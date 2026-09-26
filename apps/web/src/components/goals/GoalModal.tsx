import { useEffect, useState } from 'react'
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

interface GoalModalProps {
  open: boolean
  onClose: () => void
  goal?: SavingsGoalWithProgress | null
}

export function GoalModal({ open, onClose, goal }: GoalModalProps) {
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
    if (!name.trim()) return toast.error('Give your goal a name')
    if (!targetAmount || targetAmount <= 0) return toast.error('Enter a target amount')
    const currentAmount = parseFloat(current) || 0
    try {
      if (goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          data: { name: name.trim(), targetAmount, currentAmount, targetDate: targetDate || null, icon },
        })
        toast.success('Goal updated')
      } else {
        await createGoal.mutateAsync({
          name: name.trim(),
          targetAmount,
          currentAmount,
          targetDate: targetDate || undefined,
          icon,
        })
        toast.success('Savings goal created')
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save goal')
    }
  }

  const handleDelete = async () => {
    if (!goal) return
    try {
      await deleteGoal.mutateAsync(goal.id)
      toast.success('Goal deleted')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete goal')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="flag"
      eyebrow="Capital accumulation"
      title={goal ? 'Edit Savings Goal' : 'Add Savings Goal'}
      footer={
        <>
          {goal && (
            <Button type="button" variant="destructive-ghost" className="mr-auto" onClick={handleDelete} disabled={deleteGoal.isPending}>
              <Icon name="delete" className="text-[18px]" /> Delete
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="goal-form" disabled={pending}>
            {pending ? 'Saving…' : goal ? 'Save Goal' : 'Create Goal'}
          </Button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <div>
          <Label htmlFor="goal-name">Goal name</Label>
          <Input id="goal-name" placeholder="e.g. Emergency Reserve" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label>Icon</Label>
          <div className="grid grid-cols-8 gap-space-xs">
            {GOAL_ICONS.map((option) => (
              <button
                key={option.value}
                type="button"
                title={option.label}
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
            <Label htmlFor="goal-target">Target amount</Label>
            <MoneyInput id="goal-target" placeholder="0.00" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="goal-current">Saved so far</Label>
            <MoneyInput id="goal-current" placeholder="0.00" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="goal-date">Target date (optional)</Label>
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
  const deposit = useDepositToGoal()
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (open) setAmount('')
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!goal || !value || value <= 0) return toast.error('Enter an amount greater than zero')
    try {
      await deposit.mutateAsync({ id: goal.id, amount: value })
      toast.success(`${formatCurrency(value)} added to ${goal.name}`)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not add funds')
    }
  }

  const quick = [25, 50, 100, 250]

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="bolt"
      eyebrow="Quick boost"
      title={goal ? `Fund ${goal.name}` : 'Fund goal'}
      description={goal ? `${formatCurrency(goal.remaining)} still needed to reach ${formatCurrency(goal.targetAmount)}` : undefined}
      className="max-w-md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="deposit-form" variant="success" disabled={deposit.isPending}>
            {deposit.isPending ? 'Adding…' : 'Add Funds'}
          </Button>
        </>
      }
    >
      <form id="deposit-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        <MoneyInput large placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
        <div className="grid grid-cols-4 gap-space-xs">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="py-1.5 rounded-lg bg-secondary-container/30 text-on-secondary-container font-label-numeric-sm text-label-numeric-sm hover:bg-secondary-container/50 transition-colors"
            >
              +${q}
            </button>
          ))}
        </div>
      </form>
    </Modal>
  )
}
