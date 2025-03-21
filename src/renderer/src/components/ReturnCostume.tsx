import React, { useState } from 'react'

interface CostumeDetails {
  customerName: string
  amountPaid: number
  costumeId: string
  dateIssued: string
  timeElapsed: string
  costumeName: string
  size: string
}

const ReturnCostume: React.FC = (): React.ReactElement => {
  const [customerNumber, setCustomerNumber] = useState('')
  const [costumeDetails, setCostumeDetails] = useState<CostumeDetails | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchCostumeDetails = (): void => {
    setIsProcessing(true)
    // Placeholder logic to fetch costume details
    console.log('Fetching costume details for customer number:', customerNumber)
    // Simulate fetching data
    setTimeout(() => {
      setCostumeDetails({
        customerName: 'John Doe',
        amountPaid: 75,
        costumeId: 'CST001',
        dateIssued: '2025-03-21 10:30 AM',
        timeElapsed: '2 hours 30 minutes',
        costumeName: 'Swimming Suit',
        size: 'Large'
      })
      setIsProcessing(false)
    }, 1000)
  }

  const handleRemoveDetails = (): void => {
    setCostumeDetails(null)
    console.log('Costume details removed')
  }

  const processReturn = (): void => {
    setIsProcessing(true)
    // Placeholder logic to process return
    console.log(`Processing return for customer number: ${customerNumber}`)
    setTimeout(() => {
      setIsProcessing(false)
      setCostumeDetails(null)
      setCustomerNumber('')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Return Costume</h1>
            <p className="text-gray-600 mt-2">Process costume returns and refunds</p>
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
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchCostumeDetails}
                  disabled={isProcessing || !customerNumber}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center ${
                    isProcessing || !customerNumber
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#DC004E] text-white hover:bg-[#b0003e]'
                  }`}
                >
                  {isProcessing ? (
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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

        {costumeDetails && (
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
                Costume Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Customer Name</label>
                    <p className="text-lg font-medium text-gray-900">
                      {costumeDetails.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Costume ID</label>
                    <p className="text-lg font-medium text-gray-900">#{costumeDetails.costumeId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Date Issued</label>
                    <p className="text-lg font-medium text-gray-900">{costumeDetails.dateIssued}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-500">Amount Paid</label>
                    <p className="text-lg font-medium text-[#DC004E]">
                      ₹{costumeDetails.amountPaid.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Time Elapsed</label>
                    <p className="text-lg font-medium text-gray-900">
                      {costumeDetails.timeElapsed}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Costume Details</label>
                    <p className="text-lg font-medium text-gray-900">
                      {costumeDetails.costumeName} - {costumeDetails.size}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleRemoveDetails}
                  disabled={isProcessing}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={processReturn}
                  disabled={isProcessing}
                  className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 flex items-center ${
                    isProcessing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
                    'Process Return'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReturnCostume
