import { cn } from '@/lib/utils'

interface IconProps {
  name: string
  className?: string
  filled?: boolean
  size?: number
}

export function Icon({ name, className, filled, size }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('material-symbols-outlined', filled && 'icon-fill', className)}
      style={size ? { fontSize: size } : undefined}
    >
      {name}
    </span>
  )
}
