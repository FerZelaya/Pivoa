import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import type { CategoryBudgetWithSpent } from '@pivoa/shared'
import { Modal } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/select'
import { Icon } from '@/components/ui/icon'
import { useCategories } from '@/hooks/useCategories'
import { useBudgets, useCreateBudget, useDeleteBudget, useUpdateBudget } from '@/hooks/useBudgets'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/lib/format'

interface BudgetModalProps {
  open: boolean
  onClose: () => void
  budget?: CategoryBudgetWithSpent | null
}

export function BudgetModal({ open, onClose, budget }: BudgetModalProps) {
  const { data: categories = [] } = useCategories()
  const { data: budgets = [] } = useBudgets()
  const { data: settings } = useSettings()
  const createBudget = useCreateBudget()
  const updateBudget = useUpdateBudget()
  const deleteBudget = useDeleteBudget()

  const [categoryId, setCategoryId] = useState('')
  const [limit, setLimit] = useState('')

  useEffect(() => {
    if (!open) return
    setCategoryId(budget?.categoryId ?? '')
    setLimit(budget ? String(budget.monthlyLimit) : '')
  }, [open, budget])

  const available = useMemo(
    () => categories.filter((c) => c.id === budget?.categoryId || !budgets.some((b) => b.categoryId === c.id)),
    [categories, budgets, budget]
  )

  const allocated = budgets.filter((b) => b.id !== budget?.id).reduce((sum, b) => sum + b.monthlyLimit, 0)
  const cap = settings?.monthlyIncomeCap ?? 0
  const unallocated = cap - allocated - (parseFloat(limit) || 0)

  const pending = createBudget.isPending || updateBudget.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(limit)
    if (!value || value <= 0) return toast.error('Enter a monthly limit greater than zero')
    try {
      if (budget) {
        await updateBudget.mutateAsync({ id: budget.id, data: { monthlyLimit: value } })
        toast.success('Budget updated')
      } else {
        if (!categoryId) return toast.error('Choose a category')
        await createBudget.mutateAsync({ categoryId, monthlyLimit: value })
        toast.success('Category budget created')
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save budget')
    }
  }

  const handleDelete = async () => {
    if (!budget) return
    try {
      await deleteBudget.mutateAsync(budget.id)
      toast.success('Budget removed')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete budget')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="donut_small"
      eyebrow="Category allocation"
      title={budget ? `Adjust ${budget.category.name} Cap` : 'New Category Budget'}
      footer={
        <>
          {budget && (
            <Button type="button" variant="destructive-ghost" className="mr-auto" onClick={handleDelete} disabled={deleteBudget.isPending}>
              <Icon name="delete" className="text-[18px]" /> Remove
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="budget-form" disabled={pending}>
            {pending ? 'Saving…' : budget ? 'Save Cap' : 'Create Budget'}
          </Button>
        </>
      }
    >
      <form id="budget-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        {!budget && (
          <div>
            <Label htmlFor="budget-category">Category</Label>
            <NativeSelect id="budget-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>
                {available.length ? 'Select a category…' : 'All categories already have a budget'}
              </option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </div>
        )}
        <div>
          <Label htmlFor="budget-limit">Monthly limit</Label>
          <MoneyInput id="budget-limit" large placeholder="0.00" value={limit} onChange={(e) => setLimit(e.target.value)} autoFocus />
        </div>
        {cap > 0 && (
          <div className="flex items-center justify-between bg-surface-container-low p-space-md rounded-lg">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Unallocated of {formatCurrency(cap)} cap</span>
            <span className={`font-label-numeric-md text-label-numeric-md font-semibold ${unallocated < 0 ? 'text-tertiary-container' : 'text-secondary'}`}>
              {formatCurrency(unallocated)}
            </span>
          </div>
        )}
      </form>
    </Modal>
  )
}
