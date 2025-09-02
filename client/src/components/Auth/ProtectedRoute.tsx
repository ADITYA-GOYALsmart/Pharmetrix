import { useEffect, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = (() => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4200'
  if (typeof window === 'undefined') return envUrl
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  return isLocal ? envUrl : 'https://pharmetrix.onrender.com'
})()

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const navigate = useNavigate()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) {
          if (!cancelled) setAllowed(false)
          return
        }
        const resp = await fetch(`${API_URL}/check-token`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!cancelled) setAllowed(resp.ok)
        if (!resp.ok) {
          // Token invalid/expired → clear and redirect
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          navigate('/')
        }
      } catch {
        if (!cancelled) setAllowed(false)
        navigate('/')
      }
    }
    check()
    return () => { cancelled = true }
  }, [navigate])

  if (allowed === null) return null // or a loader
  if (!allowed) return null
  return children
}