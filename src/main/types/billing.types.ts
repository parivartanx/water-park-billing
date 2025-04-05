/**
 * Type definitions for billing objects used in the main process
 */

export interface SelectedTicket {
  _id: string;
  quantity: number;
  ticketType?: string;
  pricePerUnit?: number;
}

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
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

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
  refundAmount?: number;
  total: number;
  isReturned: boolean;
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CostumeItem {
  _id?: string;
  quantity: number;
  amount: number;
  category?: string;
  size?: string;
  refundPrice?: number;
}

export interface CostumeV2Item {
  _id?: string;
  quantity: number;
  amount: number;
  category?: string;
  refundPrice?: number;
}

export interface CostumeBill {
  _id?: string;
  customerName: string;
  customerNumber: string;
  costumes: CostumeItem[];
  discount: number;
  discountType: 'flat' | 'percentage';
  paymentMode: 'cash' | 'card' | 'upi';
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

export interface UnifiedBilling {
  _id?: string;
  customerName: string;
  customerNumber: string;
  costumes: CostumeV2Item[];
  tickets: TicketV2Item[];
  lockers: LockerV2Item[];
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
