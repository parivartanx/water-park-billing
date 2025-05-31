import { lockerDB, lockerBillingDB } from "../db";
import { LockerBilling } from "../types/locker.billing";
import { Locker } from "../types/locker";
import { decodeToken } from "./auth.controller";
import { printLockerBill } from "./print-bill.controller";
import { todayISTDateTime } from "./ist.controller";

interface PouchResponse {
    ok?: boolean;
    id?: string;
    rev?: string;
    error?: boolean;
    name?: string;
    status?: number;
    message?: string;
}

// get lockers
export const getLockers = async () => {
    try {
        const lockers = await lockerDB.find({
            selector: {
                status: { $in: ["available", "Available"] },
                isDeleted: false
            }
        }) as PouchDB.Find.FindResponse<Locker>
        return lockers.docs
    } catch (error) {
        console.error('Error getting lockers:', error)
        return []
    }
}

/// get locker stock
export const getLockerStock = async () => {
    try {
        const lockers = await lockerDB.find({
            selector: {
                isDeleted: false
            }
        }) as PouchDB.Find.FindResponse<Locker>

        // total lockers
        const totalLockers = lockers.docs.length
        // available lockers
        const availableLockers = lockers.docs.filter(locker => locker.status === "available").length
        // occupied lockers
        const occupiedLockers = lockers.docs.filter(locker => locker.status === "occupied").length

        return { totalLockers, availableLockers, occupiedLockers }
    } catch (error) {
        console.error('Error getting locker stock:', error)
        return { error: 'Failed to get locker stock' }
    }
}

// create locker billing
export const createLockerBilling = async (lockerBilling: LockerBilling, access_token: string) => {
    try {
        const decoded = decodeToken(access_token)
        if(!decoded) {
            return { error: 'Unauthorized to create locker billing' }
        }
        ///TODO: active role check after testing 
        // if(decoded.role !== "locker") {
        //     return { error: 'Unauthorized to create locker billing' }
        // }
        console.log("Decoded is ", lockerBilling)
        lockerBilling.createdBy = decoded.id
        lockerBilling.createdAt = todayISTDateTime().toISOString()
        lockerBilling.updatedAt = todayISTDateTime().toISOString()
        /// write transaction query to update lockers as occupied
      

        const lockers = await lockerDB.find({
            selector: {
                _id: { $in: lockerBilling.lockerIds },
                isDeleted: false
            }
        }) as PouchDB.Find.FindResponse<Locker>
        if(!lockers.docs.length) {
            return { error: 'Lockers not found' }
        }
       
        // Update lockers with their current revisions
        const updateLockerResult = await lockerDB.bulkDocs(lockers.docs.map(locker => ({
            ...locker,  // This spreads all properties including _id and _rev
            status: "occupied",
            updatedAt: todayISTDateTime().toISOString()
        }))) as PouchResponse[];
        
        console.log("Update locker result is ", updateLockerResult)
        if(updateLockerResult.some(result => result.error)) {
            return { error: 'Failed to update lockers' }
        }

        /// print 
        await printLockerBill(lockerBilling)
        return await lockerBillingDB.post(lockerBilling)
    } catch (error) {
        console.error('Error creating locker billing:', error)
        return { error: 'Failed to create locker billing' }
    }
}

/// get locker billing by customer phone no , sort by createdAt desc
export async function getLockerBillingByCustomerPhone(customerPhone: string, access_token: string) {
    try {
        const decoded = decodeToken(access_token);
        if (!decoded) {
            return { error: 'Invalid token' }
        }

        const lockerBilling = await lockerBillingDB.find({
            selector: {
                mobileNumber: customerPhone,
                isDeleted: false
            }
        }) as PouchDB.Find.FindResponse<LockerBilling>;

        if(!lockerBilling.docs.length) {
            return { error: 'No locker billing found for this customer' }
        }


        /// sort by createdAt desc
        lockerBilling.docs.sort((a, b) => {
            return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        });

        /// get locker numbers  
        const lockerIds = lockerBilling.docs[0].lockerIds;
        
        const lockers = await lockerDB.find({
            selector: {
                _id: { $in: lockerIds },
                isDeleted: false
            }
        }) as PouchDB.Find.FindResponse<Locker>;
        
        if(!lockers.docs.length) {
            return { error: 'Lockers not found' }
        }
        let refundAmount = 0;
        lockers.docs.forEach(locker => {
            if(locker.status === 'occupied') {
                refundAmount += locker.refundAmount || 0;
            }
        })
        lockerBilling.docs[0].lockerNames = lockers.docs.map(locker => locker.lockerNo);
        lockerBilling.docs[0].lockerIds = lockerIds;
        lockerBilling.docs[0].refundAmount = refundAmount;
        
        return lockerBilling.docs[0];
    } catch (error) {
        console.error('Error getting locker billing by customer phone:', error)
        return { error: 'Failed to get locker billing by customer phone' }
    }
}

/// refund locker billing
export const refundLockerBilling = async (lockerBillingId: string, access_token: string) => {
    try {
        const decoded = decodeToken(access_token)
        if(!decoded) {
            return { error: 'Unauthorized to refund locker billing' }
        }

        
        // Get the locker billing
        const lockerBilling = await lockerBillingDB.get(lockerBillingId) as LockerBilling

        /// change locker status to available
        const lockers = await lockerDB.find({
            selector: {
                _id: { $in: lockerBilling.lockerIds },
                isDeleted: false
            }
        }) as PouchDB.Find.FindResponse<Locker>;
        
        if(!lockers.docs.length) {
            return { error: 'Lockers not found' }
        }
        
        lockers.docs.forEach(locker => {
            locker.status = 'available';
            locker.updatedAt = todayISTDateTime().toISOString();
        })
        
        // Check if already returned
        if (lockerBilling.isReturned) {
            return { error: 'Locker has already been returned' }
        }
        
        // Update locker billing
        const updatedLockerBilling = {
            ...lockerBilling,
            isReturned: true,
            updatedAt: todayISTDateTime().toISOString(),
            updatedBy: decoded.id
        }
        
        // Save updated locker billing
        await lockerBillingDB.put(updatedLockerBilling)
        await lockerDB.bulkDocs(lockers.docs)
        
        // Return success with refund amount
        return {
            success: true,
            message: 'Locker returned successfully'
        }
    } catch (error) {
        console.log('Error refunding locker billing:', error)
        return { error: `Failed to process locker refund: ${error}` }
    }
}
