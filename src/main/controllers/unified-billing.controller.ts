import { CostumeV2Item, LockerV2Item, UnifiedBilling } from '../types/billing.types';
import { decodeToken } from './auth.controller';
import PouchDBFind from 'pouchdb-find';
import PouchDB from 'pouchdb';

import { unifiedBillingDB, v2CostumeStockDB, lockerDB } from '../db';

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

    // Add metadata
    billingData.createdAt = new Date().toISOString();
    billingData.updatedAt = new Date().toISOString();
    billingData.createdBy = token.id;

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
        return { success: false, error: 'Not enough stock' };
      }
      
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
      }) as PouchDB.Find.FindResponse<LockerV2Item>;
      
      if (!locker || locker.docs.length === 0) {
        return { success: false, error: 'Locker not found' };
      }
      
      const lockerDoc = locker.docs[0];
      const newStock = lockerDoc.quantity - item.quantity;
      
      if (newStock < 0) {
        return { success: false, error: 'Not enough stock' };
      }
      
      await lockerDB.put({
        ...lockerDoc,
        _id: lockerDoc._id,
        _rev: lockerDoc._rev,
        status:"occupied"
      })
    }
      
    
    // Save to database
    const result = await unifiedBillingDB.post(billingData);
    
    // Attempt to print receipt (optional)
    try {
      // TODO: Implement unified bill printing if needed
      // printUnifiedBill(billingData);
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
    billing.updatedAt = new Date().toISOString();
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

/// fetch recent billing history
