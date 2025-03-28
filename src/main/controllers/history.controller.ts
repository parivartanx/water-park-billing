import { costumeBillingDB,lockerBillingDB, ticketBillingDB } from "../db";
import { TicketBilling } from "../types/ticket.billing";
import { LockerBilling } from "../types/locker.billing";
import { CostumeBilling } from "../types/costume.billing";

export const billingHistories = async ({from, to, type,searchStr}) => {
    try {
       if(searchStr !== '' && searchStr !== undefined && searchStr !== null) {
            /// search histories from ticketBillingDB, lockerBillingDB, costumeBillingDB
            const ticketHistories = await ticketBillingDB.find({
                selector: {
                    $or: [
                        { customerName: { $regex: new RegExp(searchStr, 'i') } },
                        { mobileNumber: { $regex: new RegExp(searchStr, 'i') } }
                    ]

                }
            }) as PouchDB.Find.FindResponse<TicketBilling>
            const lockerHistories = await lockerBillingDB.find({
                selector: {
                    $or: [
                        { customerName: { $regex: new RegExp(searchStr, 'i') } },
                        { mobileNumber: { $regex: new RegExp(searchStr, 'i') } }
                    ]
                }
            }) as PouchDB.Find.FindResponse<LockerBilling>
            const costumeHistories = await costumeBillingDB.find({
                selector: {
                    $or: [
                        { customerName: { $regex: new RegExp(searchStr, 'i') } },
                        { mobileNumber: { $regex: new RegExp(searchStr, 'i') } }
                    ]
                }
            }) as PouchDB.Find.FindResponse<CostumeBilling>
            return { ticketHistories, lockerHistories, costumeHistories }
       }

       // if from and to date is not provided then return error message
       if(!from || !to) {
            return { error: 'Please provide from and to date' }
       }

       /// from date 
       const fromDate = new Date(from).toISOString()
       /// to date
       const toDate = new Date(to).toISOString()
       /// if type === all then get all histories
       if(type === "all") {
            /// get all histories from ticketBillingDB, lockerBillingDB, costumeBillingDB
            const ticketHistories = await ticketBillingDB.find({
                selector: {
                    createdAt: { $gte: fromDate, $lte: toDate }
                }
            }) as PouchDB.Find.FindResponse<TicketBilling>
            const lockerHistories = await lockerBillingDB.find({
                selector: {
                    createdAt: { $gte: fromDate, $lte: toDate }
                }
            }) as PouchDB.Find.FindResponse<LockerBilling>
            const costumeHistories = await costumeBillingDB.find({
                selector: {
                    createdAt: { $gte: fromDate, $lte: toDate }
                }
            }) as PouchDB.Find.FindResponse<CostumeBilling>
            return { ticketHistories, lockerHistories, costumeHistories }
       }
       /// if type === ticket then get ticket histories
       if(type === "ticket") {
            /// get ticket histories from ticketBillingDB
            const ticketHistories = await ticketBillingDB.find({
                selector: {
                    createdAt: { $gte: fromDate, $lte: toDate }
                }
            }) as PouchDB.Find.FindResponse<TicketBilling>
            return { ticketHistories }
       }
       /// if type === locker then get locker histories
       if(type === "locker") {
            /// get locker histories from lockerBillingDB
            const lockerHistories = await lockerBillingDB.find({
                selector: {
                    createdAt: { $gte: fromDate, $lte: toDate }
                }
            }) as PouchDB.Find.FindResponse<LockerBilling>
            return { lockerHistories }
       }
       /// if type === costume then get costume histories
       if(type === "costume") {
            /// get costume histories from costumeBillingDB
            const costumeHistories = await costumeBillingDB.find({
                selector: {
                    createdAt: { $gte: fromDate, $lte: toDate }
                }
            }) as PouchDB.Find.FindResponse<CostumeBilling>
            return { costumeHistories }
       }
       
       // Default return for when type doesn't match any of the above conditions
       return { error: 'Invalid type provided. Type must be "all", "ticket", "locker", or "costume"' }
    } catch (error) {
        console.error('Error getting billing histories:', error)
        return { error: 'Failed to get billing histories' }
    }
}

/// recent billing histories limit 7
export const recentBillingHistories = async (limit: number) => {
    try {
        // Get date from 365 days ago to ensure we get some recent records
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoStr = oneYearAgo.toISOString();

        const ticketHistories = await ticketBillingDB.find({
            selector: {
                createdAt: { $gte: oneYearAgoStr }   
            },
            limit: limit
        }) as PouchDB.Find.FindResponse<TicketBilling>
        
        const lockerHistories = await lockerBillingDB.find({
            selector: {
                createdAt: { $gte: oneYearAgoStr }       
            },
            limit: limit
        }) as PouchDB.Find.FindResponse<LockerBilling>
        
        const costumeHistories = await costumeBillingDB.find({
            selector: {
                createdAt: { $gte: oneYearAgoStr }       
            },
            limit: limit
        }) as PouchDB.Find.FindResponse<CostumeBilling>
        
        // Sort the results manually in memory since we can't use PouchDB's sort without an index
        if (ticketHistories.docs) {
            ticketHistories.docs.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }
        
        if (lockerHistories.docs) {
            lockerHistories.docs.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }
        
        if (costumeHistories.docs) {
            costumeHistories.docs.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
        }
        
        return { ticketHistories, lockerHistories, costumeHistories }
    } catch (error) {
        console.error('Error getting recent billing histories:', error)
        return { error: 'Failed to get recent billing histories' }
    }
}
