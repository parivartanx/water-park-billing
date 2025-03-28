export interface LockerBilling {
    _id?: string;
    lockerIds: string[];
    lockerNames?: string[];
    customerName: string;
    mobileNumber: string;
    paymentMode: string;
    discount: number;
    discountType: 'flat' | 'percentage';
    subtotal: number;
    discountAmount: number;
    gstAmount: number;
    total: number;
    refundAmount?: number;
    isReturned: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
