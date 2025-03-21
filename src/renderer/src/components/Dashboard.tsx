import React from 'react'
import { Line, Bar } from 'react-chartjs-2'
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

interface StockCardProps {
  title: string
  available: number
  total: number
}

interface PaymentCardProps {
  title: string
  cashAmount: number
  onlineAmount: number
  totalAmount: number
}

type ProductType = 'ticket' | 'locker' | 'costume' | 'Other'

interface RecentBookingProps {
  id: number
  customer: string
  product: ProductType
  quantity: number
  date: string
  amount: number
}

const StockCard = ({ title, available, total }: StockCardProps): JSX.Element => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="bg-[#DC004E] p-2 rounded-full">
        <span className="text-white">📦</span>
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <p className="text-2xl font-bold">{available}</p>
        <p className="text-sm text-gray-600">Available</p>
      </div>
      <div>
        <p className="text-lg">{total}</p>
        <p className="text-sm text-gray-600">Total Capacity</p>
      </div>
    </div>
  </div>
)

const PaymentCard = ({
  title,
  cashAmount,
  onlineAmount,
  totalAmount
}: PaymentCardProps): JSX.Element => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="bg-[#DC004E] p-2 rounded-full">
        <span className="text-white">💳</span>
      </div>
    </div>
    <div className="space-y-4">
      <div>
        <p className="text-2xl font-bold">${totalAmount.toLocaleString()}</p>
        <p className="text-sm text-gray-600">Total Sales</p>
      </div>
      <div className="flex justify-between">
        <div>
          <p className="text-lg">${cashAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Cash</p>
        </div>
        <div>
          <p className="text-lg">${onlineAmount.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Online</p>
        </div>
      </div>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  const totalRevenue = {
    today: 24400,
    yesterday: 21600,
    todayTickets: 470,
    yesterdayTickets: 418
  }

  const lineChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        fill: true,
        label: 'Hourly Revenue',
        data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 1000) + 400),
        borderColor: '#DC004E',
        backgroundColor: 'rgba(220, 0, 78, 0.1)'
      }
    ]
  }

  const barChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Weekly Revenue',
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20000) + 5000),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1
      }
    ]
  }

  const getTotalFromData = (data: number[]): string => {
    return `$${data.reduce((a, b) => a + b, 0).toLocaleString()}`
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      title: {
        display: true,
        text: 'Revenue Distribution'
      }
    }
  }

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (tickValue: string | number): string => {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
            return `$${value.toLocaleString()}`
          }
        }
      }
    }
  }

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (tickValue: string | number): string => {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue
            return `$${value.toLocaleString()}`
          }
        }
      }
    }
  }

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

  const recentBookings: RecentBookingProps[] = [
    {
      id: 1,
      customer: 'Alice Smith',
      product: 'ticket',
      quantity: 2,
      date: '2023-10-01',
      amount: 200
    },
    {
      id: 2,
      customer: 'John Doe',
      product: 'locker',
      quantity: 1,
      date: '2023-10-02',
      amount: 150
    },
    {
      id: 3,
      customer: 'Jane Smith',
      product: 'costume',
      quantity: 3,
      date: '2023-10-03',
      amount: 200
    },
    {
      id: 4,
      customer: 'Bob Brown',
      product: 'Other',
      quantity: 1,
      date: '2023-10-04',
      amount: 180
    },
    {
      id: 5,
      customer: 'Charlie Davis',
      product: 'Other',
      quantity: 2,
      date: '2023-10-05',
      amount: 220
    },
    {
      id: 6,
      customer: 'Diana Evans',
      product: 'ticket',
      quantity: 1,
      date: '2023-10-06',
      amount: 160
    },
    {
      id: 7,
      customer: 'Frank Green',
      product: 'locker',
      quantity: 3,
      date: '2023-10-07',
      amount: 140
    },
    {
      id: 8,
      customer: 'Grace Hall',
      product: 'costume',
      quantity: 1,
      date: '2023-10-08',
      amount: 190
    },
    {
      id: 9,
      customer: 'Hank Ives',
      product: 'Other',
      quantity: 2,
      date: '2023-10-09',
      amount: 210
    },
    {
      id: 10,
      customer: 'Ivy Jones',
      product: 'Other',
      quantity: 1,
      date: '2023-10-10',
      amount: 170
    }
  ]

  return (
    <div className=" bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      {/* <p className="text-gray-600 mb-2">Analytics</p> */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Today&apos;s Sales</h3>
            <div className="bg-[#DC004E] p-2 rounded-full">
              <span className="text-white">💰</span>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-bold">${totalRevenue.today.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-sm text-gray-500">({totalRevenue.todayTickets} tickets)</p>
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
            <p className="text-2xl font-bold">${totalRevenue.yesterday.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Sales</p>
            <p className="text-sm text-gray-500">({totalRevenue.yesterdayTickets} tickets)</p>
          </div>
        </div>

        <StockCard title="Available Stock" available={850} total={1000} />
        <PaymentCard
          title="Payment Mode"
          cashAmount={14640}
          onlineAmount={9760}
          totalAmount={totalRevenue.today}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Bookings</h3>
        </div>
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
                      <span className="text-[#DC004E] font-bold">{booking.customer.charAt(0)}</span>
                    </div>
                    <span className="font-medium">{booking.customer}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${productColors[booking.product]}-50 text-${productColors[booking.product]}-700`}
                  >
                    <span className="mr-2">{productIcons[booking.product]}</span>
                    {booking.product}
                  </div>
                </td>
                <td className="py-3 px-4 font-medium">{booking.quantity}</td>
                <td className="py-3 px-4 text-gray-600">
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="py-3 px-4 font-semibold text-gray-800">
                  ${booking.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button className="text-[#DC004E] hover:underline text-sm">View More</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
