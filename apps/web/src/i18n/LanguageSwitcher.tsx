import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { LANG_STORAGE_KEY, normalizeLanguage, type AppLanguage } from '@/i18n'
import { cn } from '@/lib/utils'

/** Keep i18n in sync with saved user preference once settings load. */
export function LanguageSync() {
  const { i18n } = useTranslation()
  const { data: settings } = useSettings()

  useEffect(() => {
    if (!settings?.language) return
    // Prefer an explicit local choice (or prior session) over the DB default.
    if (localStorage.getItem(LANG_STORAGE_KEY)) return
    const next = normalizeLanguage(settings.language)
    if (normalizeLanguage(i18n.language) !== next) {
      void i18n.changeLanguage(next)
    }
  }, [settings?.language, i18n])

  return null
}

export function LanguageSwitcher({
  className,
  compact = false,
  persist = true,
}: {
  className?: string
  compact?: boolean
  /** When true and the user is logged in, save to user_settings. */
  persist?: boolean
}) {
  const { t, i18n } = useTranslation()
  const { data: settings } = useSettings()
  const update = useUpdateSettings()
  const current = normalizeLanguage(i18n.language)

  const setLanguage = async (next: AppLanguage) => {
    if (next === current) return
    localStorage.setItem(LANG_STORAGE_KEY, next)
    await i18n.changeLanguage(next)
    if (persist && settings) {
      try {
        await update.mutateAsync({ language: next })
      } catch {
        // Locale already applied locally; server sync can retry later.
      }
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg bg-surface-container-low p-0.5',
        className,
      )}
      role="group"
      aria-label={t('common.language')}
    >
      {(['en', 'es'] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => void setLanguage(code)}
          className={cn(
            'rounded-md px-2.5 py-1 font-label-caps text-label-caps uppercase transition-colors',
            current === code
              ? 'bg-surface-container-lowest text-on-surface shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          {compact ? code : t(`common.lang${code === 'en' ? 'En' : 'Es'}`)}
        </button>
      ))}
    </div>
  )
}
