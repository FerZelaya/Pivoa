import { Link } from 'react-router'
import { Logo } from '@/components/ui/logo'
import { Icon } from '@/components/ui/icon'

interface AuthLayoutProps {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex flex-col px-space-lg sm:px-space-xl py-space-lg">
        <Link to="/" className="self-start">
          <Logo className="h-10" />
        </Link>
        <div className="flex-1 flex items-center justify-center py-space-xl">
          <div className="w-full max-w-[400px] animate-scale-in">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">{eyebrow}</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mt-1">{title}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-space-xl">{subtitle}</p>
            {children}
            <div className="mt-space-lg text-center font-body-md text-body-md text-on-surface-variant">{footer}</div>
          </div>
        </div>
        <p className="font-body-sm text-body-sm text-outline">© {new Date().getFullYear()} Pivoa. Smart expense tracking.</p>
      </div>

      <div className="hidden lg:flex relative overflow-hidden bg-surface-container-low items-center justify-center p-space-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative w-full max-w-[460px] flex flex-col gap-space-lg">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-primary-container">Modern Financial Studio</span>
            <h2 className="font-display text-display text-on-surface mt-1">Every dollar, on pace.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-sm">
              Set a monthly cap, give each category a budget, and watch your savings goals grow — all in one calm workspace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-space-md">
            <PreviewKpi label="Monthly Outflow" value="$1,842.50" icon="north_east" iconClass="bg-tertiary-fixed text-tertiary-container">
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-2">
                <div className="h-full w-[61%] rounded-full bg-primary-container" />
              </div>
              <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant mt-1 block">61% of $3,000 cap</span>
            </PreviewKpi>
            <PreviewKpi label="Net Savings" value="+$1,157.50" icon="savings" iconClass="bg-primary-fixed text-primary" valueClass="text-secondary">
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-secondary-fixed/30 text-on-secondary-container font-label-numeric-sm text-label-numeric-sm">
                38.6% retained
              </span>
            </PreviewKpi>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
            {[
              { name: 'Food', icon: 'restaurant', pct: 72, bar: 'bg-secondary', label: '72% Paced', badge: 'bg-secondary/10 text-secondary' },
              { name: 'Shopping', icon: 'shopping_bag', pct: 91, bar: 'bg-primary-container', label: '91% Spent', badge: 'bg-primary-fixed text-primary' },
              { name: 'Entertainment', icon: 'movie', pct: 100, bar: 'bg-tertiary-container', label: '108% Over', badge: 'bg-tertiary-container text-on-tertiary' },
            ].map((row) => (
              <div key={row.name} className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant">
                  <Icon name={row.icon} className="text-[18px]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface">{row.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${row.badge}`}>{row.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewKpi({
  label,
  value,
  icon,
  iconClass,
  valueClass = 'text-on-surface',
  children,
}: {
  label: string
  value: string
  icon: string
  iconClass: string
  valueClass?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5" />
      <div className="flex items-center justify-between mb-space-sm">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon name={icon} className="text-[18px]" />
        </div>
      </div>
      <span className={`font-label-numeric-lg text-label-numeric-lg ${valueClass}`}>{value}</span>
      {children}
    </div>
  )
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-space-xs bg-error-container/50 text-on-error-container rounded-lg px-space-md py-space-sm font-body-sm text-body-sm mb-space-md">
      <Icon name="error" className="text-[18px] mt-px" />
      <span>{message}</span>
    </div>
  )
}
