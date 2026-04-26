/**
 * ORION LOG — Hook de estadísticas de trading
 * Centraliza todos los cálculos derivados del array de trades.
 */
import { useMemo } from 'react'
import {
  winRate, winRateFiltered, profitFactor, evReal, pnlAcumulado,
  rachaActual, peorRachaSL, mejorRachaTP, maxDrawdown, equityCurve,
  wrBreakEven, diasOperados, pnlDelDia, tradesDelDia, beRate,
  distribucionResultados, wrPorDiaSemana, wrPorHora, pnlPorDia,
  psicotradingStats, correlacionEmocional, correlacionConfianza,
} from '../utils/calculations'

export const useTradeStats = (trades) => {
  return useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winRateReal: 0,
        beRateReal: 0,
        profitFactorReal: 0,
        evPorTrade: 0,
        pnlTotal: 0,
        pnlPct: 0,
        rachaCurrent: { tipo: null, count: 0 },
        peorRacha: 0,
        mejorRacha: 0,
        ddMaximo: 0,
        diasOps: 0,
        wrMinBE: wrBreakEven(),
        equityData: [],
        distribucion: [
          { name: 'TP', value: 0, pct: 0 },
          { name: 'SL', value: 0, pct: 0 },
          { name: 'BE', value: 0, pct: 0 },
        ],
        wrPorSetup: [],
        wrPorDir: [],
        wrDiaSemana: [],
        wrHora: [],
        pnlDia: [],
        psicoStats: {
          errores: {},
          wrConErrores: 0,
          wrSinErrores: 0,
          costePsicologico: 0,
          totalConErrores: 0,
          totalSinErrores: 0,
        },
        emocionalCorr: [],
        confianzaCorr: [],
        pnlHoy: 0,
        tradesHoy: [],
      }
    }

    const hoy = new Date().toISOString().split('T')[0]

    // Win rate por tipo de setup
    const setups = ['ORB', 'PULLBACK_EMA9', 'TENDENCIA', 'OTRO']
    const wrPorSetup = setups
      .map(s => {
        const filtered = trades.filter(t => t.tipo_setup === s)
        return {
          setup: s,
          wr: +(winRate(filtered) * 100).toFixed(1),
          total: filtered.length,
          pf: profitFactor(filtered),
        }
      })
      .filter(s => s.total > 0)

    // Win rate por dirección
    const wrPorDir = ['LONG', 'SHORT'].map(d => ({
      dir: d,
      wr: +(winRateFiltered(trades, 'direccion', d) * 100).toFixed(1),
      total: trades.filter(t => t.direccion === d).length,
    }))

    return {
      totalTrades: trades.length,
      winRateReal: +(winRate(trades) * 100).toFixed(1),
      beRateReal: +(beRate(trades) * 100).toFixed(1),
      profitFactorReal: profitFactor(trades),
      evPorTrade: evReal(trades),
      pnlTotal: pnlAcumulado(trades),
      pnlPct: +((pnlAcumulado(trades) / 10000) * 100).toFixed(2),
      rachaCurrent: rachaActual(trades),
      peorRacha: peorRachaSL(trades),
      mejorRacha: mejorRachaTP(trades),
      ddMaximo: maxDrawdown(trades),
      diasOps: diasOperados(trades),
      wrMinBE: wrBreakEven(),
      equityData: equityCurve(trades),
      distribucion: distribucionResultados(trades),
      wrPorSetup,
      wrPorDir,
      wrDiaSemana: wrPorDiaSemana(trades),
      wrHora: wrPorHora(trades),
      pnlDia: pnlPorDia(trades),
      psicoStats: psicotradingStats(trades),
      emocionalCorr: correlacionEmocional(trades),
      confianzaCorr: correlacionConfianza(trades),
      pnlHoy: pnlDelDia(trades, hoy),
      tradesHoy: tradesDelDia(trades, hoy),
    }
  }, [trades])
}
