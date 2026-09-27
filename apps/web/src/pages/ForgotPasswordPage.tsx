import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { AuthError, AuthLayout } from '@/components/auth/AuthLayout'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { user, loading: authLoading, requestPasswordReset } = useAuth()

  if (!authLoading && user) return <Navigate to="/overview" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await requestPasswordReset(email)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout
      eyebrow={t('auth.forgot.eyebrow')}
      title={sent ? t('auth.forgot.titleSent') : t('auth.forgot.title')}
      subtitle={
        sent
          ? t('auth.forgot.subtitleSent', { email })
          : t('auth.forgot.subtitle')
      }
      footer={
        <Link to="/login" className="text-primary-container font-semibold hover:text-primary">
          {t('auth.forgot.backToSignIn')}
        </Link>
      }
    >
      {error && <AuthError message={error} />}
      {sent ? (
        <Button type="button" size="lg" className="w-full" onClick={() => setSent(false)}>
          {t('auth.forgot.sendAnother')}
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div>
            <Label htmlFor="email">{t('auth.forgot.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.forgot.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="w-full mt-space-xs" disabled={loading}>
            {loading ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
            {!loading && <Icon name="mail" className="text-[18px]" />}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
