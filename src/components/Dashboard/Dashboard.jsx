/**
 * Dashboard — Panel principal con métricas en tiempo real del challenge activo
 */
import { useTrading } from '../../context/TradingContext'
import { useTradeStats } from '../../hooks/useTradeStats'
import { useChallengeStatus } from '../../hooks/useChallengeStatus'
import MetricCard from './MetricCard'
import EquityCurve from './EquityCurve'
import SafetyAlerts from './SafetyAlerts'
import DailyStatus from './DailyStatus'

export default function Dashboard() {
  const { activeChallenge, challengeTrades } = useTrading()
  const stats = useTradeStats(challengeTrades)
  const status = useChallengeStatus(activeChallenge, challengeTrades)

  const rachaText = stats.rachaCurrent.tipo
    ? `${stats.rachaCurrent.tipo === 'TP' ? '+' : stats.rachaCurrent.tipo === 'SL' ? '-' : '~'}${stats.rachaCurrent.count} ${stats.rachaCurrent.tipo} seguidos`
    : 'Sin trades'

  const rachaColor = stats.rachaCurrent.tipo === 'TP' ? 'green' : stats.rachaCurrent.tipo === 'SL' ? 'red' : 'amber'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#E8E9EC]">
            {activeChallenge?.nombre || 'ORION LOG'}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {activeChallenge ? `Inicio: ${activeChallenge.fecha_inicio}` : 'Sin challenge activo'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${status.estaActivo ? 'badge-green' : 'badge-red'}`}>
            {status.estaActivo ? '● ACTIVO' : '● CERRADO'}
          </span>
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

      {/* Curva de equity */}
      <EquityCurve
        data={stats.equityData}
        objetivo={activeChallenge?.objetivo_usd || 800}
        ddLimit={-(activeChallenge?.dd_max_usd || 1000)}
      />
    </div>
  )
}
