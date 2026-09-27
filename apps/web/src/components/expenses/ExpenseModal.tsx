import { useEffect, useState } from 'react'
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
import { useMe } from '@/hooks/useMe'
import { ReceiptScanner } from './ReceiptScanner'

interface ExpenseModalProps {
  open: boolean
  onClose: () => void
  expense?: ExpenseWithCategory | null
  defaultCategoryId?: string
}

export function ExpenseModal({ open, onClose, expense, defaultCategoryId }: ExpenseModalProps) {
  const { data: categories = [] } = useCategories()
  const { data: settings } = useSettings()
  const baseCurrency = settings?.currency ?? getDisplayCurrency()
  const { data: rates } = useRates(baseCurrency)
  const { data: me } = useMe()
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

  useEffect(() => {
    if (!open) return
    setAmount(expense ? String(expense.amount) : '')
    setVendor(expense?.vendor ?? '')
    setDate(expense?.date?.slice(0, 10) ?? toISODate(new Date()))
    setCategoryId(expense?.categoryId ?? defaultCategoryId ?? '')
    setNotes(expense?.notes ?? '')
    setReceiptImageUrl(expense?.receiptImageUrl ?? undefined)
    setCurrency(expense?.currency ?? baseCurrency)
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
    if (!value || value <= 0) return toast.error('Enter an amount greater than zero')
    if (!categoryId) return toast.error('Choose a category')

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
        toast.success('Transaction updated')
      } else {
        await createExpense.mutateAsync(payload)
        toast.success('Expense logged')
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save expense')
    }
  }

  const handleDelete = async () => {
    if (!expense) return
    try {
      await deleteExpense.mutateAsync(expense.id)
      toast.success('Transaction deleted')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={isEdit ? 'edit_note' : 'add_card'}
      eyebrow={isEdit ? 'Edit posting' : 'Quick add'}
      title={isEdit ? 'Edit Transaction' : 'Log Single Transaction'}
      footer={
        <>
          {isEdit && (
            <Button type="button" variant="destructive-ghost" className="mr-auto" onClick={handleDelete} disabled={deleteExpense.isPending}>
              <Icon name="delete" className="text-[18px]" /> Delete
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="expense-form" disabled={pending}>
            {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Log Expense'}
          </Button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="flex flex-col gap-space-md min-w-0">
        {!isEdit && <ReceiptScanner onScanComplete={handleScan} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md min-w-0">
          <div className="min-w-0">
            <Label htmlFor="amount">Amount</Label>
            <MoneyInput id="amount" large currency={currency} placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
            {currency !== baseCurrency && parseFloat(amount) > 0 && (
              <p className="font-label-numeric-sm text-label-numeric-sm text-on-surface-variant mt-1 truncate">
                = {formatMoney(convertWithRates(parseFloat(amount), currency, baseCurrency, rates) ?? 0, baseCurrency)} {baseCurrency}
              </p>
            )}
          </div>
          <div className="min-w-0">
            <Label htmlFor="expense-currency">Currency</Label>
            <CurrencySelect id="expense-currency" value={currency} onChange={setCurrency} disabled={me ? !me.multiCurrency : false} />
            {me && !me.multiCurrency && (
              <p className="font-body-sm text-body-sm text-outline mt-1">Other currencies are a Plus feature.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-space-md min-w-0">
          <div className="min-w-0">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="min-w-0" />
          </div>
          <div className="min-w-0">
            <Label htmlFor="category">Category</Label>
            <NativeSelect id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="" disabled>
                Select…
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
          <Label htmlFor="vendor">Merchant / Payee</Label>
          <Input id="vendor" placeholder="e.g. Whole Foods Market" value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Optional memo" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[64px]" />
        </div>

        {receiptImageUrl && (
          <a
            href={receiptImageUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-space-xs font-body-sm text-body-sm text-secondary font-medium"
          >
            <Icon name="attachment" className="text-[16px]" /> Receipt attached
          </a>
        )}
      </form>
    </Modal>
  )
}
