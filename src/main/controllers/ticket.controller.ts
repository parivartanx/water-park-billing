import { ticketDB, ticketBillingDB } from "../db";
import { TicketBilling } from "../types/ticket.billing";
import { Ticket } from "../types/ticket"; 
import { decodeToken } from "./auth.controller";
import { printTicket } from "./print-bill.controller";

// get tickets
export const getTickets = async (): Promise<Ticket[]> => {
    try {
        const tickets = await ticketDB.find({
            selector: {
                status: { $in: ["active","Active"] }
            }
        })
        return tickets.docs as unknown as Ticket[]
    } catch (error) {
        console.error('Error getting tickets:', error)
        return []
    }
}

// get ticket by id
export const getTicketById = async (id: string): Promise<Ticket[] | null> => {
    try {
        const ticket = await ticketDB.find({
            selector: {
                _id: id 
            }
        })
        return ticket.docs as unknown as Ticket[]
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

        /// print 
        await printTicket(billing)
        return await ticketBillingDB.post(billing)
    } catch (error) {
        console.error('Error saving ticket billing:', error);
        throw error;
    }
}

/// write function to print ticket using escpos 
