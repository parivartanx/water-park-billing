import { TicketBilling } from "./ticket.billing"
import { LockerBilling } from "./locker.billing"
import { CostumeBill } from "./costume-billing"

export interface BillingHistories {
    ticketHistories?: TicketBilling[]
    lockerHistories?: LockerBilling[]
    costumeHistories?: CostumeBill[]
    error?: string
}

export interface BillingHistoryParams {
    from?: string
    to?: string
    type: 'all' | 'ticket' | 'locker' | 'costume'
    searchStr?: string
}

export interface BillingHistoryResponse {
    ticketHistories?: PouchDB.Find.FindResponse<TicketBilling>
    lockerHistories?: PouchDB.Find.FindResponse<LockerBilling>
    costumeHistories?: PouchDB.Find.FindResponse<CostumeBill>
    error?: string
}

// Unified bill type for display in the UI
export interface UnifiedBill {
    id: string
    customerName: string
    phone: string
    date: string
    quantity: number
    type: 'ticket' | 'locker' | 'costume'
    totalAmount: number
    returned: boolean
    originalData: TicketBilling | LockerBilling | CostumeBill
}