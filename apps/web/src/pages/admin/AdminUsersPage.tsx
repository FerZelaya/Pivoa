import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useAdminUsers } from '@/hooks/useAdmin'
import { PageHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [plan, setPlan] = useState('')
  const [onboarding, setOnboarding] = useState('')
  const { data, isPending } = useAdminUsers({ search, plan, onboarding })

  return (
    <>
      <PageHeader eyebrow={t('admin.users.eyebrow')} title={t('admin.users.title')} />
      <div className="flex flex-wrap gap-space-sm">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.users.searchPlaceholder')}
          className="max-w-xs"
        />
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="bg-surface-container-low rounded-lg px-space-md py-2">
          <option value="">{t('admin.users.allPlans')}</option>
          <option value="free">{t('admin.users.free')}</option>
          <option value="plus">{t('admin.users.plus')}</option>
          <option value="pro">{t('admin.users.pro')}</option>
        </select>
        <select
          value={onboarding}
          onChange={(e) => setOnboarding(e.target.value)}
          className="bg-surface-container-low rounded-lg px-space-md py-2"
        >
          <option value="">{t('admin.users.onboarding')}</option>
          <option value="yes">{t('admin.users.completed')}</option>
          <option value="no">{t('admin.users.notFinished')}</option>
        </select>
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="font-label-caps text-label-caps uppercase text-outline">
              <th className="px-space-md py-space-sm">{t('admin.users.colUser')}</th>
              <th className="px-space-md py-space-sm">{t('admin.users.colPlan')}</th>
              <th className="px-space-md py-space-sm">{t('admin.users.colStatus')}</th>
              <th className="px-space-md py-space-sm">{t('admin.users.colOnboarding')}</th>
              <th className="px-space-md py-space-sm">{t('admin.users.colLastSignIn')}</th>
            </tr>
          </thead>
          <tbody>
            {isPending && (
              <tr>
                <td className="px-space-md py-space-md font-body-sm text-body-sm text-outline" colSpan={5}>
                  {t('admin.users.loading')}
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
                <td className="px-space-md py-space-sm font-body-sm text-body-sm">
                  {user.onboardingCompleted ? t('admin.users.done') : t('admin.users.pending')}
                </td>
                <td className="px-space-md py-space-sm font-body-sm text-body-sm text-outline">
                  {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : t('common.emDash')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
