import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ReceiptScanner } from './ReceiptScanner'
import { useCategories } from '@/hooks/useCategories'
import { useCreateExpense } from '@/hooks/useExpenses'
import type { ParsedReceipt } from '@/hooks/useScanReceipt'
import { Plus } from 'lucide-react'

const expenseSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  categoryId: z.string().uuid('Please select a category'),
  vendor: z.string().max(255).optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(1000).optional(),
  receiptImageUrl: z.string().optional(),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

interface AddExpenseDialogProps {
  initialData?: Partial<ExpenseFormData>
}

export function AddExpenseDialog({ initialData }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [scannedImageUrl, setScannedImageUrl] = useState<string | null>(null)
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  const createExpense = useCreateExpense()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      ...initialData,
    },
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        ...initialData,
      })
      setScannedImageUrl(null)
    }
  }, [open, reset, initialData])

  const handleScanComplete = (result: ParsedReceipt) => {
    // Prefill form with AI results
    if (result.amount > 0) {
      setValue('amount', result.amount)
    }
    if (result.vendor) {
      setValue('vendor', result.vendor)
    }
    if (result.date) {
      setValue('date', result.date)
    }
    if (result.imageUrl) {
      setScannedImageUrl(result.imageUrl)
      setValue('receiptImageUrl', result.imageUrl)
    }
    
    // Try to match suggested category
    if (result.suggestedCategory && categories) {
      const matchedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === result.suggestedCategory?.toLowerCase()
      )
      if (matchedCategory) {
        setValue('categoryId', matchedCategory.id)
      }
    }
  }

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await createExpense.mutateAsync({
        amount: data.amount,
        currency: data.currency,
        categoryId: data.categoryId,
        vendor: data.vendor || undefined,
        date: data.date,
        notes: data.notes || undefined,
        receiptImageUrl: data.receiptImageUrl || undefined,
      })
      toast.success('Expense added successfully')
      reset()
      setScannedImageUrl(null)
      setOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add expense')
    }
  }

  const categoryOptions = (categories || []).map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Scan a receipt or enter the details manually.
          </DialogDescription>
        </DialogHeader>
        
        {/* Receipt Scanner */}
        <div className="my-4">
          <ReceiptScanner onScanComplete={handleScanComplete} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {/* Amount + Currency */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="flex-1"
                  {...register('amount')}
                />
                <Input
                  className="w-20"
                  maxLength={3}
                  placeholder="USD"
                  {...register('currency')}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="categoryId">Category <span className="text-destructive">*</span></Label>
              <Select
                id="categoryId"
                options={categoryOptions}
                placeholder="Select a category"
                disabled={categoriesLoading}
                {...register('categoryId')}
              />
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Vendor */}
            <div className="grid gap-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                placeholder="e.g., Starbucks, Amazon"
                {...register('vendor')}
              />
              {errors.vendor && (
                <p className="text-sm text-destructive">{errors.vendor.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date <span className="text-destructive">*</span></Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                rows={3}
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>

            {scannedImageUrl && (
              <input type="hidden" {...register('receiptImageUrl')} />
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
