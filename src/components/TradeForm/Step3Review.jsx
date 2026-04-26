/**
 * Step3Review — Resumen final antes de guardar el trade (Versión Simplificada)
 */
import { generarWarnings } from '../../utils/validation'

export default function Step3Review({ data, tradesDelDia = [] }) {
  const warnings = generarWarnings(data, tradesDelDia)

  const resultColor = data.resultado === 'TP' ? 'text-green' : data.resultado === 'SL' ? 'text-red' : 'text-amber'
  const pnlColor = (parseFloat(data.pnl_bruto_manual) >= 0) ? 'text-green' : 'text-red'

  function ReviewRow({ label, value, color }) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className={`text-sm font-mono font-medium ${color || 'text-text-primary'}`}>{value}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con resultado */}
      <div className="text-center p-8 rounded-2xl bg-bg-elevated border border-border shadow-xl">
        <div className={`text-5xl mb-3`}>
          {data.resultado === 'TP' ? '✅' : data.resultado === 'SL' ? '❌' : '➖'}
        </div>
        <div className={`font-mono text-4xl font-bold ${resultColor}`}>
          {data.resultado || 'BE'}
        </div>
        <div className={`font-mono text-2xl mt-2 ${pnlColor}`}>
          {parseFloat(data.pnl_bruto_manual) >= 0 ? '+' : ''}${data.pnl_bruto_manual}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-3 rounded-lg border text-xs font-medium ${
                w.tipo === 'CRITICAL' || w.tipo === 'ERROR'
                  ? 'bg-red/10 border-red/20 text-red'
                  : 'bg-amber/10 border-amber/20 text-amber'
              }`}
            >
              <span className="flex-shrink-0">{w.icono}</span>
              <span>{w.mensaje}</span>
            </div>
          ))}
        </div>
      )}

      {/* Resumen de Datos Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest mb-3 font-semibold">Contexto</h3>
          <ReviewRow label="Fecha" value={data.fecha} />
          <ReviewRow label="Hora" value={data.hora_entrada} />
          <ReviewRow label="Setup" value={data.tipo_setup} />
          <ReviewRow label="Dirección" value={data.direccion} color={data.direccion === 'LONG' ? 'text-green' : 'text-red'} />
        </div>

        <div className="card">
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest mb-3 font-semibold">Mercado</h3>
          <ReviewRow label="Tendencia" value={data.tendencia_diaria} />
          <ReviewRow label="Volatilidad" value={data.volatilidad_sesion} />
          <ReviewRow label="Noticias" value={data.noticias_cercanas ? '⚠️ Sí' : 'No'} color={data.noticias_cercanas ? 'text-red' : ''} />
        </div>
      </div>

      {/* Preview Captura */}
      {data.screenshot && (
        <div className="card !p-2">
           <img src={data.screenshot} alt="Preview" className="w-full rounded-lg h-40 object-cover" />
        </div>
      )}

      {/* Notas */}
      {data.notas_post && (
        <div className="card">
          <h3 className="text-[10px] text-text-muted uppercase tracking-widest mb-1 font-semibold">Notas</h3>
          <p className="text-sm text-text-primary italic leading-relaxed">"{data.notas_post}"</p>
        </div>
      )}
    </div>
  )
}
