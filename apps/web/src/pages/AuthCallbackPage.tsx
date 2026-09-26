import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { SplashScreen } from '@/components/auth/SplashScreen'

export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (user) {
      navigate('/overview', { replace: true })
      return
    }
    const timer = window.setTimeout(() => navigate('/login', { replace: true }), 1500)
    return () => window.clearTimeout(timer)
  }, [loading, user, navigate])

  return <SplashScreen />
}
