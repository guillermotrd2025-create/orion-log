import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { TradingProvider } from './context/TradingContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TradingProvider>
      <App />
    </TradingProvider>
  </StrictMode>,
)
