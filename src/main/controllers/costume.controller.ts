import { costumeDB, costumeBillingDB } from "../db";

import { CostumeStock } from "../types/costume.stock";
import type PouchDB from 'pouchdb';
import { decodeToken } from "./auth.controller";
import { CostumeBilling } from "../types/costume.billing";
import { printCostumeBill } from "./print-bill.controller";

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

        // console.log("Customer Name:",costumeBilling.customerName)
        // console.log("Customer Number:",costumeBilling.customerNumber)
        // console.log("Costumes:",costumeBilling.costumes)
        // console.log("Total:",costumeBilling.total)
        // console.log("Is Returned:",costumeBilling.isReturned)
        // console.log("Discount:",costumeBilling.discount)
        // console.log("Discount Type:",costumeBilling.discountType)
        // console.log("Payment Mode:",costumeBilling.paymentMode)
        // console.log("Subtotal:",costumeBilling.subtotal)
        // console.log("Discount Amount:",costumeBilling.discountAmount)
        // console.log("GST Amount:",costumeBilling.gstAmount)
        
        /// validate the costume billing
        if(!costumeBilling.customerName || !costumeBilling.customerNumber || costumeBilling.costumes.length === 0 || !costumeBilling.total) {
            return { error: 'Invalid costume billing Details' }
        }

        /// update the costumes stock 
        for(const costume of costumeBilling.costumes){
           /// get the costume stock by id 
           if(!costume._id) {
            return { error: 'Invalid Costume Id ' }
           }
           const costumeStock = await costumeDB.find(
            {
                selector: {
                    _id: costume._id
                }
            }
           )as PouchDB.Find.FindResponse<CostumeStock>
           if(costumeStock.docs.length === 0) {
            return { error: 'Invalid Costume Stock' }
           }
           /// decrement the quantity
           const updatedCostumeStock = {
            ...costumeStock.docs[0],
            quantity: costumeStock.docs[0].quantity - costume.quantity
           }
           await costumeDB.put({
            ...updatedCostumeStock,
            _id: costumeStock.docs[0]._id,
            _rev: costumeStock.docs[0]._rev
           })
        }

        /// save the costume billing
        

        costumeBilling.createdBy = decoded.id
        costumeBilling.createdAt = new Date().toISOString()
        costumeBilling.updatedAt = new Date().toISOString()
        
        /// print 
        await printCostumeBill(costumeBilling)
        const response = await costumeBillingDB.post(costumeBilling) as PouchDB.Core.Response
        return { success: true, data: response }
    } catch (error) {
        console.log(error)
        return { error: 'Failed to create costume billing' }
    }
}

/// get costume billing by customer phone no , sort by createdAt desc
export const getCostumeBillingByCustomerPhone = async (customerPhone: string, access_token: string) => {
    try {
        /// check if the customer phone is valid
        if(!customerPhone) {
            return { error: 'Invalid Customer Phone' }
        }

        /// decode access token
        const decode = decodeToken(access_token)
        if(!decode) {
            return { error: 'Invalid Access Token' }
        }

        // Query using the indexed field
        const costumeBilling = await costumeBillingDB.find({
            selector: {
                customerNumber: customerPhone,
                isReturned: false
            },
            // Limit to get only the most recent ones
            limit: 10
        }) as PouchDB.Find.FindResponse<CostumeBilling>
        
        // If no results, return null
        if(!costumeBilling.docs.length) {
            return { error: 'No Costume Billing Found' }
        }

        // Sort manually by createdAt since we can't use sort in the query
        const sortedDocs = costumeBilling.docs.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // descending order (newest first)
        });
        let refundAmount = 0
        /// get costume from stock by id and extract category, size, and refundPrice and update costume object 
       const firstdoc = sortedDocs[0]
       for(const costume of firstdoc.costumes) {
        const costumeStock = await costumeDB.find({
            selector: {
                _id: costume._id
            }
        }) as PouchDB.Find.FindResponse<CostumeStock>
        if(!costumeStock.docs.length) {
            return { error: 'Invalid Costume Stock' }
        }
        costume.category = costumeStock.docs[0].category
        costume.size = costumeStock.docs[0].size
        costume.refundPrice = costumeStock.docs[0].refundPrice
        refundAmount += costume.quantity * costume.refundPrice
       }
       firstdoc.refundAmount = refundAmount


        // console.log(sortedDocs)
        // Return the first (most recent) document
        return sortedDocs[0];
    } catch (error) {
        console.error('Error getting costume billing by customer phone:', error)
        return null
    }
}

/// refund the costumes billing
export const refundCostumeBilling = async (id: string, access_token: string) => {
    try {
        /// check access token
        const token = decodeToken(access_token)
        if(!token) {
            return { error: 'Invalid Access Token' }
        }
        /// check if user is authorized
        
            /// get the latest billing
            const billingDetails = await costumeBillingDB.find({
                selector: {
                    _id: id
                }
            }) as PouchDB.Find.FindResponse<CostumeBilling>
            if(!billingDetails.docs.length) {
                return { error: 'Invalid Billing' }
            }
            const billing = billingDetails.docs[0]
            /// extract costumes 
            const costumes = billing.costumes
            /// update costumes stock
            for(const costume of costumes) {
                const costumeStock = await costumeDB.find({
                    selector: {
                        _id: costume._id
                    }
                }) as PouchDB.Find.FindResponse<CostumeStock>
                if(!costumeStock.docs.length) {
                    return { error: 'Invalid Costume Stock' }
                }
                const stock = costumeStock.docs[0]
                stock.quantity += costume.quantity
                await costumeDB.put(stock)
            }
            /// update billing
            billing.isReturned = true
            await costumeBillingDB.put(billing)
            /// return success
            return {id: id, success: 'Costume billing refunded successfully' }
            
       } catch (error) {
        console.log(error)
        return { error: 'Failed to refund costume billing' }
    }
}


