import { create } from 'zustand'
import { CashManagement } from '../../../main/types/cash-management'

interface CashManagementResponse {
  error?: string
  docs?: CashManagement[]
}

interface CashManagementStore {
  cashHistory: CashManagement[]
  loading: boolean
  error: string | null
  setCashManagement: (data: CashManagement, accessToken: string) => Promise<void>
  getCashHistory: (from: string, to: string, accessToken: string) => Promise<void>
}

export const useCashManagementStore = create<CashManagementStore>((set) => ({
  cashHistory: [],
  loading: false,
  error: null,

  setCashManagement: async (data: CashManagement, accessToken: string) => {
    try {
      set({ loading: true, error: null })
      const response = await window.electron.ipcRenderer.invoke('set-cash-management', {data,access_token: accessToken}) as CashManagementResponse
      if (response.error) {
        throw new Error(response.error)
      }
      set((state) => ({
        cashHistory: [...state.cashHistory, data],
        loading: false
      }))
    } catch (error: any) {
      set({ error: error.message || 'An error occurred', loading: false })
    }
  },

  getCashHistory: async (from: string, to: string, accessToken: string) => {
    try {
      console.log(
        "cash history from:", from, "to:", to
      )
      set({ loading: true, error: null })
      const response = await window.electron.ipcRenderer.invoke('get-cash-management-history', {from, to, access_token: accessToken}) as CashManagementResponse
      if (response.error) {
        throw new Error(response.error)
      }
      console.log("get cash history response:", response)
      set({ cashHistory: response.docs || [], loading: false })
    } catch (error: any) {
      set({ error: error.message || 'An error occurred', loading: false })
    }
  }
}))
