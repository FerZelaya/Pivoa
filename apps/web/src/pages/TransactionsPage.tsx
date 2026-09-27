import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import type { ExpenseWithCategory } from '@pivoa/shared'
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses'
import { useCategories } from '@/hooks/useCategories'
import { useCategorySpending, useSpendingSummary } from '@/hooks/useAnalytics'
import { useOverview } from '@/hooks/useOverview'
import { useMe } from '@/hooks/useMe'
import { useAppShell } from '@/components/layout'
import { Icon } from '@/components/ui/icon'
import { PageHeader } from '@/components/ui/card'
import { categoryIcon, categoryTone, chartColor } from '@/lib/categories'
import { formatCurrency, formatCycleRange, formatDate, formatMoney, getDisplayCurrency, parseLocalDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const PAGE_SIZES = [10, 20, 50]

export default function TransactionsPage() {
  const { openExpense } = useAppShell()
  const navigate = useNavigate()
  const { data: me } = useMe()
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const [searchDraft, setSearchDraft] = useState(search)
  const [categoryId, setCategoryId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => setSearchDraft(search), [search])

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchDraft.trim() === search) return
      const next = new URLSearchParams(params)
      if (searchDraft.trim()) next.set('search', searchDraft.trim())
      else next.delete('search')
      setParams(next, { replace: true })
    }, 350)
    return () => clearTimeout(t)
  }, [searchDraft, search, params, setParams])

  useEffect(() => {
    setPage(1)
    setSelected(new Set())
  }, [search, categoryId, startDate, endDate, pageSize])

  const { data, isPending, isFetching } = useExpenses({
    page,
    pageSize,
    categoryId: categoryId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search || undefined,
  })
  const { data: categories = [] } = useCategories()
  const { data: summary } = useSpendingSummary()
  const { data: byCategory = [] } = useCategorySpending()
  const { data: overview } = useOverview()
  const deleteExpense = useDeleteExpense()

  const rows = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, data?.totalPages ?? 1)
  const viewTotal = rows.reduce((sum, e) => sum + (e.baseAmount ?? e.amount), 0)
  const withReceipts = rows.filter((e) => e.receiptImageUrl).length
  const hasFilters = Boolean(search || categoryId || startDate || endDate)

  const topCategory = byCategory[0]
  const activeCategory = categories.find((c) => c.id === categoryId)

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id))

  const resetFilters = () => {
    setSearchDraft('')
    setCategoryId('')
    setStartDate('')
    setEndDate('')
    setParams(new URLSearchParams(), { replace: true })
  }

  const deleteSelected = async () => {
    const ids = [...selected]
    try {
      await Promise.all(ids.map((id) => deleteExpense.mutateAsync(id)))
      toast.success(`${ids.length} transaction${ids.length > 1 ? 's' : ''} deleted`)
      setSelected(new Set())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete transactions')
    }
  }

  const exportCsv = () => {
    if (me && !me.csvExport) {
      toast.error('CSV export is included with Plus')
      navigate('/pricing')
      return
    }
    const source = selected.size ? rows.filter((r) => selected.has(r.id)) : rows
    if (!source.length) return toast.error('Nothing to export')
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const lines = [
      ['Date', 'Merchant', 'Category', 'Original Amount', 'Original Currency', 'Base Amount', 'Base Currency', 'Notes', 'Receipt'].join(','),
      ...source.map((e) =>
        [
          e.date.slice(0, 10),
          escape(e.vendor ?? ''),
          escape(e.category?.name ?? ''),
          e.amount.toFixed(2),
          e.currency,
          (e.baseAmount ?? e.amount).toFixed(2),
          overview?.currency ?? 'USD',
          escape(e.notes ?? ''),
          e.receiptImageUrl ?? '',
        ].join(',')
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pivoa-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pageNumbers = useMemo(() => {
    const pages: (number | '…')[] = []
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p)
      else if (pages[pages.length - 1] !== '…') pages.push('…')
    }
    return pages
  }, [page, totalPages])

  return (
    <>
      <PageHeader
        eyebrow={`Expense Ledger • ${formatCycleRange(overview?.cycleStart, overview?.cycleEnd)} Postings`}
        title="Transactions"
        actions={
          <button
            type="button"
            onClick={() => openExpense()}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm font-body-md text-body-md font-semibold"
          >
            <Icon name="add" className="text-[18px]" /> Log Transaction
          </button>
        }
      />

      {/* Telemetry strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <TelemetryCard
          label="Total Disbursed (M-T-D)"
          value={summary ? `-${formatCurrency(summary.totalSpent)}` : null}
          valueClass="text-tertiary-container"
          icon="arrow_upward_alt"
          iconClass="text-tertiary-container"
          hint={<><Icon name="receipt" className="text-[14px]" /> {summary?.transactionCount ?? 0} total postings</>}
          hintClass="text-outline"
        />
        <TelemetryCard
          label="Average Ticket"
          value={summary ? formatCurrency(summary.averageTransaction) : null}
          valueClass="text-primary-container"
          icon="receipt_long"
          iconClass="text-primary-container"
          hint={
            <>
              <Icon name={(summary?.changePercent ?? 0) > 0 ? 'trending_up' : 'trending_down'} className="text-[14px]" />
              {Math.abs(summary?.changePercent ?? 0).toFixed(1)}% vs last mo
            </>
          }
          hintClass={(summary?.changePercent ?? 0) > 0 ? 'text-tertiary-container' : 'text-secondary'}
        />
        <TelemetryCard
          label="Budget Remaining"
          value={overview ? formatCurrency(overview.budgetRemaining) : null}
          valueClass={overview?.isOverBudget ? 'text-tertiary-container' : 'text-secondary'}
          icon="account_balance_wallet"
          iconClass="text-secondary"
          hint={<><Icon name="schedule" className="text-[14px]" /> {overview?.daysRemaining ?? 0} days left in cycle</>}
          hintClass="text-secondary"
        />
        <TelemetryCard
          label="Top Category"
          value={topCategory ? topCategory.categoryName : summary ? 'None yet' : null}
          valueClass="text-on-surface"
          icon={categoryIcon(topCategory?.categoryIcon, topCategory?.categoryName)}
          iconClass="text-outline"
          hint={<><Icon name="pie_chart" className="text-[14px]" /> {topCategory ? `${formatCurrency(topCategory.total)} · ${Math.round(topCategory.percentage)}%` : 'Log expenses to see'}</>}
          hintClass="text-outline"
        />
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-xs flex-1 min-w-[260px] bg-surface-container-low px-space-md py-space-xs rounded-lg focus-within:ring-2 focus-within:ring-primary-container/20">
            <Icon name="search" className="text-outline text-[18px]" />
            <input
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none py-1"
              placeholder="Search merchant or notes..."
              type="text"
            />
            {isFetching && !isPending && <Icon name="progress_activity" className="animate-spin text-outline text-[16px]" />}
          </div>

          <div className="flex flex-wrap items-center gap-space-sm">
            <label className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
              <Icon name="calendar_month" className="text-outline text-[18px]" />
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent font-body-sm text-body-sm font-medium focus:outline-none w-[118px]"
              />
              <span className="text-outline">–</span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent font-body-sm text-body-sm font-medium focus:outline-none w-[118px]"
              />
            </label>

            <label className="relative flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container transition-colors cursor-pointer">
              <Icon name="category" className="text-outline text-[18px]" />
              <span className="font-body-sm text-body-sm font-medium">Category: {activeCategory?.name ?? 'All'}</span>
              <Icon name="expand_more" className="text-outline text-[16px]" />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-primary-container hover:text-primary font-body-sm text-body-sm font-semibold flex items-center gap-1 px-space-xs"
              >
                <Icon name="restart_alt" className="text-[16px]" /> Reset
              </button>
            )}

            <div className="h-6 w-px bg-outline-variant mx-1" />

            <button
              type="button"
              onClick={exportCsv}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-primary-container text-on-primary hover:bg-primary transition-colors shadow-sm"
            >
              <Icon name="download" className="text-[18px]" />
              <span className="font-body-sm text-body-sm font-semibold">Export CSV</span>
            </button>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center justify-between bg-surface-container-high px-space-md py-space-sm rounded-lg animate-fade-in">
            <div className="flex items-center gap-space-md">
              <span className="font-label-numeric-sm text-label-numeric-sm font-medium text-on-surface">
                {selected.size} of {rows.length} selected
              </span>
              <div className="h-4 w-px bg-outline-variant" />
              <button
                type="button"
                onClick={exportCsv}
                className="flex items-center gap-1 px-space-sm py-1 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface font-body-sm text-body-sm font-medium shadow-sm transition-colors"
              >
                <Icon name="download" className="text-[16px] text-primary-container" /> Export Selected
              </button>
            </div>
            <button
              type="button"
              onClick={deleteSelected}
              disabled={deleteExpense.isPending}
              className="flex items-center gap-1 px-space-sm py-1 rounded hover:bg-surface-container text-tertiary-container font-body-sm text-body-sm font-medium transition-colors"
            >
              <Icon name="delete_sweep" className="text-[16px]" /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Ledger table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                <th className="py-space-sm px-space-md w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
                    className="w-4 h-4 rounded accent-primary-container cursor-pointer"
                    aria-label="Select all"
                  />
                </th>
                <th className="py-space-sm px-space-md">Date</th>
                <th className="py-space-sm px-space-md">Merchant / Payee</th>
                <th className="py-space-sm px-space-md">Category</th>
                <th className="py-space-sm px-space-md">Receipt</th>
                <th className="py-space-sm px-space-md text-right">Amount</th>
                <th className="py-space-sm px-space-md w-12 text-center">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {isPending &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-3 px-space-md">
                      <div className="skeleton h-10" />
                    </td>
                  </tr>
                ))}
              {!isPending && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-surface-container-low flex items-center justify-center text-outline">
                      <Icon name={hasFilters ? 'search_off' : 'receipt_long'} className="text-[26px]" />
                    </div>
                    <p className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">
                      {hasFilters ? 'No matching transactions' : 'Your ledger is empty'}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {hasFilters ? 'Try widening the date range or clearing filters.' : 'Log an expense or scan a receipt to get started.'}
                    </p>
                  </td>
                </tr>
              )}
              {rows.map((expense) => (
                <LedgerRow
                  key={expense.id}
                  expense={expense}
                  checked={selected.has(expense.id)}
                  onToggle={() => toggle(expense.id)}
                  onOpen={() => openExpense({ expense })}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md px-space-lg py-space-md bg-surface-container-low/60">
          <div className="flex items-center gap-space-lg">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Active view totals{' '}
              <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">{formatCurrency(viewTotal)}</span> spent across{' '}
              <span className="font-semibold text-on-surface">{total}</span> records
            </span>
            <label className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
              Show
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-surface-container-lowest rounded px-1.5 py-0.5 font-label-numeric-sm text-label-numeric-sm text-on-surface shadow-sm focus:outline-none cursor-pointer"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              entries
            </label>
          </div>
          <div className="flex items-center gap-1">
            <PageButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <Icon name="chevron_left" className="text-[18px]" />
            </PageButton>
            {pageNumbers.map((p, i) =>
              p === '…' ? (
                <span key={`gap-${i}`} className="px-1 text-outline">
                  …
                </span>
              ) : (
                <PageButton key={p} active={p === page} onClick={() => setPage(p)}>
                  {p}
                </PageButton>
              )
            )}
            <PageButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <Icon name="chevron_right" className="text-[18px]" />
            </PageButton>
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Top Category Share</span>
            <Icon name="donut_small" className="text-[18px] text-primary-container" />
          </div>
          {byCategory.slice(0, 3).map((c, i) => (
            <div key={c.categoryId} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface font-medium">{c.categoryName}</span>
                <span className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant">{Math.round(c.percentage)}%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.percentage}%`, backgroundColor: chartColor(i) }} />
              </div>
            </div>
          ))}
          {byCategory.length === 0 && <p className="font-body-sm text-body-sm text-outline">No spending this month yet.</p>}
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Receipt Audit</span>
            <Icon name="document_scanner" className="text-[18px] text-secondary" />
          </div>
          <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
            {rows.length ? Math.round((withReceipts / rows.length) * 100) : 0}%
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {withReceipts} of {rows.length} postings in view have a scanned receipt attached.
          </p>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-auto">
            <div className="h-full rounded-full bg-secondary" style={{ width: `${rows.length ? (withReceipts / rows.length) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Monthly Cap Usage</span>
            <Icon name="speed" className="text-[18px] text-tertiary-container" />
          </div>
          <span className="font-label-numeric-lg text-label-numeric-lg text-on-surface">
            {formatCurrency(overview?.monthlySpent)}
            <span className="font-label-numeric-sm text-label-numeric-sm text-outline"> / {formatCurrency(overview?.monthlyIncome)}</span>
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Safe run rate of <span className="font-semibold text-on-surface">{formatCurrency(overview?.dailyBudget)}/day</span> for the rest of this cycle.
          </p>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-auto">
            <div
              className={cn('h-full rounded-full', overview?.isOverBudget ? 'bg-tertiary-container' : 'bg-primary-container')}
              style={{ width: `${Math.min(100, overview?.budgetPercentage ?? 0)}%` }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

function LedgerRow({
  expense,
  checked,
  onToggle,
  onOpen,
}: {
  expense: ExpenseWithCategory
  checked: boolean
  onToggle: () => void
  onOpen: () => void
}) {
  const tone = categoryTone(expense.category?.name)
  const weekday = parseLocalDate(expense.date).toLocaleDateString('en-US', { weekday: 'long' })

  return (
    <tr className={cn('hover:bg-surface-container-low/60 transition-colors group', checked && 'bg-surface-container-low/40')}>
      <td className="py-3 px-space-md text-center">
        <input type="checkbox" checked={checked} onChange={onToggle} className="w-4 h-4 rounded accent-primary-container cursor-pointer" />
      </td>
      <td className="py-3 px-space-md whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">{formatDate(expense.date)}</span>
          <span className="font-label-numeric-sm text-label-numeric-sm text-outline">{weekday}</span>
        </div>
      </td>
      <td className="py-3 px-space-md">
        <div className="flex items-center gap-space-sm">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center font-semibold shrink-0', tone.tile)}>
            <Icon name={categoryIcon(expense.category?.icon, expense.category?.name)} className="text-[19px]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-body-md text-body-md font-semibold text-on-surface truncate">{expense.vendor || expense.category?.name || 'Expense'}</span>
            <span className="font-body-sm text-body-sm text-outline truncate max-w-[280px]">{expense.notes || 'No notes'}</span>
          </div>
        </div>
      </td>
      <td className="py-3 px-space-md whitespace-nowrap">
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body-sm text-body-sm font-semibold', tone.pill)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', tone.dot)} /> {expense.category?.name ?? 'Other'}
        </span>
      </td>
      <td className="py-3 px-space-md whitespace-nowrap">
        {expense.receiptImageUrl ? (
          <a
            href={expense.receiptImageUrl}
            target="_blank"
            rel="noreferrer"
            className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container-highest transition-colors"
            title="View receipt"
          >
            <Icon name="receipt_long" className="text-primary-container text-[18px]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface-container-lowest" />
          </a>
        ) : (
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-container-low text-outline-variant" title="No receipt">
            <Icon name="hide_image" className="text-[18px]" />
          </span>
        )}
      </td>
      <td className="py-3 px-space-md text-right whitespace-nowrap">
        <div className="flex flex-col items-end">
          <span className="font-label-numeric-md text-label-numeric-md font-semibold text-on-surface">-{formatCurrency(expense.baseAmount ?? expense.amount)}</span>
          {expense.currency && expense.currency !== getDisplayCurrency() && (
            <span className="font-label-numeric-sm text-label-numeric-sm text-outline">{formatMoney(expense.amount, expense.currency)}</span>
          )}
        </div>
      </td>
      <td className="py-3 px-space-md text-center">
        <button
          type="button"
          onClick={onOpen}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-all"
          title="Edit transaction"
        >
          <Icon name="more_horiz" className="text-[18px]" />
        </button>
      </td>
    </tr>
  )
}

function TelemetryCard({
  label,
  value,
  valueClass,
  icon,
  iconClass,
  hint,
  hintClass,
}: {
  label: string
  value: string | null
  valueClass: string
  icon: string
  iconClass: string
  hint: React.ReactNode
  hintClass: string
}) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-sm">
      <div className="flex flex-col min-w-0">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{label}</span>
        {value === null ? (
          <div className="skeleton h-7 w-28 my-0.5" />
        ) : (
          <span className={cn('font-label-numeric-lg text-label-numeric-lg truncate', valueClass)}>{value}</span>
        )}
        <span className={cn('font-body-sm text-body-sm flex items-center gap-1', hintClass)}>{hint}</span>
      </div>
      <div className={cn('w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0', iconClass)}>
        <Icon name={icon} className="text-[22px]" />
      </div>
    </div>
  )
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'min-w-8 h-8 px-2 rounded-lg flex items-center justify-center font-label-numeric-sm text-label-numeric-sm transition-colors disabled:opacity-40 disabled:pointer-events-none',
        active ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-lowest'
      )}
    >
      {children}
    </button>
  )
}
