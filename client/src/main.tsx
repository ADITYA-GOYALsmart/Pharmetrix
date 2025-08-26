import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/global.scss'
import Welcome from './components/Welcome/Welcome.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome />
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
