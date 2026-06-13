import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyAppearanceVars, DEFAULT_APPEARANCE } from './lib/appearance'

if (localStorage.getItem('sst-theme') === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark')
}

try {
  const storedAppearance = localStorage.getItem('sst-appearance')
  if (storedAppearance) {
    applyAppearanceVars(document.documentElement, { ...DEFAULT_APPEARANCE, ...JSON.parse(storedAppearance) })
  }
} catch {
  // configuração de aparência inválida, mantém o padrão
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
