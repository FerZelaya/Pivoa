import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router'
import type { ExpenseWithCategory } from '@pivoa/shared'
import { useAuth } from '@/contexts/AuthContext'
import { useOverview } from '@/hooks/useOverview'
import { useBudgets } from '@/hooks/useBudgets'
import { Icon } from '@/components/ui/icon'
import { Logo } from '@/components/ui/logo'
import { ExpenseModal } from '@/components/expenses/ExpenseModal'
import { formatCurrency, formatCycleRange, initials } from '@/lib/format'
import { useDisplayCurrency } from '@/hooks/useDisplayCurrency'
import { cn } from '@/lib/utils'
import { HelpBubble } from '@/components/support/HelpBubble'
import { useMe } from '@/hooks/useMe'

interface AppShellContext {
  openExpense: (options?: { expense?: ExpenseWithCategory; categoryId?: string }) => void
}

export function useAppShell() {
  return useOutletContext<AppShellContext>()
}

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview', icon: 'grid_view' },
  { to: '/transactions', label: 'Transactions', icon: 'receipt_long' },
  { to: '/budgets', label: 'Budgets & Goals', icon: 'track_changes' },
  { to: '/support', label: 'Support', icon: 'support_agent' },
  { to: '/settings', label: 'Settings', icon: 'tune' },
]

export function AppLayout() {
  const { user, signOut } = useAuth()
  const { data: me } = useMe()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: overview } = useOverview()
  const { data: budgets = [] } = useBudgets()
  useDisplayCurrency()

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [expenseModal, setExpenseModal] = useState<{ open: boolean; expense?: ExpenseWithCategory; categoryId?: string }>({
    open: false,
  })
  const [search, setSearch] = useState('')

  useEffect(() => setMobileNavOpen(false), [location.pathname])

  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Pivoa User'

  const alerts = budgets
    .filter((b) => b.percentage >= 80)
    .sort((a, b) => b.percentage - a.percentage)
    .map((b) => ({
      id: b.id,
      icon: b.percentage > 100 ? 'warning' : 'notifications_active',
      title: `${b.category.name} ${b.percentage > 100 ? 'over budget' : 'nearing cap'}`,
      detail: `${formatCurrency(b.spent)} of ${formatCurrency(b.monthlyLimit)} · ${Math.round(b.percentage)}%`,
      over: b.percentage > 100,
    }))
  if (overview?.isOverBudget) {
    alerts.unshift({
      id: 'monthly',
      icon: 'error',
      title: 'Monthly cap exceeded',
      detail: `${formatCurrency(overview.monthlySpent)} spent of ${formatCurrency(overview.monthlyIncome)}`,
      over: true,
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    navigate(q ? `/transactions?search=${encodeURIComponent(q)}` : '/transactions')
  }

  const context: AppShellContext = {
    openExpense: (options) => setExpenseModal({ open: true, ...options }),
  }

  const usedPct = overview?.monthlyIncome ? Math.round(overview.budgetPercentage) : 0

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-inverse-surface/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}

      {/* SideNavBar */}
      <nav
        className={cn(
          'fixed left-0 top-0 h-full w-64 z-50 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] p-space-lg flex flex-col justify-between transition-transform duration-300',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col gap-space-xl">
          <NavLink to="/overview" className="px-space-xs">
            <Logo className="h-10" />
          </NavLink>

          <button
            type="button"
            onClick={() => context.openExpense()}
            className="w-full py-space-sm px-space-md rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-all flex items-center justify-center gap-space-xs font-body-md text-body-md font-semibold shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Icon name="add" className="text-[20px]" />
            New Expense
          </button>

          <ul className="flex flex-col gap-space-xs">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-all duration-200 font-body-md text-body-md',
                      isActive
                        ? 'bg-surface-container-high text-on-surface font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon name={item.icon} filled={isActive} className="text-[22px]" />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            {me?.isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-all duration-200 font-body-md text-body-md',
                      isActive
                        ? 'bg-surface-container-high text-on-surface font-semibold'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon name="admin_panel_settings" filled={isActive} className="text-[22px]" />
                      <span>Admin</span>
                    </>
                  )}
                </NavLink>
              </li>
            )}
          </ul>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Left This Month</span>
          <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
            {overview ? formatCurrency(overview.budgetRemaining) : '—'}
          </span>
          <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden mt-1">
            <div
              className={cn('h-full rounded-full transition-all', overview?.isOverBudget ? 'bg-tertiary-container' : 'bg-primary-container')}
              style={{ width: `${Math.min(100, usedPct)}%` }}
            />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={cn('w-2 h-2 rounded-full', overview?.isOverBudget ? 'bg-tertiary-container' : 'bg-secondary')} />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {overview?.monthlyIncome ? `${usedPct}% of ${formatCurrency(overview.monthlyIncome)} cap` : 'Set a monthly cap'}
            </span>
          </div>
        </div>
      </nav>

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 z-30 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between px-space-md lg:px-gutter-desktop gap-space-md">
        <div className="flex items-center gap-space-sm flex-1 max-w-md">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            onClick={() => setMobileNavOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <form
            onSubmit={handleSearch}
            className="hidden sm:flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded-lg w-full shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-primary-container/20"
          >
            <Icon name="search" className="text-outline text-[20px]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline py-1"
              placeholder="Search transactions, merchants..."
              type="text"
            />
          </form>
        </div>

        <div className="flex items-center gap-space-md">
          <div className="hidden md:flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-lowest shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-on-surface font-body-md text-body-md">
            <Icon name="calendar_today" className="text-[18px] text-on-surface-variant" />
            <span>{formatCycleRange(overview?.cycleStart, overview?.cycleEnd)}</span>
          </div>

          <NotificationBell alerts={alerts} />

          <div className="h-8 w-px bg-outline-variant/40 hidden sm:block" />

          <ProfileMenu name={fullName} email={user?.email ?? ''} plan={me?.plan} isAdmin={Boolean(me?.isAdmin)} onSignOut={signOut} />
        </div>
      </header>

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div key={location.pathname} className="px-space-md sm:px-gutter-desktop py-space-xl max-w-[1400px] mx-auto flex flex-col gap-space-lg animate-fade-in">
          <Outlet context={context} />
        </div>
      </main>

      <ExpenseModal
        open={expenseModal.open}
        expense={expenseModal.expense}
        defaultCategoryId={expenseModal.categoryId}
        onClose={() => setExpenseModal({ open: false })}
      />
      <HelpBubble />
    </div>
  )
}

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onOutside])
  return ref
}

interface Alert {
  id: string
  icon: string
  title: string
  detail: string
  over: boolean
}

function NotificationBell({ alerts }: { alerts: Alert[] }) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  const navigate = useNavigate()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
      >
        <Icon name="notifications" />
        {alerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary-container rounded-full" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-8px_rgba(11,28,48,0.18)] overflow-hidden animate-scale-in">
          <div className="px-space-md py-space-sm bg-surface-container-low flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Budget Alerts</span>
            <span className="font-label-numeric-sm text-label-numeric-sm text-outline">{alerts.length}</span>
          </div>
          {alerts.length === 0 ? (
            <div className="p-space-lg text-center">
              <Icon name="task_alt" className="text-secondary text-[28px]" />
              <p className="font-body-md text-body-md text-on-surface mt-1">All budgets on pace</p>
              <p className="font-body-sm text-body-sm text-outline">We&apos;ll alert you at 80% of any cap.</p>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto custom-scrollbar">
              {alerts.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      navigate('/budgets')
                    }}
                    className="w-full flex items-start gap-space-sm px-space-md py-space-sm hover:bg-surface-container-low text-left transition-colors"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        a.over ? 'bg-tertiary-fixed text-tertiary-container' : 'bg-primary-fixed text-primary'
                      )}
                    >
                      <Icon name={a.icon} className="text-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-body-md text-body-md font-semibold text-on-surface">{a.title}</p>
                      <p className="font-label-numeric-sm text-label-numeric-sm text-outline">{a.detail}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function ProfileMenu({
  name,
  email,
  plan,
  isAdmin,
  onSignOut,
}: {
  name: string
  email: string
  plan?: 'free' | 'plus' | 'pro'
  isAdmin: boolean
  onSignOut: () => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside(() => setOpen(false))
  const navigate = useNavigate()

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-space-sm rounded-lg p-1 pr-space-sm hover:bg-surface-container-low transition-colors"
      >
        <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-body-md text-body-md font-bold">
          {initials(name)}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight">{name}</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{plan ? `${plan} plan` : 'Plan'}</span>
        </div>
        <Icon name="expand_more" className="hidden md:inline-block text-[18px] text-outline" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-8px_rgba(11,28,48,0.18)] overflow-hidden animate-scale-in">
          <div className="px-space-md py-space-sm bg-surface-container-low">
            <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{name}</p>
            <p className="font-body-sm text-body-sm text-outline truncate">{email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/settings')
            }}
            className="w-full flex items-center gap-space-sm px-space-md py-space-sm font-body-md text-body-md text-on-surface hover:bg-surface-container-low"
          >
            <Icon name="tune" className="text-[18px] text-on-surface-variant" /> Settings
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              navigate('/support')
            }}
            className="w-full flex items-center gap-space-sm px-space-md py-space-sm font-body-md text-body-md text-on-surface hover:bg-surface-container-low"
          >
            <Icon name="support_agent" className="text-[18px] text-on-surface-variant" /> Support
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/admin')
              }}
              className="w-full flex items-center gap-space-sm px-space-md py-space-sm font-body-md text-body-md text-on-surface hover:bg-surface-container-low"
            >
              <Icon name="admin_panel_settings" className="text-[18px] text-on-surface-variant" /> Admin
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              await onSignOut()
              navigate('/login')
            }}
            className="w-full flex items-center gap-space-sm px-space-md py-space-sm font-body-md text-body-md text-tertiary-container hover:bg-error-container/40"
          >
            <Icon name="logout" className="text-[18px]" /> Sign out
          </button>
        </div>
      )}
    </div>
  )
}
