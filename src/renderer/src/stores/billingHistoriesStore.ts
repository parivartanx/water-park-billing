/// billingHistoriesStore   

import { BillingHistories, BillingHistoryParams, BillingHistoryResponse } from "../types/billing-histories";
import { UnifiedBilling } from "../types/unified-billing";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";

export interface BillingHistoryStore {
  loading: boolean;
  error: string | null;
  billingHistories: BillingHistories;
  unifiedBills: UnifiedBilling[];
  getBillingHistories: (from: string, to: string, type: 'all' | 'ticket' | 'locker' | 'costume', searchStr: string) => Promise<void>;
  clearHistories: () => void;
  getRecentBillingHistories: (limit: number) => Promise<void>;
}

const initialState: Omit<BillingHistoryStore, 'getBillingHistories' | 'clearHistories' | 'getRecentBillingHistories'> = {
  loading: false,
  error: null,
  billingHistories: {
    unifiedBills: [],
    error: undefined
  },
  unifiedBills: []
};

export const useBillingHistoryStore = create<BillingHistoryStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      // Clear all history data
      clearHistories: () => {
        set({
          billingHistories: {
            unifiedBills: [],
            error: undefined
          },
          unifiedBills: [],
          error: null
        });
      },

      // Fetch recent billing histories from the main process
      getRecentBillingHistories: async (limit: number) => {
        try {
          set({ loading: true, error: null });
          const response = await window.electron.ipcRenderer.invoke('get-recent-billing-histories', { limit });
          console.log("Recent booking response ", response);
          
          // Type guard to ensure response has the correct structure
          const isValidResponse = (res: unknown): res is {
            unifiedBills?: UnifiedBilling[],
            error?: string
          } => {
            return typeof res === 'object' && res !== null && 
              ('unifiedBills' in res || 'error' in res);
          };
          
          if (!isValidResponse(response)) {
            throw new Error('Invalid response format');
          }
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          const billingHistories: BillingHistories = {
            unifiedBills: response.unifiedBills || [],
            error: undefined
          };
          
          set({
            billingHistories,
            unifiedBills: response.unifiedBills || [],
            loading: false
          });
        } catch (error) {
          console.error('Error getting recent billing histories:', error);
          set({ error: 'Failed to get recent billing histories', loading: false });
        }
      },
      
      // Fetch billing histories from the main process
      getBillingHistories: async (from: string, to: string, type: 'all' | 'ticket' | 'locker' | 'costume', searchStr: string) => {
        try {
          set({ loading: true, error: null });
          
          // Prepare params based on search or date range
          const params: BillingHistoryParams = {
            type,
            searchStr: searchStr || undefined,
            from: from || undefined,
            to: to || undefined
          };
          
          // Call the IPC channel to get billing histories
          const response = await window.electron.ipcRenderer.invoke(
            'get-billing-histories', 
            params
          ) as BillingHistoryResponse;
          
          // Handle error in response
          if (response.error) {
            set({ 
              error: response.error, 
              loading: false 
            });
            toast.error(response.error);
            return;
          }
          
          // Update state with the unified bills
          set({ 
            billingHistories: {
              unifiedBills: response.unifiedBills || [],
              error: undefined
            },
            unifiedBills: response.unifiedBills || [],
            loading: false
          });
          
        } catch (error) {
          console.error('Error getting billing histories:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to get billing histories';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      }
    }),
    {
      name: 'billing-history-store',
      partialize: (state) => ({
        billingHistories: state.billingHistories,
        unifiedBills: state.unifiedBills
      })
    }
  )
);
