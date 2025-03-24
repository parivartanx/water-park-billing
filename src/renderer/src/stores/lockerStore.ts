import { create } from "zustand";
import { Locker } from "@renderer/types/locker";
import type { ValidChannel } from "../types/electron";
import { LockerBilling } from "@renderer/types/locker.billing";
import toast from "react-hot-toast";

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
