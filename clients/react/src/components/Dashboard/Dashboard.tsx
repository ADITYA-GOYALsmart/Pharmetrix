import { useEffect, useMemo, useState } from 'react'

export default function Dashboard() {
  const stored = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('authUser') || 'null') } catch { return null }
  }, [])
  const name = (stored?.fullName as string) || (stored?.email as string) || 'User'

  const [greeting, setGreeting] = useState('Hi')
  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{greeting}, {name} 👋</h1>
    </main>
  )
}