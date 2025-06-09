import React, { useState, useEffect, useMemo } from 'react'
import { useBillingHistoryStore } from '../stores/billingHistoriesStore'
import { UnifiedBilling } from '../types/unified-billing'
import { format } from 'date-fns'
import { Spinner } from '../components/ui/Spinner'
import toast from 'react-hot-toast'

const BillHistory: React.FC = (): React.ReactElement => {
  // Local state for filters
  // const [startDate, setStartDate] = useState('')
  // const [endDate, setEndDate] = useState('')
  const [filterType, setFilterType] = useState<
    'ticket' | 'locker' | 'costume' | 'all'
  >('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedBill, setExpandedBill] = useState<string | null>(null)
  
  // Get state and actions from the billing history store
  const { 
    loading, 
    error, 
    unifiedBills, 
    getBillingHistories,
    // clearHistories
  } = useBillingHistoryStore()

  // Fetch billing histories when filters change
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      toast.error('Unauthorized: Access token not found');
      return;
    }
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0); // Set to today at 00:00:00
    const endDate = new Date(now);  // Set to today at 23:59:59
    // Only fetch if we have dates or search query
    if ((startDate && endDate) || searchQuery) {
      getBillingHistories(startDate.toISOString(), endDate.toISOString(), filterType, searchQuery, accessToken)
    }
  }, [filterType, searchQuery])

  // Format date for display
  const formatDate = (dateString: string | Date): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  // // Reset all filters
  // const handleResetFilters = () => {
  //   // setStartDate('')
  //   // setEndDate('')
  //   setFilterType('all')
  //   setSearchQuery('')
  //   clearHistories()
  // }

  // Filter bills based on type if needed (additional client-side filtering)
  const filteredBills = useMemo(() => {
    if (filterType === 'all') {
      return unifiedBills || []
    }
    
    return (unifiedBills || []).filter(bill => {
      if (filterType === 'ticket' && bill.tickets && bill.tickets.length > 0) {
        return true
      }
      if (filterType === 'locker' && bill.lockers && bill.lockers.length > 0) {
        return true
      }
      if (filterType === 'costume' && bill.costumes && bill.costumes.length > 0) {
        return true
      }
      return false
    })
  }, [unifiedBills, filterType])

  // Calculate payment mode totals
  const paymentModeTotals = useMemo(() => {
    const totals = {
      cash: 0,
      online: 0,
      total: 0
    }

    filteredBills.forEach(bill => {
      totals.cash += bill.cashPaid || 0
      totals.online += bill.onlinePaid || 0
      totals.total += bill.total || 0
    })

    return totals
  }, [filteredBills])

  // Toggle expanded view for a bill
  const toggleExpandBill = (billId: string | undefined) => {
    if (!billId) return;
    
    if (expandedBill === billId) {
      setExpandedBill(null);
    } else {
      setExpandedBill(billId);
    }
  };

  // Get bill type color based on products
  // const getBillTypeColor = (bill: UnifiedBilling): string => {
  //   if (bill.tickets && bill.tickets.length > 0) {
  //     return 'bg-blue-100 text-blue-800'
  //   } else if (bill.lockers && bill.lockers.length > 0) {
  //     return 'bg-purple-100 text-purple-800'
  //   } else if (bill.costumes && bill.costumes.length > 0) {
  //     return 'bg-pink-100 text-pink-800'
  //   }
  //   return 'bg-gray-100 text-gray-800'
  // }

  // // Get bill type label
  // const getBillTypeLabel = (bill: UnifiedBilling): string => {
  //   const types: string[] = []
  //   if (bill.tickets && bill.tickets.length > 0) types.push('Ticket')
  //   if (bill.lockers && bill.lockers.length > 0) types.push('Locker')
  //   if (bill.costumes && bill.costumes.length > 0) types.push('Costume')
    
  //   return types.join(', ') || 'Unknown'
  // }

  // Calculate total quantity for a bill
  const getBillQuantity = (bill: UnifiedBilling): number => {
    let total = 0
    
    if (bill.tickets) {
      total += bill.tickets.reduce((sum, ticket) => sum + (ticket.quantity || 0), 0)
    }
    
    if (bill.lockers) {
      total += bill.lockers.reduce((sum, locker) => sum + (locker.quantity || 0), 0)
    }
    
    if (bill.costumes) {
      total += bill.costumes.reduce((sum, costume) => sum + (costume.quantity || 0), 0)
    }
    
    return total
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

        {/* Payment Mode Summary Cards */}
        {!loading && !error && (filteredBills || []).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cash Payments</p>
                  <p className="text-2xl font-bold text-gray-800">₹{paymentModeTotals.cash.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Online Payments</p>
                  <p className="text-2xl font-bold text-gray-800">₹{paymentModeTotals.online.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
            </div> */}
            
            {/* <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-[#DC004E]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800">₹{paymentModeTotals.total.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-pink-100 rounded-full">
                  <svg className="w-6 h-6 text-[#DC004E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div> */}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <div>
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
              </div> */}
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
              {/* <div className="flex items-end">
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
              </div> */}
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
                      
                    </th>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(filteredBills || []).map((bill) => (
                    <React.Fragment key={bill._id}>
                      <tr
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => toggleExpandBill(bill._id)}
                            className="text-gray-500 hover:text-[#DC004E] transition-colors"
                          >
                            {expandedBill === bill._id ? '▼' : '▶'}
                          </button>
                        </td>                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-[#DC004E]/10 flex items-center justify-center mr-3">
                              <span className="text-[#DC004E] font-bold">
                                {bill.customerName.charAt(0)}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {bill.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {bill.customerNumber}
                              </div>
                              {(bill.ticketsNo || bill.stickersNo) && (
                                <div className="text-xs text-gray-400 mt-1">
                                  {bill.ticketsNo && <span>Ticket: {bill.ticketsNo}</span>}
                                  {bill.ticketsNo && bill.stickersNo && <span> • </span>}
                                  {bill.stickersNo && <span>Sticker: {bill.stickersNo}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(bill.createdAt || new Date())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            {bill.tickets && bill.tickets.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                <span className="mr-1">🎫</span>
                              </span>
                            )}
                            {bill.lockers && bill.lockers.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                <span className="mr-1">🔐</span>
                              </span>
                            )}
                            {bill.costumes && bill.costumes.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                <span className="mr-1">👗</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getBillQuantity(bill)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{bill.total.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bill.isReturned ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {bill.isReturned ? 'Returned' : 'Not Returned'}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded details row */}
                      {expandedBill === bill._id && (
                        <tr className="bg-gray-50">                          <td colSpan={7} className="py-4 px-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Customer Information */}
                              {(bill.ticketsNo || bill.stickersNo) && (
                                <div className="bg-white p-4 rounded shadow-sm">
                                  <h4 className="font-semibold text-sm mb-2 text-gray-700 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Customer Info
                                  </h4>
                                  <div className="space-y-2">
                                    {bill.ticketsNo && (
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Ticket Number:</span>
                                        <span className="text-sm font-medium">{bill.ticketsNo}</span>
                                      </div>
                                    )}
                                    {bill.stickersNo && (
                                      <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Sticker Number:</span>
                                        <span className="text-sm font-medium">{bill.stickersNo}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Payment details */}
                              <div className="bg-white p-4 rounded shadow-sm">
                                <h4 className="font-semibold text-sm mb-2 text-gray-700 flex items-center">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  Payment Details
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Cash:</span>
                                    <span className="text-sm font-medium">₹{bill.cashPaid.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Online:</span>
                                    <span className="text-sm font-medium">₹{bill.onlinePaid.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t">
                                    <span className="text-sm font-semibold">Total:</span>
                                    <span className="text-sm font-semibold">₹{bill.total.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Ticket details */}
                              {bill.tickets && bill.tickets.length > 0 && (
                                <div className="bg-white p-4 rounded shadow-sm">
                                  <h4 className="font-semibold text-sm mb-2 text-blue-700 flex items-center">
                                    <span className="mr-2">🎫</span> Tickets
                                  </h4>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {bill.tickets.map((ticket, idx) => (
                                      <div key={idx} className="text-sm border-b pb-1 last:border-b-0">
                                        <div className="flex justify-between">
                                          <span>{ticket.ticketType || 'Ticket'}</span>
                                          <span>x{ticket.quantity}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                          <span>₹{ticket.price} each</span>
                                          <span>₹{ticket.totalAmount}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Locker details */}
                              {bill.lockers && bill.lockers.length > 0 && (
                                <div className="bg-white p-4 rounded shadow-sm">
                                  <h4 className="font-semibold text-sm mb-2 text-green-700 flex items-center">
                                    <span className="mr-2">🔐</span> Lockers
                                  </h4>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {bill.lockers.map((locker, idx) => (
                                      <div key={idx} className="text-sm border-b pb-1 last:border-b-0">
                                        <div className="flex justify-between">
                                          <span>Locker {locker.lockerNames?.join(', ') || '#' + (idx + 1)}</span>
                                          <span>x{locker.quantity}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                          <span>₹{locker.price} each</span>
                                          <span>₹{locker.price * locker.quantity}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Costume details */}
                              {bill.costumes && bill.costumes.length > 0 && (
                                <div className="bg-white p-4 rounded shadow-sm">
                                  <h4 className="font-semibold text-sm mb-2 text-purple-700 flex items-center">
                                    <span className="mr-2">👗</span> Costumes
                                  </h4>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {bill.costumes.map((costume, idx) => (
                                      <div key={idx} className="text-sm border-b pb-1 last:border-b-0">
                                        <div className="flex justify-between">
                                          <span>{costume.category || 'Costume'}</span>
                                          <span>x{costume.quantity}</span>
                                        </div>
                                         <div className="flex justify-between text-xs text-gray-500">
                                        <span>₹{costume.amount / costume.quantity} each</span>
                                        <span>₹{costume.amount}</span>
                                      </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && (filteredBills || []).length === 0 && (
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
              {/* <p className="mt-1 text-sm text-gray-500">
                {(startDate || endDate || searchQuery) 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Select a date range or search to find bills'}
              </p> */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BillHistory
