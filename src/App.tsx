import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { AdminOrders } from './pages/AdminOrders'
import { PublicProfile } from './pages/PublicProfile'
import { PortfolioPage } from './pages/PortfolioPage'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'

function AuthRedirect() {
  const { user, tapUser, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!tapUser) return <Navigate to="/onboarding" replace />
  if (user.email === 'zaheer800@gmail.com') return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/auth" element={<AuthRedirect />} />
          <Route
            path="/onboarding"
            element={<ProtectedRoute><Onboarding /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute><AdminOrders /></ProtectedRoute>}
          />
          {/* Portfolio — before /:username so it isn't swallowed */}
          <Route path="/:username/:slug" element={<PortfolioPage />} />
          {/* Public profile — last so it doesn't shadow app routes */}
          <Route path="/:username" element={<PublicProfile />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
