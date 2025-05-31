import { CostumeV2Item, UnifiedBilling } from '../types/billing.types';
import { decodeToken } from './auth.controller';
import PouchDBFind from 'pouchdb-find';
import PouchDB from 'pouchdb';

import { unifiedBillingDB, v2CostumeStockDB, lockerDB } from '../db';
import { Locker } from '../types/locker';
import { printUnifiedBilling } from './print-bill.controller';
import { todayISTDateTime } from './ist.controller';

// Initialize PouchDB with the find plugin
PouchDB.plugin(PouchDBFind);


/**
 * Create a new unified billing record
 * @param billingData The unified billing data
 * @param access_token Access token for authentication
 * @returns The created billing record or an error
 */
export const createUnifiedBilling = async (billingData: UnifiedBilling, access_token: string) => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return { error: 'Invalid access token' };
    }
    // Set time zone to Asia/Kolkata (Indian Standard Time)
    const now = new Date();
    // IST is UTC+5:30
    const istTime = todayISTDateTime();
    billingData.createdAt = istTime.toISOString();
    billingData.updatedAt = istTime.toISOString();
    billingData.createdBy = token.id;
    billingData.billDate = now.toLocaleDateString();
    

    console.log('Creating unified billing:', billingData);
   

    // decrease stock quantity of costume
    for(const item of billingData.costumes) {
      const stock = await v2CostumeStockDB.find({
        selector: {
          _id: item._id
        }
      }) as PouchDB.Find.FindResponse<CostumeV2Item>;
      
      if (!stock || stock.docs.length === 0) {
        return { success: false, error: 'Costume stock not found' };
      }
      
      const stockDoc = stock.docs[0];
      const newStock = stockDoc.quantity - item.quantity;
      
      if (newStock < 0) {
        return { success: false, error: 'Costume - Not enough stock' };
      }
      
      item.refundPrice = (stockDoc.refundPrice || 0) * item.quantity;
      await v2CostumeStockDB.put({
        ...stockDoc,
        _id: stockDoc._id,
        _rev: stockDoc._rev,
        quantity: newStock
      })
    }

    // decrease stock quantity of locker
    for(const item of billingData.lockers) {
      const locker = await lockerDB.find({
        selector: {
          _id: item._id
        }
      }) as PouchDB.Find.FindResponse<Locker>;
      
      if (!locker || locker.docs.length === 0) {
        return { success: false, error: 'Locker not found' };
      }

      item.refundPrice = (locker.docs[0].refundAmount || 0);

      
      await lockerDB.put({
        ...locker.docs[0],
        _id: locker.docs[0]._id,
        _rev: locker.docs[0]._rev,
        status:"occupied"
      })
    }
      
    
    // Save to database
    const result = await unifiedBillingDB.post(billingData);
    
    // Attempt to print receipt (optional)
    try {
      printUnifiedBilling(billingData, token.id);
    } catch (printError) {
      console.error('Error printing unified bill:', printError);
      // Continue even if printing fails
    }
    
    return { 
      success: true, 
      data: result 
    };
  } catch (error) {
    console.error('Error creating unified billing:', error);
    return { 
      success: false, 
      error: 'Failed to create unified billing' 
    };
  }
};

/**
 * Get unified billing by customer phone number
 * @param customerPhone Customer phone number
 * @param access_token Access token for authentication
 * @returns The billing records or an error
 */
export const getUnifiedBillingByCustomerPhone = async (customerPhone: string, access_token: string) => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return { error: 'Invalid access token' };
    }
    
    // Query database
    const result = await unifiedBillingDB.find({
      selector: {
        customerNumber: customerPhone
      }
    }) as PouchDB.Find.FindResponse<UnifiedBilling>;
    
    return { 
      success: true, 
      data: result.docs 
    };
  } catch (error) {
    console.error('Error getting unified billing by customer phone:', error);
    return { 
      success: false, 
      error: 'Failed to get unified billing by customer phone' 
    };
  }
};

/**
 * Get all unified billing records
 * @param access_token Access token for authentication
 * @returns All billing records or an error
 */
export const getAllUnifiedBillings = async (access_token: string) => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return { error: 'Invalid access token' };
    }
    
    // Query database
    const result = await unifiedBillingDB.find({
      selector: {},
      sort: [{ createdAt: 'desc' }]
    }) as PouchDB.Find.FindResponse<UnifiedBilling>;
    
    return { 
      success: true, 
      data: result.docs 
    };
  } catch (error) {
    console.error('Error getting all unified billings:', error);
    return { 
      success: false, 
      error: 'Failed to get all unified billings' 
    };
  }
};

/**
 * Process refund for a unified billing
 * @param billingId ID of the billing to refund
 * @param access_token Access token for authentication
 * @returns The updated billing record or an error
 */
export const refundUnifiedBilling = async (billingId: string, access_token: string) => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return { error: 'Invalid access token' };
    }
    
    // Get the billing record
    const billing = await unifiedBillingDB.get(billingId) as UnifiedBilling;
    
    // Check if already refunded
    if (billing.isReturned) {
      return { 
        success: false, 
        error: 'Billing already refunded' 
      };
    }
    
    // Update billing record
    billing.isReturned = true;
    billing.updatedAt = todayISTDateTime().toISOString();
    billing.updatedBy = token.id;
    
    // Save to database
    const result = await unifiedBillingDB.put(billing);
    
    return { 
      success: true, 
      data: result 
    };
  } catch (error) {
    console.error('Error refunding unified billing:', error);
    return { 
      success: false, 
      error: 'Failed to refund unified billing' 
    };
  }
};

/// fetch customer bill by phone no for refund 
export const getLastUnifiedBillingByCustomerPhoneForRefund = async (customerPhone: string, access_token: string) => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return { error: 'Invalid access token' };
    }
    
    // Query database
    const result = await unifiedBillingDB.find({
      selector: {
        customerNumber: customerPhone,
        isReturned: false,
        createdBy: token.id
      }
    }) as PouchDB.Find.FindResponse<UnifiedBilling>;

    if (!result || result.docs.length === 0) {
      return { success: false, error: 'No unified billing found' };
    }
    
    const billingHistory = result.docs[0];
    for(const item of billingHistory.costumes) {
      // fetch costume stock
      const stock = await v2CostumeStockDB.find({
        selector: {
          _id: item._id
        }
      }) as PouchDB.Find.FindResponse<CostumeV2Item>;

      item.refundPrice = (stock.docs[0].refundPrice || 0) * item.quantity;
    }
    
    for(const item of billingHistory.lockers) {
      // fetch locker stock
      const stock = await lockerDB.find({
        selector: {
          _id: item._id
        }
      }) as PouchDB.Find.FindResponse<Locker>;
      /// quantity * refundPrice
      item.refundPrice =  (stock.docs[0].refundAmount || 0) * item.quantity;
    }


    return { 
      success: true, 
      data: billingHistory
    };
  } catch (error) {
    console.error('Error getting unified billing by customer phone:', error);
    return { 
      success: false, 
      error: 'Failed to get unified billing by customer phone' 
    };
  }
};

/// refund unifiedBilling by costume and locker ids
export const refundUnifiedBillingByCostumeAndLockerIds = async (billingId: string, costumeIds: string[], lockerIds: string[], access_token: string) => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return { error: 'Invalid access token' };
    }

    // fetch billing
    const billing = await unifiedBillingDB.get(billingId) as UnifiedBilling;
    
    if (!billing) {
      return { success: false, error: 'Billing not found' };
    }

    console.log(billing);

    // extract costumeids and quantity
    const costumeIds_qty: {id: string, quantity: number}[] = [];
    for(const costume of billing.costumes) {
      costumeIds_qty.push({id: costume._id ??"", quantity: costume.quantity});
    }
    
    for(const costume of costumeIds_qty){
      // check if id is in costumeIds
      if(costumeIds.includes(costume.id)){
        // update stock
        const stock = await v2CostumeStockDB.find({
          selector: {
            _id: costume.id
          }
        }) as PouchDB.Find.FindResponse<CostumeV2Item>;
        
        if (!stock || stock.docs.length === 0) {
          return { success: false, error: 'Costume not found' };
        }
        
        const fetchedCostume = stock.docs[0];
        const newStock = costume.quantity + fetchedCostume.quantity;
        
        await v2CostumeStockDB.put({
          ...fetchedCostume,
          _id: fetchedCostume._id,
          _rev: fetchedCostume._rev,
          quantity: newStock
        })
      }
    }

    /// update locker stock
    for(const lockerId of lockerIds){
      // update stock
      const stock = await lockerDB.find({
        selector: {
          _id: lockerId
        }
      }) as PouchDB.Find.FindResponse<Locker>;
      
      if (!stock || stock.docs.length === 0) {
        return { success: false, error: 'Locker not found' };
      }
      
      const fetchedLocker = stock.docs[0];
      
      await lockerDB.put({
        ...fetchedLocker,
        _id: fetchedLocker._id,
        _rev: fetchedLocker._rev,
        status: 'available'
      })
    }
   
      
     
    /// update isReturned
    billing.isReturned = true;
    billing.updatedAt = todayISTDateTime().toISOString();
    billing.updatedBy = token.id;
    
    // Save to database
    const result = await unifiedBillingDB.put(billing);
    
    return { 
      success: true, 
      data: result 
    };
  } catch (error) {
    console.error('Error refunding unified billing:', error);
    return { 
      success: false, 
      error: 'Failed to refund unified billing' 
    };
  }
};




