import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

try {
  registerSW({ immediate: true })
} catch {
  // PWA registration must never block first paint on GitHub Pages
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter: reliable on project Pages; avoids blank UI when basename/path mismatch */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
