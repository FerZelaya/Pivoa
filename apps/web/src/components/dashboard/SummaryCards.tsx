import { Card, CardContent } from '@/components/ui/card'
import { useSpendingSummary, useCategorySpending } from '@/hooks/useAnalytics'
import { TrendingUp, TrendingDown, Receipt, Target, Wallet } from 'lucide-react'

export function SummaryCards() {
  const { data: summary, isLoading: summaryLoading } = useSpendingSummary()
  const { data: categories } = useCategorySpending()

  const topCategory = categories?.[0]
  const isUp = summary && summary.changePercent > 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Spending Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Spending</p>
              {summaryLoading ? (
                <div className="h-8 w-28 bg-muted animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">
                  ${(summary?.totalSpent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </div>
          {summary && summary.previousMonthTotal > 0 && (
            <div className={`mt-3 flex items-center gap-1.5 text-sm ${isUp ? 'text-destructive' : 'text-accent'}`}>
              {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="font-medium">{Math.abs(summary.changePercent).toFixed(1)}%</span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Transactions</p>
              {summaryLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">
                  {summary?.transactionCount || 0}
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <Receipt className="h-5 w-5 text-secondary" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      {/* Average Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Average</p>
              {summaryLoading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
              ) : (
                <p className="text-2xl font-bold tracking-tight">
                  ${(summary?.averageTransaction || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Target className="h-5 w-5 text-accent" />
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Per transaction</p>
        </CardContent>
      </Card>

      {/* Top Category Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Top Category</p>
              {summaryLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded-lg" />
              ) : topCategory ? (
                <p className="text-2xl font-bold tracking-tight">{topCategory.categoryName}</p>
              ) : (
                <p className="text-2xl font-bold tracking-tight text-muted-foreground">--</p>
              )}
            </div>
            {topCategory && (
              <div 
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${topCategory.categoryColor}15` }}
              >
                <div 
                  className="h-5 w-5 rounded-full"
                  style={{ backgroundColor: topCategory.categoryColor }}
                />
              </div>
            )}
          </div>
          {topCategory && (
            <p className="mt-3 text-sm text-muted-foreground">
              ${topCategory.total.toFixed(2)} ({topCategory.percentage.toFixed(0)}%)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
