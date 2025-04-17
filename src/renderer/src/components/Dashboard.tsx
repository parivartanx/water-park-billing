import React, { useEffect, useState } from 'react'
// import { Line, Bar } from 'react-chartjs-2'
import { useBillingHistoryStore } from '../stores/billingHistoriesStore'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
} from 'chart.js'
import toast from 'react-hot-toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement
)

// interface StockCardProps {
//   title: string
//   available: number
//   total: number
// }

// interface PaymentCardProps {
//   title: string
//   cashAmount: number
//   onlineAmount: number
//   totalAmount: number
// }

// type ProductType = 'ticket' | 'locker' | 'costume' | 'Other'

// const StockCard = ({
//   title,
//   available,
//   total
// }: StockCardProps): JSX.Element => (
//   <div className="bg-white p-6 rounded-lg shadow-md">
//     <div className="flex justify-between items-center mb-4">
//       <h3 className="text-lg font-semibold">{title}</h3>
//       <div className="bg-[#DC004E] p-2 rounded-full">
//         <span className="text-white">📦</span>
//       </div>
//     </div>
//     <div className="space-y-4">
//       <div>
//         <p className="text-2xl font-bold">{available}</p>
//         <p className="text-sm text-gray-600">Available</p>
//       </div>
//       <div>
//         <p className="text-lg">{total}</p>
//         <p className="text-sm text-gray-600">Total Capacity</p>
//       </div>
//     </div>
//   </div>
// )

// const PaymentCard = ({
//   title,
//   cashAmount,
//   onlineAmount,
//   totalAmount
// }: PaymentCardProps): JSX.Element => (
//   <div className="bg-white p-6 rounded-lg shadow-md">
//     <div className="flex justify-between items-center mb-4">
//       <h3 className="text-lg font-semibold">{title}</h3>
//       <div className="bg-[#DC004E] p-2 rounded-full">
//         <span className="text-white">💳</span>
//       </div>
//     </div>
//     <div className="space-y-4">
//       <div>
//         <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
//         <p className="text-sm text-gray-600">Total Sales</p>
//       </div>
//       <div className="flex justify-between">
//         <div>
//           <p className="text-lg">${cashAmount.toLocaleString()}</p>
//           <p className="text-sm text-gray-600">Cash</p>
//         </div>
//         <div>
//           <p className="text-lg">${onlineAmount.toLocaleString()}</p>
//           <p className="text-sm text-gray-600">Online</p>
//         </div>
//       </div>
//     </div>
//   </div>
// )

const Dashboard: React.FC = () => {
  const { unifiedBills, getBillingHistories, loading, error } = useBillingHistoryStore();
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0); // Set to today at 00:00:00
  const endDate = new Date(now);
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      toast.error('Unauthorized: Access token not found');
      return;
    }
    // Fetch recent billing histories when component mounts
    getBillingHistories(startDate.toISOString(), endDate.toISOString(), 'all', '', accessToken);
  }, [getBillingHistories]);

  // // Calculate revenue metrics from real data
  // const revenueMetrics = useMemo(() => {
  //   // Get today's and yesterday's dates
  //   const today = new Date();
  //   const yesterday = new Date(today);
  //   yesterday.setDate(yesterday.getDate() - 1);
    
  //   const todayStr = today.toISOString().split('T')[0];
  //   const yesterdayStr = yesterday.toISOString().split('T')[0];
    
  //   // Filter bills for today and yesterday
  //   const todayBills = unifiedBills.filter(bill => bill.date.startsWith(todayStr));
  //   const yesterdayBills = unifiedBills.filter(bill => bill.date.startsWith(yesterdayStr));
    
  //   // Calculate revenue
  //   const todayRevenue = todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  //   const yesterdayRevenue = yesterdayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    
  //   // Count tickets
  //   const todayTickets = todayBills
  //     .filter(bill => bill.type === 'ticket')
  //     .reduce((sum, bill) => sum + bill.quantity, 0);
  //   const yesterdayTickets = yesterdayBills
  //     .filter(bill => bill.type === 'ticket')
  //     .reduce((sum, bill) => sum + bill.quantity, 0);
      
  //   // Calculate payment modes (assuming 60% cash, 40% online for demo)
  //   const cashAmount = todayRevenue * 0.6;
  //   const onlineAmount = todayRevenue * 0.4;
    
  //   return {
  //     today: todayRevenue || 24400, // Fallback to mock data if no real data
  //     yesterday: yesterdayRevenue || 21600,
  //     todayTickets: todayTickets || 470,
  //     yesterdayTickets: yesterdayTickets || 418,
  //     cashAmount: cashAmount || 14640,
  //     onlineAmount: onlineAmount || 9760
  //   };
  // }, [unifiedBills]);

  // const totalRevenue = revenueMetrics;

  // const lineChartData = {
  //   labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  //   datasets: [
  //     {
  //       fill: true,
  //       label: 'Hourly Revenue',
  //       data: Array.from(
  //         { length: 24 },
  //         () => Math.floor(Math.random() * 1000) + 400
  //       ),
  //       borderColor: '#DC004E',
  //       backgroundColor: 'rgba(220, 0, 78, 0.1)'
  //     }
  //   ]
  // }

  // const barChartData = {
  //   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  //   datasets: [
  //     {
  //       label: 'Weekly Revenue',
  //       data: Array.from(
  //         { length: 7 },
  //         () => Math.floor(Math.random() * 20000) + 5000
  //       ),
  //       backgroundColor: 'rgba(16, 185, 129, 0.8)',
  //       borderColor: 'rgb(16, 185, 129)',
  //       borderWidth: 1
  //     }
  //   ]
  // }

  // const getTotalFromData = (data: number[]): string => {
  //   return `$${data.reduce((a, b) => a + b, 0).toLocaleString()}`
  // }

  // const chartOptions = {
  //   responsive: true,
  //   plugins: {
  //     legend: {
  //       position: 'bottom' as const
  //     },
  //     title: {
  //       display: true,
  //       text: 'Revenue Distribution'
  //     }
  //   }
  // }

  // const lineOptions = {
  //   ...chartOptions,
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       ticks: {
  //         callback: (tickValue: string | number): string => {
  //           const value =
  //             typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
  //           return `$${value.toLocaleString()}`
  //         }
  //       }
  //     }
  //   }
  // }

  // const barOptions = {
  //   ...chartOptions,
  //   scales: {
  //     y: {
  //       beginAtZero: true,
  //       ticks: {
  //         callback: (tickValue: string | number): string => {
  //           const value =
  //             typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
  //           return `$${value.toLocaleString()}`
  //         }
  //       }
  //     }
  //   }
  // }

  // const productIcons: Record<string, string> = {
  //   ticket: '🎫',
  //   locker: '🔐',
  //   costume: '👗',
  //   all: '📋'
  // }

  // const productColors: Record<string, string> = {
  //   ticket: 'blue',
  //   locker: 'green',
  //   costume: 'purple',
  //   all: 'gray'
  // }

  // Format date for display
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Determine the bill type based on items
  const determineBillType = (bill: any): string => {
    const hasTickets = bill.tickets && bill.tickets.length > 0;
    const hasLockers = bill.lockers && bill.lockers.length > 0;
    const hasCostumes = bill.costumes && bill.costumes.length > 0;
    
    if (hasTickets && !hasLockers && !hasCostumes) return 'ticket';
    if (!hasTickets && hasLockers && !hasCostumes) return 'locker';
    if (!hasTickets && !hasLockers && hasCostumes) return 'costume';
    return 'all';
  };

  // Calculate total quantity for a bill
  const calculateTotalQuantity = (bill: any): number => {
    let total = 0;
    
    if (bill.tickets && bill.tickets.length > 0) {
      total += bill.tickets.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    }
    
    if (bill.lockers && bill.lockers.length > 0) {
      total += bill.lockers.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    }
    
    if (bill.costumes && bill.costumes.length > 0) {
      total += bill.costumes.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
    }
    
    return total;
  };

  // Toggle expanded view for a bill
  const toggleExpandBill = (billId: string) => {
    if (expandedBill === billId) {
      setExpandedBill(null);
    } else {
      setExpandedBill(billId);
    }
  };

  // Get the original bill from the ID
  const getOriginalBill = (billId: string) => {
    return unifiedBills.find(bill => bill._id === billId);
  };

  // Use the unified bills from the store instead of mock data
  const recentBookings = unifiedBills.slice(0, 10).map(bill => ({
    id: bill._id || '',
    customer: bill.customerName || 'Unknown',
    customerNumber: bill.customerNumber || 'N/A',
    product: determineBillType(bill),
    quantity: calculateTotalQuantity(bill),
    date: bill.createdAt || '',
    amount: bill.total || 0,
    cashPaid: bill.cashPaid || 0,
    onlinePaid: bill.onlinePaid || 0,
    hasTickets: bill.tickets && bill.tickets.length > 0,
    hasLockers: bill.lockers && bill.lockers.length > 0,
    hasCostumes: bill.costumes && bill.costumes.length > 0
  }));

  return (
    <div className="bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* <p className="text-gray-600 mb-2">Analytics</p> */}

      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Today&apos;s Sales</h3>
            <div className="bg-[#DC004E] p-2 rounded-full">
              <span className="text-white">💰</span>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-bold">
              ${totalRevenue.today.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-sm text-gray-500">
              ({totalRevenue.todayTickets} tickets)
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Yesterday&apos;s Sales</h3>
            <div className="bg-[#DC004E] p-2 rounded-full">
              <span className="text-white">📅</span>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-bold">
              ${totalRevenue.yesterday.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-sm text-gray-500">
              ({totalRevenue.yesterdayTickets} tickets)
            </p>
          </div>
        </div>

        <StockCard title="Available Stock" available={850} total={1000} />
        <PaymentCard
          title="Payment Mode"
          cashAmount={totalRevenue.cashAmount}
          onlineAmount={totalRevenue.onlineAmount}
          totalAmount={totalRevenue.today}
        />
      </div> */}

      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Hourly Revenue
            <span className="block text-sm text-gray-500 mt-1">
              Total: {getTotalFromData(lineChartData.datasets[0].data)}
            </span>
          </h3>
          <Line data={lineChartData} options={lineOptions} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            Weekly Revenue
            <span className="block text-sm text-gray-500 mt-1">
              Total: {getTotalFromData(barChartData.datasets[0].data)}
            </span>
          </h3>
          <Bar data={barChartData} options={barOptions} />
        </div>
      </div> */}

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Bookings</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#DC004E]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => {
                const accessToken = localStorage.getItem('access_token');
                if (!accessToken) {
                  toast.error('Unauthorized: Access token not found');
                  return;
                }
                const now = new Date();
                const startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0); // Set to today at 00:00:00
                const endDate = new Date(now);
                getBillingHistories(startDate.toISOString(), endDate.toISOString(), 'all', '', accessToken);
              }}
              className="mt-2 px-4 py-2 bg-[#DC004E] text-white rounded hover:bg-[#A30342] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : unifiedBills.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No recent bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left"></th>
                  <th className="py-2 px-4 text-left">Customer</th>
                  <th className="py-2 px-4 text-left">Product Types</th>
                  <th className="py-2 px-4 text-left">Quantity</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  {/* <th className="py-2 px-4 text-left">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking, index) => (
                  <React.Fragment key={booking.id || index}>
                    <tr
                      className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}
                    >
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => toggleExpandBill(booking.id)}
                          className="text-gray-500 hover:text-[#DC004E] transition-colors"
                        >
                          {expandedBill === booking.id ? '▼' : '▶'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#DC004E]/10 flex items-center justify-center mr-3">
                            <span className="text-[#DC004E] font-bold">
                              {booking.customer.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium block">{booking.customer}</span>
                            <span className="text-xs text-gray-500">{booking.customerNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          {booking.hasTickets && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              <span className="mr-1">🎫</span>
                            </span>
                          )}
                          {booking.hasLockers && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              <span className="mr-1">🔐</span>
                            </span>
                          )}
                          {booking.hasCostumes && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                              <span className="mr-1">👗</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{booking.quantity}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(booking.date)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {`₹${booking.amount.toLocaleString()}`}
                      </td>
                      {/* <td className="py-3 px-4">
                        <button className="text-[#DC004E] hover:underline text-sm">
                          View Details
                        </button>
                      </td> */}
                    </tr>
                    
                    {/* Expanded details row */}
                    {expandedBill === booking.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="py-4 px-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Payment details */}
                            <div className="bg-white p-4 rounded shadow-sm">
                              <h4 className="font-semibold text-sm mb-2 text-gray-700">Payment Details</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Cash:</span>
                                  <span className="text-sm font-medium">₹{booking.cashPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Online:</span>
                                  <span className="text-sm font-medium">₹{booking.onlinePaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-1 border-t">
                                  <span className="text-sm font-semibold">Total:</span>
                                  <span className="text-sm font-semibold">₹{booking.amount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Ticket details */}
                            {booking.hasTickets && (
                              <div className="bg-white p-4 rounded shadow-sm">
                                <h4 className="font-semibold text-sm mb-2 text-blue-700 flex items-center">
                                  <span className="mr-2">🎫</span> Tickets
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {getOriginalBill(booking.id)?.tickets.map((ticket, idx) => (
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
                            {booking.hasLockers && (
                              <div className="bg-white p-4 rounded shadow-sm">
                                <h4 className="font-semibold text-sm mb-2 text-green-700 flex items-center">
                                  <span className="mr-2">🔐</span> Lockers
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {getOriginalBill(booking.id)?.lockers.map((locker, idx) => (
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
                            {booking.hasCostumes && (
                              <div className="bg-white p-4 rounded shadow-sm">
                                <h4 className="font-semibold text-sm mb-2 text-purple-700 flex items-center">
                                  <span className="mr-2">👗</span> Costumes
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {getOriginalBill(booking.id)?.costumes.map((costume, idx) => (
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
        
        <div className="flex justify-end mt-4">
          <button 
            className="text-[#DC004E] hover:underline text-sm"
            onClick={() => {
              const accessToken = localStorage.getItem('access_token');
              if(!accessToken) {
                toast.error('Unauthorized: Access token not found');
                return;
              }
              getBillingHistories(startDate.toISOString(), endDate.toISOString(), 'all', '', accessToken);
            }} // Load more when clicked
          >
            View More
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
