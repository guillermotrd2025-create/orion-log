/**
 * ORION LOG — Exportadores CSV y JSON
 */

// Exportar trades a CSV
export const exportToCSV = (trades, filename = 'orion_log_trades.csv') => {
  if (!trades.length) return

  const headers = [
    'Fecha', 'Hora', 'Setup', 'Dirección', 'Resultado', 'P&L Neto',
    'Tendencia', 'Volatilidad', 'Hora Válida', 'Noticias',
    'Confirmación Vela', 'BE Activado', 'Siguió Plan', 'Desviación',
    'Estado Emocional Entrada', 'Estado Emocional Cierre', 'Confianza Setup',
    'FOMO', 'Revenge', 'Overtrading', 'Dudas', 'No Movió SL a BE',
    'Notas', 'Lección'
  ]

  const rows = trades.map(t => [
    t.fecha, t.hora_entrada, t.tipo_setup, t.direccion, t.resultado, t.pnl_neto,
    t.tendencia_diaria, t.volatilidad_sesion, t.hora_valida, t.noticias_cercanas,
    t.confirmacion_vela, t.be_activado, t.siguio_plan, t.desviacion_plan,
    t.estado_emocional_entrada, t.estado_emocional_cierre, t.confianza_setup,
    t.fomo, t.revenge_trading, t.overtrading, t.dudas_antes_entrada, t.no_movio_sl_a_be,
    `"${(t.notas_post || '').replace(/"/g, '""')}"`,
    `"${(t.leccion || '').replace(/"/g, '""')}"`
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadFile(csv, filename, 'text/csv')
}

// Exportar todo el estado a JSON (backup completo)
export const exportToJSON = (state, filename = 'orion_log_backup.json') => {
  const json = JSON.stringify(state, null, 2)
  downloadFile(json, filename, 'application/json')
}

// Importar desde archivo JSON
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (err) {
        reject(new Error('Archivo JSON inválido'))
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsText(file)
  })
}

// Helper para descargar un archivo
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
