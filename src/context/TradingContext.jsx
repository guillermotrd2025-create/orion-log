/**
 * ORION LOG — Contexto global de trading
 * Gestiona el estado de trades, challenges y sincronización con Neon DB (vía /api).
 */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { calcPnlNeto, pnlAcumulado } from '../utils/calculations'

const TradingContext = createContext(null)

const getInitialState = () => ({
  trades: [],
  challenges: [],
  activeChallengeId: localStorage.getItem('orion_log_active_challenge') || null,
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
      const challenges = Array.isArray(action.payload.challenges) ? action.payload.challenges : []
      const trades = Array.isArray(action.payload.trades) ? action.payload.trades : []
      return {
        ...state,
        challenges,
        trades,
        isLoading: false,
        activeChallengeId: state.activeChallengeId || (challenges.length > 0 ? challenges[0].id : null)
      }
    }
    case 'ADD_TRADE': {
      const currentTrades = Array.isArray(state.trades) ? state.trades : []
      return { ...state, trades: [...currentTrades, action.payload], draftTrade: null }
    }
    case 'DELETE_TRADE': {
      const currentTrades = Array.isArray(state.trades) ? state.trades : []
      return { ...state, trades: currentTrades.filter(t => t.id !== action.payload) }
    }
    case 'ADD_CHALLENGE': {
      const currentChallenges = Array.isArray(state.challenges) ? state.challenges : []
      return {
        ...state,
        challenges: [...currentChallenges, action.payload],
        activeChallengeId: action.payload.id,
      }
    }
    case 'UPDATE_CHALLENGE': {
      const challenges = (state.challenges || []).map(c =>
        c.id === action.payload.id ? { ...c, ...action.payload } : c
      )
      // Si el challenge actualizado ya no está ACTIVO y era el seleccionado, desactivar
      const updated = challenges.find(c => c.id === action.payload.id)
      let activeChallengeId = state.activeChallengeId
      if (updated && updated.resultado_final !== 'ACTIVO' && state.activeChallengeId === updated.id) {
        activeChallengeId = null
        localStorage.removeItem('orion_log_active_challenge')
      }
      return { ...state, challenges, activeChallengeId }
    }
    case 'SET_ACTIVE_CHALLENGE': {
      if (action.payload) {
        localStorage.setItem('orion_log_active_challenge', action.payload)
      } else {
        localStorage.removeItem('orion_log_active_challenge')
      }
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
        } else {
          dispatch({ type: 'SET_DATA', payload: { challenges: [], trades: [] } })
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        dispatch({ type: 'SET_DATA', payload: { challenges: [], trades: [] } })
      }
    }
    loadData()
  }, [])

  const challenges = Array.isArray(state.challenges) ? state.challenges : []
  const trades = Array.isArray(state.trades) ? state.trades : []

  const activeChallenge = challenges.find(c => c.id === state.activeChallengeId) || null
  const challengeTrades = trades
    .filter(t => t.challenge_id === state.activeChallengeId)
    .sort((a, b) => new Date(a.fecha + 'T' + (a.hora_entrada || '00:00')) - new Date(b.fecha + 'T' + (b.hora_entrada || '00:00')))

  // ¿Puede operar? Solo si hay challenge activo con resultado_final === 'ACTIVO'
  const canTrade = activeChallenge && activeChallenge.resultado_final === 'ACTIVO'

  // Acciones asíncronas
  const addTrade = useCallback(async (payload) => {
    const currentTrades = (Array.isArray(state.trades) ? state.trades : []).filter(t => t.challenge_id === state.activeChallengeId)
    const pnlNeto = calcPnlNeto(payload.resultado, payload.spread || 1.5)
    const acumulado = pnlAcumulado(currentTrades) + pnlNeto

    const newTrade = {
      ...payload,
      id: crypto.randomUUID(),
      pnl_neto: pnlNeto,
      challenge_id: state.activeChallengeId,
      pnl_acumulado_challenge: +acumulado.toFixed(2),
      nro_trade_challenge: currentTrades.length + 1,
      segundo_trade_dia: currentTrades.some(t => t.fecha === payload.fecha),
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

  const closeChallenge = useCallback(async (id, resultado) => {
    const fechaFin = new Date().toISOString().split('T')[0]
    const updateData = { id, resultado_final: resultado, fecha_fin_real: fechaFin }

    dispatch({ type: 'UPDATE_CHALLENGE', payload: updateData })

    try {
      await fetch('/api/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
    } catch (error) {
      console.error('Error cerrando challenge:', error)
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
    canTrade,
    addTrade,
    deleteTrade,
    addChallenge,
    closeChallenge,
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
