import { create } from "zustand";
import { Locker } from "@renderer/types/locker";
import type { ValidChannel } from "../types/electron";
import { LockerBilling } from "@renderer/types/locker.billing";
import toast from "react-hot-toast";
import { LockerStock } from "@renderer/types/locket-stock";

export interface LockerStore {
    lockers: Locker[];
    loading: boolean;
    error: string | null;
    getLockers: () => Promise<Locker[]>;
}

export const useLockerStore = create<LockerStore>((set) => ({
    lockers: [],
    loading: false,
    error: null,
    getLockers: async () => {
        try {
            set({ loading: true, error: null })
            const lockers = await window.electron.ipcRenderer.invoke('get-lockers' as ValidChannel) as Locker[]
            set({ lockers, loading: false })
            return lockers
        } catch (error) {
            console.error('Error fetching lockers:', error)
            set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
            return []
        }
    }
}))

/// locker stock
export interface LockerStockStore {
    lockerStock: LockerStock | null;
    loading: boolean;
    error: string | null;
    getLockerStock: () => Promise<LockerStock | null>;
}

export const useLockerStockStore = create<LockerStockStore>((set) => ({
    lockerStock: null,
    loading: false,
    error: null,
    getLockerStock: async () => {
        try {
            set({ loading: true, error: null })
            const lockerStock = await window.electron.ipcRenderer.invoke('get-locker-stock') as LockerStock | null
            set({ lockerStock, loading: false })
            return lockerStock
        } catch (error) {
            console.error('Error fetching locker stock:', error)
            set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
            return null
        }
    }
}))

type LockerBillingResponse = {
    error?: string;
    data?: LockerBilling;
}

export interface LockerBillingStore {
    lockerBilling:LockerBilling | null;
    loading: boolean;
    error: string | null;
    createLockerBilling: (lockerBilling: LockerBilling, access_token: string) => Promise<LockerBilling | null>;
}

export const useLockerBillingStore = create<LockerBillingStore>((set) => ({
    lockerBilling: null,
    loading: false,
    error: null,
    createLockerBilling: async (lockerBilling, access_token) => {
        try {
            set({ loading: true, error: null })
            const response = await window.electron.ipcRenderer.invoke('create-locker-billing' as ValidChannel, {lockerBilling, access_token}) as LockerBillingResponse
            if(response.error) {
                toast.error(response.error)
                set({ loading: false, error: response.error })
                return null
            }
            set({ loading: false, lockerBilling: response.data || lockerBilling })
            console.log("Response", response)
            toast.success('Locker billing created successfully')
            return response.data || null
        } catch (error) {
            console.error('Error creating locker billing:', error)
            /// show toast
            toast.error('Failed to create locker billing') 
            set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
            return null
        }
    }
}))

// Locker Refund Store
interface LockerRefundStore {
    loading: boolean;
    success: boolean;
    error: string | null;
    refundId: string | null;
    refundAmount: number | null;
    refundDate: string | null;
    refundLockerBilling: (lockerBillingId: string, access_token: string) => Promise<void>;
    reset: () => void;
}

export const useLockerRefundStore = create<LockerRefundStore>((set) => ({
    loading: false,
    success: false,
    error: null,
    refundId: null,
    refundAmount: null,
    refundDate: null,
    refundLockerBilling: async (lockerBillingId, access_token) => {
        try {
            set({ loading: true, error: null, success: false });
            toast.loading('Processing locker refund...', { id: 'locker-refund' });
            
            const response = await window.electron.ipcRenderer.invoke('refund-locker-billing', { 
                lockerBillingId, 
                access_token 
            }) as { success: boolean; refundAmount: number; error?: string };
            
            if (response.error) {
                set({ 
                    loading: false, 
                    error: response.error, 
                    success: false 
                });
                toast.error(response.error, { id: 'locker-refund' });
                return;
            }
            
            set({ 
                loading: false, 
                success: true, 
                refundId: lockerBillingId,
                refundAmount: response.refundAmount,
                refundDate: new Date().toISOString(),
                error: null 
            });
            
            toast.success(`Locker returned successfully!`, { 
                id: 'locker-refund',
                duration: 5000
            });
        } catch (error) {
            console.error('Error refunding locker billing:', error);
            const errorMessage = 'Failed to process locker refund. Please try again.';
            set({ 
                loading: false, 
                error: errorMessage, 
                success: false 
            });
            toast.error(errorMessage, { id: 'locker-refund' });
        }
    },
    reset: () => {
        set({
            loading: false,
            success: false,
            error: null,
            refundId: null,
            refundAmount: null,
            refundDate: null
        });
    }
}))
