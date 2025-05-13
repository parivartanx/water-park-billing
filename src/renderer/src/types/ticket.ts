export interface Ticket {
    _id?: string;
    ticketType: string; // "General", "VIP", "Combo", etc.
    status: string; // "Active","Inactive"
    price?:number;
    weekdayPrice: number;
    weekendPrice: number;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }