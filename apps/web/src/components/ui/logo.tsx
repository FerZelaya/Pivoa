import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'full' | 'mark'
}

export function Logo({ className, variant = 'full' }: LogoProps) {
  if (variant === 'mark') {
    return <img src="/favicon.svg" alt="Pivoa" className={cn('h-8 w-8', className)} />
  }
  return <img src="/logo.svg" alt="Pivoa" className={cn('h-10 w-auto', className)} />
}
