/**
 * ORION LOG — Contexto global de trading
 * Gestiona el estado de trades, challenges y sincronización con Neon DB (vía /api).
 */
import { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import { calcPnlNeto, pnlAcumulado } from '../utils/calculations'

const TradingContext = createContext(null)

const getInitialState = () => ({
  trades: [],
  challenges: [],
  activeChallengeId: localStorage.getItem('orion_log_active_challenge') || null,
  weeklyReviews: [],
  draftTrade: (() => {
    try {
      const draft = localStorage.getItem('orion_log_draft_trade')
      return draft ? JSON.parse(draft) : null
    } catch { return null }
  })(),
  activeView: 'dashboard',
  isLoading: true,
})

const tradingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATA': {
      return {
        ...state,
        challenges: action.payload.challenges,
        trades: action.payload.trades,
        isLoading: false,
        activeChallengeId: state.activeChallengeId || (action.payload.challenges.length > 0 ? action.payload.challenges[0].id : null)
      }
    }
    case 'ADD_TRADE': {
      return { ...state, trades: [...state.trades, action.payload], draftTrade: null }
    }
    case 'DELETE_TRADE': {
      return { ...state, trades: state.trades.filter(t => t.id !== action.payload) }
    }
    case 'ADD_CHALLENGE': {
      return {
        ...state,
        challenges: [...state.challenges, action.payload],
        activeChallengeId: action.payload.id,
      }
    }
    case 'SET_ACTIVE_CHALLENGE': {
      localStorage.setItem('orion_log_active_challenge', action.payload)
      return { ...state, activeChallengeId: action.payload }
    }
    case 'SET_DRAFT_TRADE': {
      localStorage.setItem('orion_log_draft_trade', JSON.stringify(action.payload))
      return { ...state, draftTrade: action.payload }
    }
    case 'CLEAR_DRAFT': {
      localStorage.removeItem('orion_log_draft_trade')
      return { ...state, draftTrade: null }
    }
    case 'SET_VIEW': {
      return { ...state, activeView: action.payload }
    }
    default:
      return state
  }
}

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, null, getInitialState)

  // Cargar datos de la API al iniciar
  useEffect(() => {
    async function loadData() {
      try {
        const [chalRes, tradRes] = await Promise.all([
          fetch('/api/challenges'),
          fetch('/api/trades')
        ])
        
        if (chalRes.ok && tradRes.ok) {
          const challenges = await chalRes.json()
          const trades = await tradRes.json()
          dispatch({ type: 'SET_DATA', payload: { challenges, trades } })
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }
    loadData()
  }, [])

  const activeChallenge = state.challenges.find(c => c.id === state.activeChallengeId) || null
  const challengeTrades = state.trades
    .filter(t => t.challenge_id === state.activeChallengeId)
    .sort((a, b) => new Date(a.fecha + 'T' + a.hora_entrada) - new Date(b.fecha + 'T' + b.hora_entrada))

  // Acciones asíncronas
  const addTrade = useCallback(async (payload) => {
    // Calculos locales antes de enviar
    const challengeTrades = state.trades.filter(t => t.challenge_id === state.activeChallengeId)
    const pnlNeto = calcPnlNeto(payload.resultado, payload.spread || 1.5)
    const acumulado = pnlAcumulado(challengeTrades) + pnlNeto

    const newTrade = {
      ...payload,
      id: crypto.randomUUID(),
      pnl_neto: pnlNeto,
      challenge_id: state.activeChallengeId,
      pnl_acumulado_challenge: +acumulado.toFixed(2),
      nro_trade_challenge: challengeTrades.length + 1,
      segundo_trade_dia: challengeTrades.some(t => t.fecha === payload.fecha),
      hora_valida: (() => {
        if (!payload.hora_entrada) return false
        const [h, m] = payload.hora_entrada.split(':').map(Number)
        const mins = h * 60 + m
        return mins >= 8 * 60 + 15 && mins <= 10 * 60 + 30
      })(),
    }

    if (payload.llego_a_10pt && !payload.be_activado) {
      newTrade.no_movio_sl_a_be = true
    }

    // Optimistic UI
    dispatch({ type: 'ADD_TRADE', payload: newTrade })

    try {
      await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrade)
      })
    } catch (error) {
      console.error('Error guardando trade:', error)
    }
  }, [state.trades, state.activeChallengeId])

  const deleteTrade = useCallback(async (id) => {
    dispatch({ type: 'DELETE_TRADE', payload: id })
    try {
      await fetch(`/api/trades?id=${id}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Error borrando trade:', error)
    }
  }, [])

  const addChallenge = useCallback(async (payload) => {
    const newChallenge = { ...payload, id: crypto.randomUUID() }
    dispatch({ type: 'ADD_CHALLENGE', payload: newChallenge })
    try {
      await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChallenge)
      })
    } catch (error) {
      console.error('Error guardando challenge:', error)
    }
  }, [])

  const setActiveChallenge = useCallback((id) => dispatch({ type: 'SET_ACTIVE_CHALLENGE', payload: id }), [])
  const setDraftTrade = useCallback((draft) => dispatch({ type: 'SET_DRAFT_TRADE', payload: draft }), [])
  const clearDraft = useCallback(() => dispatch({ type: 'CLEAR_DRAFT' }), [])
  const setView = useCallback((view) => dispatch({ type: 'SET_VIEW', payload: view }), [])

  const value = {
    state,
    dispatch,
    activeChallenge,
    challengeTrades,
    addTrade,
    deleteTrade,
    addChallenge,
    setActiveChallenge,
    setDraftTrade,
    clearDraft,
    setView,
  }

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  )
}

export const useTrading = () => {
  const context = useContext(TradingContext)
  if (!context) throw new Error('useTrading debe usarse dentro de TradingProvider')
  return context
}

export default TradingContext
