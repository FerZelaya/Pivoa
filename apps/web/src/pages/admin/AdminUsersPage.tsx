import { useState } from 'react'
import { Link } from 'react-router'
import { useAdminUsers } from '@/hooks/useAdmin'
import { PageHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('')
  const [onboarding, setOnboarding] = useState('')
  const { data, isPending } = useAdminUsers({ search, plan, onboarding })

  return (
    <>
      <PageHeader eyebrow="Directory" title="Users" />
      <div className="flex flex-wrap gap-space-sm">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email or name" className="max-w-xs" />
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="bg-surface-container-low rounded-lg px-space-md py-2">
          <option value="">All plans</option>
          <option value="free">Free</option>
          <option value="plus">Plus</option>
          <option value="pro">Pro</option>
        </select>
        <select value={onboarding} onChange={(e) => setOnboarding(e.target.value)} className="bg-surface-container-low rounded-lg px-space-md py-2">
          <option value="">Onboarding</option>
          <option value="yes">Completed</option>
          <option value="no">Not finished</option>
        </select>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="font-label-caps text-label-caps uppercase text-outline">
              <th className="px-space-md py-space-sm">User</th>
              <th className="px-space-md py-space-sm">Plan</th>
              <th className="px-space-md py-space-sm">Status</th>
              <th className="px-space-md py-space-sm">Onboarding</th>
              <th className="px-space-md py-space-sm">Last sign-in</th>
            </tr>
          </thead>
          <tbody>
            {isPending && (
              <tr>
                <td className="px-space-md py-space-md font-body-sm text-body-sm text-outline" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {data?.data.map((user) => (
              <tr key={user.id} className="border-t border-surface-container-low">
                <td className="px-space-md py-space-sm">
                  <Link to={`/admin/users/${user.id}`} className="font-body-md text-body-md font-semibold text-primary-container">
                    {user.fullName || user.email}
                  </Link>
                  <p className="font-body-sm text-body-sm text-outline">{user.email}</p>
                </td>
                <td className="px-space-md py-space-sm capitalize font-body-sm text-body-sm">{user.plan}</td>
                <td className="px-space-md py-space-sm font-body-sm text-body-sm">{user.subscriptionStatus}</td>
                <td className="px-space-md py-space-sm font-body-sm text-body-sm">{user.onboardingCompleted ? 'Done' : 'Pending'}</td>
                <td className="px-space-md py-space-sm font-body-sm text-body-sm text-outline">
                  {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
