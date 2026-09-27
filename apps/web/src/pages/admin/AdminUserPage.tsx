import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import type { PlanId } from '@pivoa/shared'
import {
  useAdminBan,
  useAdminCancelSubscription,
  useAdminConfirmEmail,
  useAdminGrantPlan,
  useAdminOnboarding,
  useAdminPasswordReset,
  useAdminUnban,
  useAdminUser,
} from '@/hooks/useAdmin'
import { PageHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/format'

export default function AdminUserPage() {
  const { id = '' } = useParams()
  const { data: user, isPending } = useAdminUser(id)
  const reset = useAdminPasswordReset(id)
  const confirm = useAdminConfirmEmail(id)
  const ban = useAdminBan(id)
  const unban = useAdminUnban(id)
  const onboarding = useAdminOnboarding(id)
  const grant = useAdminGrantPlan(id)
  const cancel = useAdminCancelSubscription(id)
  const [plan, setPlan] = useState<PlanId>('plus')

  const run = async (action: () => Promise<unknown>, ok: string) => {
    try {
      await action()
      toast.success(ok)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    }
  }

  if (isPending || !user) {
    return <p className="font-body-md text-body-md text-outline">{isPending ? 'Loading…' : 'User not found'}</p>
  }

  return (
    <>
      <PageHeader eyebrow="Support" title={user.fullName || user.email} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-xs font-body-sm text-body-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Account</h2>
          <p>{user.email}</p>
          <p>Created {new Date(user.createdAt).toLocaleString()}</p>
          <p>Last sign-in {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : '—'}</p>
          <p>Providers: {user.providers.join(', ') || 'email'}</p>
          <p>Email confirmed: {user.emailConfirmed ? 'yes' : 'no'}</p>
          <p>Banned until: {user.bannedUntil || 'not banned'}</p>
          <p>Onboarding: {user.onboardingCompleted ? 'complete' : 'incomplete'}</p>
        </section>
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-xs font-body-sm text-body-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Money & plan</h2>
          <p>
            {user.currency} · resets on day {user.cycleStartDay} · cap {formatMoney(user.monthlyIncomeCap, user.currency)}
          </p>
          <p>
            Plan {user.plan}
            {user.complimentary ? ' (complimentary)' : ''} · {user.subscriptionStatus}
          </p>
          <p>Period end: {user.currentPeriodEnd ? new Date(user.currentPeriodEnd).toLocaleString() : '—'}</p>
          <p>PayPal payer: {user.paypalPayerId || '—'}</p>
          <p>PayPal subscription: {user.paypalSubscriptionId || '—'}</p>
          <p>
            Usage: {user.expenseCount} expenses · {user.goalCount} goals · {user.budgetCount} budgets · {user.receiptScansUsed}/
            {user.receiptScanLimit} scans
          </p>
        </section>
      </div>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Support actions</h2>
        <div className="flex flex-wrap gap-space-sm">
          <Button type="button" variant="tonal" onClick={() => run(() => reset.mutateAsync(), 'Password reset email sent')}>
            Send password reset email
          </Button>
          <Button type="button" variant="tonal" onClick={() => run(() => confirm.mutateAsync(undefined), 'Email confirmed')}>
            Confirm email
          </Button>
          <Button type="button" variant="tonal" onClick={() => run(() => ban.mutateAsync(undefined), 'User disabled')}>
            Disable user
          </Button>
          <Button type="button" variant="tonal" onClick={() => run(() => unban.mutateAsync(undefined), 'User enabled')}>
            Enable user
          </Button>
          <Button
            type="button"
            variant="tonal"
            onClick={() => run(() => onboarding.mutateAsync({ completed: !user.onboardingCompleted }), 'Onboarding updated')}
          >
            {user.onboardingCompleted ? 'Mark onboarding incomplete' : 'Mark onboarding complete'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => run(() => cancel.mutateAsync(undefined), 'Renewal stopped. Access lasts until the paid period ends.')}>
            Cancel renewal
          </Button>
          <p className="font-body-sm text-body-sm text-on-surface-variant basis-full">
            Cancel stops future PayPal charges. Access lasts until the paid period ends.
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <select value={plan} onChange={(e) => setPlan(e.target.value as PlanId)} className="bg-surface-container-low rounded-lg px-space-md py-2">
            <option value="free">Free</option>
            <option value="plus">Plus complimentary</option>
            <option value="pro">Pro complimentary</option>
          </select>
          <Button type="button" onClick={() => run(() => grant.mutateAsync({ plan }), 'Plan updated')}>
            Grant plan
          </Button>
        </div>
      </section>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Recent tickets</h2>
        {user.recentTickets.length === 0 && <p className="font-body-sm text-body-sm text-outline">None</p>}
        <ul>
          {user.recentTickets.map((ticket) => (
            <li key={ticket.id}>
              <Link to={`/admin/tickets/${ticket.id}`} className="font-body-md text-body-md text-primary-container">
                {ticket.subject}
              </Link>
              <span className="font-body-sm text-body-sm text-outline"> · {ticket.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
