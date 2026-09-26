import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('bg-surface-container-lowest rounded-xl shadow-sm', className)} {...props} />
  )
)
Card.displayName = 'Card'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

function CardHeading({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-space-md mb-space-lg', className)}>
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
        {subtitle && <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

interface PageHeaderProps {
  eyebrow: string
  title: string
  actions?: React.ReactNode
}

function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
      <div>
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{eyebrow}</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mt-0.5">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-space-sm">{actions}</div>}
    </div>
  )
}

function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number
  className?: string
  barClassName?: string
}) {
  return (
    <div className={cn('w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-700 bg-primary-container', barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export { Card, CardHeading, PageHeader, ProgressBar }
