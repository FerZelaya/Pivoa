import { Navigate, useLocation } from 'react-router'
import { useSettings } from '@/hooks/useSettings'
import { SplashScreen } from './SplashScreen'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { data: settings, isPending, isError } = useSettings()
  const location = useLocation()

  if (isPending) {
    return <SplashScreen />
  }

  if (isError) {
    return <>{children}</>
  }

  if (settings && !settings.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
