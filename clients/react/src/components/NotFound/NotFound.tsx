import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <p>
        <Link to="/dashboard">Go to Dashboard</Link>
      </p>
    </div>
  )
}