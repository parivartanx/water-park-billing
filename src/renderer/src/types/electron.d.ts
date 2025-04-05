export type ValidChannel = 'login' | 'logout' | 'get-tickets' | 'get-ticket-by-id' | 'create-ticket-billing' | 'get-lockers' | 'create-locker-billing' | 'get-locker-stock' | 'create-costume-stock' | 'get-costume-stock' | 'create-costume-billing' | 'get-billing-histories' | 'get-recent-billing-histories' | 'get-costume-billing-by-customer-phone' | 'refund-costume-billing' | 'get-locker-billing-by-customer-phone' | 'refund-locker-billing' | 'get-employee-by-id' | 'create-unified-billing' | 'get-unified-billing-by-customer-phone' | 'get-all-unified-billings' | 'refund-unified-billing'
 | 'set-cash-management' | 'get-cash-management-history';
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke(channel: ValidChannel, ...args: unknown[]): Promise<unknown>
      }
    }
  }
}
