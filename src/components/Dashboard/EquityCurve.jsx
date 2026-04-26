/**
 * EquityCurve — Curva de equity con Recharts
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const color = d.resultado === 'TP' ? '#1D9E75' : d.resultado === 'SL' ? '#E24B4A' : '#BA7517'
  return (
    <div className="card-compact !bg-[#1A1C24] !border-[#2A2D38] text-xs">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono font-bold" style={{ color }}>#{d.nro}</span>
        <span className="badge" style={{ backgroundColor: color + '33', color }}>{d.resultado}</span>
      </div>
      <div className="font-mono text-sm font-bold text-[#E8E9EC]">
        ${d.pnl_acumulado >= 0 ? '+' : ''}{d.pnl_acumulado.toFixed(0)}
      </div>
      <div className="text-[#6B7280] mt-0.5">{d.fecha}</div>
    </div>
  )
}

export default function EquityCurve({ data, objetivo = 800, ddLimit = -1000 }) {
  if (!data || data.length === 0) {
    return (
      <div className="card h-[280px] flex items-center justify-center text-[#6B7280]">
        Sin datos de equity
      </div>
    )
  }

  const minY = Math.min(...data.map(d => d.pnl_acumulado), ddLimit, 0) - 50
  const maxY = Math.max(...data.map(d => d.pnl_acumulado), objetivo) + 50

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#E8E9EC]">Curva de Equity</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-[#1D9E75] inline-block rounded"></span>
            <span className="text-[#6B7280]">Objetivo ${objetivo}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-[#E24B4A] inline-block rounded"></span>
            <span className="text-[#6B7280]">DD Límite</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#378ADD" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
          <XAxis
            dataKey="nro"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(v) => `#${v}`}
          />
          <YAxis
            domain={[minY, maxY]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={objetivo} stroke="#1D9E75" strokeDasharray="5 5" strokeOpacity={0.6} />
          <ReferenceLine y={ddLimit} stroke="#E24B4A" strokeDasharray="5 5" strokeOpacity={0.6} />
          <ReferenceLine y={0} stroke="#6B7280" strokeOpacity={0.3} />
          <Area
            type="monotone"
            dataKey="pnl_acumulado"
            stroke="#378ADD"
            strokeWidth={2}
            fill="url(#equityGradient)"
            dot={(props) => {
              const { cx, cy, payload } = props
              const color = payload.resultado === 'TP' ? '#1D9E75' : payload.resultado === 'SL' ? '#E24B4A' : '#BA7517'
              return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#12141A" strokeWidth={2} />
            }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#E8E9EC' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
