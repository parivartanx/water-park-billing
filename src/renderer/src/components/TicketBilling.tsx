import React, { useState } from 'react'
import {
  Minus,
  Plus,
  Calculator,
  Ticket,
  User,
  CreditCard,
  QrCode
} from 'lucide-react'

interface Ticket {
  id: number
  name: string
  price: number
  quantity: number
  description: string
}

const TicketBilling: React.FC = () => {
  const [customerName, setCustomerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [paymentMode, setPaymentMode] = useState('cash')
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>(
    'percentage'
  )
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([])
  const [tickets] = useState<Ticket[]>([
    {
      id: 1,
      name: 'Adult Day Pass',
      price: 49.99,
      quantity: 0,
      description:
        'Full day access to all water park attractions for adults (13+ years)'
    },
    {
      id: 2,
      name: 'Child Day Pass',
      price: 29.99,
      quantity: 0,
      description:
        'Full day access to all water park attractions for children (4-12 years)'
    },
    {
      id: 3,
      name: 'Family Pack (2+2)',
      price: 149.99,
      quantity: 0,
      description: 'Package for 2 adults and 2 children with full day access'
    },
    {
      id: 4,
      name: 'Senior Citizen',
      price: 39.99,
      quantity: 0,
      description: 'Special discounted pass for seniors (60+ years)'
    }
  ])

  const paymentModeIcons = {
    cash: <User className="w-5 h-5 text-[#DC004E]" />,
    card: <CreditCard className="w-5 h-5 text-[#DC004E]" />,
    upi: <QrCode className="w-5 h-5 text-[#DC004E]" />
  }

  const GST_RATE = 0.18

  const toggleTicketSelection = (ticket: Ticket): void => {
    setSelectedTickets((prevSelected) => {
      if (prevSelected.some((t) => t.id === ticket.id)) {
        return prevSelected.filter((t) => t.id !== ticket.id)
      } else {
        return [...prevSelected, { ...ticket, quantity: 1 }]
      }
    })
  }

  const updateTicketQuantity = (ticketId: number, increment: boolean): void => {
    setSelectedTickets((prevSelected) =>
      prevSelected.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              quantity: Math.max(0, ticket.quantity + (increment ? 1 : -1))
            }
          : ticket
      )
    )
  }

  const subtotal = selectedTickets.reduce(
    (sum, ticket) => sum + ticket.price * ticket.quantity,
    0
  )
  const discountAmount =
    discountType === 'percentage' ? (discount / 100) * subtotal : discount
  const gstAmount = (subtotal - discountAmount) * GST_RATE
  const total = subtotal - discountAmount + gstAmount

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    console.log({
      customerName,
      mobileNumber,
      tickets: selectedTickets,
      paymentMode,
      discount,
      discountType,
      subtotal,
      discountAmount,
      gstAmount,
      total
    })
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Ticket className="text-[#DC004E]" />
          Ticket Billing
        </h1>
        <p className="text-gray-500 mt-2">
          Create a new ticket booking for your customers
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#DC004E] transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="h-6 w-6 text-[#DC004E]" />
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-[#DC004E] rounded-xl opacity-25 group-hover:opacity-50 transition duration-300 blur-sm group-hover:blur-md"></div>
              <div className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 group-hover:border-[#DC004E] group-hover:shadow-lg">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2 text-[#DC004E]" />
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border-b-2 border-transparent focus:border-[#DC004E] bg-gray-50 rounded-lg transition-all duration-300 focus:bg-white focus:outline-none"
                  required
                  placeholder="Enter full name"
                />
              </div>
            </div>
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-[#DC004E] rounded-xl opacity-25 group-hover:opacity-50 transition duration-300 blur-sm group-hover:blur-md"></div>
              <div className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 group-hover:border-[#DC004E] group-hover:shadow-lg">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-[#DC004E]" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.slice(0, 10))}
                  className="w-full px-4 py-3 border-b-2 border-transparent focus:border-[#DC004E] bg-gray-50 rounded-lg transition-all duration-300 focus:bg-white focus:outline-none"
                  required
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Selection */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#DC004E]">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Available Tickets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                  selectedTickets.some((t) => t.id === ticket.id)
                    ? 'border-[#DC004E] bg-pink-50'
                    : 'border-gray-200 hover:border-[#DC004E] hover:shadow-md'
                }`}
                onClick={() => toggleTicketSelection(ticket)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{ticket.name}</h3>
                  <span className="text-[#DC004E] font-bold">
                    ₹{ticket.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {ticket.description}
                </p>
                {selectedTickets.some((t) => t.id === ticket.id) && (
                  <div className="flex items-center justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateTicketQuantity(ticket.id, false)
                      }}
                      className="p-1 rounded-full hover:bg-pink-100 text-[#DC004E] transition-colors duration-200"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="font-medium text-gray-800">
                      {selectedTickets.find((t) => t.id === ticket.id)
                        ?.quantity || 0}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateTicketQuantity(ticket.id, true)
                      }}
                      className="p-1 rounded-full hover:bg-pink-100 text-[#DC004E] transition-colors duration-200"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Billing Details */}
        {selectedTickets.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#DC004E]">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Billing Details
            </h2>

            {/* Payment Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full md:w-1/3 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-gray-50"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
                <div className="ml-2">
                  {
                    paymentModeIcons[
                      paymentMode as keyof typeof paymentModeIcons
                    ]
                  }
                </div>
              </div>
            </div>

            {/* Discount Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(e.target.value as 'flat' | 'percentage')
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-gray-50"
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount {discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-gray-50"
                  min="0"
                />
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-[#DC004E]">
                  -₹{discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-[#DC004E] text-white rounded-lg hover:bg-[#b0003e] transition-colors duration-200 flex items-center gap-2"
              >
                <Calculator size={20} />
                Generate Bill
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default TicketBilling
