import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useCashManagementStore } from '../stores/cash-management-store'
import { CashManagement } from '../../../main/types/cash-management'
import { useBillingHistoryStore } from '../stores/billingHistoriesStore'
import { UnifiedBilling } from '@renderer/types/unified-billing'

type WithdrawalFormData = Pick<
  CashManagement,
  'withdrawBy' | 'amount' | 'date' | 'description'
>

const CashStore: React.FC = () => {
  const { cashHistory, loading, setCashManagement, getCashHistory } =
    useCashManagementStore()

  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0); // Set to today at 00:00:00
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999); // Set to today at 23:59:59.999

  const [withdrawalData, setWithdrawalData] = useState<WithdrawalFormData>({
    withdrawBy: '',
    amount: null,
    // set today date
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  /// usestate of total cash amount
  const [totalCashAmount, setTotalCashAmount] = useState(0)

  const [availableCash, setAvailableCash] = useState(0)

  // Get state and actions from the billing history store
  const { 
    unifiedBills, 
    getBillingHistories,
    // clearHistories
  } = useBillingHistoryStore()

  // use callback to get billingHistory and calculate total cash amount
  const getTotalCashAmount = useCallback(async () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      toast.error('Unauthorized: Access token not found');
      return;
    }

    // Only fetch if we have dates or search query
    if ((startDate && endDate)) {
      await getBillingHistories(startDate.toISOString(), endDate.toISOString(), 'all', '', accessToken)
      const totalCash = unifiedBills?.reduce((acc: number, bill: UnifiedBilling) => acc + (bill.cashPaid || 0), 0) || 0
      setTotalCashAmount(totalCash)
    }
  }, [getBillingHistories])

  // Fetch billing histories when filters change
  useEffect(() => {
    getTotalCashAmount()
  }, [getTotalCashAmount])


  // Fetch cash history for today on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      toast.error('Failed to retrieve access token');
      return;
    }
    getCashHistory(startDate.toISOString(), endDate.toISOString(), accessToken);
  }, [getCashHistory]);

  // Calculate available cash whenever cashHistory or totalCashAmount changes
  useEffect(() => {
    const todayWithdrawals = cashHistory.reduce((acc: number, cash: CashManagement) => acc + (cash.amount || 0), 0);
    setAvailableCash(totalCashAmount - todayWithdrawals);
  }, [cashHistory, totalCashAmount]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setWithdrawalData({
      ...withdrawalData,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) {
        toast.error('Failed to retrieve access token')
        return
      }

      if (!withdrawalData.amount) {
        toast.error('Amount is required')
        return
      }
      /// check amoun
      if (withdrawalData.amount > availableCash) {
        toast.error('Insufficient cash available')
        return
      }
      await setCashManagement(
        {
          withdrawBy: withdrawalData.withdrawBy,
          amount: withdrawalData.amount,
          date: withdrawalData.date,
          description: withdrawalData.description
        },
        accessToken
      )

      toast.success('Cash withdrawal recorded successfully')
      setWithdrawalData({
        date: new Date().toISOString().split('T')[0],
        withdrawBy: '',
        amount: 0,
        description: ''
      })
      // After successful withdrawal, refresh cash history for today
      await getCashHistory(startDate.toISOString(), endDate.toISOString(), accessToken)
    } catch (error) {
      console.error('Error recording withdrawal:', error)
      toast.error('Failed to record withdrawal')
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#DC004E] border-b-2 border-[#DC004E]/20 pb-2">
          Cash Management
        </h1>

        {/* Cash Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-[#DC004E]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Total Cash Payment
              </h3>
              <div className="bg-gradient-to-r from-[#DC004E] to-[#A30342] p-3 rounded-full shadow-md">
                <span className="text-white text-xl">💰</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">
              ₹
              {totalCashAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Total cash collected from all transactions
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Available Cash
              </h3>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-full shadow-md">
                <span className="text-white text-xl">💵</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-gray-800">
              ₹
              {availableCash.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Cash available for withdrawal
            </p>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-[#DC004E] to-[#A30342] p-2 rounded-full mr-3">
              <span className="text-white">💸</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Withdraw Cash
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={withdrawalData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdrawn By
                </label>
                <input
                  type="text"
                  name="withdrawBy"
                  value={withdrawalData.withdrawBy}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={withdrawalData.amount ?? ''}
                  onChange={(e) =>
                    setWithdrawalData({
                      ...withdrawalData,
                      amount: parseFloat(e.target.value) || null
                    })
                  }
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Amount"
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={withdrawalData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#DC004E] to-[#A30342] text-white rounded-md hover:from-[#A30342] hover:to-[#DC004E] focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:ring-offset-2 disabled:opacity-50 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>Withdraw Cash</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-[#DC004E] to-[#A30342] p-2 rounded-full mr-3">
              <span className="text-white">📝</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Recent Transactions
            </h2>
          </div>

          {loading && cashHistory.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#DC004E]"></div>
            </div>
          ) : cashHistory.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">📊</div>
              <p className="text-gray-600 text-lg">No transactions found</p>
              <p className="text-gray-500 text-sm mt-2">
                All your cash withdrawals will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Withdrawn By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cashHistory.map((item, index) => (
                    <tr key={item._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.withdrawBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{item.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CashStore
