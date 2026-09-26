import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { fieldClasses } from './input'
import { listCurrencies } from '@/lib/currencies'

interface CurrencySelectProps {
  value: string
  onChange: (code: string) => void
  id?: string
  className?: string
  disabled?: boolean
}

export function CurrencySelect({ value, onChange, id, className, disabled }: CurrencySelectProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const options = useMemo(() => listCurrencies(), [])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options.slice(0, 40)
    return options.filter((o) => o.code.toLowerCase().includes(q) || o.name.toLowerCase().includes(q)).slice(0, 40)
  }, [options, query])
  const selected = options.find((o) => o.code === value)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative min-w-0 w-full', className)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(fieldClasses, 'flex items-center justify-between gap-2 text-left cursor-pointer')}
      >
        <span className="min-w-0 truncate">
          <span className="font-label-numeric-sm text-label-numeric-sm font-semibold">{value || 'USD'}</span>
          {selected && <span className="text-on-surface-variant ml-2">{selected.name}</span>}
        </span>
        <span className="material-symbols-outlined text-[18px] text-outline shrink-0">expand_more</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-40 mt-1 max-w-full overflow-hidden bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-8px_rgba(11,28,48,0.18)]">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search currencies…"
            className="w-full min-w-0 px-space-md py-2 font-body-sm text-body-sm bg-surface-container-low border-0 border-b border-surface-container focus:outline-none"
          />
          <ul className="max-h-56 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {filtered.map((option) => (
              <li key={option.code} className="min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.code)
                    setQuery('')
                    setOpen(false)
                  }}
                  className={cn(
                    'w-full min-w-0 flex items-center gap-space-sm px-space-md py-2 text-left hover:bg-surface-container-low',
                    option.code === value && 'bg-surface-container-high'
                  )}
                >
                  <span className="font-label-numeric-sm text-label-numeric-sm font-semibold shrink-0 w-10">{option.code}</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate min-w-0">{option.name}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-space-md py-space-md font-body-sm text-body-sm text-outline">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
