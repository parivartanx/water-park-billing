
export interface CostumeBill {
    _id?: string
    customerName: string
    customerNumber: string
    costumes: {
        _id?: string
        quantity: number
        amount: number
    }[]
    discount: number
    discountType: 'flat' | 'percentage'
    paymentMode: 'cash' | 'card' | 'upi'

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