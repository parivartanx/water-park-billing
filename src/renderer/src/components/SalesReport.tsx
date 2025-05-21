import React, { useState, useEffect, useMemo } from 'react'
import { useBillingHistoryStore } from '../stores/billingHistoriesStore'
import { format } from 'date-fns'
import { Spinner } from './ui/Spinner'
import toast from 'react-hot-toast'
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, ChartLegend, CategoryScale, LinearScale, BarElement, Title)

const SalesReport: React.FC = (): React.ReactElement => {
  // Local state for filters
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [filterType, setFilterType] = useState<'ticket' | 'locker' | 'costume' | 'all'>('all')
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'all'>('today')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Get state and actions from the billing history store
  const { 
    loading, 
    error, 
    unifiedBills, 
    getBillingHistories,
  } = useBillingHistoryStore()

  // Set date range based on selected period
  useEffect(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (filterPeriod === 'today') {
      setStartDate(format(today, 'yyyy-MM-dd'))
      setEndDate(format(today, 'yyyy-MM-dd'))
    } else if (filterPeriod === 'yesterday') {
      setStartDate(format(yesterday, 'yyyy-MM-dd'))
      setEndDate(format(yesterday, 'yyyy-MM-dd'))
    } 
    else if (filterPeriod === 'all') {
      // Set to a wide date range to get all data
      const oneYearAgo = new Date(today)
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      setStartDate(format(oneYearAgo, 'yyyy-MM-dd'))
      setEndDate(format(today, 'yyyy-MM-dd'))
    }
  }, [filterPeriod])

  // Fetch billing histories when filters change
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      toast.error('Unauthorized: Access token not found')
      return
    }
    
    // Create start and end date with proper time
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    
    // Fetch data
    getBillingHistories(start.toISOString(), end.toISOString(), filterType, searchQuery, accessToken)
  }, [startDate, endDate, filterType, searchQuery, getBillingHistories])

  // Format date for display
  const formatDate = (dateString: string | Date): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  // Filter bills based on type and payment method (only cash-based sales)
  const filteredBills = useMemo(() => {
    // First filter for cash-based sales only
    const cashOnlyBills = (unifiedBills || []).filter(bill => {
      // Include only bills with cash payments greater than 0
      return bill.cashPaid > 0
    })
    
    // Then apply category filter if needed
    if (filterType === 'all') {
      return cashOnlyBills
    }
    
    return cashOnlyBills.filter(bill => {
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
  // Calculate summary totals
  const summary = useMemo(() => {
    const result = {
      totalAmount: 0,
      cashAmount: 0,
      onlineAmount: 0,
      refundAmount: 0,
      pendingRefundAmount: 0,
      completedRefundAmount: 0,
      totalRefundableAmount: 0,
      finalSales: 0,
      ticketCount: 0,
      lockerCount: 0,
      costumeCount: 0,
      ticketAmount: 0,
      lockerAmount: 0,
      costumeAmount: 0,
      transactionCount: filteredBills.length
    }

    filteredBills.forEach(bill => {
      // Calculate total amounts
      result.totalAmount += bill.total || 0
      result.cashAmount += bill.cashPaid || 0
      result.onlineAmount += bill.onlinePaid || 0
     
      
      // Calculate total refundable amount for today's transactions
      for(const locker of bill.lockers || []) {
        if(bill.isReturned){
          result.completedRefundAmount += locker.refundPrice || 0

        }
        result.totalRefundableAmount += locker.refundPrice || 0
      }
      for(const costume of bill.costumes || []) {
        if(bill.isReturned){
          result.completedRefundAmount += costume.refundPrice || 0
        }
        result.totalRefundableAmount += costume.refundPrice || 0
      }

      // Count items and their amounts
      if (bill.tickets && bill.tickets.length > 0) {
        bill.tickets.forEach(ticket => {
          result.ticketCount += ticket.quantity || 0
          result.ticketAmount += ticket.totalAmount || 0
        })
      }
      
      if (bill.lockers && bill.lockers.length > 0) {
        bill.lockers.forEach(locker => {
          result.lockerCount += locker.quantity || 0
          result.lockerAmount += locker.price || 0
        })
      }
      
      if (bill.costumes && bill.costumes.length > 0) {
        bill.costumes.forEach(costume => {
          result.costumeCount += costume.quantity || 0
          result.costumeAmount += costume.amount || 0
        })
      }
    })
    
    // Calculate final sales (total minus refunds)
    result.finalSales = result.totalAmount - result.refundAmount
    result.pendingRefundAmount = result.totalRefundableAmount - result.completedRefundAmount
    
    return result
  }, [filteredBills])

  // Prepare chart data for Chart.js (cash only)
  // const paymentChartData = {
  //   labels: ['Cash'],
  //   datasets: [
  //     {
  //       data: [summary.cashAmount],
  //       backgroundColor: ['#0088FE'],
  //       borderColor: ['#0088FE'],
  //       borderWidth: 1,
  //     },
  //   ],
  // }
  
  const categoryChartData = {
    labels: ['Tickets', 'Lockers', 'Costumes'],
    datasets: [
      {
        label: 'Sales Amount',
        data: [summary.ticketAmount, summary.lockerAmount, summary.costumeAmount],
        backgroundColor: ['#0088FE', '#00C49F', '#FFBB28'],
      },
    ],
  }
  
  // Chart options
  // const pieOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'bottom' as const,
  //     },
  //     tooltip: {
  //       callbacks: {
  //         label: function(context) {
  //           const label = context.label || '';
  //           const value = context.raw || 0;
  //           return `${label}: ₹${Number(value).toFixed(2)}`;
  //         }
  //       }
  //     }
  //   },
  // }
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ₹${Number(value).toFixed(2)}`;
          }
        }
      }
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cash Sales Report</h1>
            <p className="text-gray-600 mt-2">
              View and analyze cash-based sales data across all transactions
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as 'today' | 'yesterday' | 'all')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              >
                <option value="today">Today</option>
                {/* <option value="yesterday">Yesterday</option> */}
                {/* <option value="all">All Time</option> */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'ticket' | 'locker' | 'costume' | 'all')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              >
                <option value="all">All Categories</option>
                <option value="ticket">Tickets</option>
                <option value="locker">Lockers</option>
                <option value="costume">Costumes</option>
              </select>
            </div>
            
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              />
            </div> */}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Spinner className="h-10 w-10 text-[#DC004E]" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}        {/* Summary Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-800">₹{summary.totalAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Transactions: {summary.transactionCount}</p>
              </div>
            </div> */}
            
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cash Payments</p>
                  <p className="text-2xl font-bold text-gray-800">₹{summary.cashAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Transactions: {summary.transactionCount}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Refunds</p>
                  <p className="text-2xl font-bold text-gray-800">₹{summary.pendingRefundAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Total Refundable: ₹{summary.totalRefundableAmount.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed Refunds</p>
                  <p className="text-2xl font-bold text-gray-800">₹{summary.completedRefundAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Total Refunds: ₹{summary.refundAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Refund Summary */}
        {!loading && !error && filteredBills.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Refund Summary</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium mb-4 text-gray-700">Today's Refund Status</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending Refunds:</span>
                      <span className="font-semibold text-yellow-600">₹{summary.pendingRefundAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed Refunds:</span>
                      <span className="font-semibold text-green-600">₹{summary.completedRefundAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-gray-700 font-medium">Total Refunds:</span>
                      <span className="font-bold text-gray-800">₹{summary.refundAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-4 text-gray-700">Refundable Transactions</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Refundable Amount:</span>
                      <span className="font-semibold text-blue-600">₹{summary.totalRefundableAmount.toFixed(2)}</span>
                    </div>
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, (summary.pendingRefundAmount / (summary.totalRefundableAmount || 1)) * 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>0%</span>
                        <span>Pending Refunds: {summary.totalRefundableAmount ? ((summary.pendingRefundAmount / summary.totalRefundableAmount) * 100).toFixed(1) : 0}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Summary */}
        {!loading && !error && filteredBills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold mb-2">Tickets</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Count: {summary.ticketCount}</p>
                  <p className="text-gray-600">Amount: ₹{summary.ticketAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold mb-2">Lockers</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Count: {summary.lockerCount}</p>
                  <p className="text-gray-600">Amount: ₹{summary.lockerAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold mb-2">Costumes</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">Count: {summary.costumeCount}</p>
                  <p className="text-gray-600">Amount: ₹{summary.costumeAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-pink-100 rounded-full">
                  <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {!loading && !error && filteredBills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
              <div style={{ height: '300px', position: 'relative' }}>
                <Bar data={categoryChartData} options={barOptions} />
              </div>
            </div>
            

          </div>
        )}

        {/* Transactions Table */}
        {!loading && !error && filteredBills.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBills.slice(0, 10).map((bill) => (
                    <tr key={bill._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.createdAt ? formatDate(bill.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bill.customerName}</div>
                        <div className="text-sm text-gray-500">{bill.customerNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {bill.tickets && bill.tickets.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Tickets: {bill.tickets.reduce((sum, t) => sum + (t.quantity || 0), 0)}
                            </span>
                          )}
                          {bill.lockers && bill.lockers.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Lockers: {bill.lockers.reduce((sum, l) => sum + (l.quantity || 0), 0)}
                            </span>
                          )}
                          {bill.costumes && bill.costumes.length > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                              Costumes: {bill.costumes.reduce((sum, c) => sum + (c.quantity || 0), 0)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {bill.cashPaid > 0 && `Cash: ₹${bill.cashPaid.toFixed(2)}`}
                        </div>
                        <div className="text-sm text-gray-900">
                          {bill.onlinePaid > 0 && `Online: ₹${bill.onlinePaid.toFixed(2)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{bill.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {bill.isReturned ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {bill.isReturned && (
                          bill.isReturned ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )
                        )}
                        { (bill.costumes.length > 0 || bill.lockers.length > 0 || bill.costumes.length > 0) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Refundable
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredBills.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 text-center">
                <p className="text-sm text-gray-500">Showing 10 of {filteredBills.length} transactions</p>
              </div>
            )}
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && filteredBills.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesReport
