/**
 * Step1Context — Contexto pre-trade (setup, dirección, emociones)
 */
import { esHoraValida } from '../../utils/validation'

const EMOJIS = ['😰', '😟', '😐', '🙂', '😌']

export default function Step1Context({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Fecha y hora */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5 uppercase tracking-wider">Fecha</label>
          <input
            type="date"
            className="input-field font-mono"
            value={data.fecha}
            onChange={e => update('fecha', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-[#6B7280] mb-1.5 uppercase tracking-wider">Hora entrada (CET)</label>
          <input
            type="time"
            className="input-field font-mono"
            value={data.hora_entrada}
            onChange={e => update('hora_entrada', e.target.value)}
          />
          {data.hora_entrada && !esHoraValida(data.hora_entrada) && (
            <p className="text-xs text-[#E24B4A] mt-1 flex items-center gap-1">
              ⚠️ Fuera de ventana operativa (08:15–10:30)
            </p>
          )}
        </div>
      </div>

      {/* Tipo de setup */}
      <div>
        <label className="block text-xs text-[#6B7280] mb-2 uppercase tracking-wider">Tipo de Setup</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { value: 'ORB', label: 'ORB', icon: '📐', desc: 'Opening Range Breakout' },
            { value: 'PULLBACK_EMA9', label: 'Pullback EMA9', icon: '↩️', desc: 'Retroceso a EMA 9' },
            { value: 'TENDENCIA', label: 'Tendencia', icon: '📈', desc: 'Continuación de tendencia' },
            { value: 'OTRO', label: 'Otro', icon: '🔧', desc: 'Setup diferente' },
          ].map(s => (
            <button
              key={s.value}
              type="button"
              className={`toggle-btn text-left p-3 ${data.tipo_setup === s.value ? 'active' : ''}`}
              onClick={() => update('tipo_setup', s.value)}
            >
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="font-semibold text-sm">{s.label}</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dirección */}
      <div>
        <label className="block text-xs text-[#6B7280] mb-2 uppercase tracking-wider">Dirección</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`toggle-btn py-4 text-center text-lg font-bold ${data.direccion === 'LONG' ? 'active-green' : ''}`}
            onClick={() => update('direccion', 'LONG')}
          >
            ↑ LONG
          </button>
          <button
            type="button"
            className={`toggle-btn py-4 text-center text-lg font-bold ${data.direccion === 'SHORT' ? 'active-red' : ''}`}
            onClick={() => update('direccion', 'SHORT')}
          >
            ↓ SHORT
          </button>
        </div>
      </div>

      {/* Contexto de mercado */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#6B7280] mb-2 uppercase tracking-wider">Tendencia Diaria</label>
          <div className="flex gap-2">
            {['ALCISTA', 'BAJISTA', 'LATERAL'].map(t => (
              <button
                key={t}
                type="button"
                className={`toggle-btn flex-1 text-xs ${
                  data.tendencia_diaria === t
                    ? t === 'ALCISTA' ? 'active-green' : t === 'BAJISTA' ? 'active-red' : 'active-amber'
                    : ''
                }`}
                onClick={() => update('tendencia_diaria', t)}
              >
                {t === 'ALCISTA' ? '↑' : t === 'BAJISTA' ? '↓' : '↔'} {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#6B7280] mb-2 uppercase tracking-wider">Volatilidad Sesión</label>
          <div className="flex gap-2">
            {['ALTA', 'NORMAL', 'BAJA'].map(v => (
              <button
                key={v}
                type="button"
                className={`toggle-btn flex-1 text-xs ${data.volatilidad_sesion === v ? 'active' : ''}`}
                onClick={() => update('volatilidad_sesion', v)}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Noticias */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1C24] border border-[#1E2028]">
        <div>
          <span className="text-sm text-[#E8E9EC]">📰 ¿Noticias en ±30 min?</span>
          <p className="text-[10px] text-[#6B7280] mt-0.5">NFP, CPI, FOMC, IFO, ZEW...</p>
        </div>
        <button
          type="button"
          className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${
            data.noticias_cercanas ? 'bg-[#E24B4A]' : 'bg-[#1E2028]'
          }`}
          onClick={() => update('noticias_cercanas', !data.noticias_cercanas)}
        >
          <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-200 ${
            data.noticias_cercanas ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>
      {data.noticias_cercanas && (
        <div className="p-2 rounded bg-[#E24B4A1A] border border-[#E24B4A33] text-xs text-[#E24B4A]">
          ⚠️ Noticias de alto impacto cercanas. Evalúa el riesgo adicional.
        </div>
      )}

      {/* Estado emocional */}
      <div>
        <label className="block text-xs text-[#6B7280] mb-2 uppercase tracking-wider">
          Estado Emocional antes de Entrar
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="5"
            value={data.estado_emocional_entrada}
            onChange={e => update('estado_emocional_entrada', Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-2xl w-10 text-center">{EMOJIS[data.estado_emocional_entrada - 1]}</span>
        </div>
        <div className="flex justify-between text-[10px] text-[#6B7280] mt-1 px-1">
          <span>Muy ansioso</span>
          <span>Muy calmado</span>
        </div>
      </div>

      {/* Confianza en setup */}
      <div>
        <label className="block text-xs text-[#6B7280] mb-2 uppercase tracking-wider">
          Confianza en el Setup
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="5"
            value={data.confianza_setup}
            onChange={e => update('confianza_setup', Number(e.target.value))}
            className="flex-1"
          />
          <span className="font-mono text-lg font-bold text-[#378ADD] w-10 text-center">
            {data.confianza_setup}/5
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-[#6B7280] mt-1 px-1">
          <span>Sin confianza</span>
          <span>Total confianza</span>
        </div>
      </div>

      {/* Notas pre-trade */}
      <div>
        <label className="block text-xs text-[#6B7280] mb-1.5 uppercase tracking-wider">Notas Pre-Trade</label>
        <textarea
          className="input-field resize-none h-20"
          placeholder="¿Qué ves en el gráfico? ¿Cuál es tu plan?"
          value={data.notas_pre || ''}
          onChange={e => update('notas_pre', e.target.value)}
        />
      </div>
    </div>
  )
}
