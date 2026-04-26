/**
 * Sidebar — Navegación lateral con branding y accesos rápidos
 */
import { useTrading } from '../context/TradingContext'
import { exportToCSV, exportToJSON } from '../utils/exporters'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', shortcut: 'D' },
  { id: 'new_trade', label: 'Nuevo Trade', icon: '➕', shortcut: 'N', requiresChallenge: true },
  { id: 'trade_log', label: 'Historial', icon: '📋', shortcut: 'H' },
  { id: 'statistics', label: 'Estadísticas', icon: '📈', shortcut: 'E' },
  { id: 'challenges', label: 'Challenges', icon: '🏆', shortcut: 'C' },
]

export default function Sidebar() {
  const { state, setView, challengeTrades, activeChallenge, canTrade } = useTrading()

  const handleExportCSV = () => exportToCSV(challengeTrades)
  const handleExportJSON = () => {
    exportToJSON({
      trades: state.trades,
      challenges: state.challenges,
      activeChallengeId: state.activeChallengeId,
    })
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-bg-card border-r border-border h-screen flex flex-col">
      {/* Branding */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#378ADD] to-[#1D9E75] flex items-center justify-center">
            <span className="text-white font-bold font-mono text-sm">O</span>
          </div>
          <div>
            <h1 className="font-mono font-bold text-sm text-text-primary tracking-wide">ORION LOG</h1>
            <p className="text-[10px] text-text-muted">Trading Journal v2.0</p>
          </div>
        </div>
      </div>

      {/* Challenge activo info */}
      <div className="px-4 py-3 border-b border-border">
        {activeChallenge ? (
          <button className="w-full text-left group" onClick={() => setView('challenges')}>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Challenge Activo</p>
            <p className="text-xs text-text-primary font-medium truncate group-hover:text-blue transition-colors">
              {activeChallenge.nombre}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {activeChallenge.resultado_final === 'ACTIVO' ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
                  <span className="text-[10px] text-green font-mono">ACTIVO</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red" />
                  <span className="text-[10px] text-red font-mono">{activeChallenge.resultado_final}</span>
                </>
              )}
            </div>
          </button>
        ) : (
          <button className="w-full text-left group" onClick={() => setView('challenges')}>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Sin Challenge</p>
            <p className="text-xs text-amber font-medium group-hover:text-blue transition-colors">
              Crea o selecciona uno →
            </p>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const isBlocked = item.requiresChallenge && !canTrade
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item w-full ${state.activeView === item.id ? 'active' : ''} ${isBlocked ? 'opacity-40 cursor-not-allowed' : ''}`}
              onClick={() => !isBlocked ? setView(item.id) : setView('challenges')}
              title={isBlocked ? 'Necesitas un challenge activo' : item.label}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {isBlocked ? (
                <span className="text-[9px]">🔒</span>
              ) : (
                <kbd className="text-[9px] font-mono text-text-muted bg-bg-elevated px-1.5 py-0.5 rounded border border-border">
                  {item.shortcut}
                </kbd>
              )}
            </button>
          )
        })}
      </nav>

      {/* Export actions */}
      <div className="p-3 border-t border-border space-y-1.5">
        <p className="text-[10px] text-text-muted uppercase tracking-widest px-2 mb-1">Exportar</p>
        <button
          id="export-csv-btn"
          className="nav-item w-full text-xs"
          onClick={handleExportCSV}
        >
          <span>📄</span>
          <span>Exportar CSV</span>
        </button>
        <button
          id="export-json-btn"
          className="nav-item w-full text-xs"
          onClick={handleExportJSON}
        >
          <span>💾</span>
          <span>Backup JSON</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-[9px] text-text-muted text-center font-mono">
          ORION LOG © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  )
}
