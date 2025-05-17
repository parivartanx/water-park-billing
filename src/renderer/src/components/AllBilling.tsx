import React, { useState, useEffect } from 'react'
import {
  Ticket,
  Lock,
  CreditCard,
  User,
  ShoppingCart,
  X,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react'
import { FaTshirt } from 'react-icons/fa'
import { useTicketStore } from '../stores/ticket.store'
import { useLockerStore } from '../stores/lockerStore'
import { useCostumeStockStore } from '../stores/costumeStore'
import toast from 'react-hot-toast'
import PaymentDetail from './PaymentDetail'

// Types
import type { Ticket as TicketType } from '../types/ticket'
import type { Locker } from '../types/locker'
import type { CostumeStock } from '../types/costume-stock'
import { useUnifiedBillingStore } from '../stores/billingStore'

// Define type for cart items
type CartItem = {
  id: string
  type: 'ticket' | 'locker' | 'costume'
  name: string
  price: number
  quantity: number
  originalItem: any
}

const AllBilling: React.FC = () => {
  // Tab and Dialog State
//   const [activeTab, setActiveTab] = useState<'ticket' | 'locker' | 'costume'>('ticket')
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [lockerDialogOpen, setLockerDialogOpen] = useState(false)
  const [costumeDialogOpen, setCostumeDialogOpen] = useState(false)

  // Customer information
  const [customerName, setCustomerName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Discount state
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage')

  // Payment state
  const [cashAmount, setCashAmount] = useState<number | null>(null)
  const [onlineAmount, setOnlineAmount] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Store hooks
  const { tickets, loading: ticketLoading, getTickets } = useTicketStore()
  const { lockers, loading: lockerLoading, getLockers } = useLockerStore()
  const {
    costumeStock,
    loading: costumeLoading,
    getCostumeStock,
    categories,
    categoriesLoading,
    getCategoryList
    // createCostumeBilling
  } = useCostumeStockStore()

  // Filter states
  const [selectedCostumeCategory, setSelectedCostumeCategory] = useState<string>('MALE')
  const [lockerSearchTerm, setLockerSearchTerm] = useState('')
  const [costumeQuantity, setCostumeQuantity] = useState(1)
  const [ticketQuantity, setTicketQuantity] = useState(1)

  // Unified billing state
  const { createUnifiedBilling, loading: unifiedLoading, reset: resetUnifiedBilling } = useUnifiedBillingStore()
  const [billingStatus, setBillingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [billingError, setBillingError] = useState<string | null>(null)

  /// if today is weekday return weekday price else return weekend price
  const todayPrice = (ticket: TicketType) => {
    /// if today is saturday or sunday return weekend price else return weekday price
    const today = new Date().getDay()
    if(today === 6 || today === 0) {
      return ticket.weekendPrice
    } else {
      return ticket.weekdayPrice
    }
  }

  // Load data on component mount
  useEffect(() => {
    getTickets()
    getLockers()
    getCostumeStock()
    getCategoryList()
  }, [getTickets, getLockers, getCostumeStock, getCategoryList])
  
  // Set the first category as default when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !categoriesLoading) {
      setSelectedCostumeCategory(categories[0])
    }
  }, [categories, categoriesLoading])

  // Filter lockers based on search term
  const filteredLockers = lockers.filter(
    (locker) =>
      locker.lockerNo.toLowerCase().includes(lockerSearchTerm.toLowerCase()) &&
      locker.status === 'available'
  )

  // Filter costumes based on selected category
  const filteredCostumes = costumeStock.filter(
    (costume) =>
      costume.category === selectedCostumeCategory && costume.quantity > 0
  )

  // Add item to cart
  const addToCart = (
    item: TicketType | Locker | CostumeStock,
    type: 'ticket' | 'locker' | 'costume'
  ) => {
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.id === item._id && cartItem.type === type
    )

    if (existingItemIndex !== -1) {
      // Item already in cart, increase quantity
      const updatedCartItems = [...cartItems]
      updatedCartItems[existingItemIndex].quantity += 1
      setCartItems(updatedCartItems)
    } else {
      // New item, add to cart
      let name = ''
      let price = 0

      if (type === 'ticket') {
        const ticketItem = item as TicketType
        name = ticketItem.ticketType
        price = todayPrice(ticketItem)
      } else if (type === 'locker') {
        const lockerItem = item as Locker
        name = `Locker #${lockerItem.lockerNo}`
        price = lockerItem.pricePerUnit
      } else if (type === 'costume') {
        const costumeItem = item as CostumeStock
        name = `${costumeItem.category} Costume`
        price = costumeItem.pricePerUnit
      }

      setCartItems([
        ...cartItems,
        {
          id: item._id || `${type}-${Date.now()}`,
          type,
          name,
          price,
          quantity: 1,
          originalItem: item
        }
      ])
    }

    toast.success(`Added ${type} to cart`)
  }

  // Remove item from cart
  const removeFromCart = (index: number) => {
    const updatedCartItems = [...cartItems]
    const removedItem = updatedCartItems[index]

    updatedCartItems.splice(index, 1)
    setCartItems(updatedCartItems)

    toast.success(`Removed ${removedItem.name} from cart`)
  }

  // Update item quantity in cart
  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedCartItems = [...cartItems]
    updatedCartItems[index].quantity = newQuantity
    setCartItems(updatedCartItems)
  }

  // Calculate subtotal
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  // Calculate discount amount
  const discountAmount =
    discountType === 'percentage' ? (discount / 100) * subtotal : discount

  // Calculate total
  const total = subtotal - discountAmount

  // Calculate total payment amount
  const totalPaymentAmount = (cashAmount || 0) + (onlineAmount || 0)

  // Check if payment is valid
  const isPaymentValid = Math.abs(totalPaymentAmount - total) < 0.01

  // console.log("Total payment amount:", totalPaymentAmount)
  // console.log("Total:", total)

  // Handle billing submission
  const handleSubmit = async () => {
    // Reset any previous errors
    setBillingError(null)
    setBillingStatus('idle')

    // Validation
    if (!customerName.trim()) {
      toast.error('Please enter customer name')
      return
    }

    if (!mobileNumber.trim() || mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Please add items to the cart')
      return
    }

    if (!isPaymentValid) {
      toast.error(`Payment amount mismatch. Expected: ₹${total.toFixed(2)}, Received: ₹${totalPaymentAmount.toFixed(2)}`)
      return
    }

    // Update billing status
    setIsSubmitting(true)
    setBillingStatus('loading')

    try {
      // Group cart items by type
      const ticketItems = cartItems.filter((item) => item.type === 'ticket')
      const lockerItems = cartItems.filter((item) => item.type === 'locker')
      const costumeItems = cartItems.filter((item) => item.type === 'costume')

      // Create unified billing data
      const unifiedBillingData = {
        customerName,
        customerNumber: mobileNumber,
        
        // Transform ticket items to TicketV2Item format
        tickets: ticketItems.map((item) => ({
          _id: item.originalItem._id || '',
          price: item.price,
          quantity: item.quantity,
          totalAmount: item.price * item.quantity,
          ticketType: item.name
        })),
        
        // Transform locker items to LockerV2Item format
        lockers: lockerItems.map((item) => ({
          _id: item.originalItem._id || '',
          lockerNames: [item.originalItem.lockerNo],
          quantity: item.quantity,
          price: item.price
        })),
        
        // Transform costume items to CostumeV2Item format
        costumes: costumeItems.map((item) => ({
          _id: item.originalItem._id || '',
          quantity: item.quantity,
          amount: item.price * item.quantity,
          category: item.originalItem.category
        })),
        
        // Payment and discount details
        discount,
        discountType,
        cashPaid: cashAmount || 0,
        onlinePaid: onlineAmount || 0,
        subtotal,
        discountAmount,
        total,
        gstAmount: 0,
        isReturned: false
      }

      const access_token = localStorage.getItem('access_token')
      if (!access_token) {
        throw new Error('Unauthorized: Access token not found')
      }
      
      // Create unified billing
      const result = await createUnifiedBilling(unifiedBillingData, access_token)

      if (!result) {
        throw new Error('Failed to create unified billing')
      }

      // Update status on success
      setBillingStatus('success')
      toast.success('Unified billing created successfully!')
      
      // Reset form after successful submission
      setCartItems([])
      setCustomerName('')
      setMobileNumber('')
      setDiscount(0)
      setCashAmount(null)
      setOnlineAmount(null)
      resetUnifiedBilling()
      
    } catch (error) {
      console.error('Unified billing error:', error)
      setBillingStatus('error')
      setBillingError(error instanceof Error ? error.message : 'Failed to process unified billing')
      toast.error(error instanceof Error ? error.message : 'Failed to process unified billing')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Add loading state to dialog buttons
  const DialogButton = ({ 
    onClick, 
    children, 
    disabled = false 
  }: { 
    onClick: () => void, 
    children: React.ReactNode, 
    disabled?: boolean 
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className={`px-4 py-2 rounded-md transition-colors ${
        disabled || isSubmitting
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-[#DC004E] hover:bg-[#A30342] text-white'
      }`}
    >
      {isSubmitting ? (
        <>
          <Loader className="animate-spin h-4 w-4 mr-2" />
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  )


  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#DC004E] border-b-2 border-[#DC004E]/20 pb-2">
          Unified Billing
        </h1>

        {/* Main content area with single column */}
        <div className="space-y-6">
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

          {/* Add Items Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Add Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DialogButton
                onClick={() => setTicketDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Ticket className="h-5 w-5 text-white" />
                <span className="font-medium">Add Tickets</span>
              </DialogButton>

              <DialogButton
                onClick={() => setLockerDialogOpen(true)}
                disabled={isSubmitting}
              >
                <Lock className="h-5 w-5 text-white" />
                <span className="font-medium">Add Lockers</span>
              </DialogButton>

              <DialogButton
                onClick={() => setCostumeDialogOpen(true)}
                disabled={isSubmitting}
              >
                <FaTshirt className="h-5 w-5 text-white" />
                <span className="font-medium">Add Costumes</span>
              </DialogButton>
            </div>
          </div>

          {/* Ticket Dialog */}
          {ticketDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="text-xl font-medium flex items-center">
                    <Ticket className="h-5 w-5 mr-2 text-[#DC004E]" />
                    Select Tickets
                  </h3>
                  <button 
                    onClick={() => setTicketDialogOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                  {ticketLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC004E]"></div>
                    </div>
                  ) : tickets.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No tickets available
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket._id}
                          className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                        >
                          <h3 className="font-medium text-lg">
                            {ticket.ticketType}
                          </h3>
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-[#DC004E] text-lg">
                              ₹{todayPrice(ticket).toLocaleString()}
                            </p>
                            <span className={`text-xs ${ticket.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                              {ticket.status}
                            </span>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            {/* <div className="flex items-center">
                              <button 
                                onClick={() => {
                                  if (ticketQuantity > 1) {
                                    setTicketQuantity(ticketQuantity - 1);
                                  }
                                }}
                                className="w-8 h-8 flex items-center justify-center border rounded-l-md text-gray-600 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <div className="w-10 h-8 flex items-center justify-center border-t border-b">
                                {ticketQuantity}
                              </div>
                              <button 
                                onClick={() => setTicketQuantity(ticketQuantity + 1)}
                                className="w-8 h-8 flex items-center justify-center border rounded-r-md text-gray-600 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div> */}
                            <button
                              onClick={() => {
                                for (let i = 0; i < ticketQuantity; i++) {
                                  addToCart(ticket, 'ticket');
                                }
                                toast.success(`Added ${ticketQuantity} ${ticket.ticketType} to cart`);
                                setTicketQuantity(1);
                              }}
                              disabled={ticket.status !== 'active'}
                              className={`px-4 py-2 rounded-md text-white ${
                                ticket.status !== 'active' 
                                  ? 'bg-gray-300 cursor-not-allowed' 
                                  : 'bg-[#DC004E] hover:bg-[#A30342]'
                              }`}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t p-4 flex justify-end space-x-2">
                  <button 
                    onClick={() => setTicketDialogOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Locker Dialog */}
          {lockerDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="text-xl font-medium flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-[#DC004E]" />
                    Select Lockers
                  </h3>
                  <button 
                    onClick={() => setLockerDialogOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search locker number..."
                      value={lockerSearchTerm}
                      onChange={(e) => setLockerSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC004E]"
                    />
                  </div>

                  {lockerLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC004E]"></div>
                    </div>
                  ) : filteredLockers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No lockers available
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredLockers.map((locker) => (
                        <div
                          key={locker._id}
                          className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow text-center"
                        >
                          <p className="font-medium text-gray-800">
                            #{locker.lockerNo}
                          </p>
                          <p className="text-sm text-gray-500">
                            {locker.status}
                          </p>
                          <p className="font-semibold my-1 text-[#DC004E]">
                            ₹{locker.pricePerUnit.toLocaleString()}
                          </p>
                          <button
                            onClick={() => {
                              addToCart(locker, 'locker');
                            }}
                            className="bg-[#DC004E] text-white text-sm px-3 py-1 rounded-md hover:bg-[#A30342] transition-colors w-full mt-2"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t p-4 flex justify-end space-x-2">
                  <button 
                    onClick={() => setLockerDialogOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Costume Dialog */}
          {costumeDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="text-xl font-medium flex items-center">
                    <FaTshirt className="h-5 w-5 mr-2 text-[#DC004E]" />
                    Add Costume
                  </h3>
                  <button 
                    onClick={() => setCostumeDialogOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Category</h4>
                    {categoriesLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#DC004E]"></div>
                      </div>
                    ) : categories.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No categories available
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => setSelectedCostumeCategory(category)}
                            className={`py-3 rounded-md text-center font-medium ${
                              selectedCostumeCategory === category
                                ? 'bg-[#DC004E] text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Display costume details */}
                  {filteredCostumes.length > 0 && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{selectedCostumeCategory} Costume</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          filteredCostumes[0].quantity > costumeQuantity 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {filteredCostumes[0].quantity > costumeQuantity ? 'Available' : 'Insufficient Stock'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">In Stock: {filteredCostumes[0].quantity}</p>
                          <p className="font-semibold text-[#DC004E] text-lg mt-1">
                            ₹{filteredCostumes[0].pricePerUnit.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Refund Value: ₹{filteredCostumes[0].refundPrice.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Selected Quantity</p>
                          <p className="font-bold text-lg">{costumeQuantity}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quantity</h4>
                    <div className="flex items-center">
                      <button 
                        onClick={() => {
                          if (costumeQuantity > 1) {
                            setCostumeQuantity(costumeQuantity - 1);
                          }
                        }}
                        className="w-10 h-10 flex items-center justify-center border rounded-l-md text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <div className="w-16 h-10 flex items-center justify-center border-t border-b">
                        {costumeQuantity}
                      </div>
                      <button 
                        onClick={() => setCostumeQuantity(costumeQuantity + 1)}
                        className="w-10 h-10 flex items-center justify-center border rounded-r-md text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {costumeLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC004E]"></div>
                    </div>
                  ) : filteredCostumes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No costumes available in this category
                    </p>
                  ) : (
                    <button
                      onClick={() => {
                        const selectedCostume = filteredCostumes[0]; // Get the first costume of the selected category
                        if (selectedCostume) {
                          // Add costume to cart with proper quantity
                          const name = `${selectedCostume.category} Costume`;
                          const price = selectedCostume.pricePerUnit;
                          
                          // Use the addToCart function with the correct parameters
                          setCartItems([
                            ...cartItems,
                            {
                              id: selectedCostume._id || `costume-${Date.now()}`,
                              type: 'costume',
                              name,
                              price,
                              quantity: costumeQuantity,
                              originalItem: selectedCostume
                            }
                          ]);
                          
                          toast.success(`Added ${costumeQuantity} ${selectedCostume.category} costume(s) to cart`);
                          setCostumeQuantity(1);
                          setCostumeDialogOpen(false);
                        }
                      }}
                      disabled={filteredCostumes.length === 0 || (filteredCostumes[0]?.quantity || 0) < costumeQuantity}
                      className={`w-full py-3 rounded-md text-white font-medium ${
                        filteredCostumes.length === 0 || (filteredCostumes[0]?.quantity || 0) < costumeQuantity
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-[#DC004E] hover:bg-[#A30342]'
                      }`}
                    >
                      Add Costume to Bill
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cart Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-[#DC004E] p-2 rounded-full mr-3">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Cart</h2>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Your cart is empty.
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <div>
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">
                        ₹{item.price.toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.type !== 'locker' ? (
                        <>
                          <button
                            onClick={() =>
                              updateCartItemQuantity(index, item.quantity - 1)
                            }
                            className="text-gray-500 hover:text-[#DC004E] p-1"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartItemQuantity(index, item.quantity + 1)
                            }
                            className="text-gray-500 hover:text-[#DC004E] p-1"
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <span className="text-sm font-medium mr-2">
                          Qty: 1
                        </span>
                      )}
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#DC004E]">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-[#DC004E]" />
              Payment Details
            </h2>
            <PaymentDetail
              subtotal={subtotal}
              discount={discount}
              discountType={discountType}
              total={total}
              isSubmitting={isSubmitting}
              onDiscountTypeChange={setDiscountType}
              onDiscountChange={(value) => {
                if (value !== null) {
                  setDiscount(value)
                } else {
                  setDiscount(0)
                }
              }}
              onPaymentChange={(mode, amount) => {
                if (mode === 'cash') {
                  setCashAmount(amount)
                } else if (mode === 'card' || mode === 'online') {
                  setOnlineAmount(amount)
                }
              }}
            />
          </div>

          {/* Billing Status Indicator */}
          {billingStatus !== 'idle' && (
            <div className={`bg-white p-4 rounded-xl shadow-md border-l-4 ${
              billingStatus === 'loading' ? 'border-blue-500' :
              billingStatus === 'success' ? 'border-green-500' : 'border-red-500'
            }`}>
              <div className="flex items-center gap-3">
                {billingStatus === 'loading' && (
                  <>
                    <Loader className="h-6 w-6 text-blue-500 animate-spin" />
                    <p className="text-blue-700">Processing your unified billing...</p>
                  </>
                )}
                {billingStatus === 'success' && (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <p className="text-green-700">Billing completed successfully!</p>
                  </>
                )}
                {billingStatus === 'error' && (
                  <>
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <p className="text-red-700">{billingError || 'An error occurred during billing'}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || unifiedLoading}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
                isSubmitting || unifiedLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#DC004E] hover:bg-[#DC004E]/80 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting || unifiedLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Complete Billing
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllBilling
