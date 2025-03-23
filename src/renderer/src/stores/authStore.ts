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

export const initialAuthState: AuthState = {
  employee: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: () => {}
}

// Initialize employee from localStorage if available
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
      // Call the IPC handler in the main process and explicitly type the response
      const response = await window.electron.ipcRenderer.invoke('login', { email, password, role }) as LoginResponse
      console.log('Login response:', response)
      // store token in local storage
      localStorage.setItem('access_token', response.accessToken || '')
      localStorage.setItem('refresh_token', response.refreshToken || '')
      /// store employee in local storage
      localStorage.setItem('employee', JSON.stringify(response.employee))
      if (response.error) {
        set({ loading: false, error: response.error })
        return
      }
      
      // Store the employee data in the state
      set({ employee: response.employee, loading: false, error: null })
    } catch (error) {
      console.error('Login error:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Authentication failed. Please try again.' 
      })
    }
  },
  logout: () => {
    set(initialAuthState)
    // remove token from local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('employee')
  }
}))