import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { AuthError, AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleButton } from '@/components/auth/GoogleButton'

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { user, loading: authLoading, signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const requested = (location.state as { from?: { pathname: string } })?.from?.pathname
  const dest = requested && requested !== '/onboarding' && requested !== '/login' ? requested : '/overview'

  if (!authLoading && user) return <Navigate to={dest} replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate(dest, { replace: true })
    }
  }

  return (
    <AuthLayout
      eyebrow={t('auth.login.eyebrow')}
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.footerNew')}{' '}
          <Link to="/register" className="text-primary-container font-semibold hover:text-primary">
            {t('auth.login.createAccount')}
          </Link>
        </>
      }
    >
      {error && <AuthError message={error} />}
      <GoogleButton
        disabled={loading}
        onClick={async () => {
          setError(null)
          const { error } = await signInWithGoogle(email)
          if (error) setError(error.message)
        }}
      />
      <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div>
          <Label htmlFor="email">{t('auth.login.email')}</Label>
          <Input id="email" type="email" placeholder={t('auth.login.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />
        </div>
        <div>
          <div className="flex items-center justify-between gap-space-sm">
            <Label htmlFor="password">{t('auth.login.password')}</Label>
            <Link to="/forgot-password" className="font-body-sm text-body-sm text-primary-container font-semibold hover:text-primary">
              {t('auth.login.forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-on-surface"
              aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
            >
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[18px]" />
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full mt-space-xs" disabled={loading}>
          {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          {!loading && <Icon name="arrow_forward" className="text-[18px]" />}
        </Button>
      </form>
    </AuthLayout>
  )
}
