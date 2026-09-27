import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { SavingsGoalWithProgress } from '@pivoa/shared'
import { Modal } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, MoneyInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/ui/icon'
import { useCreateGoal, useDeleteGoal, useDepositToGoal, useUpdateGoal } from '@/hooks/useGoals'
import { GOAL_ICONS, categoryIcon } from '@/lib/categories'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'

const ICON_I18N_KEY: Record<string, string> = {
  savings: 'savings',
  shield: 'emergency',
  flight_takeoff: 'travel',
  home: 'home',
  directions_car: 'vehicle',
  school: 'education',
  laptop_mac: 'tech',
  redeem: 'gift',
}

interface GoalModalProps {
  open: boolean
  onClose: () => void
  goal?: SavingsGoalWithProgress | null
}

export function GoalModal({ open, onClose, goal }: GoalModalProps) {
  const { t } = useTranslation()
  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()

  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState('savings')

  useEffect(() => {
    if (!open) return
    setName(goal?.name ?? '')
    setTarget(goal ? String(goal.targetAmount) : '')
    setCurrent(goal ? String(goal.currentAmount) : '')
    setTargetDate(goal?.targetDate?.slice(0, 10) ?? '')
    setIcon(goal ? categoryIcon(goal.icon) : 'savings')
  }, [open, goal])

  const pending = createGoal.isPending || updateGoal.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetAmount = parseFloat(target)
    if (!name.trim()) return toast.error(t('modals.goal.nameError'))
    if (!targetAmount || targetAmount <= 0) return toast.error(t('modals.goal.targetError'))
    const currentAmount = parseFloat(current) || 0
    try {
      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          data: { name: name.trim(), targetAmount, currentAmount, targetDate: targetDate || null, icon },
        })
        toast.success(t('modals.goal.updated'))
      } else {
        await createGoal.mutateAsync({
          name: name.trim(),
          targetAmount,
          currentAmount,
          targetDate: targetDate || undefined,
          icon,
        })
        toast.success(t('modals.goal.created'))
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('modals.goal.saveError'))
    }
  }

  const handleDelete = async () => {
    if (!goal) return
    try {
      await deleteGoal.mutateAsync(goal.id)
      toast.success(t('modals.goal.deleted'))
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('modals.goal.deleteError'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="flag"
      eyebrow={t('modals.goal.eyebrow')}
      title={goal ? t('modals.goal.editTitle') : t('modals.goal.addTitle')}
      footer={
        <>
          {goal && (
            <Button type="button" variant="destructive-ghost" className="mr-auto" onClick={handleDelete} disabled={deleteGoal.isPending}>
              <Icon name="delete" className="text-[18px]" /> {t('modals.goal.delete')}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('modals.goal.cancel')}
          </Button>
          <Button type="submit" form="goal-form" disabled={pending}>
            {pending ? t('modals.goal.saving') : goal ? t('modals.goal.saveGoal') : t('modals.goal.createGoal')}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div>
          <Label htmlFor="goal-name">{t('modals.goal.name')}</Label>
          <Input
            id="goal-name"
            placeholder={t('modals.goal.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div>
          <Label>{t('modals.goal.icon')}</Label>
          <div className="grid grid-cols-8 gap-space-xs">
            {GOAL_ICONS.map((option) => (
              <button
                key={option.value}
                type="button"
                title={t(`modals.goal.icons.${ICON_I18N_KEY[option.value] ?? option.value}`)}
                onClick={() => setIcon(option.value)}
                className={cn(
                  'h-10 rounded-lg flex items-center justify-center transition-colors',
                  icon === option.value
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                )}
              >
                <Icon name={option.value} className="text-[20px]" />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-space-md">
          <div>
            <Label htmlFor="goal-target">{t('modals.goal.targetAmount')}</Label>
            <MoneyInput
              id="goal-target"
              placeholder={t('modals.goal.amountPlaceholder')}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="goal-current">{t('modals.goal.savedSoFar')}</Label>
            <MoneyInput
              id="goal-current"
              placeholder={t('modals.goal.amountPlaceholder')}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="goal-date">{t('modals.goal.targetDate')}</Label>
          <Input id="goal-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
      </form>
    </Modal>
  )
}

interface DepositModalProps {
  open: boolean
  onClose: () => void
  goal: SavingsGoalWithProgress | null
}

export function DepositModal({ open, onClose, goal }: DepositModalProps) {
  const { t } = useTranslation()
  const deposit = useDepositToGoal()
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (open) setAmount('')
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!goal || !value || value <= 0) return toast.error(t('modals.deposit.amountError'))
    try {
      await deposit.mutateAsync({ id: goal.id, amount: value })
      toast.success(t('modals.deposit.added', { amount: formatCurrency(value), name: goal.name }))
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('modals.deposit.addError'))
    }
  }

  const quick = [25, 50, 100, 250]

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="bolt"
      eyebrow={t('modals.deposit.eyebrow')}
      title={goal ? t('modals.deposit.title', { name: goal.name }) : t('modals.deposit.titleFallback')}
      description={
        goal
          ? t('modals.deposit.description', {
              remaining: formatCurrency(goal.remaining),
              target: formatCurrency(goal.targetAmount),
            })
          : undefined
      }
      className="max-w-md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('modals.deposit.cancel')}
          </Button>
          <Button type="submit" form="deposit-form" variant="success" disabled={deposit.isPending}>
            {deposit.isPending ? t('modals.deposit.adding') : t('modals.deposit.addFunds')}
          </Button>
        </>
      }
    >
      <form id="deposit-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <MoneyInput
          large
          placeholder={t('modals.deposit.amountPlaceholder')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <div className="grid grid-cols-4 gap-space-xs">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="py-1.5 rounded-lg bg-secondary-container/30 text-on-secondary-container font-label-numeric-sm text-label-numeric-sm hover:bg-secondary-container/50 transition-colors"
            >
              {t('modals.deposit.quickAmount', { amount: q })}
            </button>
          ))}
        </div>
      </form>
    </Modal>
  )
}
