import { useRef, useState } from 'react'
import { useScanReceipt, type ParsedReceipt } from '@/hooks/useScanReceipt'
import { Button } from '@/components/ui/button'
import { Upload, Camera, Loader2, Sparkles, X, AlertCircle } from 'lucide-react'
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleScan = () => {
    if (!selectedFile) return

    scanReceipt(selectedFile, {
      onSuccess: (result) => {
        onScanComplete(result)
        toast.success('Receipt scanned successfully!')
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to scan receipt')
      },
    })
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 transition-all duration-200 cursor-pointer hover:border-foreground/30 hover:bg-muted/50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Camera className="h-6 w-6" />
            </div>
            <div className="text-left">
              <p className="font-medium">Scan Receipt</p>
              <p className="text-sm text-muted-foreground">
                Take a photo or upload an image
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Upload className="h-3.5 w-3.5" />
            <span>PNG, JPG, HEIC up to 10MB</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-lg border border-border bg-card">
            <img
              src={preview}
              alt="Receipt preview"
              className="h-40 w-full object-cover"
            />
            <button
              type="button"
              onClick={clearSelection}
              className="absolute right-2 top-2 rounded-lg bg-background/90 p-1.5 text-muted-foreground shadow-sm transition-colors hover:bg-background hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            {isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">
                    Analyzing receipt...
                  </p>
                </div>
              </div>
            )}
          </div>

          {isError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{error instanceof Error ? error.message : 'Failed to scan receipt'}</p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleScan}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Scan with AI
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
