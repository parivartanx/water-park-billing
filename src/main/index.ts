import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { login } from './controllers/auth.controller'
import { getTickets, getTicketById, saveTicketBilling } from './controllers/ticket.controller'
import { getLockerBillingByCustomerPhone, getLockers, getLockerStock, refundLockerBilling } from './controllers/locker.controller'
import { createLockerBilling } from './controllers/locker.controller'
import { createV2CostumeStock, getCostumeStock, deleteCostumeStock, createCostumeBilling, getCostumeBillingByCustomerPhone, refundCostumeBilling } from './controllers/costume.controller'
import { billingHistories, recentBillingHistories } from './controllers/history.controller'
import { getEmployeeById } from './controllers/employee.controller'
import { createUnifiedBilling, getUnifiedBillingByCustomerPhone, getAllUnifiedBillings, refundUnifiedBilling } from './controllers/unified-billing.controller'
import { setCashManagement, getCashManagementHistory } from './controllers/cash-management-controller'
import { getLastUnifiedBillingByCustomerPhoneForRefund } from './controllers/unified-billing.controller'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const escpos = require('escpos');
// eslint-disable-next-line @typescript-eslint/no-require-imports
escpos.USB = require('escpos-usb')

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      devTools: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('before-input-event', (_, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      mainWindow.webContents.openDevTools()
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription)
    })
    
    try {
      const htmlPath = join(__dirname, '../renderer/index.html')
      console.log('Loading HTML file from:', htmlPath)
      mainWindow.loadFile(htmlPath)
    } catch (error) {
      console.error('Error loading HTML file:', error)
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Register IPC handlers for authentication
  ipcMain.handle('login', async (_event, args) => {
    console.log('Login handler called with args:', args)
    try {
      const { email, password, role } = args
      return await login(email, password, role)
    } catch (error) {
      console.error('Error in login handler:', error)
      return { error: 'Authentication failed. Please try again.' }
    }
  })

  /// ticket handlers
  ipcMain.handle('get-tickets', async () => {
    try {
      return await getTickets()
    } catch (error) {
      console.error('Error getting tickets:', error)
      return { error: 'Failed to fetch tickets' }
    }
  })

  ipcMain.handle('get-ticket-by-id', async (_event, args) => {
    try {
      const { id } = args
      return await getTicketById(id)
    } catch (error) {
      console.error('Error getting ticket by id:', error)
      return { error: 'Failed to fetch ticket' }
    }
  })

  /// ticket billing handlers
  ipcMain.handle('create-ticket-billing', async (_event, args) => {
    try {
      return await saveTicketBilling(args.billing, args.access_token)
    } catch (error) {
      console.error('Error creating ticket billing:', error)
      return { error: 'Failed to create ticket billing' }
    }
  })

  /// locker handlers
  ipcMain.handle('get-lockers', async (_event, args) => {
    try {
      console.log('Get lockers handler called with args:', args)
      return await getLockers()
    } catch (error) {
      console.error('Error getting lockers:', error)
      return { error: 'Failed to fetch lockers' }
    }
  })

  ipcMain.handle('get-locker-stock', async (_event, args) => {
    try {
      console.log('Get locker stock handler called with args:', args)
      return await getLockerStock()
    } catch (error) {
      console.error('Error getting locker stock:', error)
      return { error: 'Failed to fetch locker stock' }
    }
  })

  ipcMain.handle('get-locker-billing-by-customer-phone', async (_event, args) => {
    try {
      return await getLockerBillingByCustomerPhone(args.customerPhone, args.access_token)
    } catch (error) {
      console.error('Error getting locker billing by customer phone:', error)
      return { error: 'Failed to get locker billing by customer phone' }
    }
  })

  ipcMain.handle('create-locker-billing', async (_event, args) => {
    try {
      return await createLockerBilling(args.lockerBilling, args.access_token)
    } catch (error) {
      console.error('Error creating locker billing:', error)
      return { error: 'Failed to create locker billing' }
    }
  })

  ipcMain.handle('refund-locker-billing', async (_event, args) => {
    try {
      return await refundLockerBilling(args.lockerBillingId, args.access_token)
    } catch (error) {
      console.error('Error refunding locker billing:', error)
      return { error: 'Failed to process locker refund' }
    }
  })

  /// costume handlers
  ipcMain.handle('get-costume-stock', async (_event, args) => {
    try {
      console.log('Get costume stock handler called with args:', args)
      return await getCostumeStock()
    } catch (error) {
      console.error('Error getting costume stock:', error)
      return { error: 'Failed to fetch costume stock' }
    }
  })

  ipcMain.handle('create-costume-stock', async (_event, args) => {
    try {
      return await createV2CostumeStock(args.costumeStock, args.access_token)
    } catch (error) {
      console.error('Error creating costume stock:', error)
      return { error: 'Failed to create costume stock' }  
    }
  })

  ipcMain.handle('delete-costume-stock', async (_event, args) => {
    try {
      return await deleteCostumeStock(args.id)
    } catch (error) {
      console.error('Error deleting costume stock:', error)
      return { error: 'Failed to delete costume stock' }
    }
  })

  ipcMain.handle('create-costume-billing', async (_event, args) => {
    try {
      return await createCostumeBilling(args.costumeBilling, args.access_token)
    } catch (error) {
      console.error('Error creating costume billing:', error)
      return { error: 'Failed to create costume billing' }
    }
  })

  ipcMain.handle('get-costume-billing-by-customer-phone', async (_event, args) => {
    try {
      // console.log('Get costume billing by customer phone handler called with args:', args)
      return await getCostumeBillingByCustomerPhone(args.customerPhone, args.access_token)
    } catch (error) {
      console.error('Error getting costume billing by customer phone:', error)
      return { error: 'Failed to get costume billing by customer phone' }
    }
  })

  /// billing history handlers
  ipcMain.handle('get-billing-histories', async (_event, args) => {
    try {
      return await billingHistories({from: args.from, to: args.to, type: args.type, searchStr: args.searchStr})
    } catch (error) {
      console.error('Error getting billing histories:', error)
      return { error: 'Failed to fetch billing histories' }
    }
  })

  ipcMain.handle('get-recent-billing-histories', async (_event, args) => {
    try {
      if(!args.limit) {
        return { error: 'Limit is required' }
      }
      return await recentBillingHistories(args.limit)
    } catch (error) {
      console.error('Error getting recent billing histories:', error)
      return { error: 'Failed to get recent billing histories' }
    }
  })

  /// refund handlers
  ipcMain.handle('refund-costume-billing', async (_event, args) => {
    try {
      return await refundCostumeBilling(args.id, args.access_token)
    } catch (error) {
      console.error('Error refunding costume billing:', error)
      return { error: 'Failed to refund costume billing' }
    }
  })

  /// employee handlers
  ipcMain.handle('get-employee-by-id', async (_event, args) => {
    try {
      return await getEmployeeById(args.access_token)
    } catch (error) {
      console.error('Error getting employee by id:', error)
      return { error: 'Failed to get employee by id' }
    }
  })

  /// unified billing handlers
  ipcMain.handle('create-unified-billing', async (_event, args) => {
    try {
      return await createUnifiedBilling(args.billingData, args.access_token)
    } catch (error) {
      console.error('Error creating unified billing:', error)
      return { error: 'Failed to create unified billing' }
    }
  })

  ipcMain.handle('get-unified-billing-by-customer-phone', async (_event, args) => {
    try {
      return await getUnifiedBillingByCustomerPhone(args.customerPhone, args.access_token)
    } catch (error) {
      console.error('Error getting unified billing by customer phone:', error)
      return { error: 'Failed to get unified billing by customer phone' }
    }
  })

  ipcMain.handle('get-all-unified-billings', async (_event, args) => {
    try {
      return await getAllUnifiedBillings(args.access_token)
    } catch (error) {
      console.error('Error getting all unified billings:', error)
      return { error: 'Failed to get all unified billings' }
    }
  })

  ipcMain.handle('refund-unified-billing', async (_event, args) => {
    try {
      return await refundUnifiedBilling(args.billingId, args.access_token)
    } catch (error) {
      console.error('Error refunding unified billing:', error)
      return { error: 'Failed to refund unified billing' }
    }
  })

  /// cash management handlers
  ipcMain.handle('set-cash-management', async (_event, args) => {
    try {
      return await setCashManagement(args.data, args.access_token)
    } catch (error) {
      console.error('Error setting cash management:', error)
      return { error: 'Failed to set cash management' }
    }
  })

  ipcMain.handle('get-cash-management-history', async (_event, args) => {
    try {
      return await getCashManagementHistory(args.from, args.to, args.access_token)
    } catch (error) {
      console.error('Error getting cash management history:', error)
      return { error: 'Failed to get cash management history' }
    }
  })

  ipcMain.handle('get-last-unified-billing-by-customer-phone', async (_event, args) => {
    try {
      return await getLastUnifiedBillingByCustomerPhoneForRefund(args.customerPhone, args.access_token)
    } catch (error) {
      console.error('Error getting last unified billing by customer phone:', error)
      return { error: 'Failed to get last unified billing by customer phone' }
    }
  })

  // 
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
