import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { AddExpenseDialog } from '@/components/expenses/AddExpenseDialog'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { SpendingTrendChart } from '@/components/dashboard/SpendingTrendChart'
import { LogOut, Bell, Search, LayoutDashboard, BarChart3, Clock, Settings, Menu, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <img src="/logo.png" alt="Pivoa" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold">Pivoa</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavItem icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" active />
          <NavItem icon={<BarChart3 className="h-5 w-5" />} label="Reports" />
          <NavItem icon={<Clock className="h-5 w-5" />} label="History" />
          <NavItem icon={<Settings className="h-5 w-5" />} label="Settings" />
        </nav>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-medium uppercase text-primary-foreground">
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-border bg-card transform transition-transform lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Pivoa" className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold">Pivoa</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <NavItem icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" active />
          <NavItem icon={<BarChart3 className="h-5 w-5" />} label="Reports" />
          <NavItem icon={<Clock className="h-5 w-5" />} label="History" />
          <NavItem icon={<Settings className="h-5 w-5" />} label="Settings" />
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-medium uppercase text-primary-foreground">
              {firstName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">{firstName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Mobile Menu Button */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <div className="hidden flex-1 max-w-md sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search expenses..." 
                  className="pl-9"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <AddExpenseDialog />
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
              Here's your financial overview for this month.
            </p>
          </div>

          {/* Summary Cards */}
          <section className="mb-8">
            <SummaryCards />
          </section>

          {/* Charts Row */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
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

// Navigation Item Component
function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a 
      href="#" 
      className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {icon}
      {label}
    </a>
  )
}
