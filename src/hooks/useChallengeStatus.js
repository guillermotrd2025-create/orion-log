/**
 * ORION LOG — Hook de estado del challenge activo
 * Calcula progreso, drawdown, días restantes y alertas.
 */
import { useMemo } from 'react'
import { pnlAcumulado, maxDrawdown } from '../utils/calculations'
import { generarAlertasDashboard } from '../utils/validation'

export const useChallengeStatus = (challenge, trades) => {
  return useMemo(() => {
    if (!challenge) {
      return {
        progreso: 0,
        progresoColor: 'red',
        ddActual: 0,
        ddPct: 0,
        ddColor: 'green',
        diasRestantes: 0,
        diasTranscurridos: 0,
        pnlTotal: 0,
        pnlPct: 0,
        alertas: [],
        estaActivo: false,
      }
    }

    const pnlTotal = pnlAcumulado(trades)
    const pnlPct = +((pnlTotal / challenge.cuenta_usd) * 100).toFixed(2)
    const progreso = Math.min(100, Math.max(0, (pnlTotal / challenge.objetivo_usd) * 100))
    const ddMax = maxDrawdown(trades)
    const ddPct = +((ddMax / challenge.dd_max_usd) * 100).toFixed(1)

    // Color de la barra de progreso
    let progresoColor = 'red'
    if (pnlTotal > 0 && progreso < 50) progresoColor = 'amber'
    if (progreso >= 50) progresoColor = 'green'

    // Color del drawdown
    let ddColor = 'green'
    if (ddPct > 50) ddColor = 'amber'
    if (ddPct > 70) ddColor = 'red'

    // Días
    const inicio = new Date(challenge.fecha_inicio)
    const hoy = new Date()
    const diasTranscurridos = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24))
    const diasRestantes = Math.max(0, challenge.dias_maximos - diasTranscurridos)

    // Alertas de seguridad
    const alertas = generarAlertasDashboard(trades, challenge)

    return {
      progreso: +progreso.toFixed(1),
      progresoColor,
      ddActual: ddMax,
      ddPct,
      ddColor,
      diasRestantes,
      diasTranscurridos,
      pnlTotal,
      pnlPct,
      alertas,
      estaActivo: challenge.resultado_final === 'ACTIVO',
    }
  }, [challenge, trades])
}
