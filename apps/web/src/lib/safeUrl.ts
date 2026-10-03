/** Allow only http(s) URLs for user-controlled hrefs (blocks javascript:, data:, etc.). */
export function isSafeHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function safeHttpUrl(value: string | null | undefined): string | undefined {
  return isSafeHttpUrl(value) ? value : undefined
}
