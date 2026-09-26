import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { Icon } from './icon'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  eyebrow?: string
  description?: string
  icon?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, eyebrow, description, icon, children, footer, className }: ModalProps) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-space-md">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-lg max-h-[calc(100vh-2rem)] min-w-0 overflow-hidden flex flex-col bg-surface-container-lowest rounded-xl shadow-[0_20px_50px_-12px_rgba(11,28,48,0.25)] animate-scale-in',
          className
        )}
      >
        <div className="flex items-start justify-between gap-space-md p-space-lg pb-space-md">
          <div className="flex items-start gap-space-sm">
            {icon && (
              <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                <Icon name={icon} className="text-[20px]" />
              </div>
            )}
            <div>
              {eyebrow && (
                <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">{eyebrow}</p>
              )}
              <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
              {description && <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{description}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="px-space-lg pb-space-lg min-w-0 overflow-y-auto overflow-x-hidden custom-scrollbar">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-space-sm px-space-lg py-space-md bg-surface-container-low/60 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
