/**
 * DateRangeFilter — Filtro reutilizable de rango de fechas con presets
 */
import { useState, useMemo } from 'react'

const PRESETS = [
  { id: 'all',    label: 'Todo' },
  { id: 'today',  label: 'Hoy' },
  { id: 'week',   label: 'Semana' },
  { id: 'month',  label: 'Mes' },
  { id: '30d',    label: '30 días' },
  { id: 'custom', label: 'Custom' },
]

function getPresetRange(id) {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  switch (id) {
    case 'today':
      return { from: today, to: today }
    case 'week': {
      const d = new Date(now)
      d.setDate(d.getDate() - d.getDay() + 1) // Lunes
      return { from: d.toISOString().split('T')[0], to: today }
    }
    case 'month': {
      const d = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: d.toISOString().split('T')[0], to: today }
    }
    case '30d': {
      const d = new Date(now)
      d.setDate(d.getDate() - 30)
      return { from: d.toISOString().split('T')[0], to: today }
    }
    default:
      return { from: null, to: null }
  }
}

export default function DateRangeFilter({ trades, onFilter }) {
  const [active, setActive] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const handlePreset = (id) => {
    setActive(id)
    if (id === 'all') {
      onFilter(trades)
      return
    }
    if (id === 'custom') return

    const range = getPresetRange(id)
    const filtered = trades.filter(t => t.fecha >= range.from && t.fecha <= range.to)
    onFilter(filtered)
  }

  const handleCustom = () => {
    if (!customFrom || !customTo) return
    const filtered = trades.filter(t => t.fecha >= customFrom && t.fecha <= customTo)
    onFilter(filtered)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESETS.map(p => (
        <button
          key={p.id}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            active === p.id
              ? 'bg-blue text-white shadow-lg shadow-blue/20'
              : 'bg-bg-elevated text-text-muted hover:text-text-secondary border border-border hover:border-blue/30'
          }`}
          onClick={() => handlePreset(p.id)}
        >
          {p.label}
        </button>
      ))}

      {active === 'custom' && (
        <div className="flex items-center gap-2 ml-1">
          <input
            type="date"
            className="input text-xs py-1 px-2"
            value={customFrom}
            onChange={e => setCustomFrom(e.target.value)}
          />
          <span className="text-text-muted text-xs">→</span>
          <input
            type="date"
            className="input text-xs py-1 px-2"
            value={customTo}
            onChange={e => setCustomTo(e.target.value)}
          />
          <button
            className="px-3 py-1 rounded-lg text-xs font-medium bg-blue text-white hover:opacity-90 transition-all"
            onClick={handleCustom}
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
