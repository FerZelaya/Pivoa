import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      toast.error(err instanceof Error ? err.message : t('admin.user.toasts.actionFailed'))
    }
  }

  if (isPending || !user) {
    return (
      <p className="font-body-md text-body-md text-outline">
        {isPending ? t('admin.user.loading') : t('admin.user.notFound')}
      </p>
    )
  }

  return (
    <>
      <PageHeader eyebrow={t('admin.user.eyebrow')} title={user.fullName || user.email} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-xs font-body-sm text-body-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">{t('admin.user.account')}</h2>
          <p>{user.email}</p>
          <p>{t('admin.user.created', { date: new Date(user.createdAt).toLocaleString() })}</p>
          <p>
            {t('admin.user.lastSignIn', {
              date: user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : t('common.emDash'),
            })}
          </p>
          <p>
            {t('admin.user.providers', {
              providers: user.providers.join(', ') || t('admin.user.emailProvider'),
            })}
          </p>
          <p>
            {t('admin.user.emailConfirmed', {
              value: user.emailConfirmed ? t('common.yes') : t('common.no'),
            })}
          </p>
          <p>
            {t('admin.user.bannedUntil', {
              value: user.bannedUntil || t('admin.user.notBanned'),
            })}
          </p>
          <p>
            {t('admin.user.onboarding', {
              value: user.onboardingCompleted ? t('admin.user.complete') : t('admin.user.incomplete'),
            })}
          </p>
        </section>
        <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-xs font-body-sm text-body-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">{t('admin.user.moneyPlan')}</h2>
          <p>
            {t('admin.user.moneyMeta', {
              currency: user.currency,
              day: user.cycleStartDay,
              cap: formatMoney(user.monthlyIncomeCap, user.currency),
            })}
          </p>
          <p>
            {t('admin.user.planLine', {
              plan: user.plan,
              complimentary: user.complimentary ? t('admin.user.complimentary') : '',
              status: user.subscriptionStatus,
            })}
          </p>
          <p>
            {t('admin.user.periodEnd', {
              date: user.currentPeriodEnd ? new Date(user.currentPeriodEnd).toLocaleString() : t('common.emDash'),
            })}
          </p>
          <p>{t('admin.user.paypalPayer', { id: user.paypalPayerId || t('common.emDash') })}</p>
          <p>{t('admin.user.paypalSubscription', { id: user.paypalSubscriptionId || t('common.emDash') })}</p>
          <p>
            {t('admin.user.usage', {
              expenses: user.expenseCount,
              goals: user.goalCount,
              budgets: user.budgetCount,
              scansUsed: user.receiptScansUsed,
              scansLimit: user.receiptScanLimit,
            })}
          </p>
        </section>
      </div>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('admin.user.supportActions')}</h2>
        <div className="flex flex-wrap gap-space-sm">
          <Button
            type="button"
            variant="tonal"
            onClick={() => run(() => reset.mutateAsync(), t('admin.user.toasts.passwordResetSent'))}
          >
            {t('admin.user.sendPasswordReset')}
          </Button>
          <Button
            type="button"
            variant="tonal"
            onClick={() => run(() => confirm.mutateAsync(undefined), t('admin.user.toasts.emailConfirmed'))}
          >
            {t('admin.user.confirmEmail')}
          </Button>
          <Button
            type="button"
            variant="tonal"
            onClick={() => run(() => ban.mutateAsync(undefined), t('admin.user.toasts.userDisabled'))}
          >
            {t('admin.user.disableUser')}
          </Button>
          <Button
            type="button"
            variant="tonal"
            onClick={() => run(() => unban.mutateAsync(undefined), t('admin.user.toasts.userEnabled'))}
          >
            {t('admin.user.enableUser')}
          </Button>
          <Button
            type="button"
            variant="tonal"
            onClick={() =>
              run(() => onboarding.mutateAsync({ completed: !user.onboardingCompleted }), t('admin.user.toasts.onboardingUpdated'))
            }
          >
            {user.onboardingCompleted ? t('admin.user.markOnboardingIncomplete') : t('admin.user.markOnboardingComplete')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => run(() => cancel.mutateAsync(undefined), t('admin.user.toasts.renewalStopped'))}
          >
            {t('admin.user.cancelRenewal')}
          </Button>
          <p className="font-body-sm text-body-sm text-on-surface-variant basis-full">{t('admin.user.cancelHint')}</p>
        </div>
        <div className="flex items-center gap-space-sm">
          <select value={plan} onChange={(e) => setPlan(e.target.value as PlanId)} className="bg-surface-container-low rounded-lg px-space-md py-2">
            <option value="free">{t('admin.user.free')}</option>
            <option value="plus">{t('admin.user.plusComplimentary')}</option>
            <option value="pro">{t('admin.user.proComplimentary')}</option>
          </select>
          <Button type="button" onClick={() => run(() => grant.mutateAsync({ plan }), t('admin.user.toasts.planUpdated'))}>
            {t('admin.user.grantPlan')}
          </Button>
        </div>
      </section>
      <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">{t('admin.user.recentTickets')}</h2>
        {user.recentTickets.length === 0 && (
          <p className="font-body-sm text-body-sm text-outline">{t('admin.user.none')}</p>
        )}
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
