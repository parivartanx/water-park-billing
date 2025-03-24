
export interface Locker {
    _id?: string;
    isDeleted?: boolean;
    lockerNo: string;
    pricePerUnit: number;
    refundAmount: number;
    status: string; // available, reserved, occupied 
    createdAt?: string;
    updatedAt?: string;
}
