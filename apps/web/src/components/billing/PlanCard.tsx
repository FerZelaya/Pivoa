import { toast } from 'sonner'
import { useCancelPlan, useCheckout } from '@/hooks/useBilling'
import { useMe } from '@/hooks/useMe'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const LABELS = { free: 'Free', plus: 'Plus', pro: 'Pro' } as const

export function PlanCard() {
  const { data: me } = useMe()
  const checkout = useCheckout()
  const cancel = useCancelPlan()
  const canCancel =
    Boolean(me) &&
    !me?.complimentary &&
    (me?.subscriptionStatus === 'active' || me?.subscriptionStatus === 'trialing' || me?.subscriptionStatus === 'past_due')

  const start = (plan: 'plus' | 'pro', interval: 'month' | 'year') => {
    checkout.mutate(
      { plan, interval },
      { onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not start checkout') }
    )
  }

  return (
    <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
      <div className="flex items-center gap-space-sm mb-space-md">
        <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
          <Icon name="workspace_premium" className="text-[22px]" />
        </div>
        <div>
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Plan & billing</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{me ? LABELS[me.plan] : 'Plan'}</h2>
        </div>
      </div>
      {me && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          {me.subscriptionStatus !== 'none' && <span className="capitalize">{me.subscriptionStatus.replace('_', ' ')}. </span>}
          {me.complimentary && 'Complimentary access. '}
          {me.currentPeriodEnd && me.subscriptionStatus === 'canceled' && `Access until ${new Date(me.currentPeriodEnd).toLocaleDateString()}. `}
          {me.expenseLimit != null
            ? `${me.expensesThisCycle} of ${me.expenseLimit} expenses this cycle. `
            : `${me.expensesThisCycle} expenses this cycle. `}
          {me.receiptScanLimit > 0
            ? `${me.receiptScansUsed} of ${me.receiptScanLimit} receipt scans used.`
            : 'Receipt scans unlock on Plus.'}
        </p>
      )}
      <div className="flex flex-wrap gap-space-sm">
        {me?.plan === 'free' && (
          <>
            <Button type="button" onClick={() => start('plus', 'month')} disabled={checkout.isPending}>
              Plus · $7/mo
            </Button>
            <Button type="button" variant="tonal" onClick={() => start('pro', 'month')} disabled={checkout.isPending}>
              Pro · $14/mo
            </Button>
          </>
        )}
        {me?.plan === 'plus' && (
          <Button type="button" onClick={() => start('pro', 'month')} disabled={checkout.isPending}>
            Upgrade to Pro
          </Button>
        )}
        {canCancel && (
          <Button
            type="button"
            variant="ghost"
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(undefined, {
                onSuccess: () => toast.success('Renewal stopped. Access lasts until the paid period ends.'),
                onError: (err) => toast.error(err instanceof Error ? err.message : 'Could not cancel'),
              })
            }
          >
            Cancel plan
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => (window.location.href = '/pricing')}>
          Compare plans
        </Button>
      </div>
    </section>
  )
}
