import { useRef, useState } from 'react'
import { useScanReceipt, type ParsedReceipt } from '@/hooks/useScanReceipt'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { toast } from 'sonner'

interface ReceiptScannerProps {
  onScanComplete: (result: ParsedReceipt) => void
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { mutate: scanReceipt, isPending, isError, error } = useScanReceipt()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
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
        toast.success('Receipt scanned — details filled in')
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to scan receipt'),
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
            <p className="font-body-md text-body-md font-semibold text-on-surface">Scan a receipt with AI</p>
            <p className="font-body-sm text-body-sm text-outline truncate">Photo or image · PNG, JPG, HEIC up to 10MB</p>
          </div>
          <Icon name="upload" className="text-outline text-[20px]" />
        </button>
      ) : (
        <div className="flex items-center gap-space-md rounded-lg bg-surface-container-low p-space-sm">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
            <img src={preview} alt="Receipt preview" className="w-full h-full object-cover" />
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
                {error instanceof Error ? error.message : 'Failed to scan receipt'}
              </p>
            ) : (
              <p className="font-body-sm text-body-sm text-outline">
                {isPending ? 'Extracting amount, merchant and date…' : 'Ready to analyze'}
              </p>
            )}
          </div>
          <Button type="button" size="sm" onClick={handleScan} disabled={isPending}>
            <Icon name="auto_awesome" className="text-[16px]" />
            {isPending ? 'Scanning' : 'Scan'}
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
