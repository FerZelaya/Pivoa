import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useCancelPlan, useCheckout } from '@/hooks/useBilling'
import { useMe } from '@/hooks/useMe'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export function PlanCard() {
  const { t } = useTranslation()
  const { data: me } = useMe()
  const checkout = useCheckout()
  const cancel = useCancelPlan()
  const canCancel =
    Boolean(me) &&
    !me?.complimentary &&
    (me?.subscriptionStatus === 'active' || me?.subscriptionStatus === 'trialing' || me?.subscriptionStatus === 'past_due')

  const planLabel = me ? t(`billing.${me.plan}`) : t('billing.plan')

  const start = (plan: 'plus' | 'pro', interval: 'month' | 'year') => {
    checkout.mutate(
      { plan, interval },
      { onError: (err) => toast.error(err instanceof Error ? err.message : t('billing.checkoutError')) }
    )
  }

  return (
    <section className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
      <div className="flex items-center gap-space-sm mb-space-md">
        <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
          <Icon name="workspace_premium" className="text-[22px]" />
        </div>
        <div>
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">{t('billing.planBilling')}</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{planLabel}</h2>
        </div>
      </div>
      {me && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          {me.subscriptionStatus !== 'none' && (
            <span>{t(`billing.status.${me.subscriptionStatus}`)}. </span>
          )}
          {me.complimentary && t('billing.complimentary') + ' '}
          {me.currentPeriodEnd && me.subscriptionStatus === 'canceled' &&
            t('billing.accessUntil', { date: new Date(me.currentPeriodEnd).toLocaleDateString() }) + ' '}
          {me.expenseLimit != null
            ? t('billing.expensesWithLimit', { used: me.expensesThisCycle, limit: me.expenseLimit }) + ' '
            : t('billing.expensesNoLimit', { used: me.expensesThisCycle }) + ' '}
          {me.receiptScanLimit > 0
            ? t('billing.scansUsed', { used: me.receiptScansUsed, limit: me.receiptScanLimit })
            : t('billing.scansUnlock')}
        </p>
      )}
      <div className="flex flex-wrap gap-space-sm">
        {me?.plan === 'free' && (
          <>
            <Button type="button" onClick={() => start('plus', 'month')} disabled={checkout.isPending}>
              {t('billing.plusPrice')}
            </Button>
            <Button type="button" variant="tonal" onClick={() => start('pro', 'month')} disabled={checkout.isPending}>
              {t('billing.proPrice')}
            </Button>
          </>
        )}
        {me?.plan === 'plus' && (
          <Button type="button" onClick={() => start('pro', 'month')} disabled={checkout.isPending}>
            {t('billing.upgradeToPro')}
          </Button>
        )}
        {canCancel && (
          <Button
            type="button"
            variant="ghost"
            disabled={cancel.isPending}
            onClick={() =>
              cancel.mutate(undefined, {
                onSuccess: () => toast.success(t('billing.cancelSuccess')),
                onError: (err) => toast.error(err instanceof Error ? err.message : t('billing.cancelError')),
              })
            }
          >
            {t('billing.cancelPlan')}
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={() => (window.location.href = '/pricing')}>
          {t('billing.comparePlans')}
        </Button>
      </div>
    </section>
  )
}
