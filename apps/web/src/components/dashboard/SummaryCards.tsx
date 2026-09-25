import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSpendingSummary, useCategorySpending } from '@/hooks/useAnalytics'
import { TrendingUp, TrendingDown, Receipt, PieChart, DollarSign } from 'lucide-react'

export function SummaryCards() {
  const { data: summary, isLoading: summaryLoading } = useSpendingSummary()
  const { data: categories } = useCategorySpending()

  const topCategory = categories?.[0]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Spending Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Total Spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <p className="text-2xl font-bold">
                ${(summary?.totalSpent || 0).toFixed(2)}
              </p>
              {summary && summary.changePercent !== 0 && (
                <p className={`text-sm flex items-center gap-1 ${
                  summary.changePercent > 0 ? 'text-destructive' : 'text-green-600'
                }`}>
                  {summary.changePercent > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(summary.changePercent).toFixed(1)}% vs last month
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Count Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <p className="text-2xl font-bold">
                {summary?.transactionCount || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                This month
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Average Transaction Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Average
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <p className="text-2xl font-bold">
                ${(summary?.averageTransaction || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                Per transaction
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Top Category Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Top Category
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaryLoading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : topCategory ? (
            <>
              <p className="text-2xl font-bold">
                {topCategory.categoryName}
              </p>
              <p className="text-sm text-muted-foreground">
                ${topCategory.total.toFixed(2)} ({topCategory.percentage.toFixed(0)}%)
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold">--</p>
              <p className="text-sm text-muted-foreground">
                No expenses yet
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
