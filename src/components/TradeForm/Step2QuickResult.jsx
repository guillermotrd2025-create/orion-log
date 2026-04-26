/**
 * Step2QuickResult — Registro rápido de resultado y captura
 */
import { useEffect, useRef } from 'react'

export default function Step2QuickResult({ data, onChange }) {
  const inputRef = useRef(null)

  const update = (field, value) => onChange({ ...data, [field]: value })

  const handlePnlChange = (val) => {
    // Limpiar entrada para permitir +, -, . y números
    const cleanVal = val.replace(/[^0-9+.-]/g, '')
    const num = parseFloat(cleanVal)

    let result = 'BE'
    if (num > 0) result = 'TP'
    else if (num < 0) result = 'SL'

    onChange({
      ...data,
      pnl_bruto_manual: cleanVal,
      resultado: result,
      pnl_neto: isNaN(num) ? 0 : num // En este modo, el neto es lo que el usuario mete
    })
  }

  // Pegar imagen (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile()
          const reader = new FileReader()
          reader.onload = (event) => {
            update('screenshot', event.target.result)
          }
          reader.readAsDataURL(blob)
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [data, onChange])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Resultado en $ */}
      <div className="text-center">
        <label className="block text-xs text-text-muted uppercase tracking-widest mb-4">Resultado Final (USD)</label>
        <div className="relative max-w-[200px] mx-auto">
          <input
            ref={inputRef}
            type="text"
            className={`w-full bg-transparent border-b-2 text-center text-4xl font-mono font-bold outline-none transition-colors ${
              data.resultado === 'TP' ? 'border-green text-green' :
              data.resultado === 'SL' ? 'border-red text-red' :
              'border-border text-text-primary'
            }`}
            placeholder="+0.00"
            value={data.pnl_bruto_manual || ''}
            onChange={e => handlePnlChange(e.target.value)}
            autoFocus
          />
          <div className="mt-4 flex justify-center gap-4">
             <span className={`badge ${data.resultado === 'TP' ? 'badge-green' : data.resultado === 'SL' ? 'badge-red' : 'badge-amber'}`}>
               {data.resultado || 'BE'}
             </span>
          </div>
        </div>
      </div>

      {/* Captura de pantalla */}
      <div className="space-y-3">
        <label className="block text-xs text-text-muted uppercase tracking-widest">Captura del Trade</label>
        <div 
          className={`relative h-64 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
            data.screenshot 
              ? 'border-blue/50 bg-blue/5' 
              : 'border-border hover:border-blue/30 bg-bg-elevated/50'
          }`}
        >
          {data.screenshot ? (
            <>
              <img src={data.screenshot} alt="Screenshot" className="w-full h-full object-contain" />
              <button 
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red transition-colors"
                onClick={() => update('screenshot', null)}
              >
                ✕
              </button>
            </>
          ) : (
            <div className="text-center p-6">
              <p className="text-3xl mb-2">📸</p>
              <p className="text-sm text-text-secondary font-medium">Pulsa Ctrl+V para pegar la captura</p>
              <p className="text-[10px] text-text-muted mt-1">O arrastra la imagen aquí</p>
            </div>
          )}
        </div>
      </div>

      {/* Notas rápidas */}
      <div>
        <label className="block text-xs text-text-muted uppercase tracking-widest mb-2">Notas Finales</label>
        <textarea
          className="input-field resize-none h-24"
          placeholder="¿Alguna observación rápida sobre la salida o ejecución?"
          value={data.notas_post || ''}
          onChange={e => update('notas_post', e.target.value)}
        />
      </div>
    </div>
  )
}
