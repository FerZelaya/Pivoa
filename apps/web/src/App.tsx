import { Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageSync } from '@/i18n/LanguageSwitcher';
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
import RecoveryPage from '@/pages/RecoveryPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import PricingPage from '@/pages/PricingPage';
import SupportPage from '@/pages/SupportPage';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import AdminHomePage from '@/pages/admin/AdminHomePage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminUserPage from '@/pages/admin/AdminUserPage';
import AdminTicketsPage from '@/pages/admin/AdminTicketsPage';
import AdminTicketPage from '@/pages/admin/AdminTicketPage';

function App() {
  return (
    <AuthProvider>
      <LanguageSync />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/recovery" element={<RecoveryPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/:id" element={<SupportPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute skipOnboarding>
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHomePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:id" element={<AdminUserPage />} />
          <Route path="tickets" element={<AdminTicketsPage />} />
          <Route path="tickets/:id" element={<AdminTicketPage />} />
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
