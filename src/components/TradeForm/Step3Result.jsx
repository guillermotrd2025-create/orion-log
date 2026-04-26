/**
 * Step3Result — Resultado del trade y análisis post-trade
 */

const EMOJIS = ['😰', '😟', '😐', '🙂', '😌']

export default function Step3Result({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Resultado */}
      <div>
        <label className="block text-xs text-text-secondary mb-3 uppercase tracking-wider">Resultado del Trade</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'TP', label: 'Take Profit', icon: '✅', color: 'active-green', desc: '+$94 neto' },
            { value: 'SL', label: 'Stop Loss', icon: '❌', color: 'active-red', desc: '-$106 neto' },
            { value: 'BE', label: 'Break Even', icon: '➖', color: 'active-amber', desc: '-$6 comisión' },
          ].map(r => (
            <button
              key={r.value}
              type="button"
              className={`toggle-btn p-4 text-center ${data.resultado === r.value ? r.color : ''}`}
              onClick={() => update('resultado', r.value)}
            >
              <div className="text-2xl mb-1">{r.icon}</div>
              <div className="font-bold text-sm">{r.label}</div>
              <div className="text-[10px] text-text-secondary mt-0.5 font-mono">{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Seguimiento del plan */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">📋 ¿Seguiste el plan?</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`toggle-btn py-3 text-center ${data.siguio_plan ? 'active-green' : ''}`}
            onClick={() => update('siguio_plan', true)}
          >
            ✅ Sí, 100%
          </button>
          <button
            type="button"
            className={`toggle-btn py-3 text-center ${data.siguio_plan === false ? 'active-red' : ''}`}
            onClick={() => update('siguio_plan', false)}
          >
            ❌ No / Parcial
          </button>
        </div>

        {data.siguio_plan === false && (
          <div className="mt-3 animate-fade-in">
            <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">
              ¿En qué te desviaste?
            </label>
            <textarea
              className="input-field resize-none h-16"
              placeholder="Ej: Entré sin vela de confirmación, moví el SL..."
              value={data.desviacion_plan || ''}
              onChange={e => update('desviacion_plan', e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Errores psicológicos */}
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-3">🧠 Errores Psicológicos</h3>
        <div className="space-y-2">
          {[
            { field: 'fomo', label: 'FOMO', desc: 'Entré por miedo a perder el movimiento', icon: '😱' },
            { field: 'revenge_trading', label: 'Revenge Trading', desc: 'Intenté recuperar una pérdida anterior', icon: '😤' },
            { field: 'overtrading', label: 'Overtrading', desc: 'Operé más de lo permitido o sin setup claro', icon: '🔄' },
            { field: 'dudas_antes_entrada', label: 'Dudas al Entrar', desc: 'No estaba convencido pero entré igual', icon: '😰' },
          ].map(err => (
            <button
              key={err.field}
              type="button"
              className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                data[err.field]
                  ? 'bg-red-dim border-[#E24B4A55] text-red'
                  : 'bg-bg-elevated border-border text-text-secondary hover:border-border-hover'
              }`}
              onClick={() => update(err.field, !data[err.field])}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{err.icon}</span>
                <div>
                  <span className="text-sm font-medium">{err.label}</span>
                  <p className="text-[10px] opacity-70 mt-0.5">{err.desc}</p>
                </div>
                {data[err.field] && (
                  <span className="ml-auto text-xs font-mono bg-[#E24B4A33] px-2 py-0.5 rounded">DETECTADO</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Estado emocional al cierre */}
      <div>
        <label className="block text-xs text-text-secondary mb-2 uppercase tracking-wider">
          Estado Emocional al Cierre
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="5"
            value={data.estado_emocional_cierre}
            onChange={e => update('estado_emocional_cierre', Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-2xl w-10 text-center">{EMOJIS[data.estado_emocional_cierre - 1]}</span>
        </div>
        <div className="flex justify-between text-[10px] text-text-muted mt-1 px-1">
          <span>Frustrado</span>
          <span>Satisfecho</span>
        </div>
      </div>

      {/* Notas post-trade */}
      <div>
        <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">
          Notas Post-Trade
        </label>
        <textarea
          className="input-field resize-none h-20"
          placeholder="¿Qué pasó? ¿Cómo fue la ejecución?"
          value={data.notas_post || ''}
          onChange={e => update('notas_post', e.target.value)}
        />
      </div>

      {/* Lección aprendida */}
      <div>
        <label className="block text-xs text-text-secondary mb-1.5 uppercase tracking-wider">
          💡 Lección Aprendida
        </label>
        <textarea
          className="input-field resize-none h-16"
          placeholder="¿Qué harías diferente la próxima vez?"
          value={data.leccion || ''}
          onChange={e => update('leccion', e.target.value)}
        />
      </div>
    </div>
  )
}
