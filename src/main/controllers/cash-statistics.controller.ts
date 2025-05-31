import { unifiedBillingDB, cashManagementDB } from "../db";
import { UnifiedBilling } from "../types/billing.types";
import { CashManagement } from "../types/cash-management";
import { decodeToken } from "./auth.controller";
import { todayISTDateTime } from "./ist.controller";

/**
 * CashStatistics interface to hold cash-related statistics
 */
interface CashStatistics {
  totalCashAmount: number;
  totalRefundAmount: number;
  withdrawalAmount: number;
  availableCash: number;
}

/**
 * Get cash statistics for a specific date (today by default)
 * Calculates total cash payments, refunds, withdrawals, and available cash
 * 
 * @param date Date in YYYY-MM-DD format (defaults to today)
 * @param access_token Access token for authentication
 * @returns CashStatistics object with calculated values
 */
export const getCashStatistics = async (date?: string, access_token?: string) => {
  try {
    // Verify access token
    if (!access_token) {
      return { error: 'Access token is required' };
    }    console.log("Getting cash statistics for date:", date);
    
    const token = decodeToken(access_token);
    if (!token) {
      return { error: 'Invalid access token' };
    }
    
    // Use provided date or default to today in local timezone
    const localDate = date || todayISTDateTime() // YYYY-MM-DD format in local timezone
    console.log('Local date:', localDate);
    
    // Create start of day in local timezone
    const startDate = new Date(`${localDate}T00:00:00`);
    
    // Create end of day in local timezone
    const endDate = new Date(`${localDate}T23:59:59.999`);
    
    // Convert to ISO strings for database query
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();
    
    console.log('Date range for query:', startDateISO, 'to', endDateISO);
    
    // Query unified billing database for transactions matching the target date
    const unifiedBills = await unifiedBillingDB.find({
      selector: {
        createdAt: { 
          $gte: startDateISO, 
          $lte: endDateISO
        },
        createdBy: token.id
      }
    }) as PouchDB.Find.FindResponse<UnifiedBilling>;    console.log('Unified bills:', unifiedBills);
    
    // Query cash management database for withdrawals on the target date
    const cashWithdrawals = await cashManagementDB.find({
      selector: {
        date: localDate,
        transferById: token.id
      }
    }) as PouchDB.Find.FindResponse<CashManagement>;
    
    // Initialize cash statistics object
    const cashStats: CashStatistics = {
      totalCashAmount: 0,
      totalRefundAmount: 0,
      withdrawalAmount: 0,
      availableCash: 0
    };
    
    // Calculate total cash amount from all bills
    cashStats.totalCashAmount = unifiedBills.docs.reduce((total, bill) => {
      return total + (bill.cashPaid || 0);
    }, 0);
    
    // Calculate total refund amount
    cashStats.totalRefundAmount = unifiedBills.docs.reduce((total, bill) => {
      if (!bill.isReturned) return total;
      
      let refundTotal = 0;
      
      // Add up costume refunds
      if (bill.costumes && bill.costumes.length > 0) {
        refundTotal += bill.costumes.reduce((sum, costume) => {
          return sum + (costume.refundPrice || 0);
        }, 0);
      }
      
      // Add up locker refunds
      if (bill.lockers && bill.lockers.length > 0) {
        refundTotal += bill.lockers.reduce((sum, locker) => {
          return sum + (locker.refundPrice || 0);
        }, 0);
      }
      
      return total + refundTotal;
    }, 0);
    
    // Calculate withdrawal amount
    cashStats.withdrawalAmount = cashWithdrawals.docs.reduce((total, withdrawal) => {
      return total + (withdrawal.amount || 0);
    }, 0);
    
    // Calculate available cash
    cashStats.availableCash = cashStats.totalCashAmount - cashStats.totalRefundAmount - cashStats.withdrawalAmount;
    
    return { 
      success: true, 
      data: cashStats
    };
  } catch (error) {
    console.error('Error calculating cash statistics:', error);
    return { 
      success: false, 
      error: 'Failed to calculate cash statistics' 
    };
  }
};
