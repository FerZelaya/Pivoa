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
import { passwordIssueMessageKey, validatePassword } from '@/lib/password'

export default function RegisterPage() {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkInbox, setCheckInbox] = useState(false)

  const { user, loading: authLoading, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  if (!authLoading && user && !checkInbox) return <Navigate to="/overview" replace />

  const requireAge = () => {
    if (ageConfirmed) return true
    setError(t('auth.register.ageRequired'))
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!requireAge()) return
    if (password !== confirmPassword) return setError(t('auth.register.passwordsMismatch'))
    const passwordIssue = validatePassword(password)
    if (passwordIssue) return setError(t(passwordIssueMessageKey(passwordIssue)))

    setLoading(true)
    const { error, needsEmailConfirmation } = await signUp(email, password, fullName || undefined)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (needsEmailConfirmation) {
      setCheckInbox(true)
      setLoading(false)
      return
    }
    navigate('/onboarding', { replace: true })
  }

  return (
    <AuthLayout
      eyebrow={t('auth.register.eyebrow')}
      title={checkInbox ? t('auth.register.titleSent') : t('auth.register.title')}
      subtitle={
        checkInbox
          ? t('auth.register.subtitleSent', { email })
          : t('auth.register.subtitle')
      }
      footer={
        checkInbox ? (
          <Link to="/login" className="text-primary-container font-semibold hover:text-primary">
            {t('auth.register.backToSignIn')}
          </Link>
        ) : (
          <>
            {t('auth.register.footerHaveAccount')}{' '}
            <Link to="/login" className="text-primary-container font-semibold hover:text-primary">
              {t('auth.register.signIn')}
            </Link>
          </>
        )
      }
    >
      {error && <AuthError message={error} />}
      {checkInbox ? (
        <div className="flex flex-col gap-space-md">
          <div className="rounded-xl bg-surface-container-low p-space-md flex items-start gap-space-sm">
            <Icon name="mark_email_unread" className="text-[22px] text-primary-container shrink-0 mt-0.5" />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              {t('auth.register.checkInboxHint')}
            </p>
          </div>
          <Button type="button" size="lg" className="w-full" variant="tonal" onClick={() => setCheckInbox(false)}>
            {t('auth.register.useDifferentEmail')}
          </Button>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary font-body-md text-body-md font-semibold hover:bg-primary"
          >
            {t('auth.register.backToSignIn')}
            <Icon name="arrow_forward" className="text-[18px]" />
          </Link>
        </div>
      ) : (
        <>
          <label htmlFor="ageConfirmed" className="flex items-start gap-space-sm cursor-pointer">
            <input
              id="ageConfirmed"
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => {
                setAgeConfirmed(e.target.checked)
                if (e.target.checked) setError(null)
              }}
              className="mt-1 h-4 w-4 rounded border-outline-variant accent-primary-container"
              required
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant">{t('auth.register.ageGate')}</span>
          </label>
          <GoogleButton
            disabled={loading || !ageConfirmed}
            onClick={async () => {
              setError(null)
              if (!requireAge()) return
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
            <p className="font-body-sm text-body-sm text-outline -mt-space-xs">{t('auth.password.hint')}</p>
            <Button type="submit" size="lg" className="w-full" disabled={loading || !ageConfirmed}>
              {loading ? t('auth.register.submitting') : t('auth.register.submit')}
              {!loading && <Icon name="arrow_forward" className="text-[18px]" />}
            </Button>
          </form>
        </>
      )}
    </AuthLayout>
  )
}
