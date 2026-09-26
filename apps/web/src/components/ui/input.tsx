import * as React from 'react'
import { cn } from '@/lib/utils'
import { currencySymbol, getDisplayCurrency } from '@/lib/format'

export const fieldClasses =
  'w-full min-w-0 bg-surface-container-low rounded-lg px-space-md py-2.5 font-body-md text-body-md text-on-surface placeholder:text-outline border border-transparent transition-colors focus:outline-none focus:bg-surface-container-lowest focus:border-primary-container focus:ring-2 focus:ring-primary-container/15 disabled:cursor-not-allowed disabled:opacity-60'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} className={cn(fieldClasses, className)} ref={ref} {...props} />
  )
)
Input.displayName = 'Input'

interface MoneyInputProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  large?: boolean
  currency?: string
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, large, currency, ...props }, ref) => (
    <div
      className={cn(
        fieldClasses,
        'flex items-center gap-2 focus-within:bg-surface-container-lowest focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/15',
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60',
        large && 'py-3',
        className
      )}
    >
      <span
        className={cn(
          'shrink-0 font-label-numeric-md text-outline select-none',
          large ? 'text-label-numeric-lg' : 'text-label-numeric-md'
        )}
      >
        {currencySymbol(currency ?? getDisplayCurrency())}
      </span>
      <input
        ref={ref}
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        className={cn(
          'min-w-0 flex-1 bg-transparent p-0 border-0 outline-none font-label-numeric-md text-on-surface placeholder:text-outline',
          large && 'text-label-numeric-lg'
        )}
        {...props}
      />
    </div>
  )
)
MoneyInput.displayName = 'MoneyInput'

export { Input, MoneyInput }
