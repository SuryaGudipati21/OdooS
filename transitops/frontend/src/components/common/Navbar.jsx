import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="flex gap-4 p-4 border-b items-center">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/vehicles">Vehicles</Link>
      <Link to="/drivers">Drivers</Link>
      <Link to="/trips">Trips</Link>
      <Link to="/maintenance">Maintenance</Link>
      <Link to="/fuel-expenses">Fuel & Expenses</Link>
      <button onClick={handleLogout} className="ml-auto text-red-600">Logout</button>
    </nav>
  )
}