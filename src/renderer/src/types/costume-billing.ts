
export interface CostumeBill{
    _id?: string
    customerName: string
    customerNumber: string
    costumes: {
        _id?: string
        quantity: number
        amount: number
        category?: string
        size?: string
        refundPrice?: number
    }[]
    discount: number
    discountType: 'flat' | 'percentage'
    paymentMode: 'cash' | 'card' | 'upi'
    refundAmount?: number

    subtotal: number
    discountAmount: number
    total: number
    gstAmount: number
    isReturned: boolean
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
}