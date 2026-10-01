import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { CreditCardSummary } from '@pivoa/shared'
import { Modal } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, MoneyInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/select'
import { Icon } from '@/components/ui/icon'
import { formatDate, formatMoney } from '@/lib/format'
import {
  useCreateCardCharge,
  useCreateCreditCard,
  useCreditCards,
  useDeleteCreditCard,
  useRecordCardPayment,
} from '@/hooks/useCreditCards'

export function CreditCardsPanel() {
  const { t } = useTranslation()
  const { data: cards = [], isPending } = useCreditCards()
  const [editor, setEditor] = useState(false)
  const [paying, setPaying] = useState<CreditCardSummary | null>(null)
  const [charging, setCharging] = useState<CreditCardSummary | null>(null)

  return (
    <section data-tour="budgets-cards" className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
      <div className="flex items-start justify-between gap-space-md">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">{t('cards.title')}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{t('cards.subtitle')}</p>
        </div>
        <Button type="button" size="sm" onClick={() => setEditor(true)}>
          <Icon name="add" className="text-[18px]" /> {t('cards.add')}
        </Button>
      </div>
      {isPending && <div className="skeleton h-16" />}
      {!isPending && cards.length === 0 && <p className="font-body-sm text-body-sm text-outline">{t('cards.empty')}</p>}
      <ul className="flex flex-col gap-space-sm">
        {cards.map((card) => (
          <li key={card.id} className="rounded-lg bg-surface-container-low p-space-md flex flex-col sm:flex-row sm:items-center gap-space-md">
            <div className="flex-1 min-w-0">
              <p className="font-body-md text-body-md font-semibold text-on-surface">{card.name}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {t('cards.closes', { date: formatDate(card.nextClose) })} · {t('cards.due', { date: formatDate(card.nextDue) })}
                {card.rewardsType !== 'none' && ` · ${t('cards.rewards', { rate: card.rewardsRate, type: t(`cards.types.${card.rewardsType}`) })}`}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-label-caps text-label-caps uppercase text-outline">{t('cards.balance')}</p>
              <p className="font-label-numeric-md text-label-numeric-md text-on-surface">{formatMoney(card.balance, card.currency)}</p>
            </div>
            <div className="flex flex-wrap gap-space-xs">
              <Button type="button" size="sm" variant="tonal" onClick={() => setCharging(card)}>
                {t('cards.charge')}
              </Button>
              <Button type="button" size="sm" onClick={() => setPaying(card)} disabled={card.balance <= 0}>
                {t('cards.pay')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {editor && <CardEditor onClose={() => setEditor(false)} />}
      {paying && <PaymentModal card={paying} onClose={() => setPaying(null)} />}
      {charging && <ChargeModal card={charging} onClose={() => setCharging(null)} />}
    </section>
  )
}

function DaySelect({ id, value, onChange }: { id: string; value: number; onChange: (day: number) => void }) {
  const { t } = useTranslation()
  return (
    <NativeSelect id={id} value={String(value)} onChange={(e) => onChange(Number(e.target.value))}>
      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
        <option key={day} value={day}>
          {t('cards.day', { day })}
        </option>
      ))}
    </NativeSelect>
  )
}

function CardEditor({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const create = useCreateCreditCard()
  const [name, setName] = useState('')
  const [closeDay, setCloseDay] = useState(15)
  const [dueDay, setDueDay] = useState(5)
  const [rewardsType, setRewardsType] = useState<'none' | 'cashback' | 'miles' | 'points'>('none')
  const [rewardsRate, setRewardsRate] = useState('1')
  const [rewardsLabel, setRewardsLabel] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await create.mutateAsync({
        name: name.trim(),
        statementCloseDay: closeDay,
        paymentDueDay: dueDay,
        rewardsType,
        rewardsRate: rewardsType === 'none' ? 0 : parseFloat(rewardsRate) || 0,
        rewardsLabel: rewardsLabel.trim() || undefined,
      })
      toast.success(t('cards.saved'))
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('cards.error'))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      icon="credit_card"
      title={t('cards.add')}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" form="card-form" disabled={create.isPending || !name.trim()}>
            {create.isPending ? t('cards.saving') : t('cards.save')}
          </Button>
        </>
      }
    >
      <form id="card-form" onSubmit={save} className="flex flex-col gap-space-md">
        <div>
          <Label htmlFor="card-name">{t('cards.name')}</Label>
          <Input id="card-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <div>
            <Label htmlFor="close-day">{t('cards.closeDay')}</Label>
            <DaySelect id="close-day" value={closeDay} onChange={setCloseDay} />
          </div>
          <div>
            <Label htmlFor="due-day">{t('cards.dueDay')}</Label>
            <DaySelect id="due-day" value={dueDay} onChange={setDueDay} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <div>
            <Label htmlFor="rewards-type">{t('cards.rewardsType')}</Label>
            <NativeSelect id="rewards-type" value={rewardsType} onChange={(e) => setRewardsType(e.target.value as typeof rewardsType)}>
              <option value="none">{t('cards.types.none')}</option>
              <option value="cashback">{t('cards.types.cashback')}</option>
              <option value="miles">{t('cards.types.miles')}</option>
              <option value="points">{t('cards.types.points')}</option>
            </NativeSelect>
          </div>
          <div>
            <Label htmlFor="rewards-rate">{t('cards.rewardsRate')}</Label>
            <Input id="rewards-rate" type="number" min="0" step="0.1" value={rewardsRate} onChange={(e) => setRewardsRate(e.target.value)} disabled={rewardsType === 'none'} />
          </div>
        </div>
        {rewardsType !== 'none' && (
          <div>
            <Label htmlFor="rewards-label">{t('cards.rewardsLabel')}</Label>
            <Input id="rewards-label" value={rewardsLabel} onChange={(e) => setRewardsLabel(e.target.value)} />
          </div>
        )}
      </form>
    </Modal>
  )
}

function PaymentModal({ card, onClose }: { card: CreditCardSummary; onClose: () => void }) {
  const { t } = useTranslation()
  const pay = useRecordCardPayment()
  const remove = useDeleteCreditCard()
  const [amount, setAmount] = useState(String(card.balance))
  const [paidAt, setPaidAt] = useState(card.nextDue.slice(0, 10))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await pay.mutateAsync({ id: card.id, data: { amount: parseFloat(amount), paidAt } })
      toast.success(t('cards.paid', { date: formatDate(paidAt) }))
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('cards.error'))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      icon="payments"
      title={t('cards.pay')}
      description={card.name}
      footer={
        <>
          <Button
            type="button"
            variant="destructive-ghost"
            className="mr-auto"
            disabled={remove.isPending}
            onClick={async () => {
              await remove.mutateAsync(card.id)
              toast.success(t('cards.removed'))
              onClose()
            }}
          >
            {t('cards.delete')}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" form="pay-form" disabled={pay.isPending}>{t('cards.paySubmit')}</Button>
        </>
      }
    >
      <form id="pay-form" onSubmit={submit} className="flex flex-col gap-space-md">
        <div>
          <Label htmlFor="pay-amount">{t('cards.amount')}</Label>
          <MoneyInput id="pay-amount" currency={card.currency} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="paid-at">{t('cards.paidOn')}</Label>
          <Input id="paid-at" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required />
          <p className="font-body-sm text-body-sm text-outline mt-1">{t('cards.paidOnHint')}</p>
        </div>
      </form>
    </Modal>
  )
}

function ChargeModal({ card, onClose }: { card: CreditCardSummary; onClose: () => void }) {
  const { t } = useTranslation()
  const charge = useCreateCardCharge()
  const [amount, setAmount] = useState('')
  const [vendor, setVendor] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await charge.mutateAsync({
        id: card.id,
        data: { amount: parseFloat(amount), vendor: vendor.trim() || undefined, date, currency: card.currency },
      })
      toast.success(t('cards.charged'))
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('cards.error'))
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      icon="add_card"
      title={t('cards.charge')}
      description={card.name}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" form="charge-form" disabled={charge.isPending}>{t('cards.chargeSubmit')}</Button>
        </>
      }
    >
      <form id="charge-form" onSubmit={submit} className="flex flex-col gap-space-md">
        <div>
          <Label htmlFor="charge-amount">{t('cards.amount')}</Label>
          <MoneyInput id="charge-amount" currency={card.currency} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        </div>
        <div>
          <Label htmlFor="charge-vendor">{t('modals.expense.merchant')}</Label>
          <Input id="charge-vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="charge-date">{t('modals.expense.date')}</Label>
          <Input id="charge-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </form>
    </Modal>
  )
}
