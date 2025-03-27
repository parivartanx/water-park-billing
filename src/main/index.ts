import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { login } from './controllers/auth.controller'
import { getTickets, getTicketById, saveTicketBilling } from './controllers/ticket.controller'
import { getLockers, getLockerStock } from './controllers/locker.controller'
import { createLockerBilling } from './controllers/locker.controller'
import { createCostumeStock, getCostumeStock, deleteCostumeStock, createCostumeBilling } from './controllers/costume.controller'

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
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
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

  ipcMain.handle('create-locker-billing', async (_event, args) => {
    try {
      return await createLockerBilling(args.lockerBilling, args.access_token)
    } catch (error) {
      console.error('Error creating locker billing:', error)
      return { error: 'Failed to create locker billing' }
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
      return await createCostumeStock(args.costumeStock, args.access_token)
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
