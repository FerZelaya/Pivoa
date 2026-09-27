import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
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
import { useMe } from '@/hooks/useMe'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'

export default function SettingsPage() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const { data: me } = useMe()
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
        onSuccess: () => toast.success(t('settings.toasts.subscriptionUpdated')),
        onError: (err) => toast.error(err instanceof Error ? err.message : t('settings.toasts.paypalConfirmError')),
      })
      return
    }
    refreshBilling()
    toast.success(t('settings.toasts.subscriptionUpdated'))
  }, [searchParams, refreshBilling, syncBilling, t])

  const cap = settings?.monthlyIncomeCap ?? 0
  const allocated = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)
  const incomeDirty = settings ? parseFloat(income || '0') !== settings.monthlyIncomeCap : false
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split('@')[0] || t('common.defaultUserName')

  const saveIncome = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(income)
    if (!Number.isFinite(value) || value < 0) return toast.error(t('settings.toasts.invalidAmount'))
    try {
      await updateSettings.mutateAsync({ monthlyIncomeCap: value })
      toast.success(t('settings.toasts.budgetUpdated'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('settings.toasts.budgetUpdateError'))
    }
  }

  const saveCycle = async () => {
    try {
      await updateSettings.mutateAsync({ cycleStartDay })
      toast.success(t('settings.toasts.resetDayUpdated'))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('settings.toasts.resetDayError'))
    }
  }

  const confirmCurrency = async () => {
    if (!pendingCurrency) return
    try {
      await changeCurrency.mutateAsync({ currency: pendingCurrency })
      toast.success(t('settings.toasts.currencySwitched', { currency: pendingCurrency }))
      setPendingCurrency(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('settings.toasts.currencyError'))
    }
  }

  const previewConverted = pendingCurrency
    ? convertWithRates(cap, settings?.currency ?? 'USD', pendingCurrency, rates)
    : null
  const cyclePreview = getCycleWindow(cycleStartDay)
  const cycleDirty = settings ? cycleStartDay !== settings.cycleStartDay : false

  return (
    <>
      <PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} />

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
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('settings.income.eyebrow')}</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('settings.income.title')}</h2>
              </div>
            </div>
            <form onSubmit={saveIncome} className="relative flex flex-col sm:flex-row gap-space-md sm:items-end">
              <div className="flex-1">
                <label htmlFor="income" className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5">
                  {t('settings.income.maxSpend')}
                </label>
                {settingsLoading ? (
                  <div className="skeleton h-[52px]" />
                ) : (
                  <MoneyInput id="income" large value={income} onChange={(e) => setIncome(e.target.value)} placeholder={t('settings.income.placeholder')} />
                )}
              </div>
              <Button type="submit" size="lg" disabled={!incomeDirty || updateSettings.isPending}>
                {updateSettings.isPending ? t('settings.income.saving') : t('settings.income.saveCap')}
              </Button>
            </form>
            <div className="relative grid grid-cols-3 gap-space-md bg-surface-container-low p-space-md rounded-lg mt-space-lg">
              <MiniStat label={t('settings.income.monthlyCap')} value={formatCurrency(cap)} />
              <MiniStat label={t('settings.income.allocated')} value={formatCurrency(allocated)} valueClass={allocated > cap ? 'text-tertiary-container' : undefined} />
              <MiniStat label={t('settings.income.unallocated')} value={formatCurrency(cap - allocated)} valueClass={cap - allocated < 0 ? 'text-tertiary-container' : 'text-secondary'} />
            </div>
          </section>

          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-center gap-space-sm mb-space-lg">
              <div className="w-10 h-10 rounded-lg bg-secondary-container/40 text-secondary flex items-center justify-center">
                <Icon name="currency_exchange" className="text-[22px]" />
              </div>
              <div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('settings.currencyCycle.eyebrow')}</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('settings.currencyCycle.title')}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              <div>
                <label className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5">{t('settings.currencyCycle.baseCurrency')}</label>
                <CurrencySelect
                  value={settings?.currency ?? 'USD'}
                  disabled={!me?.multiCurrency}
                  onChange={(code) => {
                    if (!me?.multiCurrency) return
                    if (code !== settings?.currency) setPendingCurrency(code)
                  }}
                />
                <p className="font-body-sm text-body-sm text-outline mt-1.5">
                  {me && !me.multiCurrency
                    ? t('settings.currencyCycle.multiCurrencyLocked')
                    : t('settings.currencyCycle.currencyHint')}
                </p>
              </div>
              <div>
                <label htmlFor="cycle-day" className="block font-label-caps text-label-caps uppercase text-on-surface-variant mb-1.5">
                  {t('settings.currencyCycle.budgetResetsOn')}
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
                        {t('settings.currencyCycle.dayOption', { ordinal: ordinal(day) })}
                      </option>
                    ))}
                  </select>
                  <Button type="button" disabled={!cycleDirty || updateSettings.isPending} onClick={saveCycle}>
                    {t('settings.currencyCycle.save')}
                  </Button>
                </div>
                <p className="font-body-sm text-body-sm text-outline mt-1.5">
                  {t('settings.currencyCycle.currentWindow', { range: formatCycleRange(cyclePreview.start, cyclePreview.end) })}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                  <Icon name="translate" className="text-[22px]" />
                </div>
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('common.language')}</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('common.language')}</h2>
                </div>
              </div>
              <LanguageSwitcher persist />
            </div>
          </section>

          {/* Category budgets */}
          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
            <div className="flex items-start justify-between gap-space-md mb-space-md">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('settings.categoryBudgets.title')}</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('settings.categoryBudgets.subtitle')}</p>
              </div>
              <Button variant="tonal" size="sm" onClick={() => setBudgetModal({ open: true })}>
                <Icon name="add" className="text-[18px]" /> {t('settings.categoryBudgets.addBudget')}
              </Button>
            </div>
            <div className="flex flex-col divide-y divide-surface-container-low">
              {budgetsLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 my-space-xs" />)}
              {!budgetsLoading && budgets.length === 0 && (
                <EmptyRow icon="donut_small" text={t('settings.categoryBudgets.empty')} />
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
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('settings.savingsGoals.title')}</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('settings.savingsGoals.subtitle')}</p>
              </div>
              <Button size="sm" onClick={() => setGoalModal({ open: true })}>
                <Icon name="add" className="text-[18px]" /> {t('settings.savingsGoals.newGoal')}
              </Button>
            </div>
            <div className="flex flex-col divide-y divide-surface-container-low">
              {goalsLoading && Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-14 my-space-xs" />)}
              {!goalsLoading && goals.length === 0 && <EmptyRow icon="flag" text={t('settings.savingsGoals.empty')} />}
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
                      {t('settings.savingsGoals.meta', {
                        deadline: goal.targetDate
                          ? t('settings.savingsGoals.target', { date: formatDate(goal.targetDate) })
                          : t('settings.savingsGoals.noDeadline'),
                        pct: goal.percentage.toFixed(0),
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton icon="add_card" title={t('settings.savingsGoals.addFunds')} onClick={() => setDepositGoal(goal)} className="text-secondary" />
                    <IconButton icon="edit" title={t('settings.savingsGoals.editGoal')} onClick={() => setGoalModal({ open: true, goal })} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Account column */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('settings.account.title')}</span>
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
                <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('settings.account.currency')}</div>
                <div className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">{settings?.currency ?? 'USD'}</div>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded-lg">
                <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('settings.account.memberSince')}</div>
                <div className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">
                  {user?.created_at ? formatDate(user.created_at, { month: 'short', year: 'numeric' }) : t('common.emDash')}
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
              <Icon name="logout" className="text-[18px]" /> {t('settings.account.signOut')}
            </Button>
          </section>

          <section className="bg-surface-container-low p-space-lg rounded-xl flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <Icon name="lightbulb" className="text-[20px] text-primary-container" />
              <span className="font-headline-sm text-headline-sm text-on-surface">{t('settings.tip.title')}</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{t('settings.tip.text')}</p>
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
        eyebrow={t('settings.currencyModal.eyebrow')}
        title={t('settings.currencyModal.title', { currency: pendingCurrency ?? '' })}
        description={t('settings.currencyModal.description')}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setPendingCurrency(null)}>
              {t('settings.currencyModal.cancel')}
            </Button>
            <Button type="button" onClick={confirmCurrency} disabled={changeCurrency.isPending || previewConverted == null}>
              {changeCurrency.isPending ? t('settings.currencyModal.converting') : t('settings.currencyModal.convert')}
            </Button>
          </>
        }
      >
        <div className="flex items-center justify-between bg-surface-container-low p-space-md rounded-lg">
          <span className="font-body-md text-body-md text-on-surface-variant">{t('settings.currencyModal.monthlyCap')}</span>
          <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">
            {formatCurrency(cap)} → {previewConverted == null ? '…' : formatMoney(previewConverted, pendingCurrency ?? 'USD')}
          </span>
        </div>
      </Modal>
    </>
  )
}

function BudgetRow({ budget, onMore }: { budget: CategoryBudgetWithSpent; onMore: () => void }) {
  const { t } = useTranslation()
  const updateBudget = useUpdateBudget()
  const [value, setValue] = useState(String(budget.monthlyLimit))
  const tone = categoryTone(budget.category.name)
  const dirty = parseFloat(value || '0') !== budget.monthlyLimit

  useEffect(() => setValue(String(budget.monthlyLimit)), [budget.monthlyLimit])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const limit = parseFloat(value)
    if (!limit || limit <= 0) return toast.error(t('settings.toasts.limitError'))
    try {
      await updateBudget.mutateAsync({ id: budget.id, data: { monthlyLimit: limit } })
      toast.success(t('settings.toasts.capUpdated', { name: budget.category.name }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('settings.toasts.updateError'))
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
          {t('settings.categoryBudgets.spentPct', {
            spent: formatCurrency(budget.spent),
            pct: Math.round(budget.percentage),
          })}
        </p>
      </div>
      <div className="w-36">
        <MoneyInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="py-2"
          aria-label={t('settings.categoryBudgets.monthlyLimitAria', { name: budget.category.name })}
        />
      </div>
      {dirty ? (
        <IconButton icon="check" title={t('settings.categoryBudgets.save')} type="submit" className="text-secondary" disabled={updateBudget.isPending} />
      ) : (
        <IconButton icon="more_horiz" title={t('settings.categoryBudgets.moreOptions')} onClick={onMore} />
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
