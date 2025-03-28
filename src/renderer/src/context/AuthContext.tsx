import React, { useState, useEffect, ReactNode } from 'react'
import { AuthContext } from './AuthTypes'

export const AuthProvider = ({
  children
}: {
  children: ReactNode
}): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('access_token') !== null)

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedAuth = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')

    console.log("Auth provider called with auth: ", storedAuth, " and refresh token: ", storedRefreshToken)

    if (storedAuth && storedRefreshToken) {
      setIsAuthenticated(true)
    }
  }, [])

  // Validate authentication by checking for valid tokens
  const validateAuth = (): boolean => {
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    
    if (accessToken && refreshToken) {
      setIsAuthenticated(true)
      return true
    }
    
    setIsAuthenticated(false)
    return false
  }

  const logout = (): void => {
    setIsAuthenticated(false)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout, validateAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
