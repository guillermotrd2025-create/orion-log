/**
 * Dashboard — Panel principal con métricas en tiempo real del challenge activo
 */
import { useState } from 'react'
import { useTrading } from '../../context/TradingContext'
import { useTradeStats } from '../../hooks/useTradeStats'
import { useChallengeStatus } from '../../hooks/useChallengeStatus'
import MetricCard from './MetricCard'
import EquityCurve from './EquityCurve'
import SafetyAlerts from './SafetyAlerts'
import DailyStatus from './DailyStatus'
import CalendarHeatmap from './CalendarHeatmap'

export default function Dashboard() {
  const { activeChallenge, challengeTrades, setView, closeChallenge, canTrade } = useTrading()
  const stats = useTradeStats(challengeTrades)
  const status = useChallengeStatus(activeChallenge, challengeTrades)
  const [showCloseModal, setShowCloseModal] = useState(false)

  // Sin challenge seleccionado
  if (!activeChallenge) {
    return (
      <div className="animate-fade-in">
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🏆</p>
          <h2 className="text-lg font-bold font-mono text-text-primary mb-2">Sin Challenge Activo</h2>
          <p className="text-sm text-text-secondary mb-6">
            Selecciona o crea un challenge para ver tu dashboard.
          </p>
          <button
            className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#378ADD] to-[#1D9E75] text-white hover:opacity-90 transition-all shadow-lg shadow-blue/20"
            onClick={() => setView('challenges')}
          >
            Ir a Challenges
          </button>
        </div>
      </div>
    )
  }

  const rachaText = stats.rachaCurrent.tipo
    ? `${stats.rachaCurrent.tipo === 'TP' ? '+' : stats.rachaCurrent.tipo === 'SL' ? '-' : '~'}${stats.rachaCurrent.count} ${stats.rachaCurrent.tipo} seguidos`
    : 'Sin trades'

  const rachaColor = stats.rachaCurrent.tipo === 'TP' ? 'green' : stats.rachaCurrent.tipo === 'SL' ? 'red' : 'amber'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-text-primary">
            {activeChallenge?.nombre || 'ORION LOG'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Inicio: {activeChallenge.fecha_inicio}
            {activeChallenge.resultado_final !== 'ACTIVO' && (
              <span className="ml-2 text-red font-mono">({activeChallenge.resultado_final})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${canTrade ? 'badge-green' : 'badge-red'}`}>
            {canTrade ? '● ACTIVO' : `● ${activeChallenge.resultado_final}`}
          </span>
          {canTrade && (
            <button
              className="text-xs text-text-muted hover:text-red px-3 py-1.5 rounded-lg border border-border hover:border-red/30 transition-all duration-200"
              onClick={() => setShowCloseModal(true)}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Alertas de seguridad */}
      <SafetyAlerts alertas={status.alertas} />

      {/* Barras de progreso principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progreso hacia objetivo */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280] uppercase tracking-wider">Progreso al Objetivo</span>
            <span className="font-mono text-sm font-bold" style={{
              color: status.progresoColor === 'green' ? '#1D9E75' : status.progresoColor === 'amber' ? '#BA7517' : '#E24B4A'
            }}>
              ${status.pnlTotal.toFixed(0)} / ${activeChallenge?.objetivo_usd || 800}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.max(0, status.progreso)}%`,
                backgroundColor: status.progresoColor === 'green' ? '#1D9E75' : status.progresoColor === 'amber' ? '#BA7517' : '#E24B4A',
              }}
            />
          </div>
          <div className="text-xs text-[#6B7280] mt-1 font-mono">{status.progreso.toFixed(1)}%</div>
        </div>

        {/* Drawdown */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280] uppercase tracking-wider">Drawdown Máximo</span>
            <span className="font-mono text-sm font-bold" style={{
              color: status.ddColor === 'green' ? '#1D9E75' : status.ddColor === 'amber' ? '#BA7517' : '#E24B4A'
            }}>
              ${status.ddActual.toFixed(0)} / ${activeChallenge?.dd_max_usd || 1000}
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${status.ddPct}%`,
                backgroundColor: status.ddColor === 'green' ? '#1D9E75' : status.ddColor === 'amber' ? '#BA7517' : '#E24B4A',
              }}
            />
          </div>
          <div className="text-xs text-[#6B7280] mt-1 font-mono">{status.ddPct}% del límite</div>
        </div>
      </div>

      {/* Estado del día + Mini métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DailyStatus
          pnlHoy={stats.pnlHoy}
          tradesHoy={stats.tradesHoy}
          limiteDiario={activeChallenge?.limite_diario_usd || 500}
        />

        <MetricCard
          label="P&L Acumulado"
          value={`${stats.pnlTotal >= 0 ? '+' : ''}$${stats.pnlTotal.toFixed(0)}`}
          color={stats.pnlTotal >= 0 ? 'green' : 'red'}
          subValue={`${stats.pnlPct >= 0 ? '+' : ''}${stats.pnlPct}% de la cuenta`}
          icon="💰"
        />
        <MetricCard
          label="Win Rate"
          value={stats.winRateReal}
          suffix="%"
          color={stats.winRateReal >= 53 ? 'green' : 'red'}
          subValue={`Min BE: ${(stats.wrMinBE * 100).toFixed(0)}% · BE rate: ${stats.beRateReal}%`}
          icon="🎯"
        />
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Trades Totales"
          value={stats.totalTrades}
          subValue={`${stats.diasOps} días operados`}
          icon="📊"
          color="blue"
        />
        <MetricCard
          label="Profit Factor"
          value={stats.profitFactorReal === Infinity ? '∞' : stats.profitFactorReal}
          color={stats.profitFactorReal >= 1.5 ? 'green' : stats.profitFactorReal >= 1 ? 'amber' : 'red'}
          icon="⚖️"
        />
        <MetricCard
          label="EV por Trade"
          value={`${stats.evPorTrade >= 0 ? '+' : ''}$${stats.evPorTrade.toFixed(0)}`}
          color={stats.evPorTrade >= 0 ? 'green' : 'red'}
          icon="📈"
        />
        <MetricCard
          label="Racha Actual"
          value={rachaText}
          color={rachaColor}
          subValue={`Peor racha SL: ${stats.peorRacha}`}
          icon={stats.rachaCurrent.tipo === 'TP' ? '🔥' : stats.rachaCurrent.tipo === 'SL' ? '❄️' : '➖'}
        />
      </div>

      {/* Más métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Días Restantes"
          value={status.diasRestantes}
          subValue={`de ${activeChallenge?.dias_maximos || 60} días`}
          color={status.diasRestantes < 10 ? 'red' : status.diasRestantes < 20 ? 'amber' : 'blue'}
          icon="📅"
        />
        <MetricCard
          label="Mejor Racha TP"
          value={stats.mejorRacha}
          suffix="consecutivos"
          color="green"
          icon="🏆"
        />
        <MetricCard
          label="DD Máximo"
          value={`$${stats.ddMaximo.toFixed(0)}`}
          color={stats.ddMaximo > 700 ? 'red' : stats.ddMaximo > 400 ? 'amber' : 'green'}
          icon="📉"
        />
        <MetricCard
          label="Distribución"
          value={`${stats.distribucion[0]?.pct || 0}% TP`}
          subValue={`${stats.distribucion[1]?.pct || 0}% SL · ${stats.distribucion[2]?.pct || 0}% BE`}
          color="blue"
          icon="🥧"
        />
      </div>

      {/* Curva de equity y Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EquityCurve
            data={stats.equityData}
            objetivo={activeChallenge?.objetivo_usd || 800}
            ddLimit={-(activeChallenge?.dd_max_usd || 1000)}
          />
        </div>
        <div className="lg:col-span-1">
          <CalendarHeatmap trades={challengeTrades} />
        </div>
      </div>

      {/* Modal cerrar challenge */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowCloseModal(false)}>
          <div className="card w-full max-w-md mx-4 !bg-[#1A1C24] !border-[#2A2D38]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-mono text-text-primary mb-2">Cerrar Challenge</h3>
            <p className="text-sm text-text-secondary mb-6">¿Cómo finalizó "{activeChallenge.nombre}"?</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: 'SUPERADO', label: 'Superado', icon: '✅', color: 'from-[#1D9E75] to-[#15724F]' },
                { val: 'FALLADO',  label: 'Fallado',  icon: '❌', color: 'from-[#E24B4A] to-[#B33A39]' },
                { val: 'RETIRADO', label: 'Retirado', icon: '⏸️', color: 'from-[#6B7280] to-[#4B5563]' },
              ].map(opt => (
                <button
                  key={opt.val}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg bg-gradient-to-b ${opt.color} text-white font-semibold text-sm hover:opacity-90 transition-all duration-200`}
                  onClick={() => { closeChallenge(activeChallenge.id, opt.val); setShowCloseModal(false) }}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs text-text-muted hover:text-text-secondary transition-colors" onClick={() => setShowCloseModal(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
