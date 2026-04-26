import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { PublicProfile } from './pages/PublicProfile'

function AppRoutes() {
  const { user, tapUser, loading } = useAuth()

  // After auth, redirect to onboarding if username not set; to dashboard if set
  function AuthRedirect() {
    if (loading) return null
    if (!user) return <Navigate to="/login" replace />
    if (!tapUser) return <Navigate to="/onboarding" replace />
    return <Navigate to="/dashboard" replace />
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Catch-all for known app routes that need auth redirect */}
      <Route path="/auth" element={<AuthRedirect />} />
      {/* Public profile — must be last to not shadow app routes */}
      <Route path="/:username" element={<PublicProfile />} />
    </Routes>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
