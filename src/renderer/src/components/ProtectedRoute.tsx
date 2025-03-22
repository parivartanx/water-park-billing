import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'

const ProtectedRoute = (): JSX.Element => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-6 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default ProtectedRoute
