import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { SpendingTrendChart } from '@/components/dashboard/SpendingTrendChart'
import { LogOut, Wallet, Bell, Search } from 'lucide-react'
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
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">Pivoa</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <a href="#" className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Reports
          </a>
          <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </a>
          <a href="#" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </a>
        </nav>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted font-medium uppercase">
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">Pivoa</span>
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
              Here's an overview of your finances this month.
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
