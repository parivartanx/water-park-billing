import { lockerDB, lockerBillingDB } from "../db";
import { LockerBilling } from "../types/locker.billing";
import { Locker } from "../types/locker";
import { decodeToken } from "./auth.controller";
import PouchDB from 'pouchdb';

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
                status: { $in: ["available", "Available"] }
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
            selector: {}
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
        lockerBilling.createdAt = new Date().toISOString()
        lockerBilling.updatedAt = new Date().toISOString()
        /// write transaction query to update lockers as occupied
      

        const lockers = await lockerDB.find({
            selector: {
                _id: { $in: lockerBilling.lockerIds }
            }
        }) as PouchDB.Find.FindResponse<Locker>
        if(!lockers.docs.length) {
            return { error: 'Lockers not found' }
        }
       
        // Update lockers with their current revisions
        const updateLockerResult = await lockerDB.bulkDocs(lockers.docs.map(locker => ({
            ...locker,  // This spreads all properties including _id and _rev
            status: "occupied",
            updatedAt: new Date().toISOString()
        }))) as PouchResponse[];
        
        console.log("Update locker result is ", updateLockerResult)
        if(updateLockerResult.some(result => result.error)) {
            return { error: 'Failed to update lockers' }
        }

        return await lockerBillingDB.post(lockerBilling)
    } catch (error) {
        console.error('Error creating locker billing:', error)
        return { error: 'Failed to create locker billing' }
    }
}
