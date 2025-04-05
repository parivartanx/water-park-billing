export interface Ticket {
    _id?: string;
    ticketType: string; // "General", "VIP", "Combo", etc.
    price: number;
    description: string;
    status: string; // "Active","Inactive"
    isRefundable: boolean;
    refundPercentage?: number; // % of refund amount
    refundDuration?: number; // Duration in minutes
    refundValidUntil?: Date; // Auto-calculated
    createdAt?: Date;
    updatedAt?: Date;
  }