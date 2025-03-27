import { costumeDB, costumeBillingDB } from "../db";

import { CostumeStock } from "../types/costume.stock";
import type PouchDB from 'pouchdb';
import { decodeToken } from "./auth.controller";
import { CostumeBilling } from "../types/costume.billing";

export const getCostumeStock = async () => {
    try {
        const response = await costumeDB.find({
            selector: {}
        }) as PouchDB.Find.FindResponse<CostumeStock>
        return { success: true, data: response.docs }
    } catch (error) {
        console.log(error)
        return { error: 'Failed to get costume stock' }
    }
}

export const createCostumeStock = async (costumeStock: CostumeStock, access_token: string) => {
    try {
        const decoded = decodeToken(access_token)
        if(!decoded) {
            return { error: 'Unauthorized to create costume stock' }
        }
        /// validate the costume stock
        if(!costumeStock.category || !costumeStock.size || !costumeStock.quantity || !costumeStock.pricePerUnit) {
            return { error: 'Invalid costume stock' }
        }

        costumeStock.createdBy = decoded.id
        costumeStock.createdAt = new Date().toISOString()
        costumeStock.updatedAt = new Date().toISOString()

        ///TODO: check if the costume stock already exists
        const existingCostumeStock = await costumeDB.find({
            selector: {
                category: costumeStock.category,
                size: costumeStock.size
            }
        }) as PouchDB.Find.FindResponse<CostumeStock>
        if(existingCostumeStock.docs.length) {
            /// update the existing costume stock
            /// increment the quantity
            const updatedCostumeStock = {
                ...costumeStock,
                quantity: existingCostumeStock.docs[0].quantity + costumeStock.quantity,
                pricePerUnit: costumeStock.pricePerUnit
            }
            const response = await costumeDB.put({
                ...updatedCostumeStock,
                _id: existingCostumeStock.docs[0]._id,
                _rev: existingCostumeStock.docs[0]._rev
            }) as PouchDB.Core.Response
            return { success: true, data: response }
        }
        const response = await costumeDB.post(costumeStock) as PouchDB.Core.Response
        return { success: true, data: response }
    } catch (error) {
        console.log(error)
        return { error: 'Failed to create costume stock' }
    }
}

/// delete costume stock
export const deleteCostumeStock = async (id: string) => {
    try {
        // First get the document to retrieve its _rev
        const doc = await costumeDB.get(id);
        // Then remove using both id and rev
        const response = await costumeDB.remove(doc._id, doc._rev);
        return { success: true, data: response };
    } catch (error) {
        console.log(error);
        return { error: 'Failed to delete costume stock' };
    }
}

/// create costume billing
export const createCostumeBilling = async (costumeBilling: CostumeBilling, access_token: string) => {
    try {
        const decoded = decodeToken(access_token)
        if(!decoded) {
            return { error: 'Unauthorized to create costume billing' }
        }

        console.log("Customer Name:",costumeBilling.customerName)
        console.log("Customer Number:",costumeBilling.customerNumber)
        console.log("Costumes:",costumeBilling.costumes)
        console.log("Total:",costumeBilling.total)
        console.log("Is Returned:",costumeBilling.isReturned)
        console.log("Discount:",costumeBilling.discount)
        console.log("Discount Type:",costumeBilling.discountType)
        console.log("Payment Mode:",costumeBilling.paymentMode)
        console.log("Subtotal:",costumeBilling.subtotal)
        console.log("Discount Amount:",costumeBilling.discountAmount)
        console.log("GST Amount:",costumeBilling.gstAmount)
        
        /// validate the costume billing
        if(!costumeBilling.customerName) {
            return { error: 'Invalid costume billing' }
        }

        costumeBilling.createdBy = decoded.id
        costumeBilling.createdAt = new Date().toISOString()
        costumeBilling.updatedAt = new Date().toISOString()
        
        const response = await costumeBillingDB.post(costumeBilling) as PouchDB.Core.Response
        return { success: true, data: response }
    } catch (error) {
        console.log(error)
        return { error: 'Failed to create costume billing' }
    }
}
