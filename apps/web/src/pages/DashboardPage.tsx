import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { SpendingTrendChart } from '@/components/dashboard/SpendingTrendChart'
import { LogOut, Wallet } from 'lucide-react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pivoa</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Your financial overview at a glance.
            </p>
          </div>
          <AddExpenseDialog />
        </div>

        {/* Summary Cards */}
        <section className="mb-8">
          <SummaryCards />
        </section>

        {/* Charts */}
        <section className="grid gap-6 lg:grid-cols-2 mb-8">
          <CategoryPieChart />
          <SpendingTrendChart />
        </section>

        {/* Recent Expenses */}
        <section>
          <ExpenseList />
        </section>
      </main>
    </div>
  )
}
