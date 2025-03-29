import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Employee interface
export interface Employee {
  _id: string
  name: string
  email: string
  phoneNumber: string
  password: string
  joiningDate: string
  role: string
  status: string
}

// Response interfaces
interface EmployeeResponse {
  success: boolean
  data: Employee
  error?: string
}

// Define the employee store state
interface EmployeeState {
  employee: Employee | null
  loading: boolean
  error: string | null
  getEmployeeById: (accessToken: string) => Promise<void>
  updateProfile: (updatedData: Partial<Employee>) => Promise<void>
  reset: () => void
}

// Create the store with Zustand
export const useEmployeeStore = create<EmployeeState>()(
  devtools((set) => ({
    employee: null,
    loading: false,
    error: null,

    // Get employee data from the main process
    getEmployeeById: async (accessToken: string) => {
      try {
        set({ loading: true, error: null })
        
        const response = await window.electron.ipcRenderer.invoke('get-employee-by-id', {
          access_token: accessToken
        }) as EmployeeResponse;

        if (response.error) {
          set({ error: response.error, loading: false })
          return
        }

        set({ 
          employee: response.data, 
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Error fetching employee data:', error)
        set({ 
          error: 'Failed to load employee data. Please try again.',
          loading: false
        })
      }
    },

    // Update employee profile - this would need a corresponding backend endpoint
    updateProfile: async (updatedData: Partial<Employee>) => {
      try {
        set({ loading: true, error: null })
        
        // This is a placeholder - you would need to implement the actual API call
        // const response = await window.electron.ipcRenderer.invoke('update-employee', updatedData)
        
        // For now, just update the local state
        set((state) => ({ 
          employee: state.employee ? { ...state.employee, ...updatedData } : null,
          loading: false
        }))
        
        // Show success message or handle response
      } catch (error) {
        console.error('Error updating profile:', error)
        set({ 
          error: 'Failed to update profile. Please try again.',
          loading: false
        })
      }
    },

    // Reset store state
    reset: () => {
      set({
        employee: null,
        loading: false,
        error: null
      })
    }
  }))
)
