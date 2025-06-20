import { unifiedBillingDB } from "../db";
import { UnifiedBilling } from "../types/billing.types";
import { decodeToken } from "./auth.controller";
import { todayISTDateTime } from "./ist.controller";

///ignore linting for type 
export const billingHistories = async ({from, to, type, searchStr, access_token}) => {
    try {
        /// type is not used
        console.log(type)
        // Verify access token
        const token = decodeToken(access_token);
        if (!token) {
            return { error: 'Invalid access token' };
        }
       
       if(searchStr !== '' && searchStr !== undefined && searchStr !== null) {
            // Search histories from unifiedBillingDB
            const unifiedBills = await unifiedBillingDB.find({
                selector: {
                    $or: [
                        { customerName: { $regex: new RegExp(searchStr, 'i') } },
                        { customerNumber: { $regex: new RegExp(searchStr, 'i') } }
                    ],
                    createdBy: token.id
                }
            }) as PouchDB.Find.FindResponse<UnifiedBilling>;
            
            return { unifiedBills: unifiedBills.docs || [] };
       }

       // if from and to date is not provided then return error message
       if(!from || !to) {
            return { error: 'Please provide from and to date' };
       }

       /// from date 
       const fromDate = todayISTDateTime();
    //    console.log("From date", fromDate)
       /// to date
       const toDate = todayISTDateTime();
       fromDate.setHours(0, 0, 0, 0); // Set to start of day
       toDate.setHours(23, 59, 59, 999); // Set to end of day
        //  console.log("To date", toDate)

        const billMonth = fromDate.getMonth() + 1; // Months are 0-indexed in JavaScript
        const billDay = fromDate.getDate();
        const billYear = fromDate.getFullYear();

        const billDate = `${billMonth}/${billDay}/${billYear}`;

       // Base selector for date range
       const dateSelector = {
        //    createdAt: { $gte: fromDate.toISOString(), $lte: toDate.toISOString() },
              billDate: billDate,
           createdBy: token.id
       };

       
       console.log("today billing histories", dateSelector)
       
       /// if type === all then get all unified bills
  
            const unifiedBills = await unifiedBillingDB.find({
                selector: {
                    ...dateSelector,
                }
            }) as PouchDB.Find.FindResponse<UnifiedBilling>;

            // console.log("Unified Bills for history", unifiedBills);

            return { unifiedBills: unifiedBills.docs || [] };
       
       
    //    /// if type === ticket then get unified bills with tickets
    //    if(type === "ticket") {
    //         const unifiedBills = await unifiedBillingDB.find({
    //             selector: {
    //                 ...dateSelector,
    //                 "tickets.0": { $exists: true }
    //             }
    //         }) as PouchDB.Find.FindResponse<UnifiedBilling>;
            
    //         return { unifiedBills: unifiedBills.docs || [] };
    //    }
       
    //    /// if type === locker then get unified bills with lockers
    //    if(type === "locker") {
    //         const unifiedBills = await unifiedBillingDB.find({
    //             selector: {
    //                 ...dateSelector,
    //                 "lockers.0": { $exists: true }
    //             }
    //         }) as PouchDB.Find.FindResponse<UnifiedBilling>;
            
    //         return { unifiedBills: unifiedBills.docs || [] };
    //    }
       
    //    /// if type === costume then get unified bills with costumes
    //    if(type === "costume") {
    //         const unifiedBills = await unifiedBillingDB.find({
    //             selector: {
    //                 ...dateSelector,
    //                 "costumes.0": { $exists: true }
    //             }
    //         }) as PouchDB.Find.FindResponse<UnifiedBilling>;
            
    //         return { unifiedBills: unifiedBills.docs || [] };
    //    }
       
    //    // Default return for when type doesn't match any of the above conditions
    //    return { error: 'Invalid type provided. Type must be "all", "ticket", "locker", or "costume"' };
    } catch (error) {
        console.error('Error getting billing histories:', error);
        return { error: 'Failed to get billing histories' };
    }
}

/// recent billing histories limit 7
export const recentBillingHistories = async (limit: number, access_token: string) => {
    try {
        // Verify access token
        const token = decodeToken(access_token);
        if (!token) {
            return { error: 'Invalid access token' };
        }
        
        // Get today's date at midnight (start of day)
        const today = todayISTDateTime();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();
        
        // Get tomorrow's date at midnight (for end of range)
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString();

        // Get today's unified bills
        const unifiedBills = await unifiedBillingDB.find({
            selector: {
                createdAt: { $gte: todayStr, $lt: tomorrowStr },
                createdBy: token.id
            },
            limit: limit
        }) as PouchDB.Find.FindResponse<UnifiedBilling>;
        
        // Sort the results by createdAt in descending order
        if (unifiedBills.docs) {
            unifiedBills.docs.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });
            
            // Format dates to remove time part (keep only YYYY-MM-DD)
            unifiedBills.docs = unifiedBills.docs.map(bill => {
                if (bill.createdAt) {
                    // Create a new date object from the ISO string
                    const date = new Date(bill.createdAt);
                    // Format to YYYY-MM-DD
                    const formattedDate = date.toISOString().split('T')[0];
                    
                    // Return a new object with formatted date
                    return {
                        ...bill,
                        createdAt: formattedDate
                    };
                }
                return bill;
            });
        }
        
        return { unifiedBills: unifiedBills.docs || [] };
    } catch (error) {
        console.error('Error getting today\'s billing histories:', error);
        return { error: 'Failed to get today\'s billing histories' };
    }
}
