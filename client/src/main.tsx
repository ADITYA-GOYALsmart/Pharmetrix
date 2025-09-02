import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/global.scss'
import Landing from './components/Landing/Landing.tsx'
import GetStarted from './pages/GetStarted.tsx'
import Legal from './pages/Legal.tsx'
import Support from './pages/Support.tsx'
import Development from './pages/Development.tsx'
import ProtectedRoute from './components/Auth/ProtectedRoute.tsx'
import Dashboard from './components/Dashboard/Dashboard.tsx'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/get-started', element: <GetStarted /> },
  { path: '/dashboard', element: (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ) },
  { path: '/legal', element: <Legal /> },
  { path: '/support', element: <Support /> },
  { path: '/development', element: <Development /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
