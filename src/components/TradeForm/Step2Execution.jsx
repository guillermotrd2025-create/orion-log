/**
 * Step2Execution — Detalles de ejecución (precios, ORB, confirmaciones)
 */
import { validarDistancia } from '../../utils/validation'

export default function Step2Execution({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value })

  const distTP = data.precio_entrada && data.precio_tp
    ? validarDistancia(data.precio_entrada, data.precio_tp)
    : null
  const distSL = data.precio_entrada && data.precio_sl
    ? validarDistancia(data.precio_entrada, data.precio_sl)
    : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Precios */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          💲 Precios de Ejecución
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Entrada</label>
            <input
              type="number"
              step="0.5"
              className="input-field font-mono"
              placeholder="18250.5"
              value={data.precio_entrada || ''}
              onChange={e => update('precio_entrada', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Take Profit</label>
            <input
              type="number"
              step="0.5"
              className="input-field font-mono"
              placeholder="18275.5"
              value={data.precio_tp || ''}
              onChange={e => update('precio_tp', e.target.value ? Number(e.target.value) : null)}
            />
            {distTP && (
              <p className={`text-[10px] mt-1 font-mono ${distTP.valido ? 'text-green' : 'text-amber'}`}>
                {distTP.distancia}pt {distTP.valido ? '✓' : distTP.mensaje}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Stop Loss</label>
            <input
              type="number"
              step="0.5"
              className="input-field font-mono"
              placeholder="18225.5"
              value={data.precio_sl || ''}
              onChange={e => update('precio_sl', e.target.value ? Number(e.target.value) : null)}
            />
            {distSL && (
              <p className={`text-[10px] mt-1 font-mono ${distSL.valido ? 'text-green' : 'text-amber'}`}>
                {distSL.distancia}pt {distSL.valido ? '✓' : distSL.mensaje}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Spread */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Spread (puntos)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            className="input-field font-mono"
            value={data.spread || 1.5}
            onChange={e => update('spread', Number(e.target.value))}
          />
          {data.spread > 2 && (
            <p className="text-[10px] text-amber mt-1">⚠️ Spread alto ({data.spread}pt). Evalúa si es el momento.</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">Hora Cierre</label>
          <input
            type="time"
            className="input-field font-mono"
            value={data.hora_cierre || ''}
            onChange={e => update('hora_cierre', e.target.value)}
          />
        </div>
      </div>

      {/* ORB Fields (solo si setup es ORB) */}
      {data.tipo_setup === 'ORB' && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            📐 Datos ORB
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">ORB High</label>
              <input
                type="number"
                step="0.5"
                className="input-field font-mono"
                placeholder="18248.0"
                value={data.orb_high || ''}
                onChange={e => update('orb_high', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">ORB Low</label>
              <input
                type="number"
                step="0.5"
                className="input-field font-mono"
                placeholder="18220.0"
                value={data.orb_low || ''}
                onChange={e => update('orb_low', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>
          {/* Ruptura limpia */}
          <div className="flex items-center justify-between p-3 mt-3 rounded-lg bg-bg-elevated border border-border">
            <span className="text-sm text-text-primary">¿Ruptura limpia del rango?</span>
            <button
              type="button"
              className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                data.ruptura_limpia ? 'bg-green' : 'bg-[#1E2028]'
              }`}
              onClick={() => update('ruptura_limpia', !data.ruptura_limpia)}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
                data.ruptura_limpia ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* Confirmaciones de ejecución */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          ✅ Confirmaciones
        </h3>
        <div className="space-y-2">
          {[
            { field: 'confirmacion_vela', label: 'Vela de confirmación antes de entrar', icon: '🕯️' },
            { field: 'llego_a_10pt', label: 'El precio llegó a +10pt de ganancia', icon: '🎯' },
            { field: 'be_activado', label: 'Moví el SL a Break-Even', icon: '🛡️' },
          ].map(item => (
            <div
              key={item.field}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated border border-border"
            >
              <span className="text-sm text-text-primary flex items-center gap-2">
                <span>{item.icon}</span>
                {item.label}
              </span>
              <button
                type="button"
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
                  data[item.field] ? 'bg-green' : 'bg-[#1E2028]'
                }`}
                onClick={() => update(item.field, !data[item.field])}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
                  data[item.field] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>

        {/* Warning: llegó a 10pt pero no activó BE */}
        {data.llego_a_10pt && !data.be_activado && (
          <div className="mt-2 p-2 rounded bg-red-dim border border-[#E24B4A33] text-xs text-red flex items-center gap-2">
            ❌ El precio llegó a +10pt pero NO moviste el SL a BE. Error de ejecución.
          </div>
        )}
      </div>
    </div>
  )
}
