import React, { useState, useEffect } from 'react'
import { useBillingHistoryStore } from '@renderer/stores/billingHistoriesStore'
import { useCostumeRefundStore } from '@renderer/stores/billingStore'
import toast from 'react-hot-toast'
import { format, formatDistanceToNow } from 'date-fns'

const ReturnCostume: React.FC = (): React.ReactElement => {
  const [customerNumber, setCustomerNumber] = useState('')
  const { getCostumeBillingByCustomerPhone, billingHistory, error, loading } = useBillingHistoryStore()
  const { 
    refundCostumeBilling, 
    loading: refundLoading, 
    success, 
    reset: resetRefund
  } = useCostumeRefundStore()

  // Format time elapsed since costume was issued
  const getTimeElapsed = (createdAt?: string): string => {
    if (!createdAt) return 'Unknown'
    return formatDistanceToNow(new Date(createdAt), { addSuffix: false })
  }

  // Format date in a readable format
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown'
    return format(new Date(dateString), 'PPpp') // Format: Mar 28, 2025, 10:30 AM
  }

  const fetchCostumeDetails = async (): Promise<void> => {
    if (!customerNumber || !customerNumber.trim() || customerNumber.trim().length !== 10) {
      toast.error('Please enter a valid customer number')
      return
    }

    const access_token = localStorage.getItem('access_token')
    if(!access_token) {
      toast.error('Please login first')
      return
    }
    
    try {
      await getCostumeBillingByCustomerPhone(customerNumber, access_token)
    } catch (err) {
      console.error('Error fetching costume details:', err)
    }
  }

  const handleRemoveDetails = (): void => {
    useBillingHistoryStore.setState({ billingHistory: null })
    setCustomerNumber('')
    resetRefund()
  }

  const processReturn = async (): Promise<void> => {
    if (!billingHistory || !billingHistory._id) {
      toast.error('No valid billing record to process')
      return
    }

    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('Please login first')
      return
    }

    try {
      await refundCostumeBilling(billingHistory._id, access_token)
      
      // If refund was successful, refresh the billing history to show updated status
      if (success) {
        setTimeout(() => {
          getCostumeBillingByCustomerPhone(customerNumber, access_token)
        }, 1000)
      }
    } catch (err) {
      console.error('Error processing return:', err)
    }
  }

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Clean up state when component unmounts
  useEffect(() => {
    return () => {
      resetRefund()
      useBillingHistoryStore.setState({ billingHistory: null })
    }
  }, [resetRefund])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Return Costume</h1>
            <p className="text-gray-600 mt-2">
              Process costume returns and refunds
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-[#DC004E]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Customer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Number
                </label>
                <input
                  type="text"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] transition-colors duration-200"
                  placeholder="Enter customer number"
                  maxLength={10}
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchCostumeDetails}
                  disabled={loading || !customerNumber || customerNumber.length !== 10}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                    loading || !customerNumber || customerNumber.length !== 10
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#DC004E] to-[#A30342] text-white hover:from-[#c0003e] hover:to-[#8a0238]'
                  }`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    'Fetch Details'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {billingHistory && (
          <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-[#DC004E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Costume Details
                </h2>
                {billingHistory.isReturned && (
                  <span className="px-3 py-1 text-sm font-semibold bg-green-100 text-green-800 rounded-full flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Already Returned
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">
                      Customer Name
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {billingHistory.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Bill ID</label>
                    <p className="text-lg font-medium text-gray-900">
                      #{billingHistory._id?.substring(0, 8) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Date Issued</label>
                    <p className="text-lg font-medium text-gray-900">
                      {formatDate(billingHistory.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Amount Paid</label>
                    <p className="text-lg font-medium text-[#DC004E]">
                      ₹{billingHistory.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Time Elapsed
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {getTimeElapsed(billingHistory.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Payment Method
                    </label>
                    <p className="text-lg font-medium text-gray-900 capitalize">
                      {billingHistory.paymentMode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Costume Items */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Costume Items
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item #</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {billingHistory.costumes.map((costume, index) => (
                          <tr key={costume._id || index}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{costume._id?.substring(0, 8) || `Item ${index + 1}`}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{costume.category}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{costume.size}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{costume.quantity}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">₹{costume.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">₹{billingHistory.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            Discount ({billingHistory.discountType === 'percentage' ? `${billingHistory.discount}%` : '₹' + billingHistory.discount}):
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">₹{billingHistory.discountAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total Amount:</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">₹{billingHistory.total?.toFixed(2) || 0}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Returnable Amount:</td>
                          <td className="px-4 py-3 text-sm font-bold text-[#DC004E] text-right">₹{billingHistory.refundAmount?.toFixed(2) || 0}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Return confirmation section */}
              {!billingHistory.isReturned && (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-amber-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">Return Confirmation</h4>
                      <p className="mt-1 text-sm text-amber-700">
                        You are about to process a return for costume items rented by {billingHistory.customerName}. 
                        A refund of <span className="font-semibold">₹{billingHistory.refundAmount?.toFixed(2) || 0}</span> will be processed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleRemoveDetails}
                  disabled={refundLoading}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Clear
                </button>
                {!billingHistory.isReturned && (
                  <button
                    type="button"
                    onClick={processReturn}
                    disabled={refundLoading || success}
                    className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 flex items-center ${
                      refundLoading || success
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#FFB800] to-[#FF9500] text-white hover:from-[#e6a600] hover:to-[#e68600]'
                    }`}
                  >
                    {refundLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing Return...
                      </>
                    ) : success ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Return Processed
                      </>
                    ) : (
                      'Process Return'
                    )}
                  </button>
                )}
                {billingHistory.isReturned && (
                  <div className="px-6 py-2 bg-green-100 text-green-800 font-medium rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Already Returned
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!billingHistory && !loading && error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600">{error}</p>
            <p className="text-gray-600 mt-2">Please check the customer number and try again</p>
          </div>
        )}

        {/* Success message after return */}
        {success && !billingHistory?.isReturned && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-green-800 mb-2">Return Processed Successfully!</h3>
            <p className="text-green-700">The costume has been returned and the inventory has been updated.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReturnCostume
