import { create } from "zustand";
import toast from "react-hot-toast";

interface ReturnStore {
  loading:boolean,
  error:string | null,
  success:string | null,
  returnBillingCostumeAndLocker:(billingId:string, lockerIds:string[], costumeIds:string[], access_token:string) => Promise<void>
}

interface ReturnResponse {
  success: string | null;
  error: string | null;
}

export const useReturnStore = create<ReturnStore>((set) => ({
  loading:false,
  error:null,
  success:null,
  returnBillingCostumeAndLocker: async (billingId, lockerIds, costumeIds, access_token) => {
    try {
      set({loading:true,error:null,success:null})
    const result = await window.electron.ipcRenderer.invoke('refund-unified-billing-by-costume-and-locker-ids', { billingId, lockerIds, costumeIds, access_token }) as ReturnResponse
    if(result.error){
      set({error:result.error, loading:false})
      /// show toast message here
      toast.error(result.error)
      return
    }
    set({success:result.success, loading:false})
  }catch(e){
    const msg = e instanceof Error ? e.message : String(e)
    set({error:msg, loading:false})
    toast.error(msg)
  }
}
}))


