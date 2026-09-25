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
      className="w-8 h-8 rounded-full flex items-center justify-center"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className="h-4 w-4" style={{ color }} />
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
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-4 bg-muted rounded w-16" />
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
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
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
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No expenses yet. Add your first expense to get started!
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <CategoryIcon 
                    icon={expense.category.icon} 
                    color={expense.category.color} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {expense.vendor || expense.category.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category.name} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {expense.currency} {expense.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense.id)}
                      disabled={deleteExpense.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
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
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
