import React, { useCallback, useEffect, useState } from 'react'
import { FaTshirt } from 'react-icons/fa'
import { Lock, Calculator, User, CreditCard, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CostumeCategory } from '../utils/enums'
import { useCostumeStockStore } from '../stores/costumeStore'
import toast from 'react-hot-toast'
import { CostumeStock } from '@renderer/types/costume-stock'
import { CostumeBill } from '@renderer/types/costume-billing'
import PaymentDetail from './PaymentDetail'
import { MobileOutlined, PhoneOutlined } from '@ant-design/icons'

const CostumeBilling: React.FC = (): React.ReactElement => {
  const navigate = useNavigate()
  const {
    loading,
    error,
    costumeStock,
    getCostumeStock,
    createCostumeBilling
  } = useCostumeStockStore()
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')

  // Costume Selection State
  const [selectedCategory, setSelectedCategory] = useState<CostumeCategory>(
    CostumeCategory.MALE
  )
  const [costumeQuantity, setCostumeQuantity] = useState<number>(1)

  // Pricing and Discount State
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>(
    'percentage'
  )

  // Payment State
  const [cashAmount, setCashAmount] = useState<number | null>(null)
  const [onlineAmount, setOnlineAmount] = useState<number | null>(null)

  // Multiple Costume Selection State
  const [selectedCostumes, setSelectedCostumes] = useState<CostumeStock[]>([])

  // Billing state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [billSuccess, setBillSuccess] = useState(false)
  const [billId, setBillId] = useState<string | null>(null)
  const [billError, setBillError] = useState<string | null>(null)

  const subtotal = selectedCostumes.reduce(
    (acc, costume) => acc + costume.quantity * costume.pricePerUnit,
    0
  )
  const discountAmount =
    discountType === 'percentage' ? (discount / 100) * subtotal : discount
  const total = subtotal - discountAmount

  // Calculate total payment amount from all payment methods
  const totalPaymentAmount = (cashAmount || 0) + (onlineAmount || 0)

  // Check if payment amounts match the total bill
  const isPaymentValid = Math.abs(totalPaymentAmount - total) < 0.01 // Using small epsilon for floating point comparison

  function handleMobileNumberChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const inputNumber = e.target.value.slice(0, 10)
    setCustomerNumber(inputNumber)
  }

  // Function to add costume to selection
  const addCostumeToSelection = () => {
    if (!selectedCategory || !costumeQuantity) {
      toast.error('Please select category and quantity')
      return
    }

    /// get stock from costumeStock
    const stock = costumeStock.find(
      (item) => item.category === selectedCategory
    )
    if (!stock) {
      toast.error('No stock available for this costume')
      return
    }
    if (stock.quantity === 0) {
      toast.error(`${stock.category} costume is out of stock`)
      return
    }

    const newCostume: CostumeStock = {
      _id: stock._id,
      category: stock.category,
      quantity: costumeQuantity,
      pricePerUnit: stock.pricePerUnit,
      refundPrice: stock.refundPrice
    }

    setSelectedCostumes([...selectedCostumes, newCostume])

    // Reset selection fields
    setSelectedCategory(CostumeCategory.MALE)
    setCostumeQuantity(1)

    // Show success toast
    toast.success(`Added ${costumeQuantity} ${selectedCategory} costume`)
  }

  // Function to remove a costume from selection
  const removeCostumeFromSelection = (index: number) => {
    const updatedCostumes = selectedCostumes.filter((_, i) => i !== index)
    setSelectedCostumes(updatedCostumes)
    toast.success('Item removed from selection')
  }

  const fetchCostumeStock = useCallback(() => {
    try {
      getCostumeStock()
    } catch {
      toast.error('Failed to fetch costume stock data')
    }
  }, [getCostumeStock])

  useEffect(() => {
    fetchCostumeStock()
  }, [fetchCostumeStock])

  // Update payment distribution when total changes
  useEffect(() => {
    // If no payment amounts are set yet, set cash to full amount by default
    if (totalPaymentAmount === 0 && total > 0) {
      setCashAmount(total)
    }
    // If payment amounts were previously set but total changed, adjust proportionally
    else if (totalPaymentAmount > 0 && total > 0 && !isPaymentValid) {
      const ratio = total / totalPaymentAmount
      setCashAmount((prev) => Math.round((prev || 0) * ratio * 100) / 100)
      setOnlineAmount((prev) => Math.round((prev || 0) * ratio * 100) / 100)

      // Adjust to account for any rounding errors
      const newCash = Math.round((cashAmount || 0) * ratio * 100) / 100
      const newOnline = Math.round((onlineAmount || 0) * ratio * 100) / 100

      // If there's still a small difference, add it to cash
      const diff = total - newCash - newOnline
      if (Math.abs(diff) > 0.01) {
        setCashAmount(newCash + diff)
      }
    }
  }, [total, isPaymentValid])

  // Reset form after successful billing
  const resetForm = useCallback(() => {
    setCustomerName('')
    setCustomerNumber('')
    setSelectedCostumes([])
    setDiscount(0)
    setDiscountType('percentage')
    setCashAmount(null)
    setOnlineAmount(null)
    setBillSuccess(false)
    setBillId(null)
  }, [])

  // Handle new billing
  const handleNewBilling = useCallback(() => {
    resetForm()
    fetchCostumeStock() // Refresh stock data
  }, [resetForm, fetchCostumeStock])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // Reset previous billing states
    setBillError(null)
    setBillSuccess(false)
    setBillId(null)

    // Validate mobile number
    if (customerNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number')
      return
    }

    // Validate costume selection
    if (selectedCostumes.length === 0) {
      toast.error('Please add at least one costume')
      return
    }

    // Validate payment amounts
    if (!isPaymentValid) {
      toast.error('Payment amounts must equal the total bill amount')
      return
    }

    // Get access token from localStorage
    const access_token = localStorage.getItem('access_token')

    // Validate access token
    if (!access_token) {
      toast.error('Authentication error. Please log in again.')
      return
    }

    // Determine the primary payment mode (the one with the highest amount)
    let primaryPaymentMode: 'cash' | 'card' = 'cash'
    if ((onlineAmount || 0) > (cashAmount || 0)) {
      primaryPaymentMode = 'card' // For backward compatibility, we use 'card' for online payments
    }

    const billDetails: CostumeBill = {
      customerName,
      customerNumber,
      costumes: selectedCostumes.map((costume) => ({
        _id: costume._id,
        quantity: costume.quantity,
        amount: costume.quantity * costume.pricePerUnit
      })),
      discount,
      discountType,
      paymentMode: primaryPaymentMode, // Use the primary payment mode for compatibility
      subtotal,
      discountAmount,
      total,
      gstAmount: 0,
      isReturned: false
    }

    // Start submission
    setIsSubmitting(true)

    try {
      // Call the createCostumeBilling function from the store
      const response = await createCostumeBilling(billDetails, access_token)

      // Check if the response contains an error
      if (response && 'error' in response && response.error) {
        setBillError(response.error as string)
        toast.error(response.error as string)
        setIsSubmitting(false)
        return
      }

      // Handle success
      if (response && 'success' in response && response.success) {
        setBillSuccess(true)

        // Extract bill ID if available
        if (response.data && 'id' in response.data) {
          setBillId(response.data.id as string)
        }

        toast.success('Costume billing created successfully!')
        setIsSubmitting(false)

        // Refresh costume stock data
        fetchCostumeStock()
      }
    } catch (error) {
      console.error('Error creating costume billing:', error)
      setBillError('Failed to create costume billing. Please try again.')
      toast.error('Failed to create costume billing')
      setIsSubmitting(false)
    }
  }

  // Show loading state
  if (loading && !isSubmitting)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#DC004E]"></div>
        <span className="ml-4 text-lg font-medium text-gray-700">
          Loading costume data...
        </span>
      </div>
    )

  // Show error state
  if (error && !billError)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-600 text-xl mb-4">{error}</div>
        <button
          onClick={fetchCostumeStock}
          className="px-4 py-2 bg-[#DC004E] text-white rounded-lg hover:bg-[#b0003e]"
        >
          Try Again
        </button>
      </div>
    )

  // Show success state
  if (billSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl border-l-4 border-[#DC004E] max-w-md w-full">
          <div className="flex justify-center mb-6">
            <CheckCircle size={80} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Billing Successful!
          </h2>
          <p className="text-center text-gray-600 mb-6">
            The costume billing has been created successfully.
            {billId && (
              <span className="block font-medium mt-2">Bill ID: {billId}</span>
            )}
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleNewBilling}
              className="w-full px-6 py-3 bg-[#DC004E] text-white rounded-lg hover:bg-[#b0003e] transition-colors duration-200"
            >
              Create New Billing
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-[#DC004E] text-[#DC004E] rounded-lg hover:bg-pink-50 transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTshirt className="text-[#DC004E]" />
          Costume Billing
        </h1>
        <button
          type="button"
          onClick={() => navigate('/return-costume')}
          className="px-4 py-2 bg-[#DC004E] text-white rounded-lg hover:bg-[#b0003e] transition-colors duration-200 flex items-center gap-2"
        >
          <Lock size={20} />
          Return Costume
        </button>
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
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-[#DC004E] rounded-xl opacity-25 group-hover:opacity-50 transition duration-300 blur-sm group-hover:blur-md"></div>
              <div className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 group-hover:border-[#DC004E] group-hover:shadow-lg">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <PhoneOutlined className="h-4 w-4 mr-2 text-[#DC004E]" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={customerNumber}
                  onChange={handleMobileNumberChange}
                  className="w-full px-4 py-3 border-b-2 border-transparent focus:border-[#DC004E] bg-gray-50 rounded-lg transition-all duration-300 focus:bg-white focus:outline-none"
                  required
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Costume Selection Section */}
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-[#DC004E] p-6 mb-4 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-[#DC004E]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
              />
            </svg>
            Add Costume
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Selection with Visual Indicators */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(CostumeCategory).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-4 py-2 rounded-lg transition-all duration-200 
                      ${
                        selectedCategory === category
                          ? 'bg-[#DC004E] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                    `}
                    disabled={isSubmitting}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection with Increment/Decrement */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setCostumeQuantity(Math.max(1, costumeQuantity - 1))
                  }
                  className="bg-gray-100 p-2 rounded-l-lg hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  value={costumeQuantity}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setCostumeQuantity(value < 1 ? 1 : value)
                  }}
                  className="w-16 text-center py-2 border rounded-md focus:ring-2 focus:ring-[#DC004E]"
                  min="1"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setCostumeQuantity(costumeQuantity + 1)}
                  className="bg-gray-100 p-2 rounded-r-lg hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 01-1 1h-3a1 1 0 110-2h3V9a1 1 0 011-1v3zM4 10a1 1 0 011-1V7a1 1 0 011-1h3a1 1 0 110 2H7a1 1 0 011 1v3zM7 15h3a1 1 0 110 2H7a1 1 0 01-1-1v-3a1 1 0 011-1h3a1 1 0 110 2h-3v3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Add Costume Button with Validation Feedback */}
          <div className="mt-4">
            <button
              type="button"
              onClick={addCostumeToSelection}
              disabled={!selectedCategory || !costumeQuantity || isSubmitting}
              className={`
                w-full py-3 rounded-lg transition-all duration-200 
                ${
                  !selectedCategory || !costumeQuantity || isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#DC004E] text-white hover:bg-[#b0003e]'
                }
              `}
            >
              Add Costume to Bill
            </button>
          </div>
        </div>

        {/* Selected Costumes Display */}
        {selectedCostumes.length > 0 && (
          <div className="mt-4 bg-gray-100 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Selected Costumes</h3>
            {selectedCostumes.map((costume, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white p-3 rounded-md mb-2 shadow-sm"
              >
                <span>
                  {costume.category} (Qty: {costume.quantity}) - ₹
                  {costume.pricePerUnit} per unit = ₹
                  {costume.quantity * costume.pricePerUnit}
                </span>
                <button
                  type="button"
                  onClick={() => removeCostumeFromSelection(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Payment Details Section - Using PaymentDetail Component */}
        <PaymentDetail
          subtotal={subtotal}
          discount={discount}
          discountType={discountType}
          total={total}
          isSubmitting={isSubmitting}
          onDiscountTypeChange={(type) => setDiscountType(type)}
          onDiscountChange={(amount) => setDiscount(amount || 0)}
          onPaymentChange={(mode, amount) => {
            if (mode === 'cash') setCashAmount(amount || 0)
            if (mode === 'card') setOnlineAmount(amount || 0)
          }}
        />

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={
              isSubmitting || selectedCostumes.length === 0 || !isPaymentValid
            }
            className={`
              px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 ml-auto
              ${
                isSubmitting || selectedCostumes.length === 0 || !isPaymentValid
                  ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                  : 'bg-[#DC004E] text-white hover:bg-[#b0003e]'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
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

        {/* Error display */}
        {billError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{billError}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

export default CostumeBilling
