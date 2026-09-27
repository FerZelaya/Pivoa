import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { AuthError, AuthLayout } from '@/components/auth/AuthLayout'
import { SplashScreen } from '@/components/auth/SplashScreen'

function hashIsRecovery() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  if (hash.get('type') === 'recovery') return true
  return new URLSearchParams(window.location.search).get('type') === 'recovery'
}

export default function RecoveryPage() {
  const { user, loading: authLoading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [fromLink] = useState(() => hashIsRecovery())
  const [recoveryEvent, setRecoveryEvent] = useState(false)
  const [bootDone, setBootDone] = useState(!fromLink)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const recoveryReady = fromLink || recoveryEvent

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryEvent(true)
        setBootDone(true)
      }
    })

    if (!fromLink) return () => subscription.unsubscribe()

    const timer = window.setTimeout(() => setBootDone(true), 2000)
    return () => {
      subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [fromLink])

  if (authLoading || !bootDone) return <SplashScreen />

  if (user && !recoveryReady) return <Navigate to="/overview" replace />

  if (!user || !recoveryReady) {
    return (
      <AuthLayout
        eyebrow="Reset password"
        title="Link expired or invalid"
        subtitle="Request a new reset email from the sign-in page, or ask support to send one."
        footer={
          <Link to="/login" className="text-primary-container font-semibold hover:text-primary">
            Back to sign in
          </Link>
        }
      >
        <Button type="button" size="lg" className="w-full" onClick={() => navigate('/forgot-password')}>
          Request a new link
        </Button>
      </AuthLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) return setError('Password must be at least 6 characters')
    if (password !== confirmPassword) return setError('Passwords do not match')

    setLoading(true)
    const { error } = await updatePassword(password)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    window.history.replaceState(null, '', '/auth/recovery')
    navigate('/overview', { replace: true })
  }

  return (
    <AuthLayout
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle="You are signed in with a recovery link. Set a new password to continue."
      footer={
        <Link to="/login" className="text-primary-container font-semibold hover:text-primary">
          Back to sign in
        </Link>
      }
    >
      {error && <AuthError message={error} />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div>
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              autoFocus
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-on-surface"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[18px]" />
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" size="lg" className="w-full mt-space-xs" disabled={loading}>
          {loading ? 'Saving…' : 'Save password and continue'}
          {!loading && <Icon name="arrow_forward" className="text-[18px]" />}
        </Button>
      </form>
    </AuthLayout>
  )
}
