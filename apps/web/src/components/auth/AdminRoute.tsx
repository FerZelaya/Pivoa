import { Navigate } from 'react-router'
import { useMe } from '@/hooks/useMe'
import { SplashScreen } from './SplashScreen'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { data, isPending, isError } = useMe()
  if (isPending) return <SplashScreen />
  if (isError || !data?.isAdmin) return <Navigate to="/overview" replace />
  return <>{children}</>
}
