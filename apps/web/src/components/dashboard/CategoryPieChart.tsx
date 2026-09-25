import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCategorySpending } from '@/hooks/useAnalytics'

export function CategoryPieChart() {
  const { data, isLoading, error } = useCategorySpending()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
            <div className="mb-4 h-32 w-32 rounded-full border-[12px] border-muted" />
            <p className="text-sm">No spending data yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalSpent = data.reduce((sum, item) => sum + item.total, 0)

  const chartData = data.slice(0, 6).map((item) => ({
    name: item.categoryName,
    value: item.total,
    color: item.categoryColor,
    percentage: item.percentage,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Donut Chart with Center Label */}
          <div className="relative h-[200px] w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">${totalSpent.toFixed(0)}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 grid w-full grid-cols-2 gap-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <div 
                  className="h-3 w-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="truncate text-sm text-muted-foreground">{item.name}</span>
                <span className="ml-auto text-sm font-medium">{item.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
