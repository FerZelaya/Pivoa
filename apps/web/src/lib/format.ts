let displayCurrency = 'USD'

export function setDisplayCurrency(code: string) {
  displayCurrency = normalizeCurrency(code)
}

export function getDisplayCurrency() {
  return displayCurrency
}

export function normalizeCurrency(code?: string | null) {
  return (code || 'USD').trim().toUpperCase().slice(0, 3) || 'USD'
}

export function currencySymbol(code = displayCurrency) {
  const normalized = normalizeCurrency(code)
  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalized,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0)
    const symbol = parts.find((part) => part.type === 'currency')?.value
    if (symbol && symbol.length <= 2) return symbol
    return normalized
  } catch {
    return normalized
  }
}

export function formatMoney(value: number | null | undefined, currency = displayCurrency): string {
  const amount = Number.isFinite(value) ? (value as number) : 0
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizeCurrency(currency),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${normalizeCurrency(currency)}`
  }
}

export function formatCurrency(value: number | null | undefined): string {
  return formatMoney(value, displayCurrency)
}

export function formatCompact(value: number, currency = displayCurrency): string {
  if (Math.abs(value) < 10_000) return formatMoney(value, currency)
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalizeCurrency(currency),
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  } catch {
    return formatMoney(value, currency)
  }
}

export function formatPercent(value: number, digits = 1): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(digits)}%`
}

/** Parse a `YYYY-MM-DD` string as a local date (avoids UTC off-by-one). */
export function parseLocalDate(date: string): Date {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit', year: 'numeric' }) {
  return parseLocalDate(date).toLocaleDateString('en-US', opts)
}

export function monthName(date = new Date(), style: 'long' | 'short' = 'long') {
  return date.toLocaleDateString('en-US', { month: style })
}

export function monthYear(date = new Date()) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function ordinal(n: number) {
  const v = n % 100
  const suffix = v >= 11 && v <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')
  return `${n}${suffix}`
}

export function formatCycleRange(start?: string | null, end?: string | null) {
  if (!start || !end) return monthYear()
  const a = parseLocalDate(start)
  const b = parseLocalDate(end)
  const sameYear = a.getFullYear() === b.getFullYear()
  return `${a.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: sameYear ? undefined : 'numeric' })} – ${b.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export function startOfMonthISO(date = new Date()) {
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1))
}

export function endOfMonthISO(date = new Date()) {
  return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

export function initials(name: string) {
  return (
    name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'P'
  )
}
