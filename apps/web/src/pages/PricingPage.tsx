import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useCheckout } from '@/hooks/useBilling'
import { useMe } from '@/hooks/useMe'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '$0',
    note: 'Start tracking',
    points: ['Onboarding and 1 currency', '50 expenses per cycle', '1 savings goal', 'No receipt scanning'],
  },
  {
    id: 'plus' as const,
    name: 'Plus',
    price: '$7',
    note: '$59/year',
    points: ['Unlimited expenses', 'Any currency', 'Unlimited goals', '40 receipt scans per cycle', 'CSV export', '14-day trial'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$14',
    note: '$119/year',
    points: ['Everything in Plus', '200 receipt scans per cycle', 'High-priority support tickets'],
  },
]

export default function PricingPage() {
  const { user } = useAuth()
  const { data: me } = useMe()
  const checkout = useCheckout()
  const navigate = useNavigate()

  const choose = (plan: 'plus' | 'pro', interval: 'month' | 'year') => {
    if (!user) {
      navigate('/register')
      return
    }
    checkout.mutate(
      { plan, interval },
      { onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not start checkout') }
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 flex items-center justify-between px-space-lg">
        <Link to="/">
          <Logo className="h-10" />
        </Link>
        <Link to={user ? '/overview' : '/login'} className="font-body-sm text-body-sm font-semibold text-primary-container">
          {user ? 'Back to app' : 'Sign in'}
        </Link>
      </header>
      <main className="max-w-5xl mx-auto px-space-md py-space-xl">
        <p className="font-label-caps text-label-caps uppercase text-on-surface-variant text-center">Pricing</p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface text-center mt-1">A plan that matches how you spend</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-xl">
          {PLANS.map((plan) => (
            <article key={plan.id} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{plan.name}</h2>
                <p className="font-headline-md text-headline-md text-on-surface mt-1">
                  {plan.price}
                  {plan.id !== 'free' && <span className="font-body-sm text-body-sm text-outline">/mo</span>}
                </p>
                <p className="font-body-sm text-body-sm text-outline">{plan.note}</p>
                {me?.plan === plan.id && <p className="font-label-caps text-label-caps uppercase text-secondary mt-2">Current plan</p>}
              </div>
              <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant flex-1">
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {plan.id === 'free' ? (
                <Button type="button" variant="ghost" onClick={() => navigate(user ? '/overview' : '/register')}>
                  {user ? 'Stay on Free' : 'Create account'}
                </Button>
              ) : (
                <div className="flex flex-col gap-space-xs">
                  <Button type="button" disabled={checkout.isPending || me?.plan === plan.id} onClick={() => choose(plan.id, 'month')}>
                    Monthly
                  </Button>
                  <Button type="button" variant="tonal" disabled={checkout.isPending || me?.plan === plan.id} onClick={() => choose(plan.id, 'year')}>
                    Yearly
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
