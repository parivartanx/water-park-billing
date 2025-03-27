import { CostumeBill } from "@renderer/types/costume-billing"
import { CostumeStock } from "@renderer/types/costume-stock"
import type { ValidChannel } from "../types/electron";

import toast from "react-hot-toast"
import { create } from "zustand"

// Define response type for costume stock operations
interface CostumeStockResponse {
  success?: boolean
  error?: string
  data?: {
    id?: string
    ok?: boolean
    rev?: string
  } | CostumeStock[]
  costumeStock?: CostumeStock[]
}

// Define response type for costume billing operations
interface CostumeBillingResponse {
  success?: boolean
  error?: string
  data?: {
    id?: string
    ok?: boolean
    rev?: string
  }
}

// costume store
export interface CostumeStore {
  loading: boolean
  error: string | null
  costumeStock: CostumeStock[]
  getCostumeStock: () => Promise<void>
  createCostumeStock: (costumeStock: CostumeStock, access_token: string) => Promise<void>
  createCostumeBilling: (costumeBilling: CostumeBill, access_token: string) => Promise<CostumeBillingResponse>
}

export const initialCostumeStore: CostumeStore = {
  loading: false,
  error: null,
  costumeStock: [],
  getCostumeStock: async () => {},
  createCostumeStock: async () => {},
  createCostumeBilling: async () => ({ success: false } as CostumeBillingResponse)
}

export const useCostumeStockStore = create<CostumeStore>()((set) => ({
  ...initialCostumeStore,
  getCostumeStock: async () => {
    try {
      set({ loading: true, error: null })
      const response = await window.electron.ipcRenderer.invoke('get-costume-stock',{}) as CostumeStockResponse
      
      if (response.error) {
        set({ error: response.error, loading: false })
        return
      }
      
      // Handle the response data which could be in different formats
      const stockData = response.data && Array.isArray(response.data) 
        ? response.data 
        : response.costumeStock || []
        
      set({ 
        costumeStock: stockData, 
        loading: false 
      })
    } catch (error) {
      console.error('Error fetching costume stock:', error)
      set({ 
        error: 'Failed to fetch costume stock data', 
        loading: false 
      })
    }
  },
  createCostumeStock: async (costumeStock, access_token) => {
    try {
      set({ loading: true, error: null })
      const response = await window.electron.ipcRenderer.invoke('create-costume-stock' as ValidChannel, { 
        costumeStock, 
        access_token 
      }) as CostumeStockResponse

      console.log('Response:', response)
      
      if (response.error) {
        set({ error: response.error, loading: false })
        return
      }
      
      // After successful creation, update the store with the latest data
      // This might come directly from the response or we might need to fetch it again
      if (response.success) {
        set({ 
          error: null,
          loading: false 
        })
        toast.success('Costume stock created successfully')
      } 
      try {
        const stockResponse = await window.electron.ipcRenderer.invoke('get-costume-stock') as CostumeStockResponse
        
        if (stockResponse.error) {
          set({ error: stockResponse.error, loading: false })
          return
        }
        
        const stockData = stockResponse.data && Array.isArray(stockResponse.data) 
          ? stockResponse.data 
          : stockResponse.costumeStock || []
          
        set({ 
          costumeStock: stockData, 
          loading: false 
        })
      } catch (fetchError) {
        console.error('Error fetching updated costume stock:', fetchError)
        set({ 
          error: 'Created costume stock but failed to fetch updated data', 
          loading: false 
        })
      }
    } catch (error) {
      console.error('Error creating costume stock:', error)
      set({ 
        error: 'Failed to create costume stock', 
        loading: false 
      })
    }
  },
  createCostumeBilling: async (costumeBilling, access_token) => {
    try {
      set({ loading: true, error: null })
      const response = await window.electron.ipcRenderer.invoke('create-costume-billing' as ValidChannel, { 
        costumeBilling, 
        access_token 
      }) as CostumeStockResponse
      
      if (response.error) {
        set({ error: response.error, loading: false })
        return { error: response.error } as CostumeBillingResponse
      }
      
      // After successful creation, update the store with the latest data
      if (response.success) {
        set({ 
          error: null,
          loading: false 
        })
        toast.success('Costume billing created successfully')
        return { success: true, data: response.data } as CostumeBillingResponse
      } 
      
      // Default return if no success or error is explicitly set
      set({ loading: false })
      return response as CostumeBillingResponse
    } catch (error) {
      console.error('Error creating costume billing:', error)
      set({ 
        error: 'Failed to create costume billing', 
        loading: false 
      })
      return { error: 'Failed to create costume billing' } as CostumeBillingResponse
    }
  }
}))
