import React, { useEffect } from 'react'
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

type ProductType = 'ticket' | 'locker' | 'costume' | 'Other'

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
  const { unifiedBills, getRecentBillingHistories, loading, error } = useBillingHistoryStore();

  useEffect(() => {
    // Fetch recent billing histories when component mounts
    getRecentBillingHistories(10);
  }, [getRecentBillingHistories]);

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

  const productIcons: Record<ProductType, string> = {
    ticket: '🎫',
    locker: '🔐',
    costume: '👗',
    Other: '📋'
  }

  const productColors: Record<ProductType, string> = {
    ticket: 'blue',
    locker: 'green',
    costume: 'purple',
    Other: 'gray'
  }

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Use the unified bills from the store instead of mock data
  const recentBookings = unifiedBills.slice(0, 10).map(bill => ({
    id: bill.id,
    customer: bill.customerName,
    product: bill.type as ProductType,
    quantity: bill.quantity,
    date: bill.date,
    amount: bill.totalAmount
  }));

  return (
    <div className=" bg-gray-50 min-h-screen">
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
              onClick={() => getRecentBillingHistories(10)}
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
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Customer</th>
                <th className="py-2 px-4 text-left">Product</th>
                <th className="py-2 px-4 text-left">Quantity</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking, index) => (
                <tr
                  key={booking.id}
                  className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-[#DC004E]/10 flex items-center justify-center mr-3">
                        <span className="text-[#DC004E] font-bold">
                          {booking.customer.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{booking.customer}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${productColors[booking.product]}-50 text-${productColors[booking.product]}-700`}
                    >
                      <span className="mr-2">
                        {productIcons[booking.product]}
                      </span>
                      {booking.product}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium">{booking.quantity}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {formatDate(booking.date)}
                  </td>
                  {/*Add Rupees symbol */}
                  <td className="py-3 px-4 font-semibold text-gray-800">
                    
                    {`₹${booking.amount.toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <div className="flex justify-end mt-4">
          <button 
            className="text-[#DC004E] hover:underline text-sm"
            onClick={() => getRecentBillingHistories(20)} // Load more when clicked
          >
            View More
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
