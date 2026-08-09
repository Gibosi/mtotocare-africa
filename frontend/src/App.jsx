import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { LoginPage } from './pages/LoginPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { Layout } from './components/Layout'
import { ProviderDashboard } from './pages/provider/Dashboard'
import { ProviderPatients } from './pages/provider/Patients'
import { ProviderPatientDetail } from './pages/provider/PatientDetail'
import { ProviderAppointments } from './pages/provider/Appointments'
import { AdminDashboard } from './pages/admin/Dashboard'
import { AdminUsers } from './pages/admin/Users'
import { AdminFacilities } from './pages/admin/Facilities'
import { AdminAudit } from './pages/admin/Audit'
import { ProfilePage } from './pages/ProfilePage'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (role) {
    const roles = user.roles || []
    if (role === 'ADMIN' && !roles.includes('ADMIN')) {
      return <Navigate to={getHome(roles)} replace />
    }
    if (role === 'PROVIDER') {
      const providerRoles = ['DOCTOR', 'NURSE', 'MIDWIFE', 'CHW', 'HEALTHCARE_PROVIDER']
      if (!providerRoles.some(r => roles.includes(r))) {
        return <Navigate to={getHome(roles)} replace />
      }
    }
  }
  return children
}

function getHome(roles) {
  if (roles.includes('ADMIN')) return '/admin'
  if (roles.some(r => ['DOCTOR', 'NURSE', 'MIDWIFE', 'CHW', 'HEALTHCARE_PROVIDER'].includes(r))) {
    return '/provider'
  }
  return '/login'
}

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getHome(user.roles || [])} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Provider routes */}
      <Route path="/provider" element={<ProtectedRoute role="PROVIDER"><Layout role="PROVIDER" /></ProtectedRoute>}>
        <Route index element={<ProviderDashboard />} />
        <Route path="patients" element={<ProviderPatients />} />
        <Route path="patients/:id" element={<ProviderPatientDetail />} />
        <Route path="appointments" element={<ProviderAppointments />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute role="ADMIN"><Layout role="ADMIN" /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="facilities" element={<AdminFacilities />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
