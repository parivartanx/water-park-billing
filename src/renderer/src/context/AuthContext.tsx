import React, { useState, useEffect, ReactNode } from 'react'
import { AuthContext } from './AuthTypes'

export const AuthProvider = ({
  children
}: {
  children: ReactNode
}): JSX.Element => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedAuth = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')

    if (storedAuth && storedRefreshToken) {
      setIsAuthenticated(true)

      
    }
  }, [])

 

  const logout = (): void => {
    setIsAuthenticated(false)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
