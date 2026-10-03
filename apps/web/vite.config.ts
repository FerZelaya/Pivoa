import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin, type Connect } from 'vite'
import path from 'path'

function securityHeaders(supabaseUrl: string | undefined, isDev: boolean): Record<string, string> {
  const connect = new Set<string>(["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'])
  if (supabaseUrl) {
    try {
      const origin = new URL(supabaseUrl).origin
      connect.add(origin)
      if (origin.startsWith('https://')) connect.add(origin.replace('https://', 'wss://'))
      if (origin.startsWith('http://')) connect.add(origin.replace('http://', 'ws://'))
    } catch {
      /* ignore */
    }
  }

  const scriptSrc = isDev ? ["'self'", "'unsafe-eval'", "'unsafe-inline'"] : ["'self'"]
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${[...connect].join(' ')}`,
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
  ].join('; ')

  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  }
}

function securityHeadersPlugin(supabaseUrl: string | undefined, isDev: boolean): Plugin {
  const headers = securityHeaders(supabaseUrl, isDev)
  const apply = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use((_req, res, next) => {
      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value)
      }
      next()
    })
  }
  return {
    name: 'pivoa-security-headers',
    configureServer: apply,
    configurePreviewServer: apply,
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname!), '')
  const isDev = mode === 'development'

  return {
    plugins: [react(), tailwindcss(), securityHeadersPlugin(env.VITE_SUPABASE_URL, isDev)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname!, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
