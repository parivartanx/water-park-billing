import { ElectronAPI } from '@electron-toolkit/preload'

// Define valid IPC channels
type ValidChannel = 'login' | 'logout' | 'get-tickets' | 'get-ticket-by-id'

// Define custom API interface
interface CustomAPI {
  invoke: (channel: ValidChannel, ...args: unknown[]) => Promise<unknown>
}

// Define extended Electron API interface
interface ExtendedElectronAPI extends ElectronAPI {
  ipcRenderer: {
    invoke: (channel: ValidChannel, ...args: unknown[]) => Promise<unknown>
  }
}

declare global {
  interface Window {
    electron: ExtendedElectronAPI
    api: CustomAPI
  }
}
