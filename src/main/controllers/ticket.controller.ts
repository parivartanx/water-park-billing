import { ticketDB, } from "../db";


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


