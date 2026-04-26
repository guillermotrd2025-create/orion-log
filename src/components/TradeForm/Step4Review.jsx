/**
 * Step4Review — Resumen final antes de guardar el trade
 */
import { calcPnlNeto } from '../../utils/calculations'
import { generarWarnings } from '../../utils/validation'

const EMOJIS = ['😰', '😟', '😐', '🙂', '😌']

function ReviewRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={`text-sm font-mono font-medium ${color || 'text-text-primary'}`}>{value}</span>
    </div>
  )
}

export default function Step4Review({ data, tradesDelDia = [] }) {
  const pnl = calcPnlNeto(data.resultado, data.spread || 1.5)
  const warnings = generarWarnings(data, tradesDelDia)

  const resultColor = data.resultado === 'TP' ? 'text-green' : data.resultado === 'SL' ? 'text-red' : 'text-amber'
  const pnlColor = pnl >= 0 ? 'text-green' : 'text-red'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header con resultado */}
      <div className="text-center p-6 rounded-xl bg-bg-elevated border border-border">
        <div className={`text-4xl mb-2`}>
          {data.resultado === 'TP' ? '✅' : data.resultado === 'SL' ? '❌' : '➖'}
        </div>
        <div className={`font-mono text-3xl font-bold ${resultColor}`}>
          {data.resultado || '???'}
        </div>
        <div className={`font-mono text-xl mt-1 ${pnlColor}`}>
          {pnl >= 0 ? '+' : ''}${pnl.toFixed(0)}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-3 rounded-lg border text-xs font-medium ${
                w.tipo === 'CRITICAL'
                  ? 'bg-red-dim border-[#E24B4A33] text-red'
                  : w.tipo === 'ERROR'
                    ? 'bg-red-dim border-[#E24B4A33] text-red'
                    : 'bg-amber-dim border-[#BA751733] text-amber'
              }`}
            >
              <span className="flex-shrink-0">{w.icono}</span>
              <span>{w.mensaje}</span>
            </div>
          ))}
        </div>
      )}

      {/* Detalles del trade */}
      <div className="card space-y-0.5">
        <h3 className="text-xs text-text-muted uppercase tracking-widest mb-3 font-semibold">Contexto</h3>
        <ReviewRow label="Fecha" value={data.fecha} />
        <ReviewRow label="Hora Entrada" value={data.hora_entrada} />
        <ReviewRow label="Hora Cierre" value={data.hora_cierre || '—'} />
        <ReviewRow label="Setup" value={data.tipo_setup || '—'} />
        <ReviewRow label="Dirección" value={data.direccion || '—'} color={data.direccion === 'LONG' ? 'text-green' : 'text-red'} />
        <ReviewRow label="Tendencia" value={data.tendencia_diaria || '—'} />
        <ReviewRow label="Volatilidad" value={data.volatilidad_sesion || '—'} />
      </div>

      <div className="card space-y-0.5">
        <h3 className="text-xs text-text-muted uppercase tracking-widest mb-3 font-semibold">Ejecución</h3>
        <ReviewRow label="Precio Entrada" value={data.precio_entrada || '—'} />
        <ReviewRow label="Take Profit" value={data.precio_tp || '—'} />
        <ReviewRow label="Stop Loss" value={data.precio_sl || '—'} />
        <ReviewRow label="Spread" value={`${data.spread}pt`} color={data.spread > 2 ? 'text-amber' : undefined} />
        <ReviewRow label="Confirmación Vela" value={data.confirmacion_vela ? '✅' : '❌'} />
        <ReviewRow label="BE Activado" value={data.be_activado ? '✅' : '❌'} />
        <ReviewRow label="Llegó a +10pt" value={data.llego_a_10pt ? '✅' : '❌'} />
      </div>

      <div className="card space-y-0.5">
        <h3 className="text-xs text-text-muted uppercase tracking-widest mb-3 font-semibold">Psicotrading</h3>
        <ReviewRow
          label="Emoción Entrada"
          value={`${EMOJIS[data.estado_emocional_entrada - 1]} ${data.estado_emocional_entrada}/5`}
        />
        <ReviewRow
          label="Emoción Cierre"
          value={`${EMOJIS[data.estado_emocional_cierre - 1]} ${data.estado_emocional_cierre}/5`}
        />
        <ReviewRow label="Confianza Setup" value={`${data.confianza_setup}/5`} />
        <ReviewRow label="Siguió Plan" value={data.siguio_plan ? '✅' : '❌'} color={data.siguio_plan ? 'text-green' : 'text-red'} />
        {data.fomo && <ReviewRow label="FOMO" value="⚠️ Detectado" color="text-red" />}
        {data.revenge_trading && <ReviewRow label="Revenge Trading" value="⚠️ Detectado" color="text-red" />}
        {data.overtrading && <ReviewRow label="Overtrading" value="⚠️ Detectado" color="text-red" />}
        {data.dudas_antes_entrada && <ReviewRow label="Dudas" value="⚠️ Detectado" color="text-amber" />}
      </div>

      {/* Notas */}
      {(data.notas_post || data.leccion) && (
        <div className="card space-y-3">
          <h3 className="text-xs text-text-muted uppercase tracking-widest font-semibold">Notas</h3>
          {data.notas_post && (
            <div>
              <p className="text-[10px] text-text-muted mb-1">Post-Trade</p>
              <p className="text-sm text-text-primary">{data.notas_post}</p>
            </div>
          )}
          {data.leccion && (
            <div>
              <p className="text-[10px] text-text-muted mb-1">Lección</p>
              <p className="text-sm text-text-primary italic">💡 {data.leccion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
