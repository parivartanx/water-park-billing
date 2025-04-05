import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Define allowed IPC channels for security
const validChannels = ['login', 'logout', 'get-tickets', 'get-ticket-by-id', 'create-ticket-billing', 'get-lockers', 'create-locker-billing', 'get-locker-stock','create-costume-stock','get-costume-stock','delete-costume-stock','create-costume-billing',
  'get-billing-histories', 'get-recent-billing-histories', 'get-costume-billing-by-customer-phone', 'refund-costume-billing',
  'get-locker-billing-by-customer-phone', 'refund-locker-billing', 'get-employee-by-id', 'create-unified-billing', 'get-unified-billing-by-customer-phone', 'refund-unified-billing',
  'get-all-unified-billings', 'set-cash-management', 'get-cash-management-history', 'get-last-unified-billing-by-customer-phone',
  'refund-unified-billing-by-costume-and-locker-ids'
] as const
export type ValidChannel = typeof validChannels[number]

// Custom APIs for renderer
const api = {
  // Expose ipcRenderer methods for communication with main process
  invoke: (channel: ValidChannel, ...args: unknown[]) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`))
  }
}

// Add TypeScript interface declarations
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: ValidChannel, ...args: unknown[]): Promise<unknown>
      }
    }
    api: typeof api
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ipcRenderer: {
        invoke: (channel: ValidChannel, ...args: unknown[]) => {
          if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args)
          }
          return Promise.reject(new Error(`Invalid channel: ${channel}`))
        }
      }
    })
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // Define window properties for non-contextIsolated environment
  Object.assign(window, {
    electron: {
      ...electronAPI,
      ipcRenderer: {
        invoke: (channel: ValidChannel, ...args: unknown[]) => {
          if (validChannels.includes(channel)) {
            return ipcRenderer.invoke(channel, ...args)
          }
          return Promise.reject(new Error(`Invalid channel: ${channel}`))
        }
      }
    },
    api
  })
}
