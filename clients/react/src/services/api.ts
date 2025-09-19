// API base URL resolver with local-first, deployed fallback
// - Pings local /ping with short timeout
// - Falls back to deployed URL if local is unreachable
// - Caches the resolved base URL in memory

const LOCAL_URL = (process as any).env?.PRIMARY_BACKEND_URL || 'http://localhost:4200'
const DEPLOYED_URL = (process as any).env?.DEPLOYED_BACKEND_URL || 'https://pharmetrix.onrender.com'

let cachedBaseUrl: string | null = null

async function isReachable(url: string, timeoutMs = 800): Promise<boolean> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url + '/ping', { method: 'GET', signal: controller.signal })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(t)
  }
}

export async function getApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl) {
    return cachedBaseUrl
  }
  // Try local first
  if (await isReachable(LOCAL_URL)) {
    cachedBaseUrl = LOCAL_URL
    return LOCAL_URL
  }
  // Fallback to deployed
  cachedBaseUrl = DEPLOYED_URL
  return DEPLOYED_URL
}

// Convenience wrapper for fetching with resolved base
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const base = await getApiBaseUrl()
  const url = input.startsWith('http') ? input : base.replace(/\/$/, '') + '/' + input.replace(/^\//, '')
  return fetch(url, init)
}