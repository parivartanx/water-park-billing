import { cashManagementDB } from "../db"
import { CashManagement } from "../types/cash-management"
import { decodeToken } from "./auth.controller"
import { todayISTDateTime } from "./ist.controller"

export const setCashManagement = async (cashManagement: CashManagement,access_token:string) => {
    try {
        const decodedToken = decodeToken(access_token)
        if (!decodedToken) {
            throw new Error('Invalid access token')
        }
        cashManagement.createdAt = todayISTDateTime().toISOString()
        cashManagement.transferById = decodedToken.id
        cashManagement.createdBy = decodedToken.id
        const response = await cashManagementDB.post(cashManagement)
        return response
    } catch (error) {
        console.error('Error setting cash management:', error)
        return { error: 'Failed to set cash management' }
    }
}

export const getCashManagementHistory = async (from:string, to:string, access_token:string) => {
    try {
        const token = decodeToken(access_token)
        if (!token) {
            throw new Error('Invalid access token')
        }

        // Create index for better querying
        await cashManagementDB.createIndex({
            index: {
                fields: ['date', 'transferById']
            }
        })

        
        const response = await cashManagementDB.find({
            selector: {
                createdAt: {
                    $gte: from,
                    $lte: to
                },
                transferById: token.id
            },
            sort: [{ createdAt: 'desc' }]
        })
        
        return response
    } catch (error) {
        console.error('Error getting cash management history:', error)
        return { error: 'Failed to get cash management history' }
    }
}
