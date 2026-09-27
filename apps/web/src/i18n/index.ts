import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import es from './locales/es.json'
import { setDisplayLocale } from '@/lib/format'

export const SUPPORTED_LANGS = ['en', 'es'] as const
export type AppLanguage = (typeof SUPPORTED_LANGS)[number]

export const LANG_STORAGE_KEY = 'pivoa.lang'

export function normalizeLanguage(code?: string | null): AppLanguage {
  if (!code) return 'en'
  const base = code.trim().toLowerCase().split('-')[0]
  return base === 'es' ? 'es' : 'en'
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGS],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      // Browser / OS locale is the default when nothing is saved yet.
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANG_STORAGE_KEY,
      caches: ['localStorage'],
      convertDetectedLanguage: normalizeLanguage,
    },
  })

setDisplayLocale(normalizeLanguage(i18n.language))
i18n.on('languageChanged', (lng) => {
  const next = normalizeLanguage(lng)
  setDisplayLocale(next)
  document.documentElement.lang = next
})
document.documentElement.lang = normalizeLanguage(i18n.language)

export default i18n
