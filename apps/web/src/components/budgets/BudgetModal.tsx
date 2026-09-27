import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
    if (!value || value <= 0) return toast.error(t('modals.budget.limitError'))
    try {
      if (budget) {
        await updateBudget.mutateAsync({ id: budget.id, data: { monthlyLimit: value } })
        toast.success(t('modals.budget.updated'))
      } else {
        if (!categoryId) return toast.error(t('modals.budget.categoryError'))
        await createBudget.mutateAsync({ categoryId, monthlyLimit: value })
        toast.success(t('modals.budget.created'))
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('modals.budget.saveError'))
    }
  }

  const handleDelete = async () => {
    if (!budget) return
    try {
      await deleteBudget.mutateAsync(budget.id)
      toast.success(t('modals.budget.removed'))
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('modals.budget.deleteError'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon="donut_small"
      eyebrow={t('modals.budget.eyebrow')}
      title={budget ? t('modals.budget.editTitle', { name: budget.category.name }) : t('modals.budget.newTitle')}
      footer={
        <>
          {budget && (
            <Button type="button" variant="destructive-ghost" className="mr-auto" onClick={handleDelete} disabled={deleteBudget.isPending}>
              <Icon name="delete" className="text-[18px]" /> {t('modals.budget.remove')}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('modals.budget.cancel')}
          </Button>
          <Button type="submit" form="budget-form" disabled={pending}>
            {pending ? t('modals.budget.saving') : budget ? t('modals.budget.saveCap') : t('modals.budget.create')}
          </Button>
        </>
      }
    >
      <form id="budget-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md">
        {!budget && (
          <div>
            <Label htmlFor="budget-category">{t('modals.budget.category')}</Label>
            <NativeSelect id="budget-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>
                {available.length ? t('modals.budget.selectCategory') : t('modals.budget.allHaveBudget')}
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
          <Label htmlFor="budget-limit">{t('modals.budget.monthlyLimit')}</Label>
          <MoneyInput
            id="budget-limit"
            large
            placeholder={t('modals.budget.limitPlaceholder')}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            autoFocus
          />
        </div>
        {cap > 0 && (
          <div className="flex items-center justify-between bg-surface-container-low p-space-md rounded-lg">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              {t('modals.budget.unallocatedOf', { amount: formatCurrency(cap) })}
            </span>
            <span className={`font-label-numeric-md text-label-numeric-md font-semibold ${unallocated < 0 ? 'text-tertiary-container' : 'text-secondary'}`}>
              {formatCurrency(unallocated)}
            </span>
          </div>
        )}
      </form>
    </Modal>
  )
}
