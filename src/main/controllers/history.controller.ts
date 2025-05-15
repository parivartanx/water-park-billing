import { unifiedBillingDB } from "../db";
import { UnifiedBilling } from "../types/billing.types";
import { decodeToken } from "./auth.controller";

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
       const fromDate = new Date(from).toISOString();
       /// to date
       const toDate = new Date(to).toISOString();
       
       // Base selector for date range
       const dateSelector = {
           createdAt: { $gte: fromDate, $lte: toDate },
           createdBy: token.id
       };
       
       /// if type === all then get all unified bills
  
            const unifiedBills = await unifiedBillingDB.find({
                selector: dateSelector
            }) as PouchDB.Find.FindResponse<UnifiedBilling>;
            
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
        
        // Get date from 365 days ago to ensure we get some recent records
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearAgoStr = oneYearAgo.toISOString();

        // Get recent unified bills
        const unifiedBills = await unifiedBillingDB.find({
            selector: {
                createdAt: { $gte: oneYearAgoStr },
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
        }
        
        return { unifiedBills: unifiedBills.docs || [] };
    } catch (error) {
        console.error('Error getting recent billing histories:', error);
        return { error: 'Failed to get recent billing histories' };
    }
}
