export interface CurrencyOption {
  code: string
  name: string
}

const FALLBACK = ['USD', 'EUR', 'GBP', 'HNL', 'MXN', 'CAD', 'JPY', 'AUD', 'BRL', 'CRC']

export function listCurrencies(): CurrencyOption[] {
  const names = new Intl.DisplayNames(['en'], { type: 'currency' })
  const codes =
    typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('currency') : FALLBACK

  return codes
    .map((code) => {
      try {
        return { code, name: names.of(code) ?? code }
      } catch {
        return { code, name: code }
      }
    })
    .sort((a, b) => a.code.localeCompare(b.code))
}

export function currencyName(code: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'currency' }).of(code) ?? code
  } catch {
    return code
  }
}
