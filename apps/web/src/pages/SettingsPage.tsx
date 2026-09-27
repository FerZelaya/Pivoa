import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import type { CategoryBudgetWithSpent, SavingsGoalWithProgress } from '@pivoa/shared'
import { useAuth } from '@/contexts/AuthContext'
import { useChangeCurrency, useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { useRates, convertWithRates } from '@/hooks/useRates'
import { CurrencySelect } from '@/components/ui/currency-select'
import { Modal } from '@/components/ui/dialog'
import { getCycleWindow } from '@/lib/cycle'
import { formatCurrency, formatCycleRange, formatDate, formatMoney, initials, ordinal } from '@/lib/format'
import { useBudgets, useUpdateBudget } from '@/hooks/useBudgets'
import { useGoals } from '@/hooks/useGoals'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/card'
import { BudgetModal } from '@/components/budgets/BudgetModal'
import { DepositModal, GoalModal } from '@/components/goals/GoalModal'
import { categoryIcon, categoryTone } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { PlanCard } from '@/components/billing/PlanCard'
import { useRefreshBilling, useSyncBilling } from '@/hooks/useBilling'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const refreshBilling = useRefreshBilling()
  const syncBilling = useSyncBilling()
  const billingSynced = useRef(false)
  const { data: settings, isPending: settingsLoading } = useSettings()
  const { data: budgets = [], isPending: budgetsLoading } = useBudgets()
  const { data: goals = [], isPending: goalsLoading } = useGoals()
  const updateSettings = useUpdateSettings()
  const changeCurrency = useChangeCurrency()
  const { data: rates } = useRates(settings?.currency)

  const [income, setIncome] = useState('')
  const [cycleStartDay, setCycleStartDay] = useState(1)
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null)
  const [budgetModal, setBudgetModal] = useState<{ open: boolean; budget?: CategoryBudgetWithSpent | null }>({ open: false })
  const [goalModal, setGoalModal] = useState<{ open: boolean; goal?: SavingsGoalWithProgress | null }>({ open: false })
  const [depositGoal, setDepositGoal] = useState<SavingsGoalWithProgress | null>(null)

  useEffect(() => {
    if (settings) {
      setIncome(String(settings.monthlyIncomeCap))
      setCycleStartDay(settings.cycleStartDay ?? 1)
    }
  }, [settings])

  useEffect(() => {
    if (searchParams.get('billing') !== 'success' || billingSynced.current) return
    billingSynced.current = true
    const subscriptionId = searchParams.get('subscription_id')
    if (subscriptionId) {
      syncBilling.mutate(subscriptionId, {
        onSuccess: () => toast.success('Subscription updated'),
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not confirm PayPal'),
      })
      return
    }
    refreshBilling()
    toast.success('Subscription updated')
  }, [searchParams, refreshBilling, syncBilling])

  const cap = settings?.monthlyIncomeCap ?? 0
  const allocated = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)
  const incomeDirty = settings ? parseFloat(income || '0') !== settings.monthlyIncomeCap : false
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || 'Pivoa User'

  const saveIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(income)
    if (!Number.isFinite(value) || value < 0) return toast.error('Enter a valid monthly amount')
    try {
      await updateSettings.mutateAsync({ monthlyIncomeCap: value })
      toast.success('Monthly budget updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update budget')
    }
  }

  const saveCycle = async () => {
    try {
      await updateSettings.mutateAsync({ cycleStartDay })
      toast.success('Budget reset day updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update reset day')
    }
  }

  const confirmCurrency = async () => {
    if (!pendingCurrency) return
    try {
      await changeCurrency.mutateAsync({ currency: pendingCurrency })
      toast.success(`Currency switched to ${pendingCurrency}`)
      setPendingCurrency(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not convert currency')
    }
  }

  const previewConverted = pendingCurrency
    ? convertWithRates(cap, settings?.currency ?? 'USD', pendingCurrency, rates)
    : null
  const cyclePreview = getCycleWindow(cycleStartDay)
  const cycleDirty = settings ? cycleStartDay !== settings.cycleStartDay : false

  return (
    <>
      <PageHeader eyebrow="Workspace Preferences • Budget Controls" title="Settings" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-space-lg">
          <PlanCard />
          {/* Monthly income cap */}
          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-space-sm mb-space-lg">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                <Icon name="account_balance_wallet" className="text-[22px]" />
              </div>
              <div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Aggregate Monthly Cap</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Monthly Income &amp; Budget</h2>
              </div>
            </div>
            <form onSubmit={saveIncome} className="relative flex flex-col sm:flex-row gap-space-md sm:items-end">
              <div className="flex-1">
                <label htmlFor="income" className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5">
                  Max spend per month
                </label>
                {settingsLoading ? (
                  <div className="skeleton h-[52px]" />
                ) : (
                  <MoneyInput id="income" large value={income} onChange={(e) => setIncome(e.target.value)} placeholder="3000.00" />
                )}
              </div>
              <Button type="submit" size="lg" disabled={!incomeDirty || updateSettings.isPending}>
                {updateSettings.isPending ? 'Saving…' : 'Save Cap'}
              </Button>
            </form>
            <div className="relative grid grid-cols-3 gap-space-md bg-surface-container-low p-space-md rounded-lg mt-space-lg">
              <MiniStat label="Monthly Cap" value={formatCurrency(cap)} />
              <MiniStat label="Allocated to Categories" value={formatCurrency(allocated)} valueClass={allocated > cap ? 'text-tertiary-container' : undefined} />
              <MiniStat label="Unallocated" value={formatCurrency(cap - allocated)} valueClass={cap - allocated < 0 ? 'text-tertiary-container' : 'text-secondary'} />
            </div>
          </section>

          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-center gap-space-sm mb-space-lg">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/40 text-secondary flex items-center justify-center">
                <Icon name="currency_exchange" className="text-[22px]" />
              </div>
              <div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Currency &amp; Cycle</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">How money and months work</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              <div>
                <label className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5">Base currency</label>
                <CurrencySelect
                  value={settings?.currency ?? 'USD'}
                  onChange={(code) => {
                    if (code !== settings?.currency) setPendingCurrency(code)
                  }}
                />
                <p className="font-body-sm text-body-sm text-outline mt-1.5">Changing this converts your income cap, budgets, goals and expense totals.</p>
              </div>
              <div>
                <label htmlFor="cycle-day" className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5">
                  Budget resets on
                </label>
                <div className="flex items-center gap-space-sm">
                  <select
                    id="cycle-day"
                    value={cycleStartDay}
                    onChange={(e) => setCycleStartDay(Number(e.target.value))}
                    className="flex-1 bg-surface-container-low rounded-lg px-space-md py-2.5 font-body-md text-body-md text-on-surface border border-transparent focus:outline-none focus:border-primary-container"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        The {ordinal(day)} of each month
                      </option>
                    ))}
                  </select>
                  <Button type="button" disabled={!cycleDirty || updateSettings.isPending} onClick={saveCycle}>
                    Save
                  </Button>
                </div>
                <p className="font-body-sm text-body-sm text-outline mt-1.5">
                  Current window: {formatCycleRange(cyclePreview.start, cyclePreview.end)}
                </p>
              </div>
            </div>
          </section>

          {/* Category budgets */}
          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-start justify-between gap-space-md mb-space-md">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Category Budgets</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Edit a cap inline and press Enter to save.</p>
              </div>
              <Button variant="tonal" size="sm" onClick={() => setBudgetModal({ open: true })}>
                <Icon name="add" className="text-[18px]" /> Add Budget
              </Button>
            </div>
            <div className="flex flex-col divide-y divide-surface-container-low">
              {budgetsLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 my-space-xs" />)}
              {!budgetsLoading && budgets.length === 0 && (
                <EmptyRow icon="donut_small" text="No category caps yet — add one to keep spending on track." />
              )}
              {budgets.map((budget) => (
                <BudgetRow key={budget.id} budget={budget} onMore={() => setBudgetModal({ open: true, budget })} />
              ))}
            </div>
          </section>

          {/* Savings goals */}
          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-start justify-between gap-space-md mb-space-md">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Savings Goals</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Update targets, deadlines or add funds.</p>
              </div>
              <Button size="sm" onClick={() => setGoalModal({ open: true })}>
                <Icon name="add" className="text-[18px]" /> New Goal
              </Button>
            </div>
            <div className="flex flex-col divide-y divide-surface-container-low">
              {goalsLoading && Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-14 my-space-xs" />)}
              {!goalsLoading && goals.length === 0 && <EmptyRow icon="flag" text="No savings goals yet — what are you saving for?" />}
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-space-md py-space-md">
                  <div className="w-9 h-9 rounded-lg bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0">
                    <Icon name={categoryIcon(goal.icon)} className="text-[19px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-sm">
                      <span className="font-body-md text-body-md font-semibold text-on-surface truncate">{goal.name}</span>
                      <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant whitespace-nowrap">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-1.5">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.min(100, goal.percentage)}%` }} />
                    </div>
                    <span className="font-body-sm text-body-sm text-outline">
                      {goal.targetDate ? `Target ${formatDate(goal.targetDate)}` : 'No deadline'} · {goal.percentage.toFixed(0)}% funded
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton icon="add_card" title="Add funds" onClick={() => setDepositGoal(goal)} className="text-secondary" />
                    <IconButton icon="edit" title="Edit goal" onClick={() => setGoalModal({ open: true, goal })} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Account column */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Account</span>
            <div className="flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm">
                {initials(fullName)}
              </div>
              <div className="min-w-0">
                <p className="font-body-lg text-body-lg font-semibold text-on-surface truncate">{fullName}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-space-sm">
              <div className="bg-surface-container-low p-space-sm rounded-lg">
                <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Currency</div>
                <div className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">{settings?.currency ?? 'USD'}</div>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded-lg">
                <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Member Since</div>
                <div className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">
                  {user?.created_at ? formatDate(user.created_at, { month: 'short', year: 'numeric' }) : '—'}
                </div>
              </div>
            </div>
            <Button
              variant="destructive-ghost"
              className="justify-start"
              onClick={async () => {
                await signOut()
                navigate('/login')
              }}
            >
              <Icon name="logout" className="text-[18px]" /> Sign out
            </Button>
          </section>

          <section className="bg-surface-container-low p-space-lg rounded-xl flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <Icon name="lightbulb" className="text-[20px] text-primary-container" />
              <span className="font-headline-sm text-headline-sm text-on-surface">Budgeting tip</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Try allocating about 80% of your monthly cap across categories and keep the rest as a buffer for surprises. You&apos;ll get
              alerts once any category passes 80% of its cap.
            </p>
          </section>
        </div>
      </div>

      <BudgetModal open={budgetModal.open} budget={budgetModal.budget} onClose={() => setBudgetModal({ open: false })} />
      <GoalModal open={goalModal.open} goal={goalModal.goal} onClose={() => setGoalModal({ open: false })} />
      <DepositModal open={Boolean(depositGoal)} goal={depositGoal} onClose={() => setDepositGoal(null)} />

      <Modal
        open={Boolean(pendingCurrency)}
        onClose={() => setPendingCurrency(null)}
        icon="currency_exchange"
        eyebrow="Convert balances"
        title={`Switch to ${pendingCurrency ?? ''}`}
        description="Income, category caps, goals and expense totals will be converted at today's rate. Original expense amounts stay in the currency they were logged."
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setPendingCurrency(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmCurrency} disabled={changeCurrency.isPending || previewConverted == null}>
              {changeCurrency.isPending ? 'Converting…' : 'Convert & switch'}
            </Button>
          </>
        }
      >
        <div className="flex items-center justify-between bg-surface-container-low p-space-md rounded-lg">
          <span className="font-body-md text-body-md text-on-surface-variant">Monthly cap</span>
          <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">
            {formatCurrency(cap)} → {previewConverted == null ? '…' : formatMoney(previewConverted, pendingCurrency ?? 'USD')}
          </span>
        </div>
      </Modal>
    </>
  )
}

function BudgetRow({ budget, onMore }: { budget: CategoryBudgetWithSpent; onMore: () => void }) {
  const updateBudget = useUpdateBudget()
  const [value, setValue] = useState(String(budget.monthlyLimit))
  const tone = categoryTone(budget.category.name)
  const dirty = parseFloat(value || '0') !== budget.monthlyLimit

  useEffect(() => setValue(String(budget.monthlyLimit)), [budget.monthlyLimit])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const limit = parseFloat(value)
    if (!limit || limit <= 0) return toast.error('Enter a limit greater than zero')
    try {
      await updateBudget.mutateAsync({ id: budget.id, data: { monthlyLimit: limit } })
      toast.success(`${budget.category.name} cap updated`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update')
    }
  }

  return (
    <form onSubmit={save} className="flex items-center gap-space-md py-space-sm">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', tone.tile)}>
        <Icon name={categoryIcon(budget.category.icon, budget.category.name)} className="text-[19px]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{budget.category.name}</p>
        <p className={cn('font-label-numeric-sm text-label-numeric-sm', budget.percentage > 100 ? 'text-tertiary-container' : 'text-outline')}>
          {formatCurrency(budget.spent)} spent · {Math.round(budget.percentage)}%
        </p>
      </div>
      <div className="w-36">
        <MoneyInput value={value} onChange={(e) => setValue(e.target.value)} className="py-2" aria-label={`${budget.category.name} monthly limit`} />
      </div>
      {dirty ? (
        <IconButton icon="check" title="Save" type="submit" className="text-secondary" disabled={updateBudget.isPending} />
      ) : (
        <IconButton icon="more_horiz" title="More options" onClick={onMore} />
      )}
    </form>
  )
}

function IconButton({
  icon,
  title,
  onClick,
  className,
  type = 'button',
  disabled,
}: {
  icon: string
  title: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn('p-1.5 rounded-lg text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors disabled:opacity-50', className)}
    >
      <Icon name={icon} className="text-[20px]" />
    </button>
  )
}

function MiniStat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{label}</span>
      <span className={cn('font-label-numeric-md text-label-numeric-md font-semibold text-on-surface truncate', valueClass)}>{value}</span>
    </div>
  )
}

function EmptyRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-space-sm py-space-md text-on-surface-variant">
      <Icon name={icon} className="text-outline" />
      <span className="font-body-sm text-body-sm">{text}</span>
    </div>
  )
}
