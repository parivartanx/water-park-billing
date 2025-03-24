export interface LockerBilling {
    _id?: string;
    lockerIds: string[];
    customerName: string;
    mobileNumber: string;
    paymentMode: string;
    discount: number;
    discountType: 'flat' | 'percentage';
    subtotal: number;
    discountAmount: number;
    gstAmount: number;
    total: number;
    isReturned: boolean;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
