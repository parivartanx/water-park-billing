import toast from "react-hot-toast";
import { create } from "zustand";

export interface CostumeRefundResponse {
    id?: string
    success?: string
    error?: string | null
}

export interface RefundState {
    loading: boolean
    error: string | null
    success: boolean
    refundId: string | null
    refundAmount: number | null
    refundDate: string | null
    reset: () => void
    refundCostumeBilling: (id: string, access_token: string) => Promise<CostumeRefundResponse | null>
}

export const useCostumeRefundStore = create<RefundState>((set) => ({
    loading: false,
    error: null,
    success: false,
    refundId: null,
    refundAmount: null,
    refundDate: null,
    reset: () => set({
        loading: false,
        error: null,
        success: false,
        refundId: null,
        refundAmount: null,
        refundDate: null
    }),
    refundCostumeBilling: async (id, access_token) => {
        try {
            // Reset any previous state and set loading
            set({ 
                loading: true, 
                error: null, 
                success: false,
                refundId: null,
                refundAmount: null,
                refundDate: null
            })

            // Show loading toast
            const loadingToast = toast.loading('Processing costume return...')
            
            const response = await window.electron.ipcRenderer.invoke(
                'refund-costume-billing', 
                { id, access_token }
            ) as CostumeRefundResponse
            
            // Dismiss the loading toast
            toast.dismiss(loadingToast)
            
            if (response.error) {
                toast.error(response.error)
                set({ 
                    loading: false, 
                    error: response.error, 
                    success: false 
                })
                return null
            }
            
            // Success state with refund details
            set({ 
                loading: false, 
                error: null, 
                success: true,
                refundId: id,
                refundAmount: null, // This would ideally come from the response
                refundDate: new Date().toISOString()
            })
            
            // Show success toast with auto-close
            toast.success(response.success || 'Costume returned successfully!', {
                duration: 5000,
                icon: '🎉'
            })
            
            return response
        } catch (error) {
            console.error('Error refunding costume billing:', error)
            const errorMessage = 'Failed to process costume return. Please try again.'
            
            set({ 
                error: errorMessage, 
                loading: false, 
                success: false 
            })
            
            toast.error(errorMessage, {
                duration: 5000
            })
            
            return null
        }
    }
}))