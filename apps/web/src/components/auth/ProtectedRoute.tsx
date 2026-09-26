import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingGuard } from './OnboardingGuard';
import { SplashScreen } from './SplashScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboarding?: boolean;
}

export function ProtectedRoute({ children, skipOnboarding = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Skip onboarding guard for the onboarding page itself
  if (skipOnboarding) {
    return <>{children}</>;
  }

  return <OnboardingGuard>{children}</OnboardingGuard>;
}
