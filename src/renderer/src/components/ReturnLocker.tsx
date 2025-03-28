import React, { useState, useEffect } from 'react'
import { useBillingHistoryStore } from '../stores/billingHistoriesStore'
import { useLockerRefundStore } from '../stores/lockerStore'
import toast from 'react-hot-toast'
import { format, formatDistanceToNow } from 'date-fns'

const ReturnLocker: React.FC = (): React.ReactElement => {
  const [customerPhone, setCustomerPhone] = useState('')
  const { getLockerBillingByCustomerPhone, lockerBilling, loading } = useBillingHistoryStore()
  const { 
    refundLockerBilling, 
    loading: refundLoading, 
    success, 
    refundAmount,
    reset: resetRefund
  } = useLockerRefundStore()

  // Format time elapsed since locker was issued
  const getTimeElapsed = (createdAt?: string | Date): string => {
    if (!createdAt) return 'Unknown'
    return formatDistanceToNow(new Date(createdAt), { addSuffix: false })
  }

  // Format date in a readable format
  const formatDate = (dateString?: string | Date): string => {
    if (!dateString) return 'Unknown'
    return format(new Date(dateString), 'PPpp') // Format: Mar 28, 2025, 10:30 AM
  }

  const fetchBillingDetails = async (): Promise<void> => {
    if (!customerPhone || !customerPhone.trim() || customerPhone.trim().length !== 10) {
      toast.error('Please enter a valid customer phone number')
      return
    }

    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('Please login first')
      return
    }
    
    try {
      await getLockerBillingByCustomerPhone(customerPhone, access_token)
    } catch (err) {
      console.error('Error fetching locker details:', err)
    }
  }

  const handleRemoveDetails = (): void => {
    setCustomerPhone('')
    resetRefund()
  }

  const processRefund = async (): Promise<void> => {
    if (!lockerBilling || !lockerBilling._id) {
      toast.error('No valid locker billing found')
      return
    }

    if (lockerBilling.isReturned) {
      toast.error('This locker has already been returned')
      return
    }

    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('Please login first')
      return
    }

    try {
      await refundLockerBilling(lockerBilling._id, access_token)
    } catch (err) {
      console.error('Error processing refund:', err)
    }
  }

  // Reset refund state when component unmounts
  useEffect(() => {
    return () => {
      resetRefund()
    }
  }, [resetRefund])

  // Refresh billing details after successful refund
  useEffect(() => {
    if (success && customerPhone) {
      const access_token = localStorage.getItem('access_token')
      if (access_token) {
        getLockerBillingByCustomerPhone(customerPhone, access_token)
      }
    }
  }, [success, customerPhone, getLockerBillingByCustomerPhone])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Return Locker</h1>
            <p className="text-gray-600 mt-2">
              Process locker returns and refunds
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              Locker Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Phone
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] transition-colors duration-200"
                  placeholder="Enter customer phone number"
                  maxLength={10}
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchBillingDetails}
                  disabled={loading || !customerPhone || customerPhone.length !== 10}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                    loading || !customerPhone || customerPhone.length !== 10
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#DC004E] text-white hover:bg-[#b0003e]'
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

        {lockerBilling && (
          <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
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
                Billing Details
                {lockerBilling.isReturned && (
                  <span className="ml-2 px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                    Already Returned
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">
                      Customer Name
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {lockerBilling.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Locker Number
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {lockerBilling?.lockerNames?.join(', ') || lockerBilling.lockerIds.join(', ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Date Issued</label>
                    <p className="text-lg font-medium text-gray-900">
                      {formatDate(lockerBilling.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Amount Paid</label>
                    <p className="text-lg font-medium text-[#DC004E]">
                      ₹{lockerBilling.total.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      Time Elapsed
                    </label>
                    <p className="text-lg font-medium text-gray-900">
                      {getTimeElapsed(lockerBilling.createdAt)}
                    </p>
                  </div>
                  { lockerBilling.refundAmount && (
                    <div>
                      <label className="text-sm text-gray-500 font-bold">
                        Returnable Amount
                      </label>
                      <p className="text-lg font-medium text-green-600">
                        ₹{lockerBilling.refundAmount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {success && refundAmount && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-medium text-green-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Refund Processed Successfully
                  </h3>
                  <p className="mt-2 text-green-700">
                    A refund of ₹{refundAmount.toFixed(2)} has been processed for this locker.
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleRemoveDetails}
                  disabled={loading || refundLoading}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Clear
                </button>
                {!lockerBilling.isReturned && (
                  <button
                    type="button"
                    onClick={processRefund}
                    disabled={loading || refundLoading || lockerBilling.isReturned}
                    className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 flex items-center ${
                      loading || refundLoading || lockerBilling.isReturned
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
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
                        Processing...
                      </>
                    ) : (
                      'Process Refund'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReturnLocker
