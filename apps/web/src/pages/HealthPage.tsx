import { useEffect, useState } from 'react'
import type { HealthResponse } from '@pivoa/shared'

export default function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: HealthResponse = await response.json()
        setHealth(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect')
        setHealth(null)
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-8">
          <h1 className="flex justify-center mb-2"><img src="/logo.svg" alt="Pivoa" className="h-10" />
          </h1>
          <p className="text-on-surface-variant text-center mb-8">
            System Health Check
          </p>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-error-container/50 text-on-error-container rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Connection Error</span>
              </div>
              <p className="mt-2 text-sm">{error}</p>
              <p className="mt-2 text-sm text-on-surface-variant">
                Make sure the API server is running on port 3000
              </p>
            </div>
          )}

          {health && (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-surface-container-low">
                <span className="text-on-surface-variant">API Status</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  health.status === 'ok' 
                    ? 'bg-secondary-container/40 text-on-secondary-container' 
                    : 'bg-tertiary-fixed text-tertiary'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    health.status === 'ok' ? 'bg-secondary' : 'bg-tertiary-container'
                  }`} />
                  {health.status === 'ok' ? 'Healthy' : 'Error'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-surface-container-low">
                <span className="text-on-surface-variant">Database</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                  health.db === 'connected' 
                    ? 'bg-secondary-container/40 text-on-secondary-container' 
                    : 'bg-tertiary-fixed text-tertiary'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    health.db === 'connected' ? 'bg-secondary' : 'bg-tertiary-container'
                  }`} />
                  {health.db === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-on-surface-variant">Last Check</span>
                <span className="text-on-surface text-sm">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-surface-container-low">
            <p className="text-center text-sm text-on-surface-variant">
              Smart Personal Finance Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
