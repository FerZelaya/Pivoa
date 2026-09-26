import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Icon } from '@/components/ui/icon'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: 'account_balance_wallet',
    tile: 'bg-primary-fixed text-primary',
    title: 'Monthly income cap',
    text: 'Set what you earn — say $3,000 — and Pivoa paces every day against it with a safe daily run rate.',
  },
  {
    icon: 'donut_small',
    tile: 'bg-secondary-container/50 text-secondary',
    title: 'Category budgets',
    text: 'Give Food, Housing or Shopping their own cap. Cards turn amber at 80% and red once you go over.',
  },
  {
    icon: 'flag',
    tile: 'bg-tertiary-fixed text-tertiary-container',
    title: 'Savings goals',
    text: 'Track an emergency fund or a trip with target dates, the monthly pace you need, and one-tap boosts.',
  },
  {
    icon: 'document_scanner',
    tile: 'bg-primary-fixed text-primary',
    title: 'AI receipt scanning',
    text: 'Snap a receipt and the amount, merchant, date and category are filled in for you automatically.',
  },
  {
    icon: 'monitoring',
    tile: 'bg-secondary-container/50 text-secondary',
    title: 'Cash-flow velocity',
    text: 'See cumulative spending against your income baseline, peak outflow days and month-end projections.',
  },
  {
    icon: 'receipt_long',
    tile: 'bg-surface-container-high text-on-surface',
    title: 'Searchable ledger',
    text: 'Filter by date or category, search merchants and notes, bulk-select, and export to CSV in a click.',
  },
]

const STEPS = [
  { n: '01', title: 'Set your monthly budget', text: 'Tell Pivoa your income or spending ceiling during a two-minute setup.' },
  { n: '02', title: 'Cap categories & add goals', text: 'Split your cap across categories and create your first savings goal.' },
  { n: '03', title: 'Log or scan expenses', text: 'Add transactions manually or scan receipts — dashboards update instantly.' },
]

const FAQS = [
  { q: 'Is Pivoa free?', a: 'Yes. Create an account and start budgeting — no credit card required.' },
  { q: 'Can I change my monthly budget later?', a: 'Anytime. Your income cap, category caps and goals are all editable in Settings.' },
  { q: 'How does receipt scanning work?', a: 'Upload a photo of a receipt and Pivoa uses AI to extract the amount, merchant, date and a suggested category.' },
  { q: 'Is my data private?', a: 'Your data is protected with row-level security — only you can read your expenses, budgets and goals.' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1200px] mx-auto h-full px-space-lg flex items-center justify-between">
          <Link to="/">
            <Logo className="h-10" />
          </Link>
          <nav className="hidden md:flex items-center gap-space-lg font-body-md text-body-md text-on-surface-variant">
            <a href="#features" className="hover:text-on-surface transition-colors">Features</a>
            <a href="#how" className="hover:text-on-surface transition-colors">How it works</a>
            <a href="#faq" className="hover:text-on-surface transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-space-sm">
            {user ? (
              <Link to="/overview" className="px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary font-body-md text-body-md font-semibold shadow-sm transition-colors">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-space-md py-space-sm rounded-lg text-on-surface hover:bg-surface-container-low font-body-md text-body-md font-medium transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary font-body-md text-body-md font-semibold shadow-sm transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-space-xl overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-[1200px] mx-auto px-space-lg text-center">
          <span className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-lowest shadow-sm font-label-caps text-label-caps uppercase text-primary-container">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Modern Financial Studio
          </span>
          <h1 className="mt-space-lg font-display text-[44px] leading-[52px] sm:text-[56px] sm:leading-[64px] font-bold tracking-[-0.03em] text-on-surface max-w-3xl mx-auto">
            Budget your month. <span className="text-primary-container">Hit every goal.</span>
          </h1>
          <p className="mt-space-md font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
            Pivoa turns your monthly income into a clear plan — category caps, savings goals and real-time pacing, with AI receipt scanning built in.
          </p>
          <div className="mt-space-xl flex flex-col sm:flex-row items-center justify-center gap-space-sm">
            <Link
              to={user ? '/overview' : '/register'}
              className="flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-body-lg text-body-lg font-semibold shadow-sm transition-colors"
            >
              {user ? 'Open your dashboard' : 'Start budgeting free'} <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
            <a href="#features" className="flex items-center gap-space-xs px-space-lg py-3 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low font-body-lg text-body-lg font-medium shadow-sm transition-colors">
              <Icon name="play_circle" className="text-[20px] text-primary-container" /> See features
            </a>
          </div>
        </div>

        <HeroPreview />
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-[1200px] mx-auto px-space-lg">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">Everything in one workspace</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">Built for monthly discipline</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/5 group-hover:scale-110 transition-transform duration-500" />
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', f.tile)}>
                  <Icon name={f.icon} className="text-[22px]" />
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-md">{f.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-surface-container-low">
        <div className="max-w-[1200px] mx-auto px-space-lg">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">Up and running in minutes</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">How Pivoa works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
                <span className="font-label-numeric-lg text-label-numeric-lg text-primary-container">{s.n}</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">{s.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-[760px] mx-auto px-space-lg">
          <div className="text-center mb-space-xl">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">Questions</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1">Frequently asked</h2>
          </div>
          <div className="flex flex-col gap-space-sm">
            {FAQS.map((f, i) => (
              <div key={f.q} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-space-md px-space-lg py-space-md text-left"
                >
                  <span className="font-body-lg text-body-lg font-semibold text-on-surface">{f.q}</span>
                  <Icon name={openFaq === i ? 'remove' : 'add'} className="text-outline" />
                </button>
                {openFaq === i && (
                  <p className="px-space-lg pb-space-md font-body-md text-body-md text-on-surface-variant animate-fade-in">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-[1200px] mx-auto px-space-lg">
          <div className="relative overflow-hidden rounded-xl bg-primary-container p-space-xl sm:p-12 text-center">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-secondary/30 blur-3xl" />
            <h2 className="relative font-headline-lg text-headline-lg text-on-primary">Ready to take control of your month?</h2>
            <p className="relative font-body-lg text-body-lg text-on-primary-container mt-space-sm">Set your budget in two minutes. Free forever for personal use.</p>
            <Link
              to={user ? '/overview' : '/register'}
              className="relative inline-flex items-center gap-space-xs mt-space-lg px-space-lg py-3 rounded-lg bg-surface-container-lowest text-primary font-body-lg text-body-lg font-semibold shadow-sm hover:bg-primary-fixed transition-colors"
            >
              {user ? 'Go to dashboard' : 'Create free account'} <Icon name="arrow_forward" className="text-[20px]" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1200px] mx-auto px-space-lg py-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <Logo className="h-8" />
          <p className="font-body-sm text-body-sm text-outline">© {new Date().getFullYear()} Pivoa. Smart expense tracking.</p>
        </div>
      </footer>
    </div>
  )
}

function HeroPreview() {
  const bars = [38, 52, 44, 61, 58, 72, 66, 80, 74, 86]
  return (
    <div className="relative max-w-[1100px] mx-auto px-space-lg mt-16">
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_24px_60px_-20px_rgba(11,28,48,0.25)] overflow-hidden">
        <div className="flex">
          <aside className="hidden md:flex w-52 flex-col gap-space-lg p-space-lg bg-surface-container-lowest shadow-[1px_0_8px_rgba(0,0,0,0.03)]">
            <Logo className="h-8 self-start" />
            <div className="py-space-xs rounded-lg bg-primary-container text-on-primary text-center font-body-sm text-body-sm font-semibold">+ New Expense</div>
            <div className="flex flex-col gap-space-xs">
              {[
                ['grid_view', 'Overview', true],
                ['receipt_long', 'Transactions', false],
                ['track_changes', 'Budgets & Goals', false],
                ['tune', 'Settings', false],
              ].map(([icon, label, active]) => (
                <div
                  key={label as string}
                  className={cn(
                    'flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg font-body-sm text-body-sm',
                    active ? 'bg-surface-container-high text-on-surface font-semibold' : 'text-on-surface-variant'
                  )}
                >
                  <Icon name={icon as string} filled={Boolean(active)} className="text-[18px]" /> {label}
                </div>
              ))}
            </div>
          </aside>
          <div className="flex-1 bg-background p-space-lg flex flex-col gap-space-md text-left">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">October Cycle • Day 18 of 31</span>
              <div className="font-headline-md text-headline-md text-on-surface">Financial Overview</div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
              {[
                ['Saved in Goals', '$12,480.00', 'account_balance', 'bg-primary-fixed text-primary', 'text-on-surface'],
                ['Monthly Income', '$3,000.00', 'south_west', 'bg-secondary-container/40 text-secondary', 'text-on-surface'],
                ['Monthly Outflow', '$1,842.50', 'north_east', 'bg-tertiary-fixed text-tertiary-container', 'text-on-surface'],
                ['Net Savings', '+$1,157.50', 'savings', 'bg-primary-fixed text-primary', 'text-secondary'],
              ].map(([label, value, icon, tile, color]) => (
                <div key={label} className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">{label}</span>
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
                <div className="font-body-md text-body-md font-semibold text-on-surface">Cash Flow &amp; Daily Velocity</div>
                <div className="h-32 mt-space-sm flex items-end gap-1.5">
                  {bars.map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary-container/20 to-primary-container" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-sm">
                <div className="font-body-md text-body-md font-semibold text-on-surface">Budget Watch</div>
                {[
                  ['Food', 72, 'bg-secondary'],
                  ['Shopping', 91, 'bg-primary-container'],
                  ['Entertainment', 100, 'bg-tertiary-container'],
                ].map(([name, pct, bar]) => (
                  <div key={name as string}>
                    <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                      <span>{name}</span>
                      <span className="font-label-numeric-sm text-label-numeric-sm">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-container rounded-full overflow-hidden mt-1">
                      <div className={cn('h-full rounded-full', bar as string)} style={{ width: `${pct}%` }} />
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
