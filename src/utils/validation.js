/**
 * ORION LOG — Validación de trades y reglas de negocio
 */

// Ventana operativa válida: 08:15 - 10:30 CET
export const esHoraValida = (hora) => {
  if (!hora) return false
  const [h, m] = hora.split(':').map(Number)
  const mins = h * 60 + m
  return mins >= 8 * 60 + 15 && mins <= 10 * 60 + 30
}

// Spread óptimo: ≤ 2 puntos
export const esSpreadOptimo = (spread) => {
  return spread <= 2
}

// Validar distancia TP/SL (~25 puntos)
export const validarDistancia = (entrada, objetivo, esperado = 25) => {
  const distancia = Math.abs(objetivo - entrada)
  const tolerancia = 3 // permitir ±3 puntos de margen
  return {
    distancia: +distancia.toFixed(1),
    valido: distancia >= esperado - tolerancia && distancia <= esperado + tolerancia,
    mensaje: distancia < esperado - tolerancia
      ? `Distancia muy corta (${distancia.toFixed(1)}pt vs ${esperado}pt esperados)`
      : distancia > esperado + tolerancia
        ? `Distancia muy larga (${distancia.toFixed(1)}pt vs ${esperado}pt esperados)`
        : null,
  }
}

// Verificar si la entrada está dentro de la banda ORB
export const entradaDentroORB = (precioEntrada, orbHigh, orbLow) => {
  return precioEntrada >= orbLow && precioEntrada <= orbHigh
}

// Generar warnings para un trade
export const generarWarnings = (trade, tradesDelDia = []) => {
  const warnings = []

  // Hora fuera de ventana operativa
  if (trade.hora_entrada && !esHoraValida(trade.hora_entrada)) {
    warnings.push({
      tipo: 'WARNING',
      icono: '⚠️',
      mensaje: 'Hora fuera de la ventana operativa (08:15-10:30 CET)',
    })
  }

  // Spread alto
  if (trade.spread && trade.spread > 2) {
    warnings.push({
      tipo: 'WARNING',
      icono: '⚠️',
      mensaje: `Spread alto (${trade.spread}pt). ¿Es necesario entrar ahora?`,
    })
  }

  // Noticias cercanas
  if (trade.noticias_cercanas) {
    warnings.push({
      tipo: 'WARNING',
      icono: '📰',
      mensaje: 'Noticias de alto impacto en ±30 minutos',
    })
  }

  // Segundo trade del día
  if (tradesDelDia.length >= 1) {
    const primerTrade = tradesDelDia[0]
    if (primerTrade.resultado === 'BE') {
      warnings.push({
        tipo: 'CRITICAL',
        icono: '🛑',
        mensaje: 'El 1er trade fue BE. No se recomienda 2º operación.',
      })
    } else {
      warnings.push({
        tipo: 'WARNING',
        icono: '⚠️',
        mensaje: 'Ya tienes un SL hoy. Evalúa si el 2º setup es A+ antes de entrar.',
      })
    }
  }

  if (tradesDelDia.length >= 2) {
    warnings.push({
      tipo: 'CRITICAL',
      icono: '🛑',
      mensaje: 'Límite diario: No más operaciones hoy.',
    })
  }

  // Error de ejecución: llegó a +10pt pero no movió SL a BE
  if (trade.llego_a_10pt && !trade.be_activado) {
    warnings.push({
      tipo: 'ERROR',
      icono: '❌',
      mensaje: 'El precio llegó a +10pt pero NO moviste el SL a BE. Error de ejecución.',
    })
  }

  return warnings
}

// Generar alertas del dashboard basadas en estado del challenge
export const generarAlertasDashboard = (trades, challenge) => {
  const alertas = []
  const hoy = new Date().toISOString().split('T')[0]
  const tradesHoy = trades.filter(t => t.fecha === hoy)
  const slHoy = tradesHoy.filter(t => t.resultado === 'SL').length
  const pnlHoy = tradesHoy.reduce((s, t) => s + t.pnl_neto, 0)
  const pnlTotal = trades.reduce((s, t) => s + t.pnl_neto, 0)

  // Alertas diarias
  if (slHoy === 1) {
    alertas.push({
      tipo: 'WARNING',
      icono: '⚠️',
      mensaje: 'Ya tienes un SL hoy. Evalúa si el 2º setup es A+ antes de entrar.',
      color: 'amber',
    })
  }
  if (slHoy >= 2 || tradesHoy.length >= 2) {
    alertas.push({
      tipo: 'CRITICAL',
      icono: '🛑',
      mensaje: 'Límite diario: No más operaciones hoy.',
      color: 'red',
    })
  }

  // P&L diario
  if (pnlHoy <= -200) {
    alertas.push({
      tipo: 'WARNING',
      icono: '⚠️',
      mensaje: `P&L del día: $${pnlHoy.toFixed(0)}. Considera parar hoy (-2%).`,
      color: 'amber',
    })
  }
  if (pnlHoy <= -400) {
    alertas.push({
      tipo: 'CRITICAL',
      icono: '🛑',
      mensaje: `¡LÍMITE DE SEGURIDAD! P&L del día: $${pnlHoy.toFixed(0)} (-4%). PARA HOY.`,
      color: 'red',
    })
  }

  // Drawdown del challenge
  if (challenge) {
    const ddActual = Math.max(0, -pnlTotal)
    const ddPct = ddActual / challenge.dd_max_usd
    if (ddPct >= 0.7) {
      alertas.push({
        tipo: 'CRITICAL',
        icono: '🛑',
        mensaje: `Zona peligrosa: DD en $${ddActual.toFixed(0)} (${(ddPct * 100).toFixed(0)}% del límite). Máxima precaución.`,
        color: 'red',
      })
    }
  }

  // Win rate por debajo de break-even
  const wr = trades.filter(t => t.resultado !== 'BE')
  if (wr.length >= 5) {
    const wrReal = wr.filter(t => t.resultado === 'TP').length / wr.length
    if (wrReal < 0.53) {
      alertas.push({
        tipo: 'WARNING',
        icono: '⚠️',
        mensaje: `Win rate (${(wrReal * 100).toFixed(1)}%) por debajo del break-even (53%). Revisar setup.`,
        color: 'amber',
      })
    }
  }

  return alertas
}
