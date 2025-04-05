import { UnifiedBilling } from "./unified-billing"

export interface BillingHistories {
    unifiedBills?: UnifiedBilling[]
    error?: string
}

export interface BillingHistoryParams {
    from?: string
    to?: string
    type: 'all' | 'ticket' | 'locker' | 'costume'
    searchStr?: string
}

export interface BillingHistoryResponse {
    unifiedBills?: UnifiedBilling[]
    error?: string
}


// // Unified bill type for display in the UI
// export interface UnifiedBill {
//     id: string
//     customerName: string
//     phone: string
//     date: string
//     quantity: number
//     type: 'ticket' | 'locker' | 'costume'
//     totalAmount: number
//     returned: boolean
//     originalData: TicketBilling | LockerBilling | CostumeBill
// }