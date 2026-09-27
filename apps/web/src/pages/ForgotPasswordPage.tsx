import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { AuthError, AuthLayout } from '@/components/auth/AuthLayout'

export default function ForgotPasswordPage() {
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
      eyebrow="Reset password"
      title={sent ? 'Check your email' : 'Forgot your password?'}
      subtitle={
        sent
          ? `If an account exists for ${email}, we sent a link to choose a new password.`
          : 'Enter your email and we will send a recovery link.'
      }
      footer={
        <Link to="/login" className="text-primary-container font-semibold hover:text-primary">
          Back to sign in
        </Link>
      }
    >
      {error && <AuthError message={error} />}
      {sent ? (
        <Button type="button" size="lg" className="w-full" onClick={() => setSent(false)}>
          Send another email
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="w-full mt-space-xs" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
            {!loading && <Icon name="mail" className="text-[18px]" />}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
