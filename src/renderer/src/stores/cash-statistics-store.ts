import { ValidChannel } from '@renderer/types/electron';
import { create } from 'zustand';

interface CashStatistics {
  totalCashAmount: number;
  totalRefundAmount: number;
  withdrawalAmount: number;
  availableCash: number;
}

interface CashStatisticsState {
  loading: boolean;
  error: string | null;
  cashStats: CashStatistics;
  getCashStatistics: (date: string | undefined, accessToken: string) => Promise<void>;
}

const initialCashStats: CashStatistics = {
  totalCashAmount: 0,
  totalRefundAmount: 0,
  withdrawalAmount: 0,
  availableCash: 0
};

export const useCashStatisticsStore = create<CashStatisticsState>((set) => ({
  loading: false,
  error: null,
  cashStats: initialCashStats,

  getCashStatistics: async (date: string | undefined, accessToken: string) => {
    try {
      set({ loading: true, error: null });

      const response = await window.electron.ipcRenderer.invoke('get-cash-statistics' as ValidChannel, { 
        date, 
        access_token: accessToken 
      });

      console.log('Cash statistics response:', response);

      // Assert the type of response before accessing its properties
      if (typeof response === 'object' && response !== null) {
        if ('error' in response) {
          throw new Error((response as any).error);
        }

        if (!('success' in response) || !(response as any).success) {
          throw new Error('Failed to get cash statistics');
        }

        set({ 
          cashStats: (response as any).data,
          loading: false 
        });
      } else {
        throw new Error('Invalid response from get-cash-statistics');
      }
    } catch (error: any) {
      console.error('Error getting cash statistics:', error);
      set({ 
        error: error.message || 'Failed to get cash statistics', 
        loading: false 
      });
    }
  }
}));
