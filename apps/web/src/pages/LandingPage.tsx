import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@/components/ui/icon'
import { Logo } from '@/components/ui/logo'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: 'account_balance_wallet',
    tile: 'bg-primary-fixed text-primary',
    titleKey: 'landing.features.items.incomeCap.title',
    textKey: 'landing.features.items.incomeCap.text',
  },
  {
    icon: 'donut_small',
    tile: 'bg-secondary-container/50 text-secondary',
    titleKey: 'landing.features.items.categoryBudgets.title',
    textKey: 'landing.features.items.categoryBudgets.text',
  },
  {
    icon: 'flag',
    tile: 'bg-tertiary-fixed text-tertiary-container',
    titleKey: 'landing.features.items.savingsGoals.title',
    textKey: 'landing.features.items.savingsGoals.text',
  },
  {
    icon: 'document_scanner',
    tile: 'bg-primary-fixed text-primary',
    titleKey: 'landing.features.items.receiptScanning.title',
    textKey: 'landing.features.items.receiptScanning.text',
  },
  {
    icon: 'monitoring',
    tile: 'bg-secondary-container/50 text-secondary',
    titleKey: 'landing.features.items.cashFlow.title',
    textKey: 'landing.features.items.cashFlow.text',
  },
  {
    icon: 'receipt_long',
    tile: 'bg-surface-container-high text-on-surface',
    titleKey: 'landing.features.items.ledger.title',
    textKey: 'landing.features.items.ledger.text',
  },
  {
    icon: 'currency_exchange',
    tile: 'bg-primary-fixed text-primary',
    titleKey: 'landing.features.items.multiCurrency.title',
    textKey: 'landing.features.items.multiCurrency.text',
  },
  {
    icon: 'calendar_month',
    tile: 'bg-secondary-container/50 text-secondary',
    titleKey: 'landing.features.items.cycles.title',
    textKey: 'landing.features.items.cycles.text',
  },
  {
    icon: 'credit_card',
    tile: 'bg-tertiary-fixed text-tertiary-container',
    titleKey: 'landing.features.items.cards.title',
    textKey: 'landing.features.items.cards.text',
  },
  {
    icon: 'support_agent',
    tile: 'bg-tertiary-fixed text-tertiary-container',
    titleKey: 'landing.features.items.support.title',
    textKey: 'landing.features.items.support.text',
  },
  {
    icon: 'translate',
    tile: 'bg-primary-fixed text-primary',
    titleKey: 'landing.features.items.languages.title',
    textKey: 'landing.features.items.languages.text',
  },
  {
    icon: 'notifications_active',
    tile: 'bg-secondary-container/50 text-secondary',
    titleKey: 'landing.features.items.alerts.title',
    textKey: 'landing.features.items.alerts.text',
  },
  {
    icon: 'lock',
    tile: 'bg-surface-container-high text-on-surface',
    titleKey: 'landing.features.items.security.title',
    textKey: 'landing.features.items.security.text',
  },
] as const

const DEEP_DIVE = [
  {
    icon: 'grid_view',
    titleKey: 'landing.deepDive.items.overview.title',
    textKey: 'landing.deepDive.items.overview.text',
  },
  {
    icon: 'receipt_long',
    titleKey: 'landing.deepDive.items.transactions.title',
    textKey: 'landing.deepDive.items.transactions.text',
  },
  {
    icon: 'track_changes',
    titleKey: 'landing.deepDive.items.budgetsGoals.title',
    textKey: 'landing.deepDive.items.budgetsGoals.text',
  },
  {
    icon: 'document_scanner',
    titleKey: 'landing.deepDive.items.receipts.title',
    textKey: 'landing.deepDive.items.receipts.text',
  },
] as const

const STEPS = [
  { n: '01', titleKey: 'landing.how.steps.1.title', textKey: 'landing.how.steps.1.text' },
  { n: '02', titleKey: 'landing.how.steps.2.title', textKey: 'landing.how.steps.2.text' },
  { n: '03', titleKey: 'landing.how.steps.3.title', textKey: 'landing.how.steps.3.text' },
] as const

const FAQS = [
  { qKey: 'landing.faq.items.free.q', aKey: 'landing.faq.items.free.a' },
  { qKey: 'landing.faq.items.cards.q', aKey: 'landing.faq.items.cards.a' },
  { qKey: 'landing.faq.items.changeBudget.q', aKey: 'landing.faq.items.changeBudget.a' },
  { qKey: 'landing.faq.items.receipts.q', aKey: 'landing.faq.items.receipts.a' },
  { qKey: 'landing.faq.items.privacy.q', aKey: 'landing.faq.items.privacy.a' },
] as const

export default function LandingPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1200px] mx-auto h-full px-space-lg flex items-center justify-between">
          <Link to="/">
            <Logo className="h-10" />
          </Link>
          <nav className="hidden md:flex items-center gap-space-lg font-body-md text-body-md text-on-surface-variant">
            <a href="#features" className="hover:text-on-surface transition-colors">
              {t('landing.nav.features')}
            </a>
            <a href="#how" className="hover:text-on-surface transition-colors">
              {t('landing.nav.how')}
            </a>
            <a href="#pricing" className="hover:text-on-surface transition-colors">
              {t('landing.nav.pricing')}
            </a>
            <a href="#faq" className="hover:text-on-surface transition-colors">
              {t('landing.nav.faq')}
            </a>
          </nav>
          <div className="flex items-center gap-space-sm">
            <LanguageSwitcher persist={false} compact />
            {user ? (
              <Link
                to="/overview"
                className="px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary font-body-md text-body-md font-semibold shadow-sm transition-colors"
              >
                {t('landing.nav.openDashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-space-md py-space-sm rounded-lg text-on-surface hover:bg-surface-container-low font-body-md text-body-md font-medium transition-colors"
                >
                  {t('landing.nav.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary font-body-md text-body-md font-semibold shadow-sm transition-colors"
                >
                  {t('landing.nav.getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-space-xl overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-space-lg text-center">
          <span className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-lowest shadow-sm font-label-caps text-label-caps uppercase text-primary-container">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> {t('landing.hero.badge')}
          </span>
          <h1 className="mt-space-lg font-display text-[44px] leading-[52px] sm:text-[56px] sm:leading-[64px] font-bold tracking-[-0.03em] text-on-surface max-w-3xl mx-auto">
            {t('landing.hero.titleBefore')} <span className="text-primary-container">{t('landing.hero.titleAccent')}</span>
          </h1>
          <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">{t('landing.hero.subtitle')}</p>
          <div className="mt-space-xl flex flex-col sm:flex-row items-center justify-center gap-space-sm">
            <Link
              to={user ? '/overview' : '/register'}
              className="flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-body-lg text-body-lg font-semibold shadow-sm transition-colors"
            >
              {user ? t('landing.hero.ctaLoggedIn') : t('landing.hero.ctaGuest')}{' '}
              <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low font-body-lg text-body-lg font-medium shadow-sm transition-colors"
            >
              <Icon name="play_circle" className="text-[20px] text-primary-container" /> {t('landing.hero.seeFeatures')}
            </a>
          </div>
        </div>
        <HeroPreview />
      </section>

      <section id="features" className="py-20">
        <div className="max-w-[1200px] mx-auto px-space-lg">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">{t('landing.features.eyebrow')}</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{t('landing.features.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {FEATURES.map((f) => (
              <div
                key={f.titleKey}
                className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/5 group-hover:scale-110 transition-transform duration-500" />
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', f.tile)}>
                  <Icon name={f.icon} className="text-[22px]" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-md">{t(f.titleKey)}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{t(f.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-space-lg">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">{t('landing.deepDive.eyebrow')}</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{t('landing.deepDive.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {DEEP_DIVE.map((item, index) => (
              <article
                key={item.titleKey}
                className={cn(
                  'bg-surface-container-lowest rounded-xl shadow-sm p-space-lg sm:p-space-xl flex flex-col gap-space-md',
                  index % 2 === 1 && 'md:translate-y-space-lg'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
                  <Icon name={item.icon} className="text-[26px]" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{t(item.titleKey)}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{t(item.textKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-20">
        <div className="max-w-[1200px] mx-auto px-space-lg">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">{t('landing.how.eyebrow')}</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{t('landing.how.title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <span className="font-label-numeric-lg text-label-numeric-lg text-primary-container">{s.n}</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">{t(s.titleKey)}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{t(s.textKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-space-lg">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">{t('landing.plans.eyebrow')}</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{t('landing.plans.title')}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">{t('landing.plans.subtitle')}</p>
          </div>
          <article className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg sm:p-space-xl max-w-3xl mx-auto">
            <p className="font-headline-md text-headline-md text-on-surface">{t('landing.plans.free.name')}</p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{t('landing.plans.free.note')}</p>
            <ul className="mt-space-lg grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {(t('landing.plans.points', { returnObjects: true }) as string[]).map((point) => (
                <li key={point} className="flex items-start gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
                  <Icon name="check" className="text-[18px] shrink-0 mt-0.5 text-secondary" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <Link
              to={user ? '/overview' : '/register'}
              className="inline-flex mt-space-lg items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary font-body-md text-body-md font-semibold"
            >
              {t('landing.plans.ctaFree')}
            </Link>
          </article>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="max-w-[760px] mx-auto px-space-lg">
          <div className="text-center mb-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">{t('landing.faq.eyebrow')}</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">{t('landing.faq.title')}</h2>
          </div>
          <div className="flex flex-col gap-space-sm">
            {FAQS.map((f, i) => (
              <div key={f.qKey} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-space-md px-space-lg py-space-md text-left"
                >
                  <span className="font-body-lg text-body-lg font-semibold text-on-surface">{t(f.qKey)}</span>
                  <Icon name={openFaq === i ? 'remove' : 'add'} className="text-outline" />
                </button>
                {openFaq === i && (
                  <p className="px-space-lg pb-space-md font-body-md text-body-md text-on-surface-variant animate-fade-in">{t(f.aKey)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-space-lg">
          <div className="relative overflow-hidden rounded-xl bg-primary-container p-space-xl sm:p-12 text-center">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-secondary/30 blur-3xl" />
            <h2 className="relative font-headline-lg text-headline-lg text-on-primary">{t('landing.cta.title')}</h2>
            <p className="relative font-body-lg text-body-lg text-on-primary-container mt-space-sm">{t('landing.cta.subtitle')}</p>
            <Link
              to={user ? '/overview' : '/register'}
              className="relative inline-flex items-center gap-space-xs mt-space-lg px-space-lg py-3 rounded-lg bg-surface-container-lowest text-primary font-body-lg text-body-lg font-semibold shadow-sm hover:bg-primary-fixed transition-colors"
            >
              {user ? t('landing.cta.loggedIn') : t('landing.cta.guest')} <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1200px] mx-auto px-space-lg py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <Logo className="h-8" />
          <div className="flex items-center gap-space-md font-body-sm text-body-sm text-outline">
            <a href="#pricing" className="hover:text-on-surface">
              {t('landing.nav.pricing')}
            </a>
            <a href="#pricing" className="hover:text-on-surface">
              {t('landing.nav.pricing')}
            </a>
            <p>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function HeroPreview() {
  const { t } = useTranslation()
  const bars = [38, 52, 44, 61, 58, 72, 66, 80, 74, 86]
  const navItems = [
    ['grid_view', 'landing.preview.overview', true],
    ['receipt_long', 'landing.preview.transactions', false],
    ['track_changes', 'landing.preview.budgets', false],
    ['tune', 'landing.preview.settings', false],
  ] as const
  const kpis = [
    ['landing.preview.savedInGoals', '$12,480.00', 'account_balance', 'bg-primary-fixed text-primary', 'text-on-surface'],
    ['landing.preview.monthlyIncome', '$3,000.00', 'south_west', 'bg-secondary-container/40 text-secondary', 'text-on-surface'],
    ['landing.preview.monthlyOutflow', '$1,842.50', 'north_east', 'bg-tertiary-fixed text-tertiary-container', 'text-on-surface'],
    ['landing.preview.netSavings', '+$1,157.50', 'savings', 'bg-primary-fixed text-primary', 'text-secondary'],
  ] as const
  const watch = [
    ['landing.preview.food', 72, 'bg-secondary'],
    ['landing.preview.shopping', 91, 'bg-primary-container'],
    ['landing.preview.entertainment', 100, 'bg-tertiary-container'],
  ] as const

  return (
    <div className="relative max-w-[1100px] mx-auto px-space-lg mt-16">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_24px_60px_-20px_rgba(11,28,48,0.25)] overflow-hidden">
        <div className="flex">
          <aside className="hidden md:flex w-52 flex-col gap-space-lg p-space-lg bg-surface-container-lowest shadow-[1px_0_8px_rgba(0,0,0,0.03)]">
            <Logo className="h-8 self-start" />
            <div className="py-space-xs rounded-lg bg-primary-container text-on-primary text-center font-body-sm text-body-sm font-semibold">
              {t('landing.preview.newExpense')}
            </div>
            <div className="flex flex-col gap-space-xs">
              {navItems.map(([icon, labelKey, active]) => (
                <div
                  key={labelKey}
                  className={cn(
                    'flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg font-body-sm text-body-sm',
                    active ? 'bg-surface-container-high text-on-surface font-semibold' : 'text-on-surface-variant'
                  )}
                >
                  <Icon name={icon} filled={active} className="text-[18px]" /> {t(labelKey)}
                </div>
              ))}
            </div>
          </aside>
          <div className="flex-1 bg-background p-space-lg flex flex-col gap-space-md text-left">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('landing.preview.cycleLabel')}</span>
              <div className="font-headline-md text-headline-md text-on-surface">{t('landing.preview.financialOverview')}</div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
              {kpis.map(([labelKey, value, icon, tile, color]) => (
                <div key={labelKey} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">{t(labelKey)}</span>
                    <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', tile)}>
                      <Icon name={icon} className="text-[15px]" />
                    </div>
                  </div>
                  <div className={cn('font-label-numeric-md text-[18px] font-semibold mt-space-xs', color)}>{value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
              <div className="lg:col-span-2 bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                <div className="font-body-md text-body-md font-semibold text-on-surface">{t('landing.preview.cashFlow')}</div>
                <div className="h-32 mt-space-sm flex items-end gap-1.5">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-primary-container/20 to-primary-container"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
                <div className="font-body-md text-body-md font-semibold text-on-surface">{t('landing.preview.budgetWatch')}</div>
                {watch.map(([nameKey, pct, bar]) => (
                  <div key={nameKey}>
                    <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                      <span>{t(nameKey)}</span>
                      <span className="font-label-numeric-sm text-label-numeric-sm">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden mt-1">
                      <div className={cn('h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
