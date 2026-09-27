import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { SplashScreen } from '@/components/auth/SplashScreen'

function isRecoveryRedirect() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  if (hash.get('type') === 'recovery') return true
  return new URLSearchParams(window.location.search).get('type') === 'recovery'
}

export default function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isRecoveryRedirect()) {
      navigate('/auth/recovery', { replace: true })
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/auth/recovery', { replace: true })
      }
    })

    if (loading) return () => subscription.unsubscribe()
    if (user) {
      navigate('/overview', { replace: true })
      return () => subscription.unsubscribe()
    }
    const timer = window.setTimeout(() => navigate('/login', { replace: true }), 1500)
    return () => {
      subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [loading, user, navigate])

  return <SplashScreen />
}
