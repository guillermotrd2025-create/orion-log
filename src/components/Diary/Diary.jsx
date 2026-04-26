/**
 * Diary — Sección de journaling y notas diarias
 */
import { useState, useEffect, useMemo } from 'react'
import { useTrading } from '../../context/TradingContext'

const EMOJIS = ['😰', '😟', '😐', '🙂', '😌']

export default function Diary() {
  const { challengeTrades } = useTrading()
  const [entries, setEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentEntry, setCurrentEntry] = useState({ notas: '', humor: 3, horas_sueno: 7, ejercicio: false })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar entradas
  useEffect(() => {
    setIsLoading(true)
    fetch('/api/diary')
      .then(res => res.json())
      .then(data => {
        setEntries(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Error fetching diary:', err)
        setIsLoading(false)
      })
  }, [])

  // Al cambiar la fecha seleccionada, actualizar currentEntry
  useEffect(() => {
    const entry = entries.find(e => e.fecha === selectedDate)
    if (entry) {
      setCurrentEntry(entry)
    } else {
      setCurrentEntry({ notas: '', humor: 3, horas_sueno: 7, ejercicio: false })
    }
  }, [selectedDate, entries])

  // Trades del día seleccionado
  const tradesOfTheDay = useMemo(() => {
    return challengeTrades.filter(t => t.fecha === selectedDate)
  }, [challengeTrades, selectedDate])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: selectedDate,
          ...currentEntry
        })
      })
      const savedEntry = await res.json()
      
      setEntries(prev => {
        const idx = prev.findIndex(e => e.fecha === selectedDate)
        if (idx >= 0) {
          const newEntries = [...prev]
          newEntries[idx] = savedEntry
          return newEntries
        }
        return [savedEntry, ...prev].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      })
    } catch (err) {
      console.error('Error saving diary entry:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const pnlDia = tradesOfTheDay.reduce((sum, t) => sum + (parseFloat(t.pnl_bruto_manual) || t.pnl_neto || 0), 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-text-primary">Diario de Trading</h1>
          <p className="text-sm text-text-secondary mt-1">Registra tu estado mental y físico cada día.</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            className="input-field font-mono py-2"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor del Diario */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card space-y-6">
            <div>
              <label className="block text-xs text-text-muted uppercase tracking-widest mb-2">Estado de Ánimo General</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1" max="5"
                  className="flex-1"
                  value={currentEntry.humor || 3}
                  onChange={e => setCurrentEntry({...currentEntry, humor: Number(e.target.value)})}
                />
                <span className="text-3xl w-12 text-center">{EMOJIS[(currentEntry.humor || 3) - 1]}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-widest mb-2">Horas de Sueño</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" step="0.5" min="0" max="24"
                    className="input-field text-center font-mono text-lg"
                    value={currentEntry.horas_sueno || ''}
                    onChange={e => setCurrentEntry({...currentEntry, horas_sueno: parseFloat(e.target.value)})}
                  />
                  <span className="text-sm text-text-muted">h</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted uppercase tracking-widest mb-2">Ejercicio Físico</label>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    currentEntry.ejercicio ? 'bg-green/20 text-green border border-green/30' : 'bg-bg-elevated border border-border text-text-muted'
                  }`}
                  onClick={() => setCurrentEntry({...currentEntry, ejercicio: !currentEntry.ejercicio})}
                >
                  {currentEntry.ejercicio ? '🏃‍♂️ Sí, entrené' : '❌ No entrené'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-text-muted uppercase tracking-widest mb-2">Reflexiones del Día</label>
              <textarea
                className="input-field min-h-[250px] resize-y leading-relaxed"
                placeholder="¿Cómo te sentiste hoy operando? ¿Qué hiciste bien? ¿Qué puedes mejorar?"
                value={currentEntry.notas || ''}
                onChange={e => setCurrentEntry({...currentEntry, notas: e.target.value})}
              />
            </div>

            <div className="flex justify-end">
              <button
                className={`px-8 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
                  isSaving ? 'bg-blue/50 text-white cursor-wait' : 'bg-blue text-white hover:opacity-90 shadow-lg shadow-blue/20'
                }`}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '⏳ Guardando...' : '💾 Guardar Diario'}
              </button>
            </div>
          </div>
        </div>

        {/* Resumen de Trades del Día */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card h-full">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center justify-between">
              <span>📊 Resumen Operativo</span>
              <span className={`font-mono ${pnlDia > 0 ? 'text-green' : pnlDia < 0 ? 'text-red' : 'text-text-muted'}`}>
                {pnlDia > 0 ? '+' : ''}{pnlDia.toFixed(0)}$
              </span>
            </h3>
            
            {tradesOfTheDay.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <p className="text-2xl mb-2">🏖️</p>
                <p className="text-sm">No hubo operaciones</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-text-muted mb-2 px-1">
                  <span>Hora</span>
                  <span>Setup</span>
                  <span>Resultado</span>
                </div>
                {tradesOfTheDay.map(t => {
                  const pnl = parseFloat(t.pnl_bruto_manual) || t.pnl_neto || 0;
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-[#1A1C24]">
                      <span className="font-mono text-xs text-text-secondary">{t.hora_entrada}</span>
                      <span className="text-xs font-semibold">{t.tipo_setup}</span>
                      <span className={`font-mono text-sm font-bold ${t.resultado === 'TP' ? 'text-green' : t.resultado === 'SL' ? 'text-red' : 'text-amber'}`}>
                        {pnl > 0 ? '+' : ''}{pnl}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
