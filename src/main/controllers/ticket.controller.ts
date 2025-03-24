import { ticketDB, ticketBillingDB } from "../db";
import { TicketBilling } from "../types/ticket.billing";
import { decodeToken } from "./auth.controller";

// get tickets
export const getTickets = async () => {
    try {
        const tickets = await ticketDB.find({
            selector: {
                status: { $in: ["active","Active"] }
            }
        })
        return tickets.docs
    } catch (error) {
        console.error('Error getting tickets:', error)
        return []
    }
}

// get ticket by id
export const getTicketById = async (id: string) => {
    try {
        const ticket = await ticketDB.find({
            selector: {
                id
            }
        })
        return ticket.docs
    } catch (error) {
        console.error('Error getting ticket by id:', error)
        return null
    }
}

/// ============================ Ticket billing functions ==============================
export const saveTicketBilling = async (billing: TicketBilling, access_token: string) => {
    try {
      
        const decoded = decodeToken(access_token)
        if(!decoded) {
            return { error: 'Unauthorized to save ticket billing' }
        }
        if(decoded.role !== "ticket"){
            return { error: 'Unauthorized to save ticket billing' }
        }
        billing.createdBy = decoded.id
        billing.createdAt = new Date().toISOString()
        billing.updatedAt = new Date().toISOString()
        return await ticketBillingDB.post(billing)
    } catch (error) {
        console.error('Error saving ticket billing:', error);
        throw error;
    }
}
