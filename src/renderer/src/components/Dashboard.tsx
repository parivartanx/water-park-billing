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

  const recentBookings = [
    {
      id: 1,
      customer: 'John Doe',
      product: 'Water Slide',
      quantity: 2,
      date: '2023-10-01',
      amount: 120
    },
    {
      id: 2,
      customer: 'Jane Smith',
      product: 'Wave Pool',
      quantity: 1,
      date: '2023-10-02',
      amount: 150
    },
    {
      id: 3,
      customer: 'Alice Johnson',
      product: 'Lazy River',
      quantity: 3,
      date: '2023-10-03',
      amount: 200
    },
    {
      id: 4,
      customer: 'Bob Brown',
      product: 'Splash Pad',
      quantity: 1,
      date: '2023-10-04',
      amount: 180
    },
    {
      id: 5,
      customer: 'Charlie Davis',
      product: 'Water Slide',
      quantity: 2,
      date: '2023-10-05',
      amount: 220
    },
    {
      id: 6,
      customer: 'Diana Evans',
      product: 'Wave Pool',
      quantity: 1,
      date: '2023-10-06',
      amount: 160
    },
    {
      id: 7,
      customer: 'Frank Green',
      product: 'Lazy River',
      quantity: 3,
      date: '2023-10-07',
      amount: 140
    },
    {
      id: 8,
      customer: 'Grace Hall',
      product: 'Splash Pad',
      quantity: 1,
      date: '2023-10-08',
      amount: 190
    },
    {
      id: 9,
      customer: 'Hank Ives',
      product: 'Water Slide',
      quantity: 2,
      date: '2023-10-09',
      amount: 210
    },
    {
      id: 10,
      customer: 'Ivy Jones',
      product: 'Wave Pool',
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
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Customer</th>
              <th className="py-2">Product</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Date</th>
              <th className="py-2">Amount</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {recentBookings.map((booking, index) => (
              <tr key={booking.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                <td className="border px-4 py-2">{booking.customer}</td>
                <td className="border px-4 py-2">{booking.product}</td>
                <td className="border px-4 py-2">{booking.quantity}</td>
                <td className="border px-4 py-2">{booking.date}</td>
                <td className="border px-4 py-2">₹{booking.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button className="text-[#DC004E] hover:underline">View More</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
