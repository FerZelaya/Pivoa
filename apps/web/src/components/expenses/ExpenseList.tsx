import { useState } from 'react'
import { toast } from 'sonner'
import { useExpenses, useDeleteExpense } from '@/hooks/useExpenses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Trash2, 
  Edit,
  Utensils,
  Car,
  Zap,
  Tv,
  HeartPulse,
  ShoppingBag,
  Home,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { ExpenseWithCategory } from '@pivoa/shared'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  utensils: Utensils,
  car: Car,
  zap: Zap,
  tv: Tv,
  'heart-pulse': HeartPulse,
  'shopping-bag': ShoppingBag,
  home: Home,
  'more-horizontal': MoreHorizontal,
}

function CategoryIcon({ icon, color }: { icon: string; color: string }) {
  const Icon = iconMap[icon] || MoreHorizontal
  return (
    <div 
      className="flex h-10 w-10 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${color}12` }}
    >
      <Icon className="h-5 w-5" style={{ color }} />
    </div>
  )
}

interface ExpenseListProps {
  onEdit?: (expense: ExpenseWithCategory) => void
}

export function ExpenseList({ onEdit }: ExpenseListProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useExpenses({ page, pageSize: 10 })
  const deleteExpense = useDeleteExpense()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return
    
    try {
      await deleteExpense.mutateAsync(id)
      toast.success('Expense deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete expense')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg bg-muted/30 p-3 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load expenses</p>
        </CardContent>
      </Card>
    )
  }

  const expenses = data?.data || []
  const totalPages = data?.totalPages || 1

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium">No expenses yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first expense to get started
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="mb-2 hidden grid-cols-[1fr_1fr_100px_100px_80px] gap-4 px-3 text-xs font-medium text-muted-foreground sm:grid">
              <span>Description</span>
              <span>Category</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
              <span></span>
            </div>

            {/* Expense Rows */}
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 sm:grid-cols-[1fr_1fr_100px_100px_80px] sm:gap-4"
                >
                  {/* Icon + Description */}
                  <CategoryIcon icon={expense.category.icon} color={expense.category.color} />
                  <div className="min-w-0 sm:contents">
                    <div className="sm:col-span-1">
                      <p className="truncate font-medium">
                        {expense.vendor || expense.category.name}
                      </p>
                      <p className="text-sm text-muted-foreground sm:hidden">
                        {expense.category.name} • {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    
                    {/* Category - Desktop */}
                    <div className="hidden sm:block">
                      <span 
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ 
                          backgroundColor: `${expense.category.color}12`,
                          color: expense.category.color 
                        }}
                      >
                        {expense.category.name}
                      </span>
                    </div>

                    {/* Date - Desktop */}
                    <div className="hidden text-sm text-muted-foreground sm:block">
                      {new Date(expense.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold">
                        ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {expense.currency}
                      </p>
                    </div>
                    
                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(expense)}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleteExpense.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
