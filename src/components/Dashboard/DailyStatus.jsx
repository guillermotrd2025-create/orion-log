/**
 * DailyStatus — Semáforo de seguridad diaria + barra de P&L del día
 */
export default function DailyStatus({ pnlHoy, tradesHoy, limiteDiario = 500 }) {
  const slHoy = tradesHoy.filter(t => t.resultado === 'SL').length
  const tpHoy = tradesHoy.filter(t => t.resultado === 'TP').length
  const beHoy = tradesHoy.filter(t => t.resultado === 'BE').length

  // Semáforo: verde si no hay pérdida, ámbar si -$100 a -$300, rojo si >-$300
  let semaforoColor = '#1D9E75'
  let semaforoLabel = 'SEGURO'
  if (pnlHoy < -100) { semaforoColor = '#BA7517'; semaforoLabel = 'PRECAUCIÓN' }
  if (pnlHoy < -300) { semaforoColor = '#E24B4A'; semaforoLabel = 'PELIGRO' }

  const perdidaPct = Math.min(100, Math.max(0, (Math.abs(Math.min(0, pnlHoy)) / limiteDiario) * 100))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#E8E9EC]">Estado del Día</h3>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: semaforoColor, boxShadow: `0 0 8px ${semaforoColor}66` }}
          />
          <span className="text-xs font-mono font-semibold" style={{ color: semaforoColor }}>
            {semaforoLabel}
          </span>
        </div>
      </div>

      {/* P&L del día */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`font-mono text-xl font-bold ${pnlHoy >= 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
          {pnlHoy >= 0 ? '+' : ''}${pnlHoy.toFixed(0)}
        </span>
        <span className="text-xs text-[#6B7280]">P&L hoy</span>
      </div>

      {/* Barra de pérdida diaria */}
      {pnlHoy < 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-[#6B7280] mb-1">
            <span>Pérdida diaria</span>
            <span className="font-mono">${Math.abs(pnlHoy).toFixed(0)} / ${limiteDiario}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${perdidaPct}%`,
                backgroundColor: perdidaPct > 70 ? '#E24B4A' : perdidaPct > 40 ? '#BA7517' : '#1D9E75',
              }}
            />
          </div>
        </div>
      )}

      {/* Resumen de trades */}
      <div className="flex items-center gap-3 text-xs">
        <span className="text-[#6B7280]">Trades hoy:</span>
        <span className="font-mono font-semibold text-[#E8E9EC]">{tradesHoy.length}</span>
        {tpHoy > 0 && <span className="badge badge-green">TP ×{tpHoy}</span>}
        {slHoy > 0 && <span className="badge badge-red">SL ×{slHoy}</span>}
        {beHoy > 0 && <span className="badge badge-amber">BE ×{beHoy}</span>}
      </div>
    </div>
  )
}
