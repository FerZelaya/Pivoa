import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { useCheckout } from '@/hooks/useBilling'
import { useMe } from '@/hooks/useMe'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'

const PLAN_IDS = ['free', 'plus', 'pro'] as const

export default function PricingPage() {
  const { t } = useTranslation()
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
      { onError: (err) => toast.error(err instanceof Error ? err.message : t('pricing.checkoutError')) }
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 flex items-center justify-between px-space-lg gap-space-md">
        <Link to="/">
          <Logo className="h-10" />
        </Link>
        <div className="flex items-center gap-space-md">
          <LanguageSwitcher persist={false} compact />
          <Link to={user ? '/overview' : '/login'} className="font-body-sm text-body-sm font-semibold text-primary-container">
            {user ? t('pricing.backToApp') : t('pricing.signIn')}
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-space-md py-space-xl">
        <p className="font-label-caps text-label-caps uppercase text-on-surface-variant text-center">{t('pricing.eyebrow')}</p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface text-center mt-1">{t('pricing.title')}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-xl">
          {PLAN_IDS.map((id) => {
            const points = t(`pricing.plans.${id}.points`, { returnObjects: true }) as string[]
            return (
              <article key={id} className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">{t(`pricing.plans.${id}.name`)}</h2>
                  <p className="font-headline-md text-headline-md text-on-surface mt-1">
                    {t(`pricing.plans.${id}.price`)}
                    {id !== 'free' && <span className="font-body-sm text-body-sm text-outline">{t('pricing.perMonth')}</span>}
                  </p>
                  <p className="font-body-sm text-body-sm text-outline">{t(`pricing.plans.${id}.note`)}</p>
                  {me?.plan === id && <p className="font-label-caps text-label-caps uppercase text-secondary mt-2">{t('pricing.currentPlan')}</p>}
                </div>
                <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm text-on-surface-variant flex-1">
                  {Array.isArray(points) && points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {id === 'free' ? (
                  <Button type="button" variant="ghost" onClick={() => navigate(user ? '/overview' : '/register')}>
                    {user ? t('pricing.stayOnFree') : t('pricing.createAccount')}
                  </Button>
                ) : (
                  <div className="flex flex-col gap-space-xs">
                    <Button type="button" disabled={checkout.isPending || me?.plan === id} onClick={() => choose(id, 'month')}>
                      {t('pricing.monthly')}
                    </Button>
                    <Button type="button" variant="tonal" disabled={checkout.isPending || me?.plan === id} onClick={() => choose(id, 'year')}>
                      {t('pricing.yearly')}
                    </Button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
