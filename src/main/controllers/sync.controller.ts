import { 
  employeeDB, 
  customerDB, 
  ticketDB, 
  costumeDB, 
  lockerDB, 
  ticketBillingDB, 
  lockerBillingDB, 
  costumeBillingDB, 
  v2CostumeStockDB, 
  unifiedBillingDB, 
  cashManagementDB 
} from "../db";
import { decodeToken } from "./auth.controller";

interface SyncProgress {
  total: number;
  completed: number;
  currentTable: string;
  status: 'syncing' | 'completed' | 'error';
}

interface SyncResult {
  success: boolean;
  message: string;
  progress?: SyncProgress;
  error?: string;
}

// Define all databases to sync - PRIORITY ORDER: unified-billing first
const databases = [
  { name: 'unified-billing', db: unifiedBillingDB, priority: true }, // HIGHEST PRIORITY
  { name: 'cash-management', db: cashManagementDB },
  { name: 'locker-billing', db: lockerBillingDB },
  { name: 'costume-billing', db: costumeBillingDB },
  { name: 'ticket-billing', db: ticketBillingDB },
  { name: 'v2-costume-stock', db: v2CostumeStockDB },
  { name: 'lockers', db: lockerDB },
  { name: 'costumes', db: costumeDB },
  { name: 'tickets', db: ticketDB },
  { name: 'customers', db: customerDB },
  { name: 'employees', db: employeeDB }
];

/**
 * Force sync all local data to remote databases
 * Priority: unified-billing database first, then others
 * @param access_token Access token for authentication
 * @returns Sync result with progress information
 */
export const forceSyncToCloud = async (access_token: string): Promise<SyncResult> => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return {
        success: false,
        message: 'Invalid access token',
        error: 'Authentication failed'
      };
    }

    console.log('Starting manual sync to cloud with unified-billing priority...');
    
    const totalDatabases = databases.length;
    let completedDatabases = 0;
    const syncResults: Array<{name: string, success: boolean, error?: string, docCount?: number}> = [];

    // Process each database in priority order
    for (const { name, db, priority } of databases) {
      try {
        console.log(`${priority ? '[PRIORITY] ' : ''}Syncing ${name}...`);
        
        // Get all documents from local database
        const allDocs = await db.allDocs({ include_docs: true });
        const docCount = allDocs.rows.length;
        
        if (docCount > 0) {
          console.log(`Found ${docCount} documents in ${name}`);
          
          // Special handling for unified-billing (priority database)
          if (priority) {
            console.log('🚀 PRIORITY SYNC: Processing unified-billing database...');
          }
            // Force push to remote using replication with timeout
          const replicationPromise = db.replicate.to(`http://admin:password@165.232.179.60:5984/${name}`, {
            live: false,
            retry: false,
            timeout: priority ? 60000 : 30000 // Longer timeout for priority DB
          });

          // Add timeout wrapper for better error handling
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Sync timeout')), priority ? 120000 : 60000);
          });

          const replicationResult = await Promise.race([replicationPromise, timeoutPromise]);
          
          console.log(`✅ Sync completed for ${name}:`, replicationResult);
          syncResults.push({ name, success: true, docCount });
          
          if (priority) {
            console.log('🎉 PRIORITY SYNC COMPLETED: unified-billing synced successfully!');
          }
        } else {
          console.log(`No documents found in ${name}`);
          syncResults.push({ name, success: true, docCount: 0 });
        }
        
        completedDatabases++;
        
      } catch (error) {
        console.error(`❌ Error syncing ${name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Special error handling for priority database
        if (priority) {
          console.error('🚨 CRITICAL: Failed to sync unified-billing database!');
          return {
            success: false,
            message: 'Failed to sync critical unified-billing database',
            error: `Unified billing sync failed: ${errorMessage}`,
            progress: {
              total: totalDatabases,
              completed: completedDatabases,
              currentTable: `Failed: ${name}`,
              status: 'error'
            }
          };
        }
        
        syncResults.push({ 
          name, 
          success: false, 
          error: errorMessage
        });
        completedDatabases++;
      }
    }

    // Calculate results
    const failedSyncs = syncResults.filter(result => !result.success);
    const totalSyncedDocs = syncResults.reduce((sum, result) => sum + (result.docCount || 0), 0);
    
    if (failedSyncs.length === 0) {
      return {
        success: true,
        message: `✅ Successfully synced all ${totalDatabases} databases (${totalSyncedDocs} documents) to cloud`,
        progress: {
          total: totalDatabases,
          completed: completedDatabases,
          currentTable: 'All databases synced successfully',
          status: 'completed'
        }
      };
    } else {
      return {
        success: false,
        message: `⚠️ Sync completed with ${failedSyncs.length} failures (${totalSyncedDocs} documents synced)`,
        error: `Failed databases: ${failedSyncs.map(f => f.name).join(', ')}`,
        progress: {
          total: totalDatabases,
          completed: completedDatabases,
          currentTable: 'Completed with errors',
          status: 'error'
        }
      };
    }

  } catch (error) {
    console.error('Error in manual sync:', error);
    return {
      success: false,
      message: 'Manual sync failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Quick sync for unified billing database only (highest priority)
 * @param access_token Access token for authentication
 * @returns Sync result for unified billing
 */
export const syncUnifiedBillingOnly = async (access_token: string): Promise<SyncResult> => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return {
        success: false,
        message: 'Invalid access token',
        error: 'Authentication failed'
      };
    }

    console.log('🚀 Starting PRIORITY sync for unified-billing database...');
    
    try {
      // Get all documents from unified billing database
      const allDocs = await unifiedBillingDB.allDocs({ include_docs: true });
      const docCount = allDocs.rows.length;
      
      if (docCount > 0) {
        console.log(`📊 Found ${docCount} unified billing documents to sync`);
        
        // Push to remote unified billing database
        const replicationResult = await unifiedBillingDB.replicate.to(`http://admin:password@165.232.179.60:5984/unified-billing`, {
          live: false,
          retry: false,
          timeout: 120000 // 2 minutes timeout for critical data
        });
        
        console.log('✅ Unified billing sync completed successfully:', replicationResult);
        
        return {
          success: true,
          message: `🎉 Successfully synced ${docCount} unified billing records to cloud`,
          progress: {
            total: 1,
            completed: 1,
            currentTable: 'unified-billing completed',
            status: 'completed'
          }
        };
      } else {
        console.log('📭 No unified billing documents found to sync');
        return {
          success: true,
          message: 'No unified billing data to sync',
          progress: {
            total: 1,
            completed: 1,
            currentTable: 'unified-billing (no data)',
            status: 'completed'
          }
        };
      }
      
    } catch (error) {
      console.error('❌ Failed to sync unified billing:', error);
      return {
        success: false,
        message: 'Failed to sync unified billing database',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        progress: {
          total: 1,
          completed: 0,
          currentTable: 'unified-billing failed',
          status: 'error'
        }
      };
    }

  } catch (error) {
    console.error('Error in unified billing sync:', error);
    return {
      success: false,
      message: 'Unified billing sync failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get sync status and progress
 * @param access_token Access token for authentication
 * @returns Current sync status
 */
export const getSyncStatus = async (access_token: string): Promise<SyncResult> => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return {
        success: false,
        message: 'Invalid access token',
        error: 'Authentication failed'
      };
    }

    // Get info about unified billing database (priority check)
    try {
      const unifiedBillingInfo = await unifiedBillingDB.info();
      console.log(`📊 Unified Billing Status: ${unifiedBillingInfo.doc_count} documents, update sequence: ${unifiedBillingInfo.update_seq}`);
      
      return {
        success: true,
        message: `Sync status: ${unifiedBillingInfo.doc_count} unified billing records ready for sync`,
        progress: {
          total: databases.length,
          completed: databases.length,
          currentTable: `Unified billing: ${unifiedBillingInfo.doc_count} docs`,
          status: 'completed'
        }
      };
    } catch (error) {
      console.error('Error getting unified billing status:', error);
      return {
        success: false,
        message: 'Failed to get unified billing status',
        error: error instanceof Error ? error.message : 'Database access error'
      };
    }

  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      success: false,
      message: 'Failed to get sync status',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Force sync from cloud to local databases (pull from remote)
 * Priority: unified-billing database first, then others
 * @param access_token Access token for authentication
 * @returns Sync result with progress information
 */
export const forceSyncFromCloud = async (access_token: string): Promise<SyncResult> => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return {
        success: false,
        message: 'Invalid access token',
        error: 'Authentication failed'
      };
    }

    console.log('Starting manual sync from cloud with unified-billing priority...');
    
    const totalDatabases = databases.length;
    let completedDatabases = 0;
    const syncResults: Array<{name: string, success: boolean, error?: string, docCount?: number}> = [];

    // Process each database in priority order
    for (const { name, db, priority } of databases) {
      try {
        console.log(`${priority ? '[PRIORITY] ' : ''}Pulling ${name} from cloud...`);
        
        // Special handling for unified-billing (priority database)
        if (priority) {
          console.log('🚀 PRIORITY PULL: Processing unified-billing database...');
        }
        
        // Force pull from remote using replication with timeout
        const replicationPromise = db.replicate.from(`http://admin:password@165.232.179.60:5984/${name}`, {
          live: false,
          retry: false,
          timeout: priority ? 60000 : 30000 // Longer timeout for priority DB
        });

        // Add timeout wrapper for better error handling
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Sync timeout')), priority ? 120000 : 60000);
        });

        const replicationResult = await Promise.race([replicationPromise, timeoutPromise]);
        
        // Get updated document count after pull
        const allDocs = await db.allDocs({ include_docs: true });
        const docCount = allDocs.rows.length;
        
        console.log(`✅ Pull completed for ${name}:`, replicationResult);
        console.log(`📊 ${name} now has ${docCount} documents locally`);
        syncResults.push({ name, success: true, docCount });
        
        if (priority) {
          console.log('🎉 PRIORITY PULL COMPLETED: unified-billing synced successfully from cloud!');
        }
        
        completedDatabases++;
        
      } catch (error) {
        console.error(`❌ Error pulling ${name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Special error handling for priority database
        if (priority) {
          console.error('🚨 CRITICAL: Failed to pull unified-billing database from cloud!');
          return {
            success: false,
            message: 'Failed to sync critical unified-billing database from cloud',
            error: `Unified billing pull failed: ${errorMessage}`,
            progress: {
              total: totalDatabases,
              completed: completedDatabases,
              currentTable: `Failed: ${name}`,
              status: 'error'
            }
          };
        }
        
        syncResults.push({ 
          name, 
          success: false, 
          error: errorMessage
        });
        completedDatabases++;
      }
    }

    // Calculate results
    const failedSyncs = syncResults.filter(result => !result.success);
    const totalSyncedDocs = syncResults.reduce((sum, result) => sum + (result.docCount || 0), 0);
    
    if (failedSyncs.length === 0) {
      return {
        success: true,
        message: `✅ Successfully pulled all ${totalDatabases} databases from cloud (${totalSyncedDocs} total documents)`,
        progress: {
          total: totalDatabases,
          completed: completedDatabases,
          currentTable: 'All databases pulled successfully',
          status: 'completed'
        }
      };
    } else {
      return {
        success: false,
        message: `⚠️ Pull completed with ${failedSyncs.length} failures (${totalSyncedDocs} documents synced)`,
        error: `Failed databases: ${failedSyncs.map(f => f.name).join(', ')}`,
        progress: {
          total: totalDatabases,
          completed: completedDatabases,
          currentTable: 'Completed with errors',
          status: 'error'
        }
      };
    }

  } catch (error) {
    console.error('Error in manual pull from cloud:', error);
    return {
      success: false,
      message: 'Manual pull from cloud failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Bidirectional sync - both push and pull
 * @param access_token Access token for authentication
 * @returns Sync result with progress information
 */
export const bidirectionalSync = async (access_token: string): Promise<SyncResult> => {
  try {
    // Verify access token
    const token = decodeToken(access_token);
    if (!token) {
      return {
        success: false,
        message: 'Invalid access token',
        error: 'Authentication failed'
      };
    }

    console.log('Starting bidirectional sync (push + pull) with unified-billing priority...');
    
    const totalDatabases = databases.length * 2; // Double because we do both push and pull
    let completedOperations = 0;
    const syncResults: Array<{name: string, operation: string, success: boolean, error?: string, docCount?: number}> = [];

    // Process each database in priority order - BIDIRECTIONAL
    for (const { name, db, priority } of databases) {
      try {
        console.log(`${priority ? '[PRIORITY] ' : ''}Bidirectional sync for ${name}...`);
        
        if (priority) {
          console.log('🚀 PRIORITY BIDIRECTIONAL: Processing unified-billing database...');
        }
        
        // STEP 1: PULL FROM CLOUD (get latest from remote)
        try {
          const pullPromise = db.replicate.from(`http://admin:password@165.232.179.60:5984/${name}`, {
            live: false,
            retry: false,
            timeout: priority ? 60000 : 30000
          });          const pullTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Pull timeout')), priority ? 120000 : 60000);
          });

          await Promise.race([pullPromise, pullTimeoutPromise]);
          console.log(`✅ Pull completed for ${name}`);
          syncResults.push({ name, operation: 'pull', success: true });
          completedOperations++;
        } catch (pullError) {
          console.error(`❌ Pull failed for ${name}:`, pullError);
          syncResults.push({ 
            name, 
            operation: 'pull', 
            success: false, 
            error: pullError instanceof Error ? pullError.message : 'Pull failed'
          });
          completedOperations++;
        }
        
        // STEP 2: PUSH TO CLOUD (send local changes)
        try {
          const allDocs = await db.allDocs({ include_docs: true });
          const docCount = allDocs.rows.length;
          
          const pushPromise = db.replicate.to(`http://admin:password@165.232.179.60:5984/${name}`, {
            live: false,
            retry: false,
            timeout: priority ? 60000 : 30000
          });          const pushTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Push timeout')), priority ? 120000 : 60000);
          });

          await Promise.race([pushPromise, pushTimeoutPromise]);
          console.log(`✅ Push completed for ${name}`);
          syncResults.push({ name, operation: 'push', success: true, docCount });
          completedOperations++;
        } catch (pushError) {
          console.error(`❌ Push failed for ${name}:`, pushError);
          syncResults.push({ 
            name, 
            operation: 'push', 
            success: false, 
            error: pushError instanceof Error ? pushError.message : 'Push failed'
          });
          completedOperations++;
        }
        
        if (priority) {
          console.log('🎉 PRIORITY BIDIRECTIONAL SYNC COMPLETED: unified-billing synced both ways!');
        }
        
      } catch (error) {
        console.error(`❌ Error in bidirectional sync for ${name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (priority) {
          console.error('🚨 CRITICAL: Failed bidirectional sync for unified-billing database!');
          return {
            success: false,
            message: 'Failed critical unified-billing bidirectional sync',
            error: `Unified billing bidirectional sync failed: ${errorMessage}`,
            progress: {
              total: totalDatabases,
              completed: completedOperations,
              currentTable: `Failed: ${name}`,
              status: 'error'
            }
          };
        }
        
        syncResults.push({ 
          name, 
          operation: 'both', 
          success: false, 
          error: errorMessage
        });
        completedOperations += 2; // Account for both operations failing
      }
    }

    // Calculate results
    const failedSyncs = syncResults.filter(result => !result.success);
    const totalDocCount = syncResults.reduce((sum, result) => sum + (result.docCount || 0), 0);
    
    if (failedSyncs.length === 0) {
      return {
        success: true,
        message: `✅ Successfully completed bidirectional sync for all databases (${totalDocCount} documents processed)`,
        progress: {
          total: totalDatabases,
          completed: completedOperations,
          currentTable: 'All bidirectional syncs completed',
          status: 'completed'
        }
      };
    } else {
      return {
        success: false,
        message: `⚠️ Bidirectional sync completed with ${failedSyncs.length} failures`,
        error: `Failed operations: ${failedSyncs.map(f => `${f.name} (${f.operation})`).join(', ')}`,
        progress: {
          total: totalDatabases,
          completed: completedOperations,
          currentTable: 'Completed with errors',
          status: 'error'
        }
      };
    }

  } catch (error) {
    console.error('Error in bidirectional sync:', error);
    return {
      success: false,
      message: 'Bidirectional sync failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
