import * as React from 'react'
import { cn } from '@/lib/utils'
import { fieldClasses } from './input'

const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<'select'>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative min-w-0 w-full">
      <select ref={ref} className={cn(fieldClasses, 'appearance-none pr-9 cursor-pointer', className)} {...props}>
        {children}
      </select>
      <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
        expand_more
      </span>
    </div>
  )
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect }
