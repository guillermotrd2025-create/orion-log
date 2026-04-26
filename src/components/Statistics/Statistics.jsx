/**
 * Statistics — Vista de análisis estadístico con gráficos
 */
import { useState, useEffect } from 'react'
import { useTrading } from '../../context/TradingContext'
import { useTradeStats } from '../../hooks/useTradeStats'
import DateRangeFilter from '../DateRangeFilter'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

const COLORS = { TP: '#1D9E75', SL: '#E24B4A', BE: '#BA7517' }
const PIE_COLORS = ['#1D9E75', '#E24B4A', '#BA7517']

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card-compact !bg-[#1A1C24] !border-[#2A2D38] text-xs">
      <p className="font-mono font-bold text-text-primary mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value}{typeof p.value === 'number' && p.value % 1 === 0 ? '' : ''}
        </p>
      ))}
    </div>
  )
}

function StatSection({ title, icon, children }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  )
}

export default function Statistics() {
  const { challengeTrades, activeChallenge } = useTrading()
  const [filteredTrades, setFilteredTrades] = useState(challengeTrades)
  const stats = useTradeStats(filteredTrades)

  // Sync filteredTrades when challengeTrades changes
  useEffect(() => {
    setFilteredTrades(challengeTrades)
  }, [challengeTrades])

  if (stats.totalTrades === 0 && challengeTrades.length === 0) {
    return (
      <div className="animate-fade-in">
        <h1 className="text-xl font-bold font-mono text-text-primary mb-4">Estadísticas</h1>
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">📈</p>
          <p className="text-text-secondary">No hay trades para analizar.</p>
          <p className="text-text-muted text-xs mt-1">Registra tu primer trade para ver las estadísticas.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold font-mono text-text-primary">Estadísticas</h1>
        <p className="text-sm text-text-secondary mt-1">
          {activeChallenge?.nombre || 'Análisis'} — {stats.totalTrades} trades analizados
        </p>
      </div>

      {/* Filtro por fechas */}
      <DateRangeFilter trades={challengeTrades} onFilter={setFilteredTrades} />

      {/* Row 1: Distribution + Setup WR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie chart distribución */}
        <StatSection title="Distribución" icon="🥧">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.distribucion} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} strokeWidth={0}>
                  {stats.distribucion.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {stats.distribucion.map((d, i) => (
              <div key={d.name} className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: PIE_COLORS[i] }} />
                <p className="text-xs font-mono font-bold" style={{ color: PIE_COLORS[i] }}>{d.pct}%</p>
                <p className="text-[10px] text-text-muted">{d.name} ({d.value})</p>
              </div>
            ))}
          </div>
        </StatSection>

        {/* WR por Setup */}
        <StatSection title="Win Rate por Setup" icon="🎯">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.wrPorSetup} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
              <XAxis dataKey="setup" tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="wr" name="Win Rate" fill="#378ADD" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            {stats.wrPorSetup.map(s => (
              <div key={s.setup} className="text-center">
                <p className="text-xs font-mono font-bold text-blue">{s.wr}%</p>
                <p className="text-[10px] text-text-muted">{s.setup} ({s.total})</p>
                <p className="text-[10px] text-text-muted">PF: {s.pf === Infinity ? '∞' : s.pf}</p>
              </div>
            ))}
          </div>
        </StatSection>
      </div>

      {/* Row 2: WR by day + WR by hour */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatSection title="Win Rate por Día" icon="📅">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.wrDiaSemana} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
              <XAxis dataKey="dia" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="wr" name="WR %" fill="#1D9E75" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </StatSection>

        <StatSection title="Win Rate por Hora" icon="🕐">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.wrHora} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
              <XAxis dataKey="hora" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="wr" name="WR %" fill="#BA7517" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </StatSection>
      </div>

      {/* Row 3: Direction WR + P&L por día */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatSection title="Win Rate por Dirección" icon="↕️">
          <div className="grid grid-cols-2 gap-4">
            {stats.wrPorDir.map(d => (
              <div key={d.dir} className="text-center p-4 rounded-lg bg-bg-elevated border border-border">
                <span className={`text-2xl font-bold font-mono ${d.dir === 'LONG' ? 'text-green' : 'text-red'}`}>
                  {d.dir === 'LONG' ? '↑' : '↓'}
                </span>
                <p className="text-sm font-bold font-mono text-text-primary mt-2">{d.wr}%</p>
                <p className="text-[10px] text-text-muted">{d.dir} ({d.total} trades)</p>
              </div>
            ))}
          </div>
        </StatSection>

        <StatSection title="P&L Diario" icon="💰">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.pnlDia} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
              <XAxis dataKey="fecha" tick={{ fill: '#6B7280', fontSize: 9 }} axisLine={false} tickLine={false}
                tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="pnl" name="P&L" radius={[3, 3, 0, 0]}>
                {stats.pnlDia.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? '#1D9E75' : '#E24B4A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </StatSection>
      </div>

      {/* Row 4: Psicotrading */}
      <StatSection title="Psicotrading" icon="🧠">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Errores */}
          <div className="space-y-2">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Errores Detectados</p>
            {Object.entries(stats.psicoStats.errores).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-2 rounded bg-bg-elevated">
                <span className="text-xs text-text-secondary capitalize">{key.replace(/_/g, ' ')}</span>
                <span className={`text-xs font-mono font-bold ${val > 0 ? 'text-red' : 'text-text-muted'}`}>{val}</span>
              </div>
            ))}
          </div>

          {/* WR comparison */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase mb-1">WR Sin Errores</p>
              <p className="text-2xl font-mono font-bold text-green">{stats.psicoStats.wrSinErrores}%</p>
              <p className="text-[10px] text-text-muted">({stats.psicoStats.totalSinErrores} trades)</p>
            </div>
            <div className="text-xs text-text-muted">vs</div>
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase mb-1">WR Con Errores</p>
              <p className="text-2xl font-mono font-bold text-red">{stats.psicoStats.wrConErrores}%</p>
              <p className="text-[10px] text-text-muted">({stats.psicoStats.totalConErrores} trades)</p>
            </div>
          </div>

          {/* Coste psicológico */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-[10px] text-text-muted uppercase mb-2">Coste Psicológico</p>
            <p className={`text-3xl font-mono font-bold ${stats.psicoStats.costePsicologico >= 0 ? 'text-green' : 'text-red'}`}>
              {stats.psicoStats.costePsicologico >= 0 ? '+' : ''}${stats.psicoStats.costePsicologico}
            </p>
            <p className="text-[10px] text-text-muted mt-1">P&L de trades con errores</p>
          </div>
        </div>
      </StatSection>

      {/* Row 5: Correlación emocional */}
      <StatSection title="Correlación Emocional → Win Rate" icon="💡">
        <div className="grid grid-cols-5 gap-3">
          {stats.emocionalCorr.map(e => (
            <div key={e.nivel} className="text-center p-3 rounded-lg bg-bg-elevated border border-border">
              <span className="text-2xl">{e.emoji}</span>
              <p className="text-sm font-mono font-bold text-text-primary mt-2">{e.wr}%</p>
              <p className="text-[10px] text-text-muted">{e.total} trades</p>
            </div>
          ))}
        </div>
      </StatSection>
    </div>
  )
}
