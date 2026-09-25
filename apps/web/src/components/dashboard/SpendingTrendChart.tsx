import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSpendingTrend } from '@/hooks/useAnalytics'

export function SpendingTrendChart() {
  const [granularity, setGranularity] = useState<'day' | 'week'>('day')
  const { data, isLoading, error } = useSpendingTrend(granularity, 30)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[280px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load data</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = (data || []).map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    total: item.total,
  }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Spending Trend</CardTitle>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            variant={granularity === 'day' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 rounded-md px-3 text-xs"
            onClick={() => setGranularity('day')}
          >
            Daily
          </Button>
          <Button
            variant={granularity === 'week' ? 'default' : 'ghost'}
            size="sm"
            className="h-7 rounded-md px-3 text-xs"
            onClick={() => setGranularity('week')}
          >
            Weekly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground">
            <div className="mb-4 flex gap-2">
              {[40, 60, 80, 55, 70, 45, 65].map((h, i) => (
                <div key={i} className="w-6 rounded-t-md bg-muted" style={{ height: h }} />
              ))}
            </div>
            <p className="text-sm">No spending data yet</p>
          </div>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e5e5" 
                  vertical={false}
                />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 12 }}
                  dy={8}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#737373', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                  dx={-8}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spent']}
                  cursor={{ fill: 'rgba(23, 23, 23, 0.04)' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px',
                  }}
                />
                <Bar 
                  dataKey="total" 
                  fill="#171717"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
