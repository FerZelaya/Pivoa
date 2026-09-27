import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useScanReceipt, type ParsedReceipt } from '@/hooks/useScanReceipt'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { toast } from 'sonner'

interface ReceiptScannerProps {
  onScanComplete: (result: ParsedReceipt) => void
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: scanReceipt, isPending, isError, error } = useScanReceipt()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error(t('modals.receipt.selectImageError'))
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t('modals.receipt.sizeError'))
      return
    }
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleScan = () => {
    if (!selectedFile) return
    scanReceipt(selectedFile, {
      onSuccess: (result) => {
        onScanComplete(result)
        toast.success(t('modals.receipt.scanned'))
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : t('modals.receipt.scanError')),
    })
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group w-full flex items-center gap-space-md rounded-lg border border-dashed border-outline-variant bg-surface-container-low/60 p-space-md text-left transition-colors hover:border-primary-container hover:bg-primary-fixed/30"
        >
          <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Icon name="document_scanner" className="text-[22px]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body-md text-body-md font-semibold text-on-surface">{t('modals.receipt.title')}</p>
            <p className="font-body-sm text-body-sm text-outline truncate">{t('modals.receipt.hint')}</p>
          </div>
          <Icon name="upload" className="text-outline text-[20px]" />
        </button>
      ) : (
        <div className="flex items-center gap-space-md rounded-lg bg-surface-container-low p-space-sm">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
            <img src={preview} alt={t('modals.receipt.previewAlt')} className="w-full h-full object-cover" />
            {isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/70">
                <Icon name="progress_activity" className="animate-spin text-primary-container" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body-md text-body-md font-semibold text-on-surface truncate">{selectedFile?.name}</p>
            {isError ? (
              <p className="font-body-sm text-body-sm text-tertiary-container">
                {error instanceof Error ? error.message : t('modals.receipt.scanError')}
              </p>
            ) : (
              <p className="font-body-sm text-body-sm text-outline">
                {isPending ? t('modals.receipt.extracting') : t('modals.receipt.ready')}
              </p>
            )}
          </div>
          <Button type="button" size="sm" onClick={handleScan} disabled={isPending}>
            <Icon name="auto_awesome" className="text-[16px]" />
            {isPending ? t('modals.receipt.scanning') : t('modals.receipt.scan')}
          </Button>
          <button
            type="button"
            onClick={clearSelection}
            className="p-1 rounded-lg text-outline hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      )}
    </div>
  )
}
