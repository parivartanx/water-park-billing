import { cashManagementDB } from "../db"
import { CashManagement } from "../types/cash-management"
import { decodeToken } from "./auth.controller"

export const setCashManagement = async (cashManagement: CashManagement,access_token:string) => {
    try {
        const decodedToken = decodeToken(access_token)
        if (!decodedToken) {
            throw new Error('Invalid access token')
        }
        cashManagement.createdAt = new Date().toISOString()
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

        console.log("Detailed from and to request", {from,to})

        // Create index for better querying
        await cashManagementDB.createIndex({
            index: {
                fields: ['date', 'transferById']
            }
        })

        console.log("Querying with dates:", { from, to })
        
        const response = await cashManagementDB.find({
            selector: {
                date: {
                    $gte: from,
                    $lte: to
                },
                transferById: token.id
            },
            sort: [{ date: 'desc' }]
        })
        
        console.log("Query response:", response)
        return response
    } catch (error) {
        console.error('Error getting cash management history:', error)
        return { error: 'Failed to get cash management history' }
    }
}
