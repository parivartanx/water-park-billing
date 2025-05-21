/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, ReactNode } from 'react'
import { AuthContext } from './AuthTypes'
import { toast } from 'react-hot-toast'

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

    // console.log("Auth provider called with auth: ", storedAuth, " and refresh token: ", storedRefreshToken)

    if (storedAuth && storedRefreshToken) {    setIsAuthenticated(true)
    }
  }, [])

  // Listen for update status notifications
  useEffect(() => {
    // The 'on' method is available in the preload script but needs type assertion
    const electronIpcRenderer = window.electron.ipcRenderer as any
    
    // Type for update status
    type UpdateStatus = {
      status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
      version?: string;
      percent?: number;
      error?: string;
    }
    
    const removeListener = electronIpcRenderer.on?.('update-status', (status: UpdateStatus) => {
      console.log('Update status:', status)
      
      if (status.status === 'available' && status.version) {
        toast.success(`Update v${status.version} available and downloading...`)
      } else if (status.status === 'downloaded' && status.version) {
        toast.success(`Update v${status.version} ready to install on restart`)
      } else if (status.status === 'error' && status.error) {
        toast.error(`Update error: ${status.error}`)
      }
    })

    return () => {
      if (typeof removeListener === 'function') {
        removeListener()
      }
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
