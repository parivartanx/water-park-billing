import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Sidebar from './Sidebar'
import { Loader2 } from 'lucide-react'

const ProtectedRoute = (): JSX.Element => {
  const { validateAuth } = useAuth()
  const location = useLocation()
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    // Validate authentication on component mount
    const isValid = validateAuth()
    setIsValidating(false)
    
    // Only update redirect state if not authenticated
    if (!isValid) {
      setShouldRedirect(true)
    }
  }, [validateAuth])

  if (shouldRedirect) {
    return <Navigate to="/signin" state={{ from: location }} replace />
  }

  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#DC004E] animate-spin" />
        <span className="ml-2 text-gray-600">Checking authentication...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}

export default ProtectedRoute
