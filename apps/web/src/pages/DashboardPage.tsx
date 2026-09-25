import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { LogOut, Wallet, TrendingUp, Receipt, PieChart } from 'lucide-react'
import { useExpenses } from '@/hooks/useExpenses'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { data: expensesData } = useExpenses({ pageSize: 100 })

  // Calculate basic stats from expenses
  const expenses = expensesData?.data || []
  const thisMonth = new Date()
  const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
  
  const monthlyExpenses = expenses.filter((e) => new Date(e.date) >= startOfMonth)
  const totalMonthlySpend = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)
  const transactionCount = monthlyExpenses.length

  // Find top category
  const categorySpending = monthlyExpenses.reduce((acc, expense) => {
    const catName = expense.category.name
    acc[catName] = (acc[catName] || 0) + expense.amount
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pivoa</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your finances.
            </p>
          </div>
          <AddExpenseDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Total Spending
              </CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ${totalMonthlySpend.toFixed(2)}
              </p>
              {transactionCount > 0 ? (
                <p className="text-sm text-muted-foreground mt-1">
                  From {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  No expenses recorded yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Transactions
              </CardTitle>
              <CardDescription>This month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{transactionCount}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {transactionCount === 0 
                  ? 'Start by adding your first expense' 
                  : `Average: $${(totalMonthlySpend / transactionCount).toFixed(2)}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Top Category
              </CardTitle>
              <CardDescription>By spending</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {topCategory ? topCategory[0] : '--'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {topCategory 
                  ? `$${topCategory[1].toFixed(2)} spent` 
                  : 'Categories will appear here'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Expense List */}
        <ExpenseList />
      </main>
    </div>
  )
}
