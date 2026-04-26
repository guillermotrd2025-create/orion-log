/**
 * ChallengeModal — Modal para crear un nuevo challenge
 */
import { useState } from 'react'
import { useTrading } from '../../context/TradingContext'

const DEFAULTS = {
  cuenta_usd: 10000,
  objetivo_usd: 800,
  dd_max_usd: 1000,
  limite_diario_usd: 500,
  coste_cuenta: 100,
  dias_maximos: 60,
}

export default function ChallengeModal({ onClose }) {
  const { addChallenge, setView } = useTrading()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    cuenta_usd: DEFAULTS.cuenta_usd,
    objetivo_usd: DEFAULTS.objetivo_usd,
    dd_max_usd: DEFAULTS.dd_max_usd,
    limite_diario_usd: DEFAULTS.limite_diario_usd,
    coste_cuenta: DEFAULTS.coste_cuenta,
    dias_maximos: DEFAULTS.dias_maximos,
    notas: '',
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!form.nombre.trim()) return
    setIsSaving(true)

    await addChallenge({
      ...form,
      nombre: form.nombre.trim(),
      fecha_inicio: new Date().toISOString().split('T')[0],
      resultado_final: 'ACTIVO',
    })

    setView('dashboard')
    onClose()
  }

  const canSave = form.nombre.trim().length > 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-lg mx-4 !bg-[#1A1C24] !border-[#2A2D38] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold font-mono text-text-primary">Nuevo Challenge</h2>
            <p className="text-xs text-text-muted mt-0.5">Configura los parámetros de tu nueva cuenta</p>
          </div>
          <button className="text-text-muted hover:text-text-primary text-xl transition-colors" onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Nombre del Challenge *</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Ej: Challenge Fase 1 — Mayo 2026"
              value={form.nombre}
              onChange={e => update('nombre', e.target.value)}
              autoFocus
            />
          </div>

          {/* Grid de métricas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Cuenta (USD)</label>
              <input type="number" className="input w-full" value={form.cuenta_usd} onChange={e => update('cuenta_usd', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Objetivo (USD)</label>
              <input type="number" className="input w-full" value={form.objetivo_usd} onChange={e => update('objetivo_usd', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">DD Máximo (USD)</label>
              <input type="number" className="input w-full" value={form.dd_max_usd} onChange={e => update('dd_max_usd', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Límite Diario (USD)</label>
              <input type="number" className="input w-full" value={form.limite_diario_usd} onChange={e => update('limite_diario_usd', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Coste Cuenta (USD)</label>
              <input type="number" className="input w-full" value={form.coste_cuenta} onChange={e => update('coste_cuenta', +e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Días Máximos</label>
              <input type="number" className="input w-full" value={form.dias_maximos} onChange={e => update('dias_maximos', +e.target.value)} />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs text-text-muted uppercase tracking-wider mb-1.5">Notas (opcional)</label>
            <textarea
              className="input w-full min-h-[60px] resize-none"
              placeholder="Objetivos personales, reglas especiales..."
              value={form.notas}
              onChange={e => update('notas', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button className="px-5 py-2 rounded-lg text-sm text-text-muted hover:text-text-secondary transition-colors" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              canSave && !isSaving
                ? 'bg-gradient-to-r from-[#378ADD] to-[#1D9E75] text-white hover:opacity-90 shadow-lg shadow-blue/20'
                : 'bg-bg-elevated text-text-muted cursor-not-allowed'
            }`}
            onClick={canSave && !isSaving ? handleSave : undefined}
            disabled={!canSave || isSaving}
          >
            {isSaving ? '⏳ Creando...' : '🏆 Crear Challenge'}
          </button>
        </div>
      </div>
    </div>
  )
}
