import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { runTour } from './runTour'

type TourContextValue = {
  startTour: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const running = useRef(false)
  const latest = useRef({ t, language: i18n.language, navigate, updateSettings })
  latest.current = { t, language: i18n.language, navigate, updateSettings }

  const startTour = useCallback((replay: boolean) => {
    if (running.current) return
    running.current = true
    const { t, language, navigate, updateSettings } = latest.current

    const begin = async () => {
      if (replay) await updateSettings.mutateAsync({ tutorialCompleted: false })
      runTour({
        t,
        language,
        navigate,
        onComplete: () => {
          running.current = false
          updateSettings.mutate({ tutorialCompleted: true })
        },
        onAbort: () => {
          running.current = false
        },
      })
    }

    void begin().catch(() => {
      running.current = false
    })
  }, [])

  useEffect(() => {
    if (!settings?.onboardingCompleted || settings.tutorialCompleted) return
    if (location.pathname !== '/overview') return
    if (running.current) return
    const timer = window.setTimeout(() => startTour(false), 500)
    return () => window.clearTimeout(timer)
  }, [settings?.onboardingCompleted, settings?.tutorialCompleted, location.pathname, startTour])

  const replay = useCallback(() => startTour(true), [startTour])

  return <TourContext.Provider value={{ startTour: replay }}>{children}</TourContext.Provider>
}
