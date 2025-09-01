import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/global.scss'
import Welcome from './components/Welcome/Welcome.tsx'
import Auth from './pages/Auth.tsx'
import Legal from './pages/Legal.tsx'
import Support from './pages/Support.tsx'
import Development from './pages/Development.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Welcome /> },
  { path: '/auth', element: <Auth /> },
  { path: '/legal', element: <Legal /> },
  { path: '/support', element: <Support /> },
  { path: '/development', element: <Development /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
