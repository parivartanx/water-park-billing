import { create } from 'zustand'
import { Employee } from '../types/employee'

// Define the response type from the login API
interface LoginResponse {
  employee: Employee
  error?: string
  accessToken?: string
  refreshToken?: string
}

export interface AuthState {
  employee: Employee | null
  loading: boolean
  error: string | null
  login: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
}

const initialAuthState: AuthState = {
  employee: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {}
}

// Helper function to get initial employee state from localStorage
const getInitialEmployee = (): Employee | null => {
  const storedEmployee = localStorage.getItem('employee')
  return storedEmployee ? JSON.parse(storedEmployee) : null
}

export const useAuthStore = create<AuthState>()((set) => ({
  ...initialAuthState,
  employee: getInitialEmployee(),
  login: async (email: string, password: string, role: string) => {
    set({ loading: true, error: null })
    try {
      const response = await window.electron.ipcRenderer.invoke('login', { 
        email, 
        password, 
        role 
      }) as LoginResponse

      if (response.error) {
        set({ loading: false, error: response.error })
        return
      }

      // Store tokens and employee data in localStorage
      localStorage.setItem('access_token', response.accessToken || '')
      localStorage.setItem('refresh_token', response.refreshToken || '')
      localStorage.setItem('employee', JSON.stringify(response.employee))

      // Update store state
      set({ employee: response.employee, loading: false, error: null })
    } catch (error) {
      console.error('Login error:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Login failed'
      })
    }
  },
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('employee')
    
    // Reset store state
    set(initialAuthState)
  }
}))