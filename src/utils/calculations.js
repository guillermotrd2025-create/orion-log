/**
 * ORION LOG — Módulo de cálculos estadísticos
 * Todas las funciones asumen un array de trades con el modelo de datos estándar.
 */

// ─── PNL AUTOMÁTICO ──────────────────────────────────────────
// Calcula P&L neto según resultado y spread.
// TP = +$94 neto (25pt * 4 lotes * $1 - spread), SL = -$106, BE = -$6 comisión
export const calcPnlNeto = (resultado, spread = 1.5) => {
  const lotes = 4
  const puntos = 25
  const valorPunto = 1 // $1 por punto por lote
  const bruto = puntos * lotes * valorPunto // $100

  switch (resultado) {
    case 'TP':
      return +(bruto - spread * lotes * valorPunto).toFixed(2) // ~$94
    case 'SL':
      return +(-bruto - spread * lotes * valorPunto).toFixed(2) // ~-$106
    case 'BE':
      return +(-(spread * lotes * valorPunto)).toFixed(2) // ~-$6 (solo spread/comisión)
    default:
      return 0
  }
}

// ─── WIN RATE ────────────────────────────────────────────────
// Win rate real: TP / (TP + SL). Los BE no cuentan como win ni loss.
export const winRate = (trades) => {
  const closed = trades.filter(t => t.resultado !== 'BE')
  if (closed.length === 0) return 0
  return closed.filter(t => t.resultado === 'TP').length / closed.length
}

// Win rate filtrado por un campo y valor específico
export const winRateFiltered = (trades, field, value) => {
  const filtered = trades.filter(t => t[field] === value)
  return winRate(filtered)
}

// ─── PROFIT FACTOR ───────────────────────────────────────────
export const profitFactor = (trades) => {
  const gains = trades.filter(t => t.pnl_neto > 0).reduce((s, t) => s + t.pnl_neto, 0)
  const losses = Math.abs(trades.filter(t => t.pnl_neto < 0).reduce((s, t) => s + t.pnl_neto, 0))
  return losses > 0 ? +(gains / losses).toFixed(2) : gains > 0 ? Infinity : 0
}

// ─── EXPECTED VALUE (EV) POR TRADE ──────────────────────────
export const evReal = (trades) => {
  if (trades.length === 0) return 0
  return +(trades.reduce((s, t) => s + t.pnl_neto, 0) / trades.length).toFixed(2)
}

// ─── P&L ACUMULADO ───────────────────────────────────────────
export const pnlAcumulado = (trades) => {
  return +trades.reduce((s, t) => s + t.pnl_neto, 0).toFixed(2)
}

// ─── RACHA ACTUAL ────────────────────────────────────────────
// Devuelve la racha actual consecutiva del último resultado
export const rachaActual = (trades) => {
  if (!trades.length) return { tipo: null, count: 0 }
  const sorted = [...trades].sort((a, b) => 
    new Date(a.fecha + 'T' + a.hora_entrada) - new Date(b.fecha + 'T' + b.hora_entrada)
  )
  const ultimo = sorted[sorted.length - 1]
  let count = 0
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].resultado === ultimo.resultado) count++
    else break
  }
  return { tipo: ultimo.resultado, count }
}

// ─── PEOR RACHA DE SL CONSECUTIVOS ──────────────────────────
export const peorRachaSL = (trades) => {
  const sorted = [...trades].sort((a, b) => 
    new Date(a.fecha + 'T' + a.hora_entrada) - new Date(b.fecha + 'T' + b.hora_entrada)
  )
  let max = 0, current = 0
  sorted.forEach(t => {
    if (t.resultado === 'SL') { current++; max = Math.max(max, current) }
    else current = 0
  })
  return max
}

// ─── MEJOR RACHA DE TP CONSECUTIVOS ─────────────────────────
export const mejorRachaTP = (trades) => {
  const sorted = [...trades].sort((a, b) => 
    new Date(a.fecha + 'T' + a.hora_entrada) - new Date(b.fecha + 'T' + b.hora_entrada)
  )
  let max = 0, current = 0
  sorted.forEach(t => {
    if (t.resultado === 'TP') { current++; max = Math.max(max, current) }
    else current = 0
  })
  return max
}

// ─── DRAWDOWN MÁXIMO ─────────────────────────────────────────
export const maxDrawdown = (trades) => {
  const sorted = [...trades].sort((a, b) => 
    new Date(a.fecha + 'T' + a.hora_entrada) - new Date(b.fecha + 'T' + b.hora_entrada)
  )
  let peak = 0, maxDD = 0, cumPnl = 0
  sorted.forEach(t => {
    cumPnl += t.pnl_neto
    if (cumPnl > peak) peak = cumPnl
    const dd = peak - cumPnl
    if (dd > maxDD) maxDD = dd
  })
  return +maxDD.toFixed(2)
}

// ─── CURVA DE EQUITY ─────────────────────────────────────────
// Devuelve array de { nro, pnl_acumulado, resultado } para Recharts
export const equityCurve = (trades) => {
  const sorted = [...trades].sort((a, b) => 
    new Date(a.fecha + 'T' + a.hora_entrada) - new Date(b.fecha + 'T' + b.hora_entrada)
  )
  let cum = 0
  return sorted.map((t, i) => {
    cum += t.pnl_neto
    return {
      nro: i + 1,
      pnl_acumulado: +cum.toFixed(2),
      resultado: t.resultado,
      fecha: t.fecha,
    }
  })
}

// ─── WR MÍNIMO DE BREAK-EVEN ────────────────────────────────
// Con los parámetros actuales: avgLoss / (avgWin + avgLoss) = 106 / (94 + 106) ≈ 53%
export const wrBreakEven = (avgWin = 94, avgLoss = 106) => {
  return +(Math.abs(avgLoss) / (avgWin + Math.abs(avgLoss))).toFixed(4)
}

// ─── DÍAS OPERADOS ───────────────────────────────────────────
export const diasOperados = (trades) => {
  const fechas = new Set(trades.map(t => t.fecha))
  return fechas.size
}

// ─── P&L DEL DÍA ────────────────────────────────────────────
export const pnlDelDia = (trades, fecha) => {
  return +trades
    .filter(t => t.fecha === fecha)
    .reduce((s, t) => s + t.pnl_neto, 0)
    .toFixed(2)
}

// ─── TRADES DEL DÍA ─────────────────────────────────────────
export const tradesDelDia = (trades, fecha) => {
  return trades.filter(t => t.fecha === fecha)
}

// ─── BE RATE ─────────────────────────────────────────────────
export const beRate = (trades) => {
  if (trades.length === 0) return 0
  return trades.filter(t => t.resultado === 'BE').length / trades.length
}

// ─── DISTRIBUCIÓN POR RESULTADO ──────────────────────────────
export const distribucionResultados = (trades) => {
  const tp = trades.filter(t => t.resultado === 'TP').length
  const sl = trades.filter(t => t.resultado === 'SL').length
  const be = trades.filter(t => t.resultado === 'BE').length
  const total = trades.length || 1
  return [
    { name: 'TP', value: tp, pct: +((tp / total) * 100).toFixed(1) },
    { name: 'SL', value: sl, pct: +((sl / total) * 100).toFixed(1) },
    { name: 'BE', value: be, pct: +((be / total) * 100).toFixed(1) },
  ]
}

// ─── WIN RATE POR DÍA DE LA SEMANA ──────────────────────────
export const wrPorDiaSemana = (trades) => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const grouped = {}
  trades.forEach(t => {
    const d = new Date(t.fecha).getDay()
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(t)
  })
  return Object.entries(grouped).map(([dia, ts]) => ({
    dia: dias[parseInt(dia)],
    wr: +(winRate(ts) * 100).toFixed(1),
    total: ts.length,
  }))
}

// ─── WIN RATE POR HORA DE ENTRADA ───────────────────────────
export const wrPorHora = (trades) => {
  const grouped = {}
  trades.forEach(t => {
    const hora = t.hora_entrada?.split(':')[0] || '??'
    if (!grouped[hora]) grouped[hora] = []
    grouped[hora].push(t)
  })
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hora, ts]) => ({
      hora: hora + ':00',
      wr: +(winRate(ts) * 100).toFixed(1),
      total: ts.length,
    }))
}

// ─── P&L POR DÍA (para heatmap) ─────────────────────────────
export const pnlPorDia = (trades) => {
  const grouped = {}
  trades.forEach(t => {
    if (!grouped[t.fecha]) grouped[t.fecha] = 0
    grouped[t.fecha] += t.pnl_neto
  })
  return Object.entries(grouped).map(([fecha, pnl]) => ({
    fecha,
    pnl: +pnl.toFixed(2),
  }))
}

// ─── ESTADÍSTICAS PSICOTRADING ──────────────────────────────
export const psicotradingStats = (trades) => {
  const errores = {
    fomo: trades.filter(t => t.fomo).length,
    revenge_trading: trades.filter(t => t.revenge_trading).length,
    overtrading: trades.filter(t => t.overtrading).length,
    dudas_antes_entrada: trades.filter(t => t.dudas_antes_entrada).length,
    no_movio_sl_a_be: trades.filter(t => t.no_movio_sl_a_be).length,
  }

  const conErrores = trades.filter(t => 
    t.fomo || t.revenge_trading || t.overtrading || t.dudas_antes_entrada || t.no_movio_sl_a_be
  )
  const sinErrores = trades.filter(t =>
    !t.fomo && !t.revenge_trading && !t.overtrading && !t.dudas_antes_entrada && !t.no_movio_sl_a_be
  )

  const costePsicologico = +conErrores.reduce((s, t) => s + t.pnl_neto, 0).toFixed(2)

  return {
    errores,
    wrConErrores: +(winRate(conErrores) * 100).toFixed(1),
    wrSinErrores: +(winRate(sinErrores) * 100).toFixed(1),
    costePsicologico,
    totalConErrores: conErrores.length,
    totalSinErrores: sinErrores.length,
  }
}

// ─── CORRELACIÓN EMOCIONAL VS RESULTADO ─────────────────────
export const correlacionEmocional = (trades) => {
  const grouped = {}
  trades.forEach(t => {
    const estado = t.estado_emocional_entrada || 3
    if (!grouped[estado]) grouped[estado] = []
    grouped[estado].push(t)
  })
  return [1, 2, 3, 4, 5].map(nivel => ({
    nivel,
    emoji: ['😰', '😟', '😐', '🙂', '😌'][nivel - 1],
    wr: grouped[nivel] ? +(winRate(grouped[nivel]) * 100).toFixed(1) : 0,
    total: grouped[nivel]?.length || 0,
  }))
}

// ─── CORRELACIÓN CONFIANZA VS RESULTADO ─────────────────────
export const correlacionConfianza = (trades) => {
  const grouped = {}
  trades.forEach(t => {
    const conf = t.confianza_setup || 3
    if (!grouped[conf]) grouped[conf] = []
    grouped[conf].push(t)
  })
  return [1, 2, 3, 4, 5].map(nivel => ({
    nivel,
    wr: grouped[nivel] ? +(winRate(grouped[nivel]) * 100).toFixed(1) : 0,
    total: grouped[nivel]?.length || 0,
  }))
}
