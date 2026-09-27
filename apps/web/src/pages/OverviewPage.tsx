import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useOverview } from '@/hooks/useOverview'
import { useCategorySpending, useSpendingTrend, type TrendDataPoint } from '@/hooks/useAnalytics'
import { useExpenses } from '@/hooks/useExpenses'
import { useBudgets } from '@/hooks/useBudgets'
import { useGoals } from '@/hooks/useGoals'
import { useAppShell } from '@/components/layout'
import { Icon } from '@/components/ui/icon'
import { PageHeader } from '@/components/ui/card'
import { DonutChart } from '@/components/charts/DonutChart'
import { categoryIcon, chartColor } from '@/lib/categories'
import { formatCompact, formatCurrency, formatCycleRange, formatDate, parseLocalDate, toISODate } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function OverviewPage() {
  const { t } = useTranslation()
  const { openExpense } = useAppShell()
  const today = new Date()

  const { data: overview, isPending: overviewLoading } = useOverview()
  const { data: categories = [] } = useCategorySpending()
  const { data: trend = [] } = useSpendingTrend({ granularity: 'day', from: overview?.cycleStart, to: overview?.cycleEnd })
  const { data: recent, isPending: recentLoading } = useExpenses({ pageSize: 6 })
  const { data: budgets = [] } = useBudgets()
  const { data: goals = [] } = useGoals()

  const income = overview?.monthlyIncome ?? 0
  const spent = overview?.monthlySpent ?? 0
  const daysInMonth = overview?.daysInMonth ?? 30
  const dayOfCycle = overview ? daysInMonth - overview.daysRemaining : today.getDate()
  const dailyIncome = income / daysInMonth
  const cycleLabel = formatCycleRange(overview?.cycleStart, overview?.cycleEnd)

  const chartData = buildChartData(trend, overview?.cycleStart, dailyIncome)

  const peakDay = chartData.reduce((max, d) => (d.daily > max.daily ? d : max), { label: t('common.emDash'), daily: 0 } as { label: string; daily: number })
  const dailyAverage = dayOfCycle ? spent / dayOfCycle : 0
  const bufferReserve = income - (overview?.projectedMonthEnd ?? 0)

  const topCategories = categories.slice(0, 5)
  const categoryTotal = categories.reduce((sum, c) => sum + c.total, 0)

  const burnMultiplier = income ? (overview?.projectedMonthEnd ?? 0) / income : 0
  const health =
    !income ? { label: t('overview.health.noCap'), tone: 'text-outline' }
    : burnMultiplier > 1 ? { label: t('overview.health.overPace'), tone: 'text-tertiary-container' }
    : burnMultiplier > 0.85 ? { label: t('overview.health.watch'), tone: 'text-primary-container' }
    : { label: t('overview.health.optimal'), tone: 'text-secondary' }

  const milestones = goals
    .filter((g) => g.percentage < 100)
    .sort((a, b) => (a.targetDate ?? '9999').localeCompare(b.targetDate ?? '9999'))
    .slice(0, 3)

  const budgetWatch = [...budgets].sort((a, b) => b.percentage - a.percentage).slice(0, 4)

  return (
    <>
      <PageHeader
        eyebrow={t('overview.eyebrow', { cycle: cycleLabel, day: dayOfCycle, days: daysInMonth })}
        title={t('overview.title')}
        actions={
          <>
            <Link
              to="/budgets"
              className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low transition-colors font-body-md text-body-md font-medium"
            >
              <Icon name="track_changes" className="text-[18px]" /> {t('overview.manageBudgets')}
            </Link>
            <button
              type="button"
              onClick={() => openExpense()}
              className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm font-body-md text-body-md font-semibold"
            >
              <Icon name="bolt" className="text-[18px]" /> {t('overview.quickAdd')}
            </button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        <KpiCard
          label={t('overview.kpi.savedInGoals')}
          icon="account_balance"
          iconClass="bg-primary-fixed text-primary"
          value={overview ? formatCurrency(overview.totalBalance) : null}
          circle="bg-primary/5"
        >
          <span className="px-2 py-0.5 rounded bg-primary-fixed/60 text-on-primary-fixed-variant font-label-numeric-sm text-label-numeric-sm">
            {t('overview.kpi.goal', { count: goals.length })}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{t('overview.kpi.acrossFunds')}</span>
        </KpiCard>

        <KpiCard
          label={t('overview.kpi.monthlyIncome')}
          icon="south_west"
          iconClass="bg-secondary-container/40 text-secondary"
          value={overview ? formatCurrency(income) : null}
          circle="bg-secondary/5"
        >
          <span className="px-2 py-0.5 rounded bg-secondary-fixed/30 text-on-secondary-container font-label-numeric-sm text-label-numeric-sm">
            {t('overview.kpi.perDay', { amount: formatCurrency(dailyIncome) })}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{t('overview.kpi.budgetCeiling')}</span>
        </KpiCard>

        <KpiCard
          label={t('overview.kpi.monthlyOutflow')}
          icon="north_east"
          iconClass="bg-tertiary-fixed text-tertiary-container"
          value={overview ? formatCurrency(spent) : null}
          circle="bg-tertiary/5"
        >
          <div className="w-full flex flex-col gap-1">
            <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
              <span>{t('overview.kpi.cap', { amount: formatCurrency(income) })}</span>
              <span className={cn('font-label-numeric-sm text-label-numeric-sm', overview?.isOverBudget && 'text-tertiary-container')}>
                {t('overview.kpi.pctUsed', { pct: Math.round(overview?.budgetPercentage ?? 0) })}
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', overview?.isOverBudget ? 'bg-tertiary-container' : 'bg-primary-container')}
                style={{ width: `${Math.min(100, overview?.budgetPercentage ?? 0)}%` }}
              />
            </div>
          </div>
        </KpiCard>

        <KpiCard
          label={t('overview.kpi.netSavingsRate')}
          icon="savings"
          iconClass="bg-primary-fixed text-primary"
          value={overview ? `${overview.netSavings >= 0 ? '+' : '-'}${formatCurrency(Math.abs(overview.netSavings))}` : null}
          valueClass={overview && overview.netSavings < 0 ? 'text-tertiary-container' : 'text-secondary'}
          circle="bg-secondary/5"
        >
          <span
            className={cn(
              'px-2 py-0.5 rounded font-label-numeric-sm text-label-numeric-sm',
              (overview?.savingsRate ?? 0) >= 0 ? 'bg-secondary-fixed/30 text-on-secondary-container' : 'bg-tertiary-fixed text-tertiary'
            )}
          >
            {(overview?.savingsRate ?? 0).toFixed(1)}%
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {overview?.changeFromLastMonth
              ? t('overview.kpi.spendVsLastMo', {
                  change: `${overview.changeFromLastMonth > 0 ? '+' : ''}${overview.changeFromLastMonth}`,
                })
              : t('overview.kpi.ofIncomeRetained')}
          </span>
        </KpiCard>
      </div>

      {/* Chart + allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface">{t('overview.chart.title')}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{t('overview.chart.subtitle')}</div>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('overview.chart.spendingTrack')}</span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="w-2.5 h-1 border-b border-dashed border-secondary" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {t('overview.chart.baselineIncome', { amount: formatCurrency(dailyIncome).replace('.00', '') })}
                </span>
              </div>
            </div>
          </div>
          <div className="w-full h-64 pt-4">
            {overviewLoading ? (
              <div className="skeleton h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#dce9ff" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#777587', fontFamily: 'JetBrains Mono' }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tick={{ fontSize: 11, fill: '#777587', fontFamily: 'JetBrains Mono' }}
                    tickFormatter={(v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#c7c4d8', strokeDasharray: '3 3' }} />
                  {income > 0 && (
                    <Line type="linear" dataKey="baseline" stroke="#006c4a" strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} />
                  )}
                  <Area type="monotone" dataKey="spending" stroke="#3525cd" strokeWidth={2.5} fill="url(#spendFill)" activeDot={{ r: 4, fill: '#3525cd', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-3 gap-space-md bg-surface-container-low p-space-md rounded-lg">
            <Stat label={t('overview.chart.dailyAverage')} value={formatCurrency(dailyAverage)} />
            <Stat
              label={t('overview.chart.peakOutflowDay')}
              value={peakDay.daily ? t('overview.chart.peakValue', { amount: formatCompact(peakDay.daily), label: peakDay.label }) : t('common.emDash')}
              valueClass="text-tertiary"
            />
            <Stat
              label={t('overview.chart.bufferReserve')}
              value={income ? `${bufferReserve >= 0 ? '+' : '-'}${formatCompact(Math.abs(bufferReserve))}` : t('common.emDash')}
              valueClass={bufferReserve >= 0 ? 'text-secondary' : 'text-tertiary-container'}
            />
          </div>
        </div>

        <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface">{t('overview.allocation.title')}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{t('overview.allocation.subtitle')}</div>
            </div>
            <Link to="/budgets" className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface">
              <Icon name="more_vert" className="text-[18px]" />
            </Link>
          </div>
          <div className="py-space-sm">
            <DonutChart
              segments={topCategories.map((c, i) => ({ value: c.total, color: chartColor(i) }))}
              label={t('overview.allocation.total')}
              value={formatCompact(categoryTotal)}
            />
          </div>
          <div className="flex flex-col gap-space-sm">
            {topCategories.length === 0 && (
              <p className="font-body-sm text-body-sm text-outline text-center">{t('overview.allocation.empty')}</p>
            )}
            {topCategories.map((c, i) => (
              <div key={c.categoryId} className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: chartColor(i) }} />
                  <span className="font-body-sm text-body-sm text-on-surface truncate">{c.categoryName}</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">{Math.round(c.percentage)}%</span>
                  <span className="font-label-numeric-md text-label-numeric-md text-on-surface font-semibold w-20 text-right">{formatCurrency(c.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions + right rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-headline-sm text-headline-sm text-on-surface">{t('overview.recent.title')}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">{t('overview.recent.subtitle')}</div>
            </div>
            <Link to="/transactions" className="font-body-sm text-body-sm text-primary font-semibold hover:text-on-primary-fixed-variant flex items-center gap-1">
              <span>{t('overview.recent.viewAll')}</span>
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                  <th className="py-2.5 px-space-md rounded-l-lg">{t('overview.recent.colMerchant')}</th>
                  <th className="py-2.5 px-space-md">{t('overview.recent.colCategory')}</th>
                  <th className="py-2.5 px-space-md">{t('overview.recent.colDate')}</th>
                  <th className="py-2.5 px-space-md text-right rounded-r-lg">{t('overview.recent.colAmount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {recentLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="py-3 px-space-md">
                        <div className="skeleton h-9" />
                      </td>
                    </tr>
                  ))}
                {!recentLoading && !recent?.data.length && (
                  <tr>
                    <td colSpan={4} className="py-space-xl text-center">
                      <Icon name="receipt_long" className="text-outline-variant text-[36px]" />
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">{t('overview.recent.empty')}</p>
                      <button type="button" onClick={() => openExpense()} className="font-body-sm text-body-sm text-primary-container font-semibold mt-1">
                        {t('overview.recent.logFirst')}
                      </button>
                    </td>
                  </tr>
                )}
                {recent?.data.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-surface-container-low/60 transition-colors cursor-pointer"
                    onClick={() => openExpense({ expense })}
                  >
                    <td className="py-3 px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0">
                          <Icon name={categoryIcon(expense.category?.icon, expense.category?.name)} className="text-[19px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-body-md text-body-md font-semibold text-on-surface truncate">
                            {expense.vendor || expense.category?.name || t('common.expense')}
                          </div>
                          <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                            {expense.notes || (expense.receiptImageUrl ? t('overview.recent.receiptAttached') : t('overview.recent.manualEntry'))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-space-md">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-body-sm text-body-sm whitespace-nowrap">
                        {expense.category?.name ?? t('common.other')}
                      </span>
                    </td>
                    <td className="py-3 px-space-md font-label-numeric-sm text-label-numeric-sm text-on-surface-variant whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>
                    <td className="py-3 px-space-md text-right font-label-numeric-md text-label-numeric-md font-semibold text-tertiary whitespace-nowrap">
                      -{formatCurrency(expense.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <Icon name="event_upcoming" className="text-[20px] text-primary" />
                <span className="font-headline-sm text-headline-sm text-on-surface">{t('overview.goals.title')}</span>
              </div>
              <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                {t('overview.goals.active', { count: goals.length })}
              </span>
            </div>
            {milestones.length === 0 ? (
              <Link to="/budgets" className="flex items-center gap-space-sm bg-surface-container-low p-space-sm rounded-lg hover:bg-surface-container transition-colors">
                <Icon name="flag" className="text-secondary" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">{t('overview.goals.addGoal')}</span>
              </Link>
            ) : (
              <div className="flex flex-col gap-space-sm relative">
                <div className="absolute left-3.5 top-3 bottom-3 w-0.5 bg-surface-container-high" />
                {milestones.map((goal, i) => {
                  const days = goal.targetDate ? Math.ceil((parseLocalDate(goal.targetDate).getTime() - today.getTime()) / 86_400_000) : null
                  const dotClass = ['bg-secondary text-on-secondary', 'bg-primary-container text-on-primary', 'bg-outline text-on-primary'][i % 3]
                  return (
                    <div key={goal.id} className="flex items-start gap-space-md relative pl-1">
                      <div className={cn('w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest z-10 shrink-0 mt-0.5', dotClass)}>
                        <Icon name={categoryIcon(goal.icon)} className="text-[14px]" />
                      </div>
                      <div className="flex-1 bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between gap-space-sm">
                        <div className="min-w-0">
                          <div className="font-body-sm text-body-sm font-semibold text-on-surface truncate">{goal.name}</div>
                          <div className={cn('font-label-numeric-sm text-label-numeric-sm font-medium', days !== null && days < 30 ? 'text-tertiary' : 'text-on-surface-variant')}>
                            {days === null
                              ? t('overview.goals.pctFunded', { pct: Math.round(goal.percentage) })
                              : days < 0
                                ? t('overview.goals.targetPassed')
                                : t('overview.goals.dueIn', {
                                    days,
                                    date: formatDate(goal.targetDate!, { month: 'short', day: 'numeric' }),
                                  })}
                          </div>
                        </div>
                        <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface whitespace-nowrap">{formatCompact(goal.remaining)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {budgetWatch.length > 0 && (
              <div className="pt-space-sm flex flex-col gap-space-sm">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('overview.goals.budgetWatch')}</span>
                {budgetWatch.map((b) => (
                  <div key={b.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-body-sm text-body-sm text-on-surface">{b.category.name}</span>
                      <span className={cn('font-label-numeric-sm text-label-numeric-sm', b.percentage > 100 ? 'text-tertiary-container' : 'text-on-surface-variant')}>
                        {formatCompact(b.spent)} / {formatCompact(b.monthlyLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', b.percentage > 100 ? 'bg-tertiary-container' : b.percentage >= 80 ? 'bg-primary-container' : 'bg-secondary')}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-headline-sm text-headline-sm text-on-surface">{t('overview.health.title')}</span>
              <span className={cn('font-label-caps text-label-caps font-bold', health.tone)}>{health.label}</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              {income
                ? t('overview.health.pulseWithIncome', {
                    rate: (overview?.savingsRate ?? 0).toFixed(1),
                    projected: formatCurrency(overview?.projectedMonthEnd),
                    daily: formatCurrency(overview?.dailyBudget),
                  })
                : t('overview.health.pulseNoIncome')}
            </p>
            <div className="pt-space-xs flex items-center gap-space-sm">
              <div className="flex-1 bg-surface-container-low p-space-sm rounded-lg">
                <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('overview.health.burnMultiplier')}</div>
                <div className={cn('font-label-numeric-md text-label-numeric-md font-semibold', burnMultiplier > 1 ? 'text-tertiary-container' : 'text-on-surface')}>
                  {t('overview.health.burnValue', { value: burnMultiplier.toFixed(2) })}
                </div>
              </div>
              <div className="flex-1 bg-surface-container-low p-space-sm rounded-lg">
                <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('overview.health.daysLeft')}</div>
                <div className="font-label-numeric-md text-label-numeric-md text-secondary font-semibold">
                  {overview?.daysRemaining != null
                    ? t('overview.health.daysValue', { count: overview.daysRemaining })
                    : t('common.emDash')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function buildChartData(trend: TrendDataPoint[], cycleStart: string | undefined, dailyIncome: number) {
  const byDate = new Map(trend.map((point) => [point.date.slice(0, 10), point.total]))
  const points = []
  let cumulative = 0
  const start = cycleStart ? parseLocalDate(cycleStart) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cursor = new Date(start)
  let day = 1
  while (cursor <= today && day <= 62) {
    const daily = byDate.get(toISODate(cursor)) ?? 0
    cumulative += daily
    points.push({
      label: cursor.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      daily,
      spending: Math.round(cumulative * 100) / 100,
      baseline: Math.round(dailyIncome * day * 100) / 100,
    })
    cursor.setDate(cursor.getDate() + 1)
    day += 1
  }
  return points
}

interface KpiCardProps {
  label: string
  icon: string
  iconClass: string
  value: string | null
  valueClass?: string
  circle: string
  children: React.ReactNode
}

function KpiCard({ label, icon, iconClass, value, valueClass, circle, children }: KpiCardProps) {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between gap-space-md relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={cn('absolute -right-6 -bottom-6 w-24 h-24 rounded-full group-hover:scale-110 transition-transform duration-500', circle)} />
      <div className="flex items-center justify-between relative">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconClass)}>
          <Icon name={icon} className="text-[20px]" />
        </div>
      </div>
      <div className="flex flex-col gap-space-xs relative">
        {value === null ? (
          <div className="skeleton h-7 w-32" />
        ) : (
          <span className={cn('font-label-numeric-lg text-label-numeric-lg text-on-surface', valueClass)}>{value}</span>
        )}
        <div className="flex items-center gap-space-xs">{children}</div>
      </div>
    </div>
  )
}

function Stat({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{label}</span>
      <span className={cn('font-label-numeric-md text-label-numeric-md font-semibold text-on-surface truncate', valueClass)}>{value}</span>
    </div>
  )
}

interface TooltipPayload {
  payload: { label: string; spending: number; baseline: number; daily: number }
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  const { t } = useTranslation()
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="bg-inverse-surface text-inverse-on-surface rounded-lg px-space-md py-space-sm shadow-lg">
      <div className="font-label-caps text-label-caps uppercase opacity-70">{point.label}</div>
      <div className="font-label-numeric-md text-label-numeric-md font-semibold">
        {t('overview.chart.tooltipTotal', { amount: formatCurrency(point.spending) })}
      </div>
      <div className="font-label-numeric-sm text-label-numeric-sm opacity-80">
        {t('overview.chart.tooltipDaily', { amount: formatCurrency(point.daily) })}
      </div>
    </div>
  )
}
