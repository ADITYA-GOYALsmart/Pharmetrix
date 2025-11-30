import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { AppRouter } from './router'
import { ThemeProvider } from './app/services/theme/theme.service'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
)
