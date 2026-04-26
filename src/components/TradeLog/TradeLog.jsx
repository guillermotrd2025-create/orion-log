/**
 * TradeLog — Historial de trades con tabla ordenable
 */
import { useState, useMemo } from 'react'
import { useTrading } from '../../context/TradingContext'
import DateRangeFilter from '../DateRangeFilter'

const EMOJIS = ['😰', '😟', '😐', '🙂', '😌']

export default function TradeLog() {
  const { challengeTrades, activeChallenge, deleteTrade } = useTrading()
  const [sortBy, setSortBy] = useState('fecha')
  const [sortDir, setSortDir] = useState('desc')
  const [filterSetup, setFilterSetup] = useState('ALL')
  const [filterResult, setFilterResult] = useState('ALL')
  const [expandedId, setExpandedId] = useState(null)
  const [dateFiltered, setDateFiltered] = useState(challengeTrades)

  // Re-sync when challengeTrades changes
  useMemo(() => setDateFiltered(challengeTrades), [challengeTrades])

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    let trades = [...dateFiltered]
    if (filterSetup !== 'ALL') trades = trades.filter(t => t.tipo_setup === filterSetup)
    if (filterResult !== 'ALL') trades = trades.filter(t => t.resultado === filterResult)
    trades.sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy]
      if (sortBy === 'fecha') { va = a.fecha + 'T' + a.hora_entrada; vb = b.fecha + 'T' + b.hora_entrada }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      return sortDir === 'asc' ? va - vb : vb - va
    })
    return trades
  }, [dateFiltered, filterSetup, filterResult, sortBy, sortDir])

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este trade?')) { deleteTrade(id); setExpandedId(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-text-primary">Historial de Trades</h1>
          <p className="text-sm text-text-secondary mt-1">
            {activeChallenge?.nombre || 'Todos'} — {filtered.length} trades
          </p>
        </div>
      </div>

      {/* Filtro por fechas */}
      <DateRangeFilter trades={challengeTrades} onFilter={setDateFiltered} />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Setup:</span>
          {['ALL', 'ORB', 'PULLBACK_EMA9', 'TENDENCIA'].map(s => (
            <button key={s} className={`toggle-btn text-xs py-1 px-2.5 ${filterSetup === s ? 'active' : ''}`}
              onClick={() => setFilterSetup(s)}>
              {s === 'ALL' ? 'Todos' : s === 'PULLBACK_EMA9' ? 'EMA9' : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted">Resultado:</span>
          {['ALL', 'TP', 'SL', 'BE'].map(r => (
            <button key={r}
              className={`toggle-btn text-xs py-1 px-2.5 ${filterResult === r ? (r === 'TP' ? 'active-green' : r === 'SL' ? 'active-red' : r === 'BE' ? 'active-amber' : 'active') : ''}`}
              onClick={() => setFilterResult(r)}>
              {r === 'ALL' ? 'Todos' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary text-sm">📋 No hay trades con estos filtros</p>
        </div>
      ) : (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { id: 'nro_trade_challenge', label: '#' },
                    { id: 'fecha', label: 'Fecha' },
                    { id: 'tipo_setup', label: 'Setup' },
                    { id: 'direccion', label: 'Dir' },
                    { id: 'resultado', label: 'Resultado' },
                    { id: 'pnl_neto', label: 'P&L' },
                    { id: 'pnl_acumulado_challenge', label: 'Acum.' },
                    { id: 'estado_emocional_entrada', label: 'Emoción' },
                  ].map(col => (
                    <th key={col.id}
                      className="py-3 px-3 text-left text-[10px] text-text-muted uppercase tracking-widest font-semibold cursor-pointer hover:text-text-secondary"
                      onClick={() => toggleSort(col.id)}>
                      {col.label}{sortBy === col.id && <span className="ml-1 text-[9px]">{sortDir === 'asc' ? '▲' : '▼'}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(trade => (
                  <TradeRow key={trade.id} trade={trade} isExpanded={expandedId === trade.id}
                    onToggle={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
                    onDelete={() => handleDelete(trade.id)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function TradeRow({ trade, isExpanded, onToggle, onDelete }) {
  const pnlColor = trade.pnl_neto >= 0 ? 'text-green' : 'text-red'
  const acumColor = trade.pnl_acumulado_challenge >= 0 ? 'text-green' : 'text-red'
  const resultBadge = trade.resultado === 'TP' ? 'badge-green' : trade.resultado === 'SL' ? 'badge-red' : 'badge-amber'
  const hasErrors = trade.fomo || trade.revenge_trading || trade.overtrading

  return (
    <>
      <tr className={`table-row cursor-pointer ${isExpanded ? 'bg-bg-elevated' : ''}`} onClick={onToggle}>
        <td className="py-3 px-3 font-mono text-text-muted text-xs">{trade.nro_trade_challenge}</td>
        <td className="py-3 px-3">
          <span className="font-mono text-xs">{trade.fecha}</span>
          <span className="text-text-muted text-[10px] ml-1">{trade.hora_entrada}</span>
        </td>
        <td className="py-3 px-3"><span className="badge badge-blue text-[10px]">{trade.tipo_setup}</span></td>
        <td className="py-3 px-3">
          <span className={`font-mono text-xs font-bold ${trade.direccion === 'LONG' ? 'text-green' : 'text-red'}`}>
            {trade.direccion === 'LONG' ? '↑' : '↓'} {trade.direccion}
          </span>
        </td>
        <td className="py-3 px-3">
          <span className={`badge ${resultBadge}`}>{trade.resultado}</span>
          {hasErrors && <span className="ml-1 text-[10px]" title="Errores">⚠️</span>}
        </td>
        <td className={`py-3 px-3 font-mono font-bold ${pnlColor}`}>
          {trade.pnl_neto >= 0 ? '+' : ''}${trade.pnl_neto}
        </td>
        <td className={`py-3 px-3 font-mono text-xs ${acumColor}`}>
          {trade.pnl_acumulado_challenge >= 0 ? '+' : ''}${trade.pnl_acumulado_challenge}
        </td>
        <td className="py-3 px-3 text-center">{EMOJIS[trade.estado_emocional_entrada - 1]}</td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={8} className="px-4 pb-4 bg-bg-elevated">
            <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-bg-card border border-border animate-fade-in">
              <DetailItem label="Tendencia" value={trade.tendencia_diaria} />
              <DetailItem label="Volatilidad" value={trade.volatilidad_sesion} />
              <DetailItem label="Confianza" value={`${trade.confianza_setup}/5`} />
              <DetailItem label="Spread" value={`${trade.spread}pt`} />
              <DetailItem label="BE Activado" value={trade.be_activado ? '✅' : '❌'} />
              <DetailItem label="Siguió Plan" value={trade.siguio_plan ? '✅' : '❌'} />
              {trade.notas_post && <div className="col-span-full"><DetailItem label="Notas" value={trade.notas_post} /></div>}
              {trade.leccion && <div className="col-span-full"><DetailItem label="Lección" value={`💡 ${trade.leccion}`} /></div>}
              {hasErrors && (
                <div className="col-span-full flex gap-2">
                  {trade.fomo && <span className="badge badge-red">FOMO</span>}
                  {trade.revenge_trading && <span className="badge badge-red">REVENGE</span>}
                  {trade.overtrading && <span className="badge badge-red">OVERTRADING</span>}
                </div>
              )}
              <div className="col-span-full flex justify-end pt-2 border-t border-border">
                <button className="text-xs text-red hover:underline" onClick={e => { e.stopPropagation(); onDelete() }}>
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-text-muted uppercase mb-1">{label}</p>
      <p className="text-xs text-text-primary">{value}</p>
    </div>
  )
}
