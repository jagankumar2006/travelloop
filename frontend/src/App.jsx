import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import CreateTripPage from './pages/CreateTripPage'
import MyTripsPage from './pages/MyTripsPage'
import ItineraryBuilderPage from './pages/ItineraryBuilderPage'
import ItineraryViewPage from './pages/ItineraryViewPage'
import CitySearchPage from './pages/CitySearchPage'
import ActivitySearchPage from './pages/ActivitySearchPage'
import BudgetPage from './pages/BudgetPage'
import PackingPage from './pages/PackingPage'
import SharedTripPage from './pages/SharedTripPage'
import ProfilePage from './pages/ProfilePage'
import NotesPage from './pages/NotesPage'
import AdminPage from './pages/AdminPage'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400">Loading Traveloop...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user } = useAuth()
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Public shared itinerary */}
      <Route path="/share/:token" element={<SharedTripPage />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trips"     element={<MyTripsPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />
        <Route path="/trips/:id/edit"      element={<CreateTripPage />} />
        <Route path="/trips/:id/builder"   element={<ItineraryBuilderPage />} />
        <Route path="/trips/:id/view"      element={<ItineraryViewPage />} />
        <Route path="/trips/:id/budget"    element={<BudgetPage />} />
        <Route path="/trips/:id/packing"   element={<PackingPage />} />
        <Route path="/trips/:id/notes"     element={<NotesPage />} />
        <Route path="/cities"      element={<CitySearchPage />} />
        <Route path="/activities"  element={<ActivitySearchPage />} />
        <Route path="/profile"     element={<ProfilePage />} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
