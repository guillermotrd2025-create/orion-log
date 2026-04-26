/**
 * Challenges — Página de gestión de challenges con lista de cards
 */
import { useState, useMemo } from 'react'
import { useTrading } from '../../context/TradingContext'
import { pnlAcumulado, winRate } from '../../utils/calculations'
import ChallengeModal from './ChallengeModal'

const STATUS_CONFIG = {
  ACTIVO:   { label: 'ACTIVO',   color: '#1D9E75', icon: '🟢', badge: 'badge-green' },
  SUPERADO: { label: 'SUPERADO', color: '#378ADD', icon: '✅', badge: 'badge-blue' },
  FALLADO:  { label: 'FALLADO',  color: '#E24B4A', icon: '❌', badge: 'badge-red' },
  RETIRADO: { label: 'RETIRADO', color: '#6B7280', icon: '⏸️', badge: 'badge-amber' },
}

export default function Challenges() {
  const { state, setActiveChallenge, setView, closeChallenge, activeChallenge } = useTrading()
  const [showModal, setShowModal] = useState(false)
  const [closingId, setClosingId] = useState(null)

  const challenges = Array.isArray(state.challenges) ? state.challenges : []
  const trades = Array.isArray(state.trades) ? state.trades : []

  // Ordenar: activos primero, luego por fecha
  const sorted = useMemo(() =>
    [...challenges].sort((a, b) => {
      if (a.resultado_final === 'ACTIVO' && b.resultado_final !== 'ACTIVO') return -1
      if (a.resultado_final !== 'ACTIVO' && b.resultado_final === 'ACTIVO') return 1
      return new Date(b.createdAt || b.fecha_inicio) - new Date(a.createdAt || a.fecha_inicio)
    }), [challenges])

  const handleSelect = (id) => {
    setActiveChallenge(id)
    setView('dashboard')
  }

  const handleClose = async (resultado) => {
    if (!closingId) return
    await closeChallenge(closingId, resultado)
    setClosingId(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-text-primary">Mis Challenges</h1>
          <p className="text-sm text-text-secondary mt-1">
            {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} registrado{challenges.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="px-5 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#378ADD] to-[#1D9E75] text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-blue/20"
          onClick={() => setShowModal(true)}
        >
          ＋ Nuevo Challenge
        </button>
      </div>

      {/* Lista de challenges */}
      {sorted.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🏆</p>
          <p className="text-text-secondary">No hay challenges todavía.</p>
          <p className="text-text-muted text-xs mt-1">Crea tu primer challenge para empezar a registrar trades.</p>
          <button
            className="mt-6 px-6 py-2.5 rounded-lg font-semibold text-sm bg-blue text-white hover:opacity-90 transition-all"
            onClick={() => setShowModal(true)}
          >
            Crear Challenge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(ch => (
            <ChallengeCard
              key={ch.id}
              challenge={ch}
              trades={trades.filter(t => t.challenge_id === ch.id)}
              isActive={state.activeChallengeId === ch.id}
              onSelect={() => handleSelect(ch.id)}
              onClose={() => setClosingId(ch.id)}
            />
          ))}
        </div>
      )}

      {/* Modal nuevo challenge */}
      {showModal && (
        <ChallengeModal onClose={() => setShowModal(false)} />
      )}

      {/* Modal cerrar challenge */}
      {closingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setClosingId(null)}>
          <div className="card w-full max-w-md mx-4 !bg-[#1A1C24] !border-[#2A2D38]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-mono text-text-primary mb-2">Cerrar Challenge</h3>
            <p className="text-sm text-text-secondary mb-6">¿Cómo finalizó este challenge?</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: 'SUPERADO', label: 'Superado', icon: '✅', color: 'from-[#1D9E75] to-[#15724F]' },
                { val: 'FALLADO',  label: 'Fallado',  icon: '❌', color: 'from-[#E24B4A] to-[#B33A39]' },
                { val: 'RETIRADO', label: 'Retirado', icon: '⏸️', color: 'from-[#6B7280] to-[#4B5563]' },
              ].map(opt => (
                <button
                  key={opt.val}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-b ${opt.color} text-white font-semibold text-sm hover:opacity-90 transition-all duration-200`}
                  onClick={() => handleClose(opt.val)}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs text-text-muted hover:text-text-secondary transition-colors" onClick={() => setClosingId(null)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ChallengeCard({ challenge, trades, isActive, onSelect, onClose }) {
  const status = STATUS_CONFIG[challenge.resultado_final] || STATUS_CONFIG.ACTIVO
  const pnl = pnlAcumulado(trades)
  const wr = trades.length > 0 ? +(winRate(trades) * 100).toFixed(1) : 0
  const diasUsados = challenge.fecha_inicio
    ? Math.floor((Date.now() - new Date(challenge.fecha_inicio).getTime()) / 86400000)
    : 0
  const diasRestantes = Math.max(0, (challenge.dias_maximos || 60) - diasUsados)
  const progreso = challenge.objetivo_usd ? Math.min(100, Math.max(0, (pnl / challenge.objetivo_usd) * 100)) : 0

  return (
    <div className={`card relative transition-all duration-300 hover:border-[#378ADD]/40 ${
      isActive ? '!border-[#378ADD] shadow-lg shadow-[#378ADD]/10' : ''
    }`}>
      {/* Badge activo */}
      {isActive && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-blue text-white text-[10px] font-bold font-mono shadow-lg">
          SELECCIONADO
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-text-primary truncate">{challenge.nombre}</h3>
          <p className="text-[10px] text-text-muted font-mono mt-0.5">
            Inicio: {challenge.fecha_inicio}
            {challenge.fecha_fin_real && ` → Fin: ${challenge.fecha_fin_real}`}
          </p>
        </div>
        <span className={`badge ${status.badge} text-[10px] ml-2 flex-shrink-0`}>
          {status.icon} {status.label}
        </span>
      </div>

      {/* Mini métricas */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div>
          <p className="text-[10px] text-text-muted">Trades</p>
          <p className="text-sm font-mono font-bold text-text-primary">{trades.length}</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">P&L</p>
          <p className={`text-sm font-mono font-bold ${pnl >= 0 ? 'text-green' : 'text-red'}`}>
            {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">Win Rate</p>
          <p className="text-sm font-mono font-bold text-text-primary">{wr}%</p>
        </div>
        <div>
          <p className="text-[10px] text-text-muted">Días</p>
          <p className="text-sm font-mono font-bold text-text-primary">
            {challenge.resultado_final === 'ACTIVO' ? diasRestantes : diasUsados}
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-text-muted mb-1">
          <span>Progreso al objetivo</span>
          <span className="font-mono">${pnl.toFixed(0)} / ${challenge.objetivo_usd || 800}</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.max(0, progreso)}%`,
              backgroundColor: progreso >= 80 ? '#1D9E75' : progreso >= 40 ? '#BA7517' : '#378ADD',
            }}
          />
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <button
          className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${
            isActive
              ? 'bg-blue/10 text-blue border border-blue/30'
              : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-elevated/80'
          }`}
          onClick={onSelect}
        >
          {isActive ? '📊 Ver Dashboard' : '→ Seleccionar'}
        </button>
        {challenge.resultado_final === 'ACTIVO' && (
          <button
            className="py-2 px-3 rounded-lg text-xs text-text-muted hover:text-red hover:bg-red/10 transition-all duration-200 border border-border"
            onClick={e => { e.stopPropagation(); onClose() }}
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  )
}
