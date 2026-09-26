import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import type { CategoryBudgetWithSpent, SavingsGoalWithProgress } from '@pivoa/shared'
import { useBudgets } from '@/hooks/useBudgets'
import { useGoals } from '@/hooks/useGoals'
import { useOverview } from '@/hooks/useOverview'
import { useAppShell } from '@/components/layout'
import { Icon } from '@/components/ui/icon'
import { DonutChart } from '@/components/charts/DonutChart'
import { BudgetModal } from '@/components/budgets/BudgetModal'
import { DepositModal, GoalModal } from '@/components/goals/GoalModal'
import { categoryIcon, categoryTone, chartColor } from '@/lib/categories'
import { formatCompact, formatCurrency, formatCycleRange, formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

type SortMode = 'utilization' | 'alpha'

export default function BudgetsPage() {
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
            Portfolio Discipline • {formatCycleRange(overview?.cycleStart, overview?.cycleEnd)} Cycle
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mt-0.5">Budgets &amp; Financial Targets</h1>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            type="button"
            onClick={() => setBudgetModal({ open: true })}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-body-md text-body-md font-semibold"
          >
            <Icon name="add_chart" className="text-[18px]" /> New Category Budget
          </button>
          <button
            type="button"
            onClick={() => setGoalModal({ open: true })}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm font-body-md text-body-md font-semibold"
          >
            <Icon name="add" className="text-[18px]" /> Add Savings Goal
          </button>
        </div>
      </div>

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
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Aggregate Monthly Cap</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Overall Spend Velocity</h2>
              </div>
            </div>
            <span className="px-space-sm py-1 rounded-full bg-surface-container-low font-label-numeric-sm text-label-numeric-sm text-on-surface-variant whitespace-nowrap">
              {overview?.daysRemaining ?? '—'} days left in cycle
            </span>
          </div>

          <div className="relative">
            {overviewLoading ? (
              <div className="skeleton h-10 w-2/3" />
            ) : (
              <div className="flex flex-wrap items-baseline gap-x-space-sm gap-y-1">
                <span className="font-label-numeric-lg text-[34px] leading-[40px] font-semibold text-on-surface">{formatCurrency(spent)}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">consumed of</span>
                <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">{formatCurrency(cap)}</span>
                <span className="font-body-md text-body-md text-on-surface-variant">total limit</span>
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
              <span>$0.00 base</span>
              <span className={cn('font-semibold', pct > 100 ? 'text-tertiary-container' : 'text-secondary')}>
                {pct > 100 ? `${formatCurrency(spent - cap)} over ceiling` : `${formatCurrency(cap - spent)} cushion remaining`}
              </span>
              <span>{formatCurrency(cap)} ceiling</span>
            </div>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-space-md bg-surface-container-low p-space-md rounded-lg">
            <HeroStat label="Safe Daily Run Rate" value={`${formatCurrency(overview?.dailyBudget)}/d`} valueClass="text-secondary" />
            <HeroStat label="Actual Mean Burn" value={`${formatCurrency(meanBurn)}/d`} valueClass={meanBurn > cap / daysInMonth ? 'text-tertiary-container' : 'text-on-surface'} />
            <HeroStat
              label="Month-End Projection"
              value={formatCurrency(projection)}
              valueClass={projection > cap ? 'text-tertiary-container' : 'text-on-surface'}
              badge={cap ? (projection > cap ? 'Over-Budget' : 'On-Budget') : undefined}
              badgeClass={projection > cap ? 'bg-tertiary-fixed text-tertiary' : 'bg-secondary-container/40 text-on-secondary-container'}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div>
            <div className="font-headline-sm text-headline-sm text-on-surface">Bucket Composition</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant">How your {formatCompact(cap)} cap is allocated</div>
          </div>
          <DonutChart
            segments={[
              ...composition.map((b, i) => ({ value: b.monthlyLimit, color: chartColor(i) })),
              ...(unallocated > 0 ? [{ value: unallocated, color: '#c7c4d8' }] : []),
            ]}
            label="Active"
            value={`${budgets.length} Caps`}
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
                <span className="font-body-sm text-body-sm text-on-surface-variant">Unallocated</span>
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
              <Icon name="donut_small" className="text-[14px]" /> Category Allocations
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Spending Caps by Category</h2>
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
                {mode === 'utilization' ? 'Highest Utilization' : 'Alphabetical'}
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
              <span className="font-body-md text-body-md font-semibold">Add category budget</span>
              <span className="font-body-sm text-body-sm text-outline">Set a monthly cap for any category</span>
            </button>
          )}
        </div>
      </section>

      {/* Goals */}
      <section className="flex flex-col gap-space-md">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
          <div>
            <span className="font-label-caps text-label-caps uppercase text-secondary flex items-center gap-1">
              <Icon name="flag" className="text-[14px]" /> Capital Accumulation
            </span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Target Goals &amp; Dedicated Sinking Funds</h2>
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant">
            Total Vault Capital:{' '}
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
              <span className="font-body-md text-body-md font-semibold">Add savings goal</span>
              <span className="font-body-sm text-body-sm text-outline">Emergency fund, travel, a new car…</span>
            </button>
          )}
        </div>
        <p className="font-body-sm text-body-sm text-outline">
          Manage your monthly income cap anytime in{' '}
          <Link to="/settings" className="text-primary-container font-semibold hover:underline">
            Settings
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
  const pct = budget.percentage
  const over = pct > 100
  const warn = pct >= 80 && !over
  const tone = categoryTone(budget.category.name)

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <div className={cn('p-2 rounded-lg', tone.tile)}>
            <Icon name={categoryIcon(budget.category.icon, budget.category.name)} className="text-[22px]" />
          </div>
          <div className="min-w-0">
            <div className="font-body-lg text-body-lg font-semibold text-on-surface truncate">{budget.category.name}</div>
            <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">Monthly cap</div>
          </div>
        </div>
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded whitespace-nowrap',
            over ? 'bg-tertiary-container text-on-tertiary' : warn ? 'bg-primary-fixed text-primary' : 'bg-secondary/10 text-secondary'
          )}
        >
          {Math.round(pct)}% {over ? 'Over' : warn ? 'Spent' : 'Paced'}
        </span>
      </div>

      {over && (
        <div className="flex items-center gap-space-xs bg-error-container/40 px-space-sm py-1.5 rounded-lg">
          <Icon name="warning" className="text-[16px] text-tertiary-container" />
          <span className="font-body-sm text-body-sm text-tertiary-container font-medium">
            Exceeded by {formatCurrency(budget.spent - budget.monthlyLimit)}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-space-xs">
        <div className="flex items-baseline gap-space-xs">
          <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">{formatCurrency(budget.spent)}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">of {formatCurrency(budget.monthlyLimit)} cap</span>
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
          {over ? 'No room left this cycle' : `${formatCurrency(budget.remaining)} remaining`}
        </span>
        <div className="flex items-center gap-space-sm">
          <button type="button" onClick={onLog} className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface font-semibold flex items-center gap-0.5">
            <Icon name="add" className="text-[16px]" /> Log
          </button>
          <button type="button" onClick={onEdit} className="font-body-sm text-body-sm text-primary-container hover:text-primary font-semibold flex items-center gap-0.5">
            Adjust <Icon name="chevron_right" className="text-[16px]" />
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
              {goal.targetDate ? `Target ${formatDate(goal.targetDate, { month: 'short', year: 'numeric' })}` : 'Open-ended fund'}
            </div>
          </div>
        </div>
        <button type="button" onClick={onEdit} className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors">
          <Icon name="edit" className="text-[18px]" />
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-space-sm">
        <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">{formatCurrency(goal.currentAmount)}</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">Target: {formatCurrency(goal.targetAmount)}</span>
      </div>

      <div className="flex flex-col gap-space-xs">
        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all duration-700', tone.bar)} style={{ width: `${Math.min(100, goal.percentage)}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className={cn('font-label-numeric-sm text-label-numeric-sm font-semibold', tone.text)}>{goal.percentage.toFixed(1)}% Funded</span>
          <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">
            {complete ? 'Goal reached' : `${formatCurrency(goal.remaining)} needed`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between bg-surface-container-low p-space-sm rounded-lg">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          {goal.monthlyRequired !== null ? 'Required Pace' : 'Proj. Fulfillment'}
        </span>
        <span className="font-label-numeric-sm text-label-numeric-sm font-semibold text-on-surface">
          {complete ? 'Complete' : goal.monthlyRequired !== null ? `${formatCurrency(goal.monthlyRequired)}/mo` : 'No deadline'}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="font-body-sm text-body-sm text-outline">
          {goal.targetDate ? formatDate(goal.targetDate) : 'Flexible timeline'}
        </span>
        <button
          type="button"
          onClick={onBoost}
          disabled={complete}
          className="flex items-center gap-1 px-space-sm py-1 rounded-lg bg-secondary-container/30 text-on-secondary-container hover:bg-secondary-container/50 font-body-sm text-body-sm font-semibold transition-colors disabled:opacity-50"
        >
          <Icon name="add" className="text-[16px]" /> Quick Boost
        </button>
      </div>
    </div>
  )
}
