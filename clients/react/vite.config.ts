import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Minimal declaration to satisfy TS without requiring @types/node
declare const process: any

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (no prefix filter) so we can forward non-VITE ones
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5000,
      strictPort: true,
    },
    define: {
      // Expose non-VITE envs by inlining them at build time
      'process.env.PRIMARY_BACKEND_URL': JSON.stringify(env.PRIMARY_BACKEND_URL),
      'process.env.DEPLOYED_BACKEND_URL': JSON.stringify(env.DEPLOYED_BACKEND_URL),
    },
  }
})
