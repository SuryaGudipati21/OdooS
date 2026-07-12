  /**
   * ⚠️ SHARED FILE — everyone touches this, but only to add ONE <Route> line
   * for their own page. Pull before you edit, push right after, tell the group.
   */
  import { Routes, Route, Navigate } from 'react-router-dom'
  import { useAuth } from './context/AuthContext'

  import LoginPage from './pages/LoginPage.jsx'
  import SignupPage from './pages/SignupPage.jsx'
  import VehicleRegistryPage from './pages/VehicleRegistryPage.jsx'
  import DriverManagementPage from './pages/DriverManagementPage.jsx'
  import TripManagementPage from './pages/TripManagementPage.jsx'
  import MaintenancePage from './pages/MaintenancePage.jsx'
  import FuelExpensePage from './pages/FuelExpensePage.jsx'
  // import DashboardPage from './pages/DashboardPage.jsx'
  // import ReportsPage from './pages/ReportsPage.jsx'

  function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth()
    if (loading) return null
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return children
  }

  function App() {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/vehicles" element={<ProtectedRoute><VehicleRegistryPage /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><DriverManagementPage /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><TripManagementPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
        <Route path="/fuel-expenses" element={<ProtectedRoute><FuelExpensePage /></ProtectedRoute>} />
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        {/* <Route path="/reports" element={<ReportsPage />} /> */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  export default App
