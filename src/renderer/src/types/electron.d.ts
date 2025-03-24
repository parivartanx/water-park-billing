export type ValidChannel = 'login' | 'logout' | 'get-tickets' | 'get-ticket-by-id' | 'create-ticket-billing' | 'get-lockers' | 'create-locker-billing';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: ValidChannel, ...args: unknown[]): Promise<unknown>
      }
    }
  }
}
