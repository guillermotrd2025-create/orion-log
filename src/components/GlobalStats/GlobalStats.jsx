/**
 * GlobalStats — Vista global con estadísticas agregadas de todos los challenges
 */
import { useMemo } from 'react'
import { useTrading } from '../../context/TradingContext'
import { useTradeStats } from '../../hooks/useTradeStats'
import { pnlAcumulado, winRate, profitFactor } from '../../utils/calculations'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const STATUS_COLORS = {
  ACTIVO: '#1D9E75',
  SUPERADO: '#378ADD',
  FALLADO: '#E24B4A',
  RETIRADO: '#6B7280',
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card-compact !bg-[#1A1C24] !border-[#2A2D38] text-xs">
      <p className="font-mono font-bold text-text-primary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function GlobalStats() {
  const { state } = useTrading()
  const allTrades = Array.isArray(state.trades) ? state.trades : []
  const allChallenges = Array.isArray(state.challenges) ? state.challenges : []
  const globalStats = useTradeStats(allTrades)

  // Resumen por challenge
  const challengeSummary = useMemo(() => {
    return allChallenges.map(ch => {
      const trades = allTrades.filter(t => t.challenge_id === ch.id)
      const pnl = pnlAcumulado(trades)
      const wr = trades.length > 0 ? +(winRate(trades) * 100).toFixed(1) : 0
      const pf = profitFactor(trades)
      return {
        ...ch,
        trades: trades.length,
        pnl,
        wr,
        pf: pf === Infinity ? '∞' : pf,
      }
    }).sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio))
  }, [allChallenges, allTrades])

  // Datos para gráfico de P&L por challenge
  const pnlPorChallenge = challengeSummary.map(ch => ({
    name: ch.nombre.length > 15 ? ch.nombre.slice(0, 15) + '…' : ch.nombre,
    pnl: ch.pnl,
    estado: ch.resultado_final,
  }))

  const completados = allChallenges.filter(c => c.resultado_final === 'SUPERADO').length
  const fallados = allChallenges.filter(c => c.resultado_final === 'FALLADO').length
  const activos = allChallenges.filter(c => c.resultado_final === 'ACTIVO').length

  if (allTrades.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-xl font-bold font-mono text-text-primary mb-4">Vista Global</h1>
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🌍</p>
          <p className="text-text-secondary">No hay datos para mostrar.</p>
          <p className="text-text-muted text-xs mt-1">Completa algún challenge para ver tu progreso global.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-mono text-text-primary">Vista Global</h1>
        <p className="text-sm text-text-secondary mt-1">
          Estadísticas agregadas de toda tu carrera — {allTrades.length} trades en {allChallenges.length} challenges
        </p>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Total Trades</p>
          <p className="text-2xl font-mono font-bold text-text-primary">{globalStats.totalTrades}</p>
        </div>
        <div className="card text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">P&L Total</p>
          <p className={`text-2xl font-mono font-bold ${globalStats.pnlTotal >= 0 ? 'text-green' : 'text-red'}`}>
            {globalStats.pnlTotal >= 0 ? '+' : ''}${globalStats.pnlTotal.toFixed(0)}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Win Rate</p>
          <p className="text-2xl font-mono font-bold text-text-primary">{globalStats.winRateReal}%</p>
        </div>
        <div className="card text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Profit Factor</p>
          <p className="text-2xl font-mono font-bold text-text-primary">
            {globalStats.profitFactorReal === Infinity ? '∞' : globalStats.profitFactorReal}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Challenges</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-xs font-mono text-green">✅ {completados}</span>
            <span className="text-xs font-mono text-red">❌ {fallados}</span>
            <span className="text-xs font-mono text-blue">🟢 {activos}</span>
          </div>
        </div>
      </div>

      {/* Gráfico P&L por Challenge */}
      {pnlPorChallenge.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span>📊</span> P&L por Challenge
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pnlPorChallenge} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                {pnlPorChallenge.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.estado] || '#378ADD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabla resumen de challenges */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <span>🏆</span> Resumen de Challenges
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-left text-[10px] text-text-muted uppercase tracking-widest">Nombre</th>
                <th className="py-3 px-4 text-left text-[10px] text-text-muted uppercase tracking-widest">Estado</th>
                <th className="py-3 px-4 text-left text-[10px] text-text-muted uppercase tracking-widest">Trades</th>
                <th className="py-3 px-4 text-left text-[10px] text-text-muted uppercase tracking-widest">P&L</th>
                <th className="py-3 px-4 text-left text-[10px] text-text-muted uppercase tracking-widest">WR</th>
                <th className="py-3 px-4 text-left text-[10px] text-text-muted uppercase tracking-widest">PF</th>
                <th className="py-3 px-4 text-left text-[10px] text-text-muted uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {challengeSummary.map(ch => (
                <tr key={ch.id} className="table-row border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 font-medium text-text-primary text-xs truncate max-w-[200px]">{ch.nombre}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono font-bold" style={{ color: STATUS_COLORS[ch.resultado_final] }}>
                      {ch.resultado_final}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-text-secondary">{ch.trades}</td>
                  <td className={`py-3 px-4 font-mono text-xs font-bold ${ch.pnl >= 0 ? 'text-green' : 'text-red'}`}>
                    {ch.pnl >= 0 ? '+' : ''}${ch.pnl.toFixed(0)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-text-secondary">{ch.wr}%</td>
                  <td className="py-3 px-4 font-mono text-xs text-text-secondary">{ch.pf}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-text-muted">{ch.fecha_inicio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
