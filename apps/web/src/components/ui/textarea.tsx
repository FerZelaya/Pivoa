import * as React from 'react'
import { cn } from '@/lib/utils'
import { fieldClasses } from './input'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea className={cn(fieldClasses, 'min-h-[80px] resize-none', className)} ref={ref} {...props} />
  )
)
Textarea.displayName = 'Textarea'

export { Textarea }
