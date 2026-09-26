import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-space-xs whitespace-nowrap rounded-lg font-body-md text-body-md font-semibold transition-all cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary-container text-on-primary shadow-sm hover:bg-primary',
        tonal: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
        outline: 'bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low',
        ghost: 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
        link: 'text-primary-container hover:text-primary hover:underline active:scale-100',
        success: 'bg-secondary text-on-secondary shadow-sm hover:opacity-90',
        destructive: 'bg-tertiary-container text-on-tertiary shadow-sm hover:bg-tertiary',
        'destructive-ghost': 'text-tertiary-container hover:bg-error-container/40',
      },
      size: {
        default: 'px-space-md py-space-sm',
        sm: 'px-space-sm py-1.5 text-body-sm',
        lg: 'px-space-lg py-3 text-body-lg',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
