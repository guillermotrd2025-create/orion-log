import { useMemo } from 'react'

const DAYS_OF_WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function CalendarHeatmap({ trades }) {
  // Generar datos del mes actual
  const { days, monthName, year } = useMemo(() => {
    const today = new Date()
    // Si hay trades, quizás usar el mes del último trade, pero por defecto el mes actual
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    
    // Ajustar para que la semana empiece en Lunes (1) en lugar de Domingo (0)
    let firstDayIndex = firstDay.getDay() - 1
    if (firstDayIndex === -1) firstDayIndex = 6 // Domingo

    const daysInMonth = lastDay.getDate()
    
    // Agrupar trades por fecha (YYYY-MM-DD)
    const dailyPnl = {}
    trades.forEach(t => {
      if (!dailyPnl[t.fecha]) dailyPnl[t.fecha] = 0
      dailyPnl[t.fecha] += (parseFloat(t.pnl_bruto_manual) || t.pnl_neto || 0)
    })

    const daysArray = []
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDayIndex; i++) {
      daysArray.push({ type: 'empty', id: `empty-${i}` })
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      const pnl = dailyPnl[dateStr]
      
      let status = 'none'
      if (pnl !== undefined) {
        if (pnl > 0) status = 'win'
        else if (pnl < 0) status = 'loss'
        else status = 'be'
      }

      daysArray.push({
        type: 'day',
        id: dateStr,
        date: i,
        pnl,
        status,
        isToday: dateStr === today.toISOString().split('T')[0]
      })
    }

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    return {
      days: daysArray,
      monthName: monthNames[currentMonth],
      year: currentYear
    }
  }, [trades])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <span>📅</span> Calendario de {monthName} {year}
        </h3>
        <div className="flex gap-2 text-[10px] text-text-muted">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-green" /> Win</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red" /> Loss</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber" /> BE</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 md:gap-2">
        {/* Cabecera días */}
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-text-muted mb-1">
            {d}
          </div>
        ))}

        {/* Cuadrículas */}
        {days.map(d => {
          if (d.type === 'empty') {
            return <div key={d.id} className="aspect-square rounded-md bg-transparent" />
          }

          let bgColor = 'bg-bg-elevated border border-border'
          if (d.status === 'win') bgColor = 'bg-green/20 border-green/30 text-green'
          else if (d.status === 'loss') bgColor = 'bg-red/20 border-red/30 text-red'
          else if (d.status === 'be') bgColor = 'bg-amber/20 border-amber/30 text-amber'

          return (
            <div
              key={d.id}
              className={`aspect-square rounded-md flex flex-col items-center justify-center relative group cursor-default transition-all ${bgColor} ${d.isToday ? 'ring-1 ring-white/20' : ''}`}
            >
              <span className="text-xs font-mono">{d.date}</span>
              
              {/* Tooltip */}
              {d.status !== 'none' && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-mono">
                  {d.id}: {d.pnl > 0 ? '+' : ''}{d.pnl.toFixed(0)}$
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
