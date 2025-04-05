import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find'

// Enable PouchDB query capabilities
PouchDB.plugin(PouchDBFind)

// export const apiEndPoint = 'http://165.232.179.60/api/v1'
// const remoteIp = '165.232.179.60'
export const apiEndPoint = 'http://localhost:3004/api/v1'



/// db names
const employeeDB = new PouchDB('employees')
const customerDB = new PouchDB('customers')
const ticketDB = new PouchDB('tickets')
const costumeDB = new PouchDB('costumes')
const lockerDB = new PouchDB('lockers')
const ticketBillingDB = new PouchDB('ticket-billing')
const lockerBillingDB = new PouchDB('locker-billing')
const costumeBillingDB = new PouchDB('costume-billing')
const v2CostumeStockDB = new PouchDB('v2-costume-stock')
const unifiedBillingDB = new PouchDB('unified-billing')
const cashManagementDB = new PouchDB('cash-management')

/// remote dbs 
const remoteEmployeeDB = new PouchDB('http://admin:password@localhost:5984/employees')
const remoteCustomerDB = new PouchDB('http://admin:password@localhost:5984/customers')
const remoteTicketDB = new PouchDB('http://admin:password@localhost:5984/tickets')
const remoteCostumeDB = new PouchDB('http://admin:password@localhost:5984/costumes')
const remoteLockerDB = new PouchDB('http://admin:password@localhost:5984/lockers')
const remoteTicketBillingDB = new PouchDB('http://admin:password@localhost:5984/ticket-billing')
const remoteLockerBillingDB = new PouchDB('http://admin:password@localhost:5984/locker-billing')
const remoteCostumeBillingDB = new PouchDB('http://admin:password@localhost:5984/costume-billing')
const remoteV2CostumeStockDB = new PouchDB('http://admin:password@localhost:5984/v2-costume-stock')
const remoteUnifiedBillingDB = new PouchDB('http://admin:password@localhost:5984/unified-billing')
const remoteCashManagementDB = new PouchDB('http://admin:password@localhost:5984/cash-management')

/// sync dbs
employeeDB.sync(remoteEmployeeDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
customerDB.sync(remoteCustomerDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
ticketDB.sync(remoteTicketDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
costumeDB.sync(remoteCostumeDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
lockerDB.sync(remoteLockerDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
ticketBillingDB.sync(remoteTicketBillingDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
lockerBillingDB.sync(remoteLockerBillingDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
costumeBillingDB.sync(remoteCostumeBillingDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
v2CostumeStockDB.sync(remoteV2CostumeStockDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))
unifiedBillingDB.sync(remoteUnifiedBillingDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))

cashManagementDB.sync(remoteCashManagementDB, { live: true, retry: true })
.on('change', (info) => console.log('Sync change:', info))
.on('error', (err) => console.error('Sync error:', err))






//


export { employeeDB, customerDB, ticketDB, costumeDB, lockerDB, ticketBillingDB, lockerBillingDB, 
    costumeBillingDB, v2CostumeStockDB, unifiedBillingDB, cashManagementDB }
