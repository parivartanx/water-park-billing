import React, { useState } from 'react'
import { Minus, Plus, Calculator, X, Ticket } from 'lucide-react'

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
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([])
  const [tickets] = useState<Ticket[]>([
    {
      id: 1,
      name: 'Adult Day Pass',
      price: 49.99,
      quantity: 0,
      description: 'Full day access to all water park attractions for adults (13+ years)'
    },
    {
      id: 2,
      name: 'Child Day Pass',
      price: 29.99,
      quantity: 0,
      description: 'Full day access to all water park attractions for children (4-12 years)'
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

  const GST_RATE = 0.18

  const updateTicketQuantity = (ticketId: number, increment: boolean): void => {
    setSelectedTickets((prevSelected) =>
      prevSelected.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, quantity: Math.max(0, ticket.quantity + (increment ? 1 : -1)) }
          : ticket
      )
    )
  }

  const toggleTicketSelection = (ticket: Ticket): void => {
    setSelectedTickets((prevSelected) => {
      if (prevSelected.some((t) => t.id === ticket.id)) {
        return prevSelected.filter((t) => t.id !== ticket.id)
      } else {
        return [...prevSelected, { ...ticket, quantity: 1 }]
      }
    })
  }

  const openSidebarDialog = (): void => {
    setIsDialogOpen(true)
  }

  const subtotal = selectedTickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0)
  const discountAmount = discountType === 'percentage' ? (discount / 100) * subtotal : discount
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

  const handleSaveBill = (): void => {
    // Implementation of handleSaveBill
  }

  const handlePrintBill = (): void => {
    // Implementation of handlePrintBill
  }

  return (
    <div className="space-y-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Ticket Billing</h1>
        <p className="text-gray-500 mt-1">Create a new ticket booking</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.slice(0, 10))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
                required
              />
            </div>
          </div>
        </div>

        {/* Selected Tickets Display */}
        {selectedTickets.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Selected Tickets</h2>
            <ul className="space-y-2">
              {selectedTickets.map((ticket) => (
                <li key={ticket.id} className="flex justify-between items-center">
                  <span>{ticket.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateTicketQuantity(ticket.id, false)}
                      className="p-2 rounded-full hover:bg-gray-200"
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium">{ticket.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateTicketQuantity(ticket.id, true)}
                      className="p-2 rounded-full hover:bg-gray-200"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <span className="font-medium">
                    ${(ticket.price * ticket.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ticket Selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket Selection</h2>
          <button
            type="button"
            onClick={openSidebarDialog}
            className="px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#DC004E] focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:ring-offset-2"
          >
            Select Ticket
          </button>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percentage')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              />
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Bill Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Discount ({discountType === 'percentage' ? `${discount}%` : `$${discount}`})
              </span>
              <span className="font-medium text-red-500">-${discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-medium">${gstAmount.toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-[#DC004E]">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-[#DC004E]">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save and Print Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleSaveBill}
            className="px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#DC004E] focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:ring-offset-2"
          >
            Save Bill
          </button>
          <button
            type="button"
            onClick={handlePrintBill}
            className="px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#DC004E] focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:ring-offset-2"
          >
            Print Bill
          </button>
        </div>
      </form>

      {/* Sidebar Dialog for Ticket Selection */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Select Tickets</h2>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:border-[#DC004E] hover:shadow-md transition-all ${
                      selectedTickets.some((t) => t.id === ticket.id) ? 'border-[#DC004E]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Ticket className="w-5 h-5 text-[#DC004E]" />
                      <span className="font-bold text-[#DC004E]">${ticket.price.toFixed(2)}</span>
                    </div>
                    <h3 className="font-medium text-gray-800">{ticket.name}</h3>
                    {selectedTickets.some((t) => t.id === ticket.id) && (
                      <div className="mt-2 flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateTicketQuantity(ticket.id, false)}
                          className="p-2 rounded-full hover:bg-gray-200"
                        >
                          <Minus className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="text-sm">
                          {selectedTickets.find((t) => t.id === ticket.id)?.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateTicketQuantity(ticket.id, true)}
                          className="p-2 rounded-full hover:bg-gray-200"
                        >
                          <Plus className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleTicketSelection(ticket)}
                      className="mt-2 inline-flex items-center bg-[#DC004E] text-white text-sm px-2 py-1 rounded"
                    >
                      {selectedTickets.some((t) => t.id === ticket.id) ? 'Remove' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketBilling
