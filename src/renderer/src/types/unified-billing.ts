
export interface TicketV2Item {
    _id?: string;
    price: number;
    quantity: number;
    totalAmount: number;
    ticketType?: string;
    refundPrice?: number;
  }
  
  export interface LockerV2Item{
    _id?: string;
    lockerNames?: string[];
    quantity: number;
    refundPrice?: number;
    price: number;
  }

  export interface CostumeV2Item {
    _id?: string;
    quantity: number;
    amount: number;
    category?: string;
    refundPrice?: number;
  }
export interface UnifiedBilling {
    _id?: string;
    customerName: string;
    customerNumber: string;
    costumes: CostumeV2Item[];
    tickets: TicketV2Item[];
    lockers: LockerV2Item[];
    ticketsNo: string | null;
    stickersNo: string | null;
    discount: number;
    discountType: 'flat' | 'percentage';
    cashPaid: number;
    onlinePaid: number;
    refundAmount?: number;
    subtotal: number;
    discountAmount: number;
    total: number;
    gstAmount: number;
    isReturned: boolean;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    createdBy?: string;
    updatedBy?: string;
  }
  