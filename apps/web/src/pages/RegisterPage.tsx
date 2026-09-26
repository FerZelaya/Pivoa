import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { AuthError, AuthLayout } from '@/components/auth/AuthLayout'
import { GoogleButton } from '@/components/auth/GoogleButton'

export default function RegisterPage() {
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
    if (password !== confirmPassword) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')

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
      eyebrow="Get started • Free"
      title="Create your account"
      subtitle="Two minutes to set up your monthly budget and first goal."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary-container font-semibold hover:text-primary">
            Sign in
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
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" placeholder="Alex Morgan" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" autoFocus />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-outline -mt-space-xs">At least 6 characters.</p>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
          {!loading && <Icon name="arrow_forward" className="text-[18px]" />}
        </Button>
      </form>
    </AuthLayout>
  )
}
