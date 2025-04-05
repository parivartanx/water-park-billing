export interface CostumeStock {
    _id?: string
    category: string
    size: string
    quantity: number
    pricePerUnit: number
    refundPrice: number
    createdAt?: string
    updatedAt?: string
    createdBy?: string
}

export interface V2CostumeStock {
    _id?: string
    category: string
    quantity: number
    pricePerUnit: number
    refundPrice: number
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
}