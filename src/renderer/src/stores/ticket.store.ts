import { create } from 'zustand'
import { Ticket } from '../types/ticket'
import { TicketBilling } from '@renderer/types/ticket.billing'
import type { ValidChannel } from '../types/electron'

interface TicketStore {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  getTickets: () => Promise<Ticket[]>;
}

export const useTicketStore = create<TicketStore>((set,) => ({
  tickets: [],
  loading: false,
  error: null,
  getTickets: async () => {
    try {
      set({ loading: true, error: null })
      const tickets = await window.electron.ipcRenderer.invoke('get-tickets' as ValidChannel) as Ticket[];
      // console.log("Tickets are ", tickets)
      set({ tickets, loading: false });
      return tickets;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      return [];
    }
  }
}))


/// ticket billing store 

interface TicketBillingStore {
  bills:TicketBilling[];
  success: boolean;
  billingLoading: boolean;
  billingError: string | null;
  createTicketBilling: (ticketBilling: TicketBilling) => Promise<void>;
}

export const useTicketBillingStore = create<TicketBillingStore>((set) => ({
  bills: [],
  success: false,
  billingLoading: false,
  billingError: null,
  createTicketBilling: async (ticketBilling) => {
    try {
        /// get access token
        const access_token = localStorage.getItem('access_token') || ''
        if(!access_token) {
          set({ billingLoading: false, billingError: 'Unauthorized to create ticket billing', success: false })
          /// logout and move to sign in page 
          //TODO://
          return
        }
        
      set({ billingLoading: true, billingError: null, success: false })
      await window.electron.ipcRenderer.invoke('create-ticket-billing' as ValidChannel, {
        billing: ticketBilling,
        access_token
      })
      set({ success: true, billingLoading: false, billingError: null })
    } catch (error) {
      console.error('Error creating ticket billing:', error)
      set({ billingError: error instanceof Error ? error.message : 'Unknown error', billingLoading: false, success: false })
    }
  }
}))
