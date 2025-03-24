import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = (): JSX.Element => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Only update redirect state if not authenticated
    if (!isAuthenticated) {
      setShouldRedirect(true)
    }
  }, [isAuthenticated])

  if (shouldRedirect) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#DC004E] animate-spin" />
        <span className="ml-2 text-gray-600">Checking authentication...</span>
      </div>
    )
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
