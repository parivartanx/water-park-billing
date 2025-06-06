import React, { useState, useEffect } from 'react'

interface Bill {
  id: number
  customerName: string
  phone: string
  date: string
  quantity: number
  type: 'ticket' | 'locker' | 'costume'
  totalAmount: number
  subtotal: number
  gst: number
  discount: number
  paymentMode: 'cash' | 'card' | 'upi'
  returned: boolean
  // Additional type-specific details
  costumeSizes?: string[]
  lockerNumbers?: string[]
  ticketId?: string
}

const BillHistory: React.FC = (): React.ReactElement => {
  const [bills, setBills] = useState<Bill[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterType, setFilterType] = useState<
    'ticket' | 'locker' | 'costume' | ''
  >('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)

  useEffect(() => {
    console.log('Fetching bill history')
    // Updated bill data with new fields
    setBills([
      {
        id: 1,
        customerName: 'John Doe',
        phone: '123-456-7890',
        date: '2023-10-01',
        quantity: 2,
        type: 'ticket',
        totalAmount: 100,
        subtotal: 90,
        gst: 10,
        discount: 5,
        paymentMode: 'cash',
        returned: false,
        ticketId: 'TICK-001'
      },
      {
        id: 2,
        customerName: 'Jane Smith',
        phone: '987-654-3210',
        date: '2023-10-02',
        quantity: 1,
        type: 'locker',
        totalAmount: 150,
        subtotal: 140,
        gst: 15,
        discount: 10,
        paymentMode: 'card',
        returned: true,
        lockerNumbers: ['A1', 'A2']
      },
      {
        id: 3,
        customerName: 'Mike Johnson',
        phone: '555-123-4567',
        date: '2023-10-03',
        quantity: 3,
        type: 'costume',
        totalAmount: 200,
        subtotal: 180,
        gst: 20,
        discount: 15,
        paymentMode: 'upi',
        returned: true,
        costumeSizes: ['L', 'XL', 'M']
      }
    ])
  }, [])

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.date)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    const matchesDate =
      (!start || billDate >= start) && (!end || billDate <= end)
    const matchesType = !filterType || bill.type === filterType
    const matchesSearch =
      !searchQuery ||
      bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.phone.includes(searchQuery)
    return matchesDate && matchesType && matchesSearch
  })

  const getTypeColor = (type: 'ticket' | 'locker' | 'costume'): string => {
    const colors = {
      ticket: 'bg-blue-100 text-blue-800',
      locker: 'bg-purple-100 text-purple-800',
      costume: 'bg-pink-100 text-pink-800'
    }
    return colors[type]
  }

  const handleViewBillDetails = (bill: Bill) => {
    setSelectedBill(bill)
  }

  const closeModal = () => {
    setSelectedBill(null)
  }

  const renderTypeSpecificDetails = (bill: Bill) => {
    switch (bill.type) {
      case 'ticket':
        return (
          <div className="flex justify-between">
            <span className="text-gray-600">Ticket ID:</span>
            <span className="font-medium">{bill.ticketId}</span>
          </div>
        )
      case 'locker':
        return (
          <div className="flex justify-between">
            <span className="text-gray-600">Locker Numbers:</span>
            <span className="font-medium">{bill.lockerNumbers?.join(', ')}</span>
          </div>
        )
      case 'costume':
        return (
          <div className="flex justify-between">
            <span className="text-gray-600">Costume Sizes:</span>
            <span className="font-medium">{bill.costumeSizes?.join(', ')}</span>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bill History</h1>
            <p className="text-gray-600 mt-2">
              View and manage past billing records
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customer or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] placeholder-gray-400"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute right-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] text-sm"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type Filter
                </label>
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as 'ticket' | 'locker' | 'costume' | ''
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] text-sm"
                >
                  <option value="">All Types</option>
                  <option value="ticket">Ticket</option>
                  <option value="locker">Locker</option>
                  <option value="costume">Costume</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                    setFilterType('')
                    setSearchQuery('')
                  }}
                  className="px-4 py-2 text-[#DC004E] hover:bg-pink-50 rounded-lg transition-colors duration-200 flex items-center text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {bill.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bill.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(bill.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor(bill.type)}`}
                      >
                        {bill.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{bill.totalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bill.returned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {bill.returned ? 'Returned' : 'Not Returned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewBillDetails(bill)}
                        className="text-[#DC004E] hover:text-[#b0003e] font-medium flex items-center justify-end space-x-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBills.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No bills found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>

        {selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Bill Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Name:</span>
                  <span className="font-medium">{selectedBill.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number:</span>
                  <span className="font-medium">{selectedBill.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(selectedBill.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className={`font-medium capitalize ${getTypeColor(selectedBill.type)}`}>
                    {selectedBill.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{selectedBill.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{selectedBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-₹{selectedBill.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST:</span>
                  <span className="font-medium text-blue-600">+₹{selectedBill.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-[#DC004E]">₹{selectedBill.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Mode:</span>
                  <span className="font-medium capitalize">{selectedBill.paymentMode}</span>
                </div>
                {renderTypeSpecificDetails(selectedBill)}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${selectedBill.returned ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedBill.returned ? 'Returned' : 'Not Returned'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BillHistory
