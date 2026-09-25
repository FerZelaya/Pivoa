import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { SpendingTrendChart } from '@/components/dashboard/SpendingTrendChart'
import { LogOut, Bell, Search, LayoutDashboard, BarChart3, Clock, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <img src="/logo.png" alt="Pivoa" className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold text-primary">Pivoa</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <a href="#" className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <BarChart3 className="h-5 w-5" />
            Reports
          </a>
          <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <Clock className="h-5 w-5" />
            History
          </a>
          <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <Settings className="h-5 w-5" />
            Settings
          </a>
        </nav>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 font-medium uppercase text-primary">
              {firstName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{firstName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-9 w-9">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Mobile Logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <img src="/logo.png" alt="Pivoa" className="h-9 w-9 object-contain" />
              <span className="font-bold text-primary">Pivoa</span>
            </div>

            {/* Search */}
            <div className="hidden flex-1 max-w-md sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search expenses..." 
                  className="pl-9 bg-background"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <AddExpenseDialog />
              <Button variant="ghost" size="icon" onClick={signOut} className="lg:hidden">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {greeting()}, {firstName}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Track. Understand. Grow. — Here's your financial overview.
            </p>
          </div>

          {/* Summary Cards */}
          <section className="mb-8">
            <SummaryCards />
          </section>

          {/* Charts Row */}
          <section className="mb-8 grid gap-5 lg:grid-cols-2">
            <CategoryPieChart />
            <SpendingTrendChart />
          </section>

          {/* Expense List */}
          <section>
            <ExpenseList />
          </section>
        </main>
      </div>
    </div>
  )
}
