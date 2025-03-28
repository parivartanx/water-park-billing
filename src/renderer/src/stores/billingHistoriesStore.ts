/// billingHistoriesStore   

import { BillingHistories, BillingHistoryParams, BillingHistoryResponse, UnifiedBill } from "../types/billing-histories";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import { TicketBilling } from "../types/ticket.billing";
import { LockerBilling } from "../types/locker.billing";
import { CostumeBill } from "../types/costume-billing";

export interface BillingHistoryStore {
  loading: boolean;
  error: string | null;
  billingHistories: BillingHistories;
  unifiedBills: UnifiedBill[];
  getBillingHistories: (from: string, to: string, type: 'all' | 'ticket' | 'locker' | 'costume', searchStr: string) => Promise<void>;
  transformToUnifiedBills: (billingHistories: BillingHistories) => UnifiedBill[];
  clearHistories: () => void;
  getRecentBillingHistories: (limit: number) => Promise<void>;
}

const initialState: Omit<BillingHistoryStore, 'getBillingHistories' | 'transformToUnifiedBills' | 'clearHistories' | 'getRecentBillingHistories'> = {
  loading: false,
  error: null,
  billingHistories: {
    ticketHistories: [],
    lockerHistories: [],
    costumeHistories: []
  },
  unifiedBills: []
};

// Helper function to transform ticket billings to unified bills
const transformTicketBillings = (tickets: TicketBilling[] = []): UnifiedBill[] => {
  return tickets.map(ticket => ({
    id: ticket._id || `ticket-${Date.now()}-${Math.random()}`,
    customerName: ticket.customerName,
    phone: ticket.mobileNumber,
    date: ticket.createdAt ? new Date(ticket.createdAt).toISOString() : new Date().toISOString(),
    quantity: ticket.tickets.reduce((sum, t) => sum + t.quantity, 0),
    type: 'ticket',
    totalAmount: ticket.total,
    returned: false, // Tickets don't have a returned status
    originalData: ticket
  }));
};

// Helper function to transform locker billings to unified bills
const transformLockerBillings = (lockers: LockerBilling[] = []): UnifiedBill[] => {
  return lockers.map(locker => ({
    id: locker._id || `locker-${Date.now()}-${Math.random()}`,
    customerName: locker.customerName,
    phone: locker.mobileNumber,
    date: locker.createdAt ? new Date(locker.createdAt).toISOString() : new Date().toISOString(),
    quantity: locker.lockerIds.length,
    type: 'locker',
    totalAmount: locker.total,
    returned: locker.isReturned,
    originalData: locker
  }));
};

// Helper function to transform costume billings to unified bills
const transformCostumeBillings = (costumes: CostumeBill[] = []): UnifiedBill[] => {
  return costumes.map(costume => ({
    id: costume._id || `costume-${Date.now()}-${Math.random()}`,
    customerName: costume.customerName,
    phone: costume.customerNumber,
    date: costume.createdAt || new Date().toISOString(),
    quantity: costume.costumes.reduce((sum, c) => sum + c.quantity, 0),
    type: 'costume',
    totalAmount: costume.total,
    returned: costume.isReturned,
    originalData: costume
  }));
};

export const useBillingHistoryStore = create<BillingHistoryStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Transform billing histories to unified bills for UI display
      transformToUnifiedBills: (billingHistories: BillingHistories): UnifiedBill[] => {
        const ticketBills = transformTicketBillings(billingHistories.ticketHistories);
        const lockerBills = transformLockerBillings(billingHistories.lockerHistories);
        const costumeBills = transformCostumeBillings(billingHistories.costumeHistories);
        
        // Combine all bill types and sort by date (newest first)
        return [...ticketBills, ...lockerBills, ...costumeBills]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      // Clear all history data
      clearHistories: () => {
        set({
          billingHistories: {
            ticketHistories: [],
            lockerHistories: [],
            costumeHistories: []
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
          console.log("Recent booking response ", response)
          // Type guard to ensure response has the correct structure
          const isValidResponse = (res: unknown): res is {
            ticketHistories?: { docs?: TicketBilling[] },
            lockerHistories?: { docs?: LockerBilling[] },
            costumeHistories?: { docs?: CostumeBill[] },
            error?: string
          } => {
            return typeof res === 'object' && res !== null && 
              ('ticketHistories' in res || 'lockerHistories' in res || 'costumeHistories' in res || 'error' in res);
          };
          
          if (!isValidResponse(response)) {
            throw new Error('Invalid response format');
          }
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          const billingHistories: BillingHistories = {
            ticketHistories: response.ticketHistories?.docs || [],
            lockerHistories: response.lockerHistories?.docs || [],
            costumeHistories: response.costumeHistories?.docs || []
          };
          
          set({
            billingHistories,
            unifiedBills: get().transformToUnifiedBills(billingHistories),
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
          
          // Process the response data
          const processedData: BillingHistories = {
            ticketHistories: response.ticketHistories?.docs || [],
            lockerHistories: response.lockerHistories?.docs || [],
            costumeHistories: response.costumeHistories?.docs || []
          };
          
          // Transform to unified bills for UI display
          const unifiedBills = get().transformToUnifiedBills(processedData);
          
          // Update state with processed data
          set({ 
            billingHistories: processedData,
            unifiedBills,
            loading: false,
            error: null
          });
          
          // Show success message if search was performed
          if (searchStr) {
            // const totalResults = unifiedBills.length;
            // toast.success(`Found ${totalResults} result${totalResults !== 1 ? 's' : ''}`);
          }
        } catch (error) {
          console.error('Error getting billing histories:', error);
          const errorMessage = 'Failed to fetch billing histories';
          set({ 
            error: errorMessage, 
            loading: false 
          });
          toast.error(errorMessage);
        }
      }
    }),
    {
      name: 'billing-history-storage', // unique name for localStorage
      partialize: (state) => ({
        // Only persist these fields to localStorage
        billingHistories: state.billingHistories,
        unifiedBills: state.unifiedBills
      })
    }
  )
);
