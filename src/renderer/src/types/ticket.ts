export interface Ticket {
    id?: string;
    parkId: string;
    ticketType: string; // "General", "VIP", "Combo", etc.
    price: number;
    status: string; // "Active","Inactive"
    isRefundable: boolean;
    refundPercentage?: number; // % of refund amount
    refundDuration?: number; // Duration in minutes
    refundValidUntil?: Date; // Auto-calculated
    createdAt?: Date;
    updatedAt?: Date;
  }