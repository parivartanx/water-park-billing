export interface TicketBilling {
    _id?: string;
    tickets: SelectedTicket[];
    customerName: string;
    mobileNumber: string;
    paymentMode: string;
    discount: number;
    discountType: 'flat' | 'percentage';
    subtotal: number;
    discountAmount: number;
    gstAmount: number;
    total: number;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface SelectedTicket {
    _id: string;
    quantity: number;
}