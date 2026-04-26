/**
 * App — Shell principal con navegación lateral y vistas
 */
import { useTrading } from './context/TradingContext'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard/Dashboard'
import TradeForm from './components/TradeForm/TradeForm'
import TradeLog from './components/TradeLog/TradeLog'
import Statistics from './components/Statistics/Statistics'
import Challenges from './components/Challenges/Challenges'
import GlobalStats from './components/GlobalStats/GlobalStats'
import Diary from './components/Diary/Diary'

const views = {
  dashboard: Dashboard,
  new_trade: TradeForm,
  trade_log: TradeLog,
  statistics: Statistics,
  challenges: Challenges,
  global_stats: GlobalStats,
  diary: Diary,
}

export default function App() {
  const { state } = useTrading()
  const ActiveView = views[state.activeView] || Dashboard

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <ActiveView />
        </div>
      </main>
    </div>
  )
}
