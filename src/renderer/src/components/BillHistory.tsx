import React, { useState, useEffect } from 'react'
import { useBillingHistoryStore } from '../stores/billingHistoriesStore'
import { UnifiedBill } from '../types/billing-histories'
import { format } from 'date-fns'
import { Spinner } from '../components/ui/Spinner'
import toast from 'react-hot-toast'

const BillHistory: React.FC = (): React.ReactElement => {
  // Local state for filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterType, setFilterType] = useState<
    'ticket' | 'locker' | 'costume' | 'all'
  >('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Get state and actions from the billing history store
  const { 
    loading, 
    error, 
    unifiedBills, 
    getBillingHistories,
    clearHistories
  } = useBillingHistoryStore()

  // Fetch billing histories when filters change
  useEffect(() => {
    // Only fetch if we have dates or search query
    if ((startDate && endDate) || searchQuery) {
      getBillingHistories(startDate, endDate, filterType, searchQuery)
    }
  }, [startDate, endDate, filterType, searchQuery])

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  // Reset all filters
  const handleResetFilters = () => {
    setStartDate('')
    setEndDate('')
    setFilterType('all')
    setSearchQuery('')
    clearHistories()
  }

  // Filter bills based on type if needed (additional client-side filtering)
  const filteredBills = filterType === 'all' 
    ? unifiedBills 
    : unifiedBills.filter(bill => bill.type === filterType)

  // Get appropriate color for bill type
  const getTypeColor = (type: 'ticket' | 'locker' | 'costume'): string => {
    const colors = {
      ticket: 'bg-blue-100 text-blue-800',
      locker: 'bg-purple-100 text-purple-800',
      costume: 'bg-pink-100 text-pink-800'
    }
    return colors[type]
  }

  // Handle view bill details
  const handleViewBill = (bill: UnifiedBill) => {
    toast.success(`Viewing bill details for ${bill.customerName}`)
    console.log('Bill details:', bill.originalData)
    // In a real implementation, you would navigate to a detail page or open a modal
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
                      e.target.value as 'ticket' | 'locker' | 'costume' | 'all'
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="ticket">Ticket</option>
                  <option value="locker">Locker</option>
                  <option value="costume">Costume</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
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

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Spinner className="h-10 w-10 text-[#DC004E]" />
              <span className="ml-3 text-gray-600">Loading billing history...</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Error loading data
              </h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
          )}

          {/* Data table */}
          {!loading && !error && (
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
                        {bill.type !== 'ticket' && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bill.returned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {bill.returned ? 'Returned' : 'Not Returned'}
                          </span>
                        )}
                        {bill.type === 'ticket' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewBill(bill)}
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
          )}

          {/* Empty state */}
          {!loading && !error && filteredBills.length === 0 && (
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
                {(startDate || endDate || searchQuery) 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Select a date range or enter a search term to find bills'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BillHistory
