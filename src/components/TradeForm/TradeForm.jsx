/**
 * TradeForm — Formulario multi-step para registrar un trade
 * 4 pasos: Contexto → Ejecución → Resultado → Revisión
 */
import { useState, useCallback } from 'react'
import { useTrading } from '../../context/TradingContext'
import { emptyTrade } from '../../data/initialState'
import Step1Context from './Step1Context'
import Step2Execution from './Step2Execution'
import Step3Result from './Step3Result'
import Step4Review from './Step4Review'

const STEPS = [
  { id: 1, label: 'Contexto', icon: '🎯' },
  { id: 2, label: 'Ejecución', icon: '⚡' },
  { id: 3, label: 'Resultado', icon: '📊' },
  { id: 4, label: 'Revisión', icon: '✅' },
]

export default function TradeForm() {
  const { addTrade, setView, challengeTrades, state, canTrade, activeChallenge } = useTrading()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(() => {
    return state.draftTrade || { ...emptyTrade }
  })
  const [isSaving, setIsSaving] = useState(false)

  // Bloquear si no hay challenge activo
  if (!canTrade) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-lg font-bold font-mono text-text-primary mb-2">No hay Challenge Activo</h2>
          <p className="text-sm text-text-secondary mb-6">
            {activeChallenge
              ? `Tu challenge "${activeChallenge.nombre}" está cerrado como ${activeChallenge.resultado_final}.`
              : 'Necesitas crear o seleccionar un challenge activo para registrar trades.'}
          </p>
          <button
            className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-gradient-to-r from-[#378ADD] to-[#1D9E75] text-white hover:opacity-90 transition-all shadow-lg shadow-blue/20"
            onClick={() => setView('challenges')}
          >
            🏆 Ir a Challenges
          </button>
        </div>
      </div>
    )
  }

  const handleChange = useCallback((updated) => {
    setData(updated)
  }, [])

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const canAdvance = () => {
    if (step === 1) {
      return data.tipo_setup && data.direccion && data.tendencia_diaria && data.volatilidad_sesion
    }
    if (step === 3) {
      return data.resultado
    }
    return true
  }

  const handleSave = () => {
    if (!data.resultado) return
    setIsSaving(true)
    setTimeout(() => {
      addTrade(data)
      setView('dashboard')
    }, 400)
  }

  // Trades del mismo día para warnings
  const tradesDelDia = challengeTrades.filter(t => t.fecha === data.fecha)

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold font-mono text-text-primary">Registrar Trade</h1>
        <p className="text-sm text-text-secondary mt-1">
          Paso {step} de 4 — {STEPS[step - 1].label}
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              onClick={() => {
                if (s.id < step || (s.id === step + 1 && canAdvance())) {
                  setStep(s.id)
                }
              }}
              className={`stepper-dot ${
                s.id === step ? 'active' : s.id < step ? 'completed' : ''
              }`}
              title={s.label}
            >
              {s.id < step ? '✓' : s.icon}
            </button>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2" style={{
                background: i < step - 1 ? '#1D9E75' : '#1E2028',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mb-8">
        {step === 1 && <Step1Context data={data} onChange={handleChange} />}
        {step === 2 && <Step2Execution data={data} onChange={handleChange} />}
        {step === 3 && <Step3Result data={data} onChange={handleChange} />}
        {step === 4 && <Step4Review data={data} tradesDelDia={tradesDelDia} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          className="nav-item px-6"
          onClick={step === 1 ? () => setView('dashboard') : prevStep}
        >
          {step === 1 ? '← Cancelar' : '← Anterior'}
        </button>

        {step < 4 ? (
          <button
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              canAdvance()
                ? 'bg-blue text-white hover:opacity-90 shadow-lg shadow-blue/20'
                : 'bg-bg-elevated text-text-muted cursor-not-allowed'
            }`}
            onClick={canAdvance() ? nextStep : undefined}
            disabled={!canAdvance()}
          >
            Siguiente →
          </button>
        ) : (
          <button
            className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
              isSaving
                ? 'bg-green/50 text-white cursor-wait'
                : 'bg-green text-white hover:opacity-90 shadow-lg shadow-green/20'
            }`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? '⏳ Guardando...' : '💾 Guardar Trade'}
          </button>
        )}
      </div>
    </div>
  )
}
