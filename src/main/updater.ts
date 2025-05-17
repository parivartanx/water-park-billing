import { dialog, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'

// Configure logging
log.transports.file.level = 'info'
autoUpdater.logger = log
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  // Check for updates immediately when the app starts
  autoUpdater.checkForUpdates().catch(err => {
    log.error('Error checking for updates:', err)
  })

  // Set up update events
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...')
    mainWindow.webContents.send('update-status', { status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info)
    mainWindow.webContents.send('update-status', { 
      status: 'available',
      version: info.version
    })

    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available and will be downloaded automatically.`,
      buttons: ['OK']
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    log.info('No updates available:', info)
    mainWindow.webContents.send('update-status', { 
      status: 'not-available',
      version: info.version
    })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const progressPercent = Math.round(progressObj.percent)
    log.info(`Download progress: ${progressPercent}%`)
    mainWindow.webContents.send('update-status', { 
      status: 'downloading',
      percent: progressPercent
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info)
    mainWindow.webContents.send('update-status', { 
      status: 'downloaded',
      version: info.version
    })

    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `A new version (${info.version}) has been downloaded. The application will be updated after you restart it.`,
      buttons: ['Restart Now', 'Later']
    }).then(result => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(false, true)
      }
    })
  })

  autoUpdater.on('error', (err) => {
    log.error('Error during update:', err)
    mainWindow.webContents.send('update-status', { 
      status: 'error',
      error: err.message
    })
  })

  // Check for updates periodically (every 4 hours)
  const FOUR_HOURS = 4 * 60 * 60 * 1000
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(err => {
      log.error('Error checking for updates:', err)
    })
  }, FOUR_HOURS)
}

// For manual update checks (can be triggered from the renderer)
export function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch(err => {
    log.error('Error checking for updates:', err)
  })
}
