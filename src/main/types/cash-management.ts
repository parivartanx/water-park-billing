
export interface CashManagement {
    _id?: string
    withdrawBy: string
    transferById?: string
    transferBy?: string
    amount: number | null
    date: string
    description: string
    createdAt?: string
    updatedAt?: string
    createdBy?: string
    updatedBy?: string
}