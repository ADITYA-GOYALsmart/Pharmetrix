// Minimal declaration to satisfy TypeScript during tsc step
// These values are replaced at build time via Vite define in vite.config.ts

declare const process: {
  env?: {
    PRIMARY_BACKEND_URL?: string
    DEPLOYED_BACKEND_URL?: string
  }
}