/** Client-side rules aligned with Supabase `lower_upper_letters_digits_symbols` + length 8. */
export const PASSWORD_MIN_LENGTH = 8

export type PasswordIssue =
  | 'tooShort'
  | 'needsLower'
  | 'needsUpper'
  | 'needsDigit'
  | 'needsSymbol'

export function validatePassword(password: string): PasswordIssue | null {
  if (password.length < PASSWORD_MIN_LENGTH) return 'tooShort'
  if (!/[a-z]/.test(password)) return 'needsLower'
  if (!/[A-Z]/.test(password)) return 'needsUpper'
  if (!/[0-9]/.test(password)) return 'needsDigit'
  if (!/[^A-Za-z0-9]/.test(password)) return 'needsSymbol'
  return null
}

export function passwordIssueMessageKey(issue: PasswordIssue): string {
  return `auth.password.${issue}`
}
