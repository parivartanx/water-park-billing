import React, { useEffect, useState } from 'react'
import {
  Minus,
  Plus,
  Calculator,
  Ticket,
  User,
  CreditCard,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useTicketStore, useTicketBillingStore } from '../stores/ticket.store'
import type { Ticket as TicketType } from '../types/ticket'
import toast from 'react-hot-toast'
import PaymentDetail from './PaymentDetail'

interface SelectedTicket extends TicketType {
  quantity: number;
}

const TicketBilling: React.FC = () => {
  const [customerName, setCustomerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage')
  const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([])
  const { getTickets, loading, error, tickets } = useTicketStore()
  const { createTicketBilling, billingLoading, billingError } = useTicketBillingStore()
  
  // Payment State
  const [cashAmount, setCashAmount] = useState<number | null>(null)
  const [onlineAmount, setOnlineAmount] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    getTickets()
  }, [getTickets])

  const GST_RATE = 0.18

  const toggleTicketSelection = (ticket: TicketType): void => {
    setSelectedTickets((prevSelected) => {
      if (prevSelected.some((t) => t._id === ticket._id)) {
        toast.success(`Removed ${ticket.ticketType} from selection`)
        return prevSelected.filter((t) => t._id !== ticket._id)
      } else {
        toast.success(`Added ${ticket.ticketType} to selection`)
        return [...prevSelected, { ...ticket, quantity: 1 }]
      }
    })
  }

  const updateTicketQuantity = (ticketId: string, increment: boolean): void => {
    setSelectedTickets((prevSelected) =>
      prevSelected.map((ticket) => {
        if (ticket._id === ticketId) {
          const newQuantity = Math.max(0, ticket.quantity + (increment ? 1 : -1))
          if (increment && newQuantity > ticket.quantity) {
            // toast.success(`Increased ${ticket.ticketType} quantity to ${newQuantity}`)
          } else if (!increment && newQuantity < ticket.quantity) {
            // toast(`Decreased ${ticket.ticketType} quantity to ${newQuantity}`, {
            //   icon: '↓',
            // })
          }
          return {
            ...ticket,
            quantity: newQuantity
          }
        }
        return ticket
      })
    )
  }

  const subtotal = selectedTickets.reduce(
    (sum, ticket) => sum + ticket.price * ticket.quantity,
    0
  )
  const discountAmount =
    discountType === 'percentage' ? (discount / 100) * subtotal : discount
  const gstAmount = (subtotal - discountAmount) * GST_RATE
  const total = subtotal - discountAmount
  
  // Calculate total payment amount from all payment methods
  const totalPaymentAmount = (cashAmount || 0) + (onlineAmount || 0)
  
  // Check if payment amounts match the total bill
  const isPaymentValid = Math.abs(totalPaymentAmount - total) < 0.01 // Using small epsilon for floating point comparison

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    
    if (selectedTickets.length === 0) {
      toast.error('Please select at least one ticket')
      return
    }

    if (selectedTickets.some(ticket => ticket.quantity === 0)) {
      toast.error('Please remove tickets with zero quantity')
      return
    }
    
    // Validate payment amounts
    if (!isPaymentValid) {
      toast.error('Payment amounts must equal the total bill amount')
      return
    }
    
    // Determine the primary payment mode (the one with the highest amount)
    let primaryPaymentMode: 'cash' | 'card' = 'cash';
    if ((onlineAmount || 0) > (cashAmount || 0)) {
      primaryPaymentMode = 'card'; // For backward compatibility, we use 'card' for online payments
    }
    
    setIsSubmitting(true)
    
    try {
      /// extract ticket id and quantity
      const tickets = selectedTickets.map((ticket) => ({
        _id: ticket._id || '',
        quantity: ticket.quantity
      }))
      
      await createTicketBilling({
        customerName,
        mobileNumber,
        tickets,
        paymentMode: primaryPaymentMode,
        discount,
        discountType,
        subtotal,
        discountAmount,
        gstAmount,
        total
      })

      toast.success('Ticket billing completed successfully!')

      // Reset form
      setCustomerName('')
      setMobileNumber('')
      setCashAmount(null)
      setOnlineAmount(null)
      setDiscount(0)
      setDiscountType('percentage')
      setSelectedTickets([])
      setIsSubmitting(false)

    } catch (error) {
      toast.error(billingError || 'Failed to create ticket billing')
      console.error('Error creating ticket billing:', error)
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#DC004E] animate-spin" />
        <span className="ml-2 text-gray-600">Loading tickets...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          <p>Error loading tickets:</p>
          <p>{error}</p>
        </div>
      </div>
    )
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
            {tickets.map((ticket) => {
              const isWeekend = ['Saturday', 'Sunday'].includes(new Date().toLocaleString('en-US', {weekday: 'long'}));
              const isWeekendTicket = ticket.ticketType.toLowerCase().includes('weekend');
              const isSingleEntry = ticket.ticketType.toLowerCase().includes('single entry');
              const isActive = isSingleEntry || (isWeekend && isWeekendTicket) || (!isWeekend && !isWeekendTicket);
              return (
                <div
                  key={ticket._id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    isActive ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  } ${
                    selectedTickets.some((t) => t._id === ticket._id)
                      ? 'border-[#DC004E] bg-pink-50'
                      : 'border-gray-200 hover:border-[#DC004E] hover:shadow-md'
                  }`}
                  onClick={() => isActive && toggleTicketSelection(ticket)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{ticket.ticketType}</h3>
                    <span className="text-[#DC004E] font-bold">
                      ₹{ticket.price}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {isActive ? ticket.status : 'Not Available'}
                  </p>
                  {selectedTickets.some((t) => t._id === ticket._id) && isActive && (
                    <div className="flex items-center justify-end gap-3 mt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateTicketQuantity(ticket._id!, false)
                        }}
                        className="p-1 rounded-full hover:bg-pink-100 text-[#DC004E] transition-colors duration-200"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="font-medium text-gray-800">
                        {selectedTickets.find((t) => t._id === ticket._id)
                          ?.quantity || 0}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateTicketQuantity(ticket._id!, true)
                        }}
                        className="p-1 rounded-full hover:bg-pink-100 text-[#DC004E] transition-colors duration-200"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing Details */}
        {selectedTickets.length > 0 && (
          <PaymentDetail
            subtotal={subtotal}
            discount={discount}
            discountType={discountType}
            total={total}
            isSubmitting={isSubmitting || billingLoading}
            onDiscountTypeChange={(type) => setDiscountType(type)}
            onDiscountChange={(amount) => setDiscount(amount || 0)}
            onPaymentChange={(mode, amount) => {
              if (mode === 'cash') setCashAmount(amount || 0);
              if (mode === 'card') setOnlineAmount(amount || 0);
            }}
          />
        )}

        {/* Action Buttons */}
        {selectedTickets.length > 0 && (
          <div className="flex justify-end gap-4 mt-6">
            {billingError && (
              <div className="flex items-center text-red-600 mr-4">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>{billingError}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={billingLoading || isSubmitting || !isPaymentValid}
              className={`px-6 py-2 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                isPaymentValid && !billingLoading && !isSubmitting
                  ? 'bg-[#DC004E] hover:bg-[#b0003e]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {billingLoading || isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Calculator size={20} />
                  Generate Bill
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default TicketBilling
