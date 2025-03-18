/* eslint-disable prettier/prettier */
import React, { useState } from 'react'

interface BillingDetails {
  customerName: string
  amountPaid: number
}

const ReturnLocker: React.FC = (): React.ReactElement => {
  const [lockerNumber, setLockerNumber] = useState('')
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)

  const fetchBillingDetails = (): void => {
    // Placeholder logic to fetch billing details
    console.log(`Fetching billing details for locker number: ${lockerNumber}`)
    // Simulate fetching data
    setBillingDetails({
      customerName: 'John Doe',
      amountPaid: 50
    })
    setLockerNumber('') // Clear the input field after fetching details
  }

  const handleRemoveDetails = (): void => {
    setBillingDetails(null)
    console.log('Locker details removed')
  }

  const processRefund = (): void => {
    // Placeholder logic to process refund
    console.log(`Processing refund for locker number: ${lockerNumber}`)
  }

  return (
    <div className="space-y-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Return Locker</h1>
        <p className="text-gray-500 mt-1">Enter locker number to fetch billing details</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locker Number</label>
            <input
              type="text"
              value={lockerNumber}
              onChange={(e) => setLockerNumber(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchBillingDetails}
              className="px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#DC004E] focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:ring-offset-2"
            >
              Fetch Details
            </button>
          </div>
        </div>
      </div>

      {billingDetails && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E] mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Billing Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer Name</span>
              <span className="font-medium">{billingDetails.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount Paid</span>
              <span className="font-medium">${billingDetails.amountPaid.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleRemoveDetails}
              className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={processRefund}
          className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Refund
        </button>
      </div>
    </div>
  )
}

export default ReturnLocker
