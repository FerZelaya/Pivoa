import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { CategoryBudgetWithSpent, SavingsGoalWithProgress } from '@pivoa/shared'
import { useBudgets } from '@/hooks/useBudgets'
import { useGoals } from '@/hooks/useGoals'
import { useOverview } from '@/hooks/useOverview'
import { useAppShell } from '@/components/layout'
import { Icon } from '@/components/ui/icon'
import { DonutChart } from '@/components/charts/DonutChart'
import { BudgetModal } from '@/components/budgets/BudgetModal'
import { DepositModal, GoalModal } from '@/components/goals/GoalModal'
import { CreditCardsPanel } from '@/components/cards/CreditCardsPanel'
import { categoryIcon, categoryTone, chartColor } from '@/lib/categories'
import { formatCompact, formatCurrency, formatCycleRange, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type SortMode = 'utilization' | 'alpha'

export default function BudgetsPage() {
  const { t } = useTranslation()
  const { openExpense } = useAppShell()
  const { data: budgets = [], isPending: budgetsLoading } = useBudgets()
  const { data: goals = [], isPending: goalsLoading } = useGoals()
  const { data: overview, isPending: overviewLoading } = useOverview()

  const [sort, setSort] = useState<SortMode>('utilization')
  const [budgetModal, setBudgetModal] = useState<{ open: boolean; budget?: CategoryBudgetWithSpent | null }>({ open: false })
  const [goalModal, setGoalModal] = useState<{ open: boolean; goal?: SavingsGoalWithProgress | null }>({ open: false })
  const [depositGoal, setDepositGoal] = useState<SavingsGoalWithProgress | null>(null)

  const cap = overview?.monthlyIncome ?? 0
  const spent = overview?.monthlySpent ?? 0
  const pct = cap ? (spent / cap) * 100 : 0
  const daysInMonth = overview?.daysInMonth ?? 30
  const daysElapsed = daysInMonth - (overview?.daysRemaining ?? 0)
  const meanBurn = daysElapsed > 0 ? spent / daysElapsed : 0
  const projection = overview?.projectedMonthEnd ?? 0

  const sorted = useMemo(
    () =>
      [...budgets].sort((a, b) =>
        sort === 'alpha' ? a.category.name.localeCompare(b.category.name) : b.percentage - a.percentage
      ),
    [budgets, sort]
  )

  const allocated = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)
  const unallocated = Math.max(0, cap - allocated)
  const composition = [...budgets].sort((a, b) => b.monthlyLimit - a.monthlyLimit)
  const vaultTotal = goals.reduce((sum, g) => sum + g.currentAmount, 0)

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
            {t('budgets.eyebrow', { cycle: formatCycleRange(overview?.cycleStart, overview?.cycleEnd) })}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mt-0.5">{t('budgets.title')}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            type="button"
            onClick={() => setBudgetModal({ open: true })}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-body-md text-body-md font-semibold"
          >
            <Icon name="add_chart" className="text-[18px]" /> {t('budgets.newCategoryBudget')}
          </button>
          <button
            type="button"
            onClick={() => setGoalModal({ open: true })}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm font-body-md text-body-md font-semibold"
          >
            <Icon name="add" className="text-[18px]" /> {t('budgets.addSavingsGoal')}
          </button>
        </div>
      </div>

      <CreditCardsPanel />

      {/* Hero + composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-xl rounded-xl shadow-sm relative overflow-hidden flex flex-col gap-space-lg">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between gap-space-md relative">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                <Icon name="speed" className="text-[22px]" />
              </div>
              <div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('budgets.hero.aggregateCap')}</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('budgets.hero.overallVelocity')}</h2>
              </div>
            </div>
            <span className="px-space-sm py-1 rounded-full bg-surface-container-low font-label-numeric-sm text-label-numeric-sm text-on-surface-variant whitespace-nowrap">
              {t('budgets.hero.daysLeft', { count: overview?.daysRemaining ?? t('common.emDash') })}
            </span>
          </div>

          <div className="relative">
            {overviewLoading ? (
              <div className="skeleton h-10 w-2/3" />
            ) : (
              <div className="flex flex-wrap items-baseline gap-x-space-sm gap-y-1">
                <span className="font-label-numeric-lg text-[34px] leading-[40px] font-semibold text-on-surface">{formatCurrency(spent)}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">{t('budgets.hero.consumedOf')}</span>
                <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">{formatCurrency(cap)}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">{t('budgets.hero.totalLimit')}</span>
                <span
                  className={cn(
                    'font-label-numeric-sm text-label-numeric-sm px-2 py-0.5 rounded',
                    pct > 100 ? 'bg-tertiary-container text-on-tertiary' : pct >= 80 ? 'bg-primary-fixed text-primary' : 'bg-secondary/10 text-secondary'
                  )}
                >
                  {pct.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div className="relative flex flex-col gap-space-xs">
            <div className="w-full h-3 bg-surface-container-high rounded-full p-0.5">
              <div
                className={cn('h-full rounded-full transition-all duration-700', pct > 100 ? 'bg-tertiary-container' : 'bg-primary-container')}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <div className="flex items-center justify-between font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
              <span>{t('budgets.hero.base')}</span>
              <span className={cn('font-semibold', pct > 100 ? 'text-tertiary-container' : 'text-secondary')}>
                {pct > 100
                  ? t('budgets.hero.overCeiling', { amount: formatCurrency(spent - cap) })
                  : t('budgets.hero.cushionRemaining', { amount: formatCurrency(cap - spent) })}
              </span>
              <span>{t('budgets.hero.ceiling', { amount: formatCurrency(cap) })}</span>
            </div>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-space-md bg-surface-container-low p-space-md rounded-lg">
            <HeroStat
              label={t('budgets.hero.safeDaily')}
              value={t('budgets.hero.perDay', { amount: formatCurrency(overview?.dailyBudget) })}
              valueClass="text-secondary"
            />
            <HeroStat
              label={t('budgets.hero.meanBurn')}
              value={t('budgets.hero.perDay', { amount: formatCurrency(meanBurn) })}
              valueClass={meanBurn > cap / daysInMonth ? 'text-tertiary-container' : 'text-on-surface'}
            />
            <HeroStat
              label={t('budgets.hero.monthEnd')}
              value={formatCurrency(projection)}
              valueClass={projection > cap ? 'text-tertiary-container' : 'text-on-surface'}
              badge={cap ? (projection > cap ? t('budgets.hero.overBudget') : t('budgets.hero.onBudget')) : undefined}
              badgeClass={projection > cap ? 'bg-tertiary-fixed text-tertiary' : 'bg-secondary-container/40 text-on-secondary-container'}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div>
            <div className="font-headline-sm text-headline-sm text-on-surface">{t('budgets.composition.title')}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              {t('budgets.composition.subtitle', { amount: formatCompact(cap) })}
            </div>
          </div>
          <DonutChart
            segments={[
              ...composition.map((b, i) => ({ value: b.monthlyLimit, color: chartColor(i) })),
              ...(unallocated > 0 ? [{ value: unallocated, color: '#c7c4d8' }] : []),
            ]}
            label={t('budgets.composition.active')}
            value={t('budgets.composition.caps', { count: budgets.length })}
          />
          <div className="flex flex-col gap-space-sm">
            {composition.slice(0, 4).map((b, i) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: chartColor(i) }} />
                  <span className="font-body-sm text-body-sm text-on-surface truncate">{b.category.name}</span>
                </div>
                <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">{formatCurrency(b.monthlyLimit)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-space-xs">
              <div className="flex items-center gap-space-sm">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0 bg-outline-variant" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('budgets.composition.unallocated')}</span>
              </div>
              <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">{formatCurrency(unallocated)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category allocations */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-primary-container flex items-center gap-1">
              <Icon name="donut_small" className="text-[14px]" /> {t('budgets.allocations.eyebrow')}
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('budgets.allocations.title')}</h2>
          </div>
          <div className="flex bg-surface-container-lowest rounded-lg p-0.5 shadow-sm">
            {(['utilization', 'alpha'] as SortMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSort(mode)}
                className={cn(
                  'px-space-md py-1.5 rounded-md font-body-sm text-body-sm transition-colors',
                  sort === mode ? 'bg-surface-container-high text-on-surface font-semibold' : 'text-on-surface-variant hover:text-on-surface'
                )}
              >
                {mode === 'utilization' ? t('budgets.allocations.sortUtilization') : t('budgets.allocations.sortAlpha')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {budgetsLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-56 rounded-xl" />)}
          {sorted.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={() => setBudgetModal({ open: true, budget })}
              onLog={() => openExpense({ categoryId: budget.categoryId })}
            />
          ))}
          {!budgetsLoading && (
            <button
              type="button"
              onClick={() => setBudgetModal({ open: true })}
              className="min-h-56 rounded-xl border-2 border-dashed border-outline-variant/70 flex flex-col items-center justify-center gap-space-xs text-on-surface-variant hover:border-primary-container hover:text-primary-container hover:bg-primary-fixed/20 transition-colors"
            >
              <Icon name="add_circle" className="text-[28px]" />
              <span className="font-body-md text-body-md font-semibold">{t('budgets.allocations.addTitle')}</span>
              <span className="font-body-sm text-body-sm text-outline">{t('budgets.allocations.addSubtitle')}</span>
            </button>
          )}
        </div>
      </section>

      {/* Goals */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary flex items-center gap-1">
              <Icon name="flag" className="text-[14px]" /> {t('budgets.goals.eyebrow')}
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('budgets.goals.title')}</h2>
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant">
            {t('budgets.goals.vaultTotal')}{' '}
            <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">{formatCurrency(vaultTotal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {goalsLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-xl" />)}
          {goals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              index={i}
              onEdit={() => setGoalModal({ open: true, goal })}
              onBoost={() => setDepositGoal(goal)}
            />
          ))}
          {!goalsLoading && (
            <button
              type="button"
              onClick={() => setGoalModal({ open: true })}
              className="min-h-72 rounded-xl border-2 border-dashed border-outline-variant/70 flex flex-col items-center justify-center gap-space-xs text-on-surface-variant hover:border-secondary hover:text-secondary hover:bg-secondary-container/10 transition-colors"
            >
              <Icon name="add_circle" className="text-[28px]" />
              <span className="font-body-md text-body-md font-semibold">{t('budgets.goals.addTitle')}</span>
              <span className="font-body-sm text-body-sm text-outline">{t('budgets.goals.addSubtitle')}</span>
            </button>
          )}
        </div>
        <p className="font-body-sm text-body-sm text-outline">
          {t('budgets.goals.settingsHint')}{' '}
          <Link to="/settings" className="text-primary-container font-semibold hover:underline">
            {t('budgets.goals.settingsLink')}
          </Link>
          .
        </p>
      </section>

      <BudgetModal open={budgetModal.open} budget={budgetModal.budget} onClose={() => setBudgetModal({ open: false })} />
      <GoalModal open={goalModal.open} goal={goalModal.goal} onClose={() => setGoalModal({ open: false })} />
      <DepositModal open={Boolean(depositGoal)} goal={depositGoal} onClose={() => setDepositGoal(null)} />
    </>
  )
}

function HeroStat({
  label,
  value,
  valueClass,
  badge,
  badgeClass,
}: {
  label: string
  value: string
  valueClass?: string
  badge?: string
  badgeClass?: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-space-xs">
        <span className={cn('font-label-numeric-md text-label-numeric-md font-semibold', valueClass)}>{value}</span>
        {badge && <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded', badgeClass)}>{badge}</span>}
      </div>
    </div>
  )
}

function BudgetCard({ budget, onEdit, onLog }: { budget: CategoryBudgetWithSpent; onEdit: () => void; onLog: () => void }) {
  const { t } = useTranslation()
  const pct = budget.percentage
  const over = pct > 100
  const warn = pct >= 80 && !over
  const tone = categoryTone(budget.category.name)
  const status = over ? t('budgets.card.over') : warn ? t('budgets.card.spent') : t('budgets.card.paced')

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className={cn('p-2 rounded-lg', tone.tile)}>
            <Icon name={categoryIcon(budget.category.icon, budget.category.name)} className="text-[22px]" />
          </div>
          <div className="min-w-0">
            <div className="font-body-lg text-body-lg font-semibold text-on-surface truncate">{budget.category.name}</div>
            <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('budgets.card.monthlyCap')}</div>
          </div>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded whitespace-nowrap',
            over ? 'bg-tertiary-container text-on-tertiary' : warn ? 'bg-primary-fixed text-primary' : 'bg-secondary/10 text-secondary'
          )}
        >
          {t('budgets.card.status', { pct: Math.round(pct), status })}
        </span>
      </div>

      {over && (
        <div className="flex items-center gap-space-xs bg-error-container/40 px-space-sm py-1.5 rounded-lg">
          <Icon name="warning" className="text-[16px] text-tertiary-container" />
          <span className="font-body-sm text-body-sm text-tertiary-container font-medium">
            {t('budgets.card.exceededBy', { amount: formatCurrency(budget.spent - budget.monthlyLimit) })}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-space-xs">
        <div className="flex items-baseline gap-space-xs">
          <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">{formatCurrency(budget.spent)}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {t('budgets.card.ofCap', { amount: formatCurrency(budget.monthlyLimit) })}
          </span>
        </div>
        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', over ? 'bg-tertiary-container' : warn ? 'bg-primary-container' : 'bg-secondary')}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>

      <div className="mt-auto bg-surface-container-low/50 -mx-space-lg -mb-space-lg p-space-md rounded-b-xl flex items-center justify-between">
        <span className={cn('font-body-sm text-body-sm', over ? 'text-tertiary-container font-medium' : 'text-on-surface-variant')}>
          {over ? t('budgets.card.noRoom') : t('budgets.card.remaining', { amount: formatCurrency(budget.remaining) })}
        </span>
        <div className="flex items-center gap-space-sm">
          <button type="button" onClick={onLog} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface font-semibold flex items-center gap-0.5">
            <Icon name="add" className="text-[16px]" /> {t('budgets.card.log')}
          </button>
          <button type="button" onClick={onEdit} className="font-body-sm text-body-sm text-primary-container hover:text-primary font-semibold flex items-center gap-0.5">
            {t('budgets.card.adjust')} <Icon name="chevron_right" className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  )
}

const GOAL_TONES = [
  { tile: 'bg-secondary-container/40 text-secondary', bar: 'bg-secondary', text: 'text-secondary' },
  { tile: 'bg-primary-fixed text-primary', bar: 'bg-primary-container', text: 'text-primary-container' },
  { tile: 'bg-surface-container-high text-on-surface', bar: 'bg-outline', text: 'text-on-surface-variant' },
]

function GoalCard({
  goal,
  index,
  onEdit,
  onBoost,
}: {
  goal: SavingsGoalWithProgress
  index: number
  onEdit: () => void
  onBoost: () => void
}) {
  const { t } = useTranslation()
  const tone = GOAL_TONES[index % GOAL_TONES.length]
  const complete = goal.percentage >= 100

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', tone.tile)}>
            <Icon name={categoryIcon(goal.icon)} className="text-[22px]" />
          </div>
          <div className="min-w-0">
            <div className="font-headline-sm text-headline-sm text-on-surface truncate">{goal.name}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              {goal.targetDate
                ? t('budgets.goals.target', { date: formatDate(goal.targetDate, { month: 'short', year: 'numeric' }) })
                : t('budgets.goals.openEnded')}
            </div>
          </div>
        </div>
        <button type="button" onClick={onEdit} className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors">
          <Icon name="edit" className="text-[18px]" />
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-space-sm">
        <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">{formatCurrency(goal.currentAmount)}</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {t('budgets.goals.targetLabel', { amount: formatCurrency(goal.targetAmount) })}
        </span>
      </div>

      <div className="flex flex-col gap-space-xs">
        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all duration-700', tone.bar)} style={{ width: `${Math.min(100, goal.percentage)}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className={cn('font-label-numeric-sm text-label-numeric-sm font-semibold', tone.text)}>
            {t('budgets.goals.pctFunded', { pct: goal.percentage.toFixed(1) })}
          </span>
          <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
            {complete ? t('budgets.goals.goalReached') : t('budgets.goals.needed', { amount: formatCurrency(goal.remaining) })}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          {goal.monthlyRequired !== null ? t('budgets.goals.requiredPace') : t('budgets.goals.projFulfillment')}
        </span>
        <span className="font-label-numeric-sm text-label-numeric-sm font-semibold text-on-surface">
          {complete
            ? t('budgets.goals.complete')
            : goal.monthlyRequired !== null
              ? t('budgets.goals.perMonth', { amount: formatCurrency(goal.monthlyRequired) })
              : t('budgets.goals.noDeadline')}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="font-body-sm text-body-sm text-outline">
          {goal.targetDate ? formatDate(goal.targetDate) : t('budgets.goals.flexibleTimeline')}
        </span>
        <button
          type="button"
          onClick={onBoost}
          disabled={complete}
          className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-secondary-container/30 text-on-secondary-container hover:bg-secondary-container/50 font-body-sm text-body-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Icon name="add" className="text-[16px]" /> {t('budgets.goals.quickBoost')}
        </button>
      </div>
    </div>
  )
}
