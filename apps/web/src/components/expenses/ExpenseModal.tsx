import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import type { ExpenseWithCategory } from '@pivoa/shared'
import { Modal } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, MoneyInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Icon } from '@/components/ui/icon'
import { useCategories } from '@/hooks/useCategories'
import { useCreateExpense, useDeleteExpense, useUpdateExpense } from '@/hooks/useExpenses'
import type { ParsedReceipt } from '@/hooks/useScanReceipt'
import { CurrencySelect } from '@/components/ui/currency-select'
import { useSettings } from '@/hooks/useSettings'
import { convertWithRates, useRates } from '@/hooks/useRates'
import { formatMoney, getDisplayCurrency, toISODate } from '@/lib/format'
import { useCreateCardCharge, useCreditCards } from '@/hooks/useCreditCards'
import { safeHttpUrl } from '@/lib/safeUrl'
import { ReceiptScanner } from './ReceiptScanner'

interface ExpenseModalProps {
  open: boolean
  onClose: () => void
  expense?: ExpenseWithCategory | null
  defaultCategoryId?: string
}

export function ExpenseModal({ open, onClose, expense, defaultCategoryId }: ExpenseModalProps) {
  const { t } = useTranslation()
  const { data: categories = [] } = useCategories()
  const { data: settings } = useSettings()
  const baseCurrency = settings?.currency ?? getDisplayCurrency()
  const { data: rates } = useRates(baseCurrency)
  const { data: cards = [] } = useCreditCards()
  const createCharge = useCreateCardCharge()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const deleteExpense = useDeleteExpense()
  const isEdit = Boolean(expense)

  const [amount, setAmount] = useState('')
  const [vendor, setVendor] = useState('')
  const [date, setDate] = useState(toISODate(new Date()))
  const [categoryId, setCategoryId] = useState('')
  const [notes, setNotes] = useState('')
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | undefined>()
  const [currency, setCurrency] = useState(baseCurrency)
  const [onCard, setOnCard] = useState(false)
  const [cardId, setCardId] = useState('')

  useEffect(() => {
    if (!open) return
    setAmount(expense ? String(expense.amount) : '')
    setVendor(expense?.vendor ?? '')
    setDate(expense?.date?.slice(0, 10) ?? toISODate(new Date()))
    setCategoryId(expense?.categoryId ?? defaultCategoryId ?? '')
    setNotes(expense?.notes ?? '')
    setReceiptImageUrl(expense?.receiptImageUrl ?? undefined)
    setCurrency(expense?.currency ?? baseCurrency)
    setOnCard(false)
    setCardId('')
  }, [open, expense, defaultCategoryId, baseCurrency])

  const handleScan = (result: ParsedReceipt) => {
    if (result.amount) setAmount(String(result.amount))
    if (result.vendor) setVendor(result.vendor)
    if (result.date) setDate(result.date.slice(0, 10))
    if (result.imageUrl) setReceiptImageUrl(result.imageUrl)
    const match = categories.find((c) => c.name.toLowerCase() === result.suggestedCategory?.toLowerCase())
    if (match) setCategoryId(match.id)
  }

  const pending = createExpense.isPending || updateExpense.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!value || value <= 0) return toast.error(t('modals.expense.amountError'))
    if (!onCard && !categoryId) return toast.error(t('modals.expense.categoryError'))
    if (onCard && !cardId) return toast.error(t('cards.selectCard'))

    const payload = {
      amount: value,
      currency,
      categoryId,
      date,
      vendor: vendor.trim() || undefined,
      notes: notes.trim() || undefined,
      receiptImageUrl,
    }
    try {
      if (expense) {
        await updateExpense.mutateAsync({ id: expense.id, data: payload })
        toast.success(t('modals.expense.updated'))
      } else if (onCard) {
        await createCharge.mutateAsync({
          id: cardId,
          data: { amount: value, currency, categoryId: categoryId || undefined, date, vendor: vendor.trim() || undefined, notes: notes.trim() || undefined },
        })
        toast.success(t('cards.charged'))
      } else {
        await createExpense.mutateAsync(payload)
        toast.success(t('modals.expense.logged'))
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('modals.expense.saveError'))
    }
  }

  const handleDelete = async () => {
    if (!expense) return
    try {
      await deleteExpense.mutateAsync(expense.id)
      toast.success(t('modals.expense.deleted'))
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('modals.expense.deleteError'))
    }
  }

  const receiptHref = safeHttpUrl(receiptImageUrl)

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={isEdit ? 'edit_note' : 'add_card'}
      eyebrow={isEdit ? t('modals.expense.editEyebrow') : t('modals.expense.addEyebrow')}
      title={isEdit ? t('modals.expense.editTitle') : t('modals.expense.addTitle')}
      footer={
        <>
          {isEdit && (
            <Button type="button" variant="destructive-ghost" className="mr-auto" onClick={handleDelete} disabled={deleteExpense.isPending}>
              <Icon name="delete" className="text-[18px]" /> {t('modals.expense.delete')}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('modals.expense.cancel')}
          </Button>
          <Button type="submit" form="expense-form" disabled={pending}>
            {pending ? t('modals.expense.saving') : isEdit ? t('modals.expense.saveChanges') : t('modals.expense.logExpense')}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md min-w-0">
        {!isEdit && cards.length > 0 && (
          <label className="flex items-start gap-space-sm">
            <input type="checkbox" checked={onCard} onChange={(e) => setOnCard(e.target.checked)} className="mt-1" />
            <span>
              <span className="font-body-md text-body-md text-on-surface">{t('cards.payWithCard')}</span>
              <span className="block font-body-sm text-body-sm text-outline">{t('cards.payWithCardHint')}</span>
            </span>
          </label>
        )}
        {!isEdit && onCard && (
          <div>
            <Label htmlFor="card">{t('cards.selectCard')}</Label>
            <NativeSelect id="card" value={cardId} onChange={(e) => setCardId(e.target.value)}>
              <option value="">{t('modals.expense.select')}</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>{card.name}</option>
              ))}
            </NativeSelect>
          </div>
        )}

        {!isEdit && <ReceiptScanner onScanComplete={handleScan} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md min-w-0">
          <div className="min-w-0">
            <Label htmlFor="amount">{t('modals.expense.amount')}</Label>
            <MoneyInput
              id="amount"
              large
              currency={currency}
              placeholder={t('modals.expense.amountPlaceholder')}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            {currency !== baseCurrency && parseFloat(amount) > 0 && (
              <p className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant mt-1 truncate">
                {t('modals.expense.converted', {
                  amount: formatMoney(convertWithRates(parseFloat(amount), currency, baseCurrency, rates) ?? 0, baseCurrency),
                  currency: baseCurrency,
                })}
              </p>
            )}
          </div>
          <div className="min-w-0">
            <Label htmlFor="expense-currency">{t('modals.expense.currency')}</Label>
            <CurrencySelect id="expense-currency" value={currency} onChange={setCurrency} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-md min-w-0">
          <div className="min-w-0">
            <Label htmlFor="date">{t('modals.expense.date')}</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="min-w-0" />
          </div>
          <div className="min-w-0">
            <Label htmlFor="category">{t('modals.expense.category')}</Label>
            <NativeSelect id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>
                {t('modals.expense.select')}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>

        <div>
          <Label htmlFor="vendor">{t('modals.expense.merchant')}</Label>
          <Input
            id="vendor"
            placeholder={t('modals.expense.merchantPlaceholder')}
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="notes">{t('modals.expense.notes')}</Label>
          <Textarea
            id="notes"
            placeholder={t('modals.expense.notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[64px]"
          />
        </div>

        {receiptHref && (
          <a
            href={receiptHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-space-xs font-body-sm text-body-sm text-secondary font-medium"
          >
            <Icon name="attachment" className="text-[16px]" /> {t('modals.expense.receiptAttached')}
          </a>
        )}
      </form>
    </Modal>
  )
}
