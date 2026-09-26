import { Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import HealthPage from '@/pages/HealthPage';
import OnboardingPage from '@/pages/OnboardingPage';
import OverviewPage from '@/pages/OverviewPage';
import TransactionsPage from '@/pages/TransactionsPage';
import BudgetsPage from '@/pages/BudgetsPage';
import SettingsPage from '@/pages/SettingsPage';
import AuthCallbackPage from '@/pages/AuthCallbackPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Onboarding route (protected but skips onboarding check) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute skipOnboarding>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected app routes with layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Legacy redirect */}
        <Route path="/dashboard" element={<Navigate to="/overview" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
