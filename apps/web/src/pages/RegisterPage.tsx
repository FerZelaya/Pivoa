import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { AuthError, AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleButton } from '@/components/auth/GoogleButton'

export default function RegisterPage() {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { user, loading: authLoading, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  if (!authLoading && user) return <Navigate to="/overview" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirmPassword) return setError(t('auth.register.passwordsMismatch'))
    if (password.length < 6) return setError(t('auth.register.passwordTooShort'))

    setLoading(true)
    const { error } = await signUp(email, password, fullName || undefined)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/onboarding', { replace: true })
    }
  }

  return (
    <AuthLayout
      eyebrow={t('auth.register.eyebrow')}
      title={t('auth.register.title')}
      subtitle={t('auth.register.subtitle')}
      footer={
        <>
          {t('auth.register.footerHaveAccount')}{' '}
          <Link to="/login" className="text-primary-container font-semibold hover:text-primary">
            {t('auth.register.signIn')}
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
          <Label htmlFor="fullName">{t('auth.register.fullName')}</Label>
          <Input id="fullName" placeholder={t('auth.register.fullNamePlaceholder')} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" autoFocus />
        </div>
        <div>
          <Label htmlFor="email">{t('auth.register.email')}</Label>
          <Input id="email" type="email" placeholder={t('auth.register.emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <div>
            <Label htmlFor="password">{t('auth.register.password')}</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">{t('auth.register.confirm')}</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-outline -mt-space-xs">{t('auth.register.passwordHint')}</p>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? t('auth.register.submitting') : t('auth.register.submit')}
          {!loading && <Icon name="arrow_forward" className="text-[18px]" />}
        </Button>
      </form>
    </AuthLayout>
  )
}
