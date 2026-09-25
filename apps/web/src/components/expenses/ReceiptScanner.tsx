import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, Loader2, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useScanReceipt, type ParsedReceipt } from '@/hooks/useScanReceipt'
import { toast } from 'sonner'

interface ReceiptScannerProps {
  onScanComplete: (result: ParsedReceipt) => void
}

export function ReceiptScanner({ onScanComplete }: ReceiptScannerProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const scanReceipt = useScanReceipt()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Scan receipt
    try {
      const result = await scanReceipt.mutateAsync(file)
      onScanComplete(result)
      toast.success('Receipt scanned! Review the details below.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to scan receipt')
      setPreview(null)
    }
  }, [scanReceipt, onScanComplete])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    noClick: true,
    noKeyboard: true,
  })

  const clearPreview = () => {
    setPreview(null)
  }

  if (scanReceipt.isPending) {
    return (
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {preview && (
              <img 
                src={preview} 
                alt="Receipt preview" 
                className="w-24 h-24 object-cover rounded-lg opacity-50"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Analyzing receipt with AI...
          </p>
        </div>
      </div>
    )
  }

  if (preview && !scanReceipt.isPending) {
    return (
      <div className="border-2 border-border rounded-lg p-4">
        <div className="flex items-start gap-4">
          <img 
            src={preview} 
            alt="Receipt preview" 
            className="w-20 h-20 object-cover rounded-lg"
          />
          <div className="flex-1">
            <p className="text-sm font-medium">Receipt uploaded</p>
            <p className="text-sm text-muted-foreground">
              AI has extracted the details. Review and edit below.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={clearPreview}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      )}
    >
      <input {...getInputProps()} />
      <input 
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onDrop([file])
        }}
        className="hidden"
        id="camera-input"
      />
      
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        
        <div>
          <p className="font-medium">Scan a receipt</p>
          <p className="text-sm text-muted-foreground">
            {isDragActive 
              ? "Drop the image here..."
              : "Drag & drop an image, or use the buttons below"}
          </p>
        </div>

        <div className="flex gap-2 mt-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={open}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById('camera-input')?.click()}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
        </div>
      </div>
    </div>
  )
}
