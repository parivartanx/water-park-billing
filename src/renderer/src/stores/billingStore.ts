import { UnifiedBilling } from "@renderer/types/unified-billing";
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

/// create separate store for unified billing
export interface UnifiedBillingState {
    loading: boolean
    error: string | null
    success: boolean
    unifiedBilling: UnifiedBilling | null
    reset: () => void
    createUnifiedBilling: (billingData: UnifiedBilling, access_token: string) => Promise<UnifiedBilling | null>
}

export const useUnifiedBillingStore = create<UnifiedBillingState>((set)=>{
   return {
    loading: false,
    error: null,
    success: false,
    unifiedBilling: null,
    reset: () => {
        set({
            loading: false,
            error: null,
            success: false,
            unifiedBilling: null
        })
    },
    createUnifiedBilling: async (billingData: UnifiedBilling, access_token: string) => {
        try {
            set({ loading: true, error: null, success: false })
            
            // Add timestamps
            billingData.createdAt = new Date().toISOString()
            billingData.updatedAt = new Date().toISOString()
            
            // Set default values for some fields if not provided
            if (billingData.gstAmount === undefined) billingData.gstAmount = 0
            if (billingData.isReturned === undefined) billingData.isReturned = false
            
            // Define response type
            interface UnifiedBillingResponse {
                success?: boolean;
                error?: string;
                data?: {
                    id?: string;
                    ok?: boolean;
                    rev?: string;
                };
            }
            
            const response = await window.electron.ipcRenderer.invoke('create-unified-billing', { billingData, access_token }) as UnifiedBillingResponse
            
            if (response.error) {
                set({ error: response.error, loading: false, success: false })
                toast.error(`Failed to create billing: ${response.error}`)
                return null
            }
            
            // Handle successful response
            set({ 
                unifiedBilling: billingData, 
                loading: false, 
                success: true 
            })
            
            toast.success('Billing created successfully!')
            return billingData
        } catch (error) {
            console.error('Error creating unified billing:', error)
            set({ 
                error: 'Failed to create unified billing', 
                loading: false, 
                success: false 
            })
            toast.error('Failed to create unified billing')
            return null
        }
    }
   }
})