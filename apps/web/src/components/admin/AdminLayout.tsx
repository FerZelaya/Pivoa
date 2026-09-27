import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/ui/logo'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/admin', label: 'Overview', icon: 'monitoring', end: true },
  { to: '/admin/users', label: 'Users', icon: 'group' },
  { to: '/admin/tickets', label: 'Tickets', icon: 'confirmation_number' },
]

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <aside className="fixed inset-y-0 left-0 w-60 bg-surface-container-lowest border-r border-surface-container hidden md:flex flex-col p-space-md">
        <Logo className="h-10" />
        <p className="font-label-caps text-label-caps uppercase text-outline mt-space-lg mb-space-sm">Admin</p>
        <nav className="flex flex-col gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-space-sm rounded-lg px-space-sm py-2 font-body-md text-body-md',
                  isActive ? 'bg-primary-fixed text-primary font-semibold' : 'text-on-surface-variant hover:bg-surface-container-low'
                )
              }
            >
              <Icon name={link.icon} className="text-[20px]" /> {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <button type="button" onClick={() => navigate('/overview')} className="flex items-center gap-space-sm px-space-sm py-2 font-body-sm text-body-sm text-on-surface-variant">
            <Icon name="arrow_back" className="text-[18px]" /> Back to app
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut()
              navigate('/login')
            }}
            className="flex items-center gap-space-sm px-space-sm py-2 font-body-sm text-body-sm text-tertiary-container"
          >
            <Icon name="logout" className="text-[18px]" /> Sign out
          </button>
        </div>
      </aside>
      <div className="md:pl-60">
        <div className="md:hidden flex items-center gap-space-sm p-space-md bg-surface-container-lowest">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="font-body-sm text-body-sm font-semibold text-primary-container">
              {link.label}
            </NavLink>
          ))}
        </div>
        <main className="p-space-lg flex flex-col gap-space-lg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
