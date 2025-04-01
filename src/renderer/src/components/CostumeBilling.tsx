import React, { useCallback, useEffect, useState } from 'react'
import { FaTshirt, FaUser, FaCreditCard, FaQrcode } from 'react-icons/fa'
import { Lock, Calculator, User, CreditCard, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CostumeCategory, CostumeSize } from '../utils/enums'
import { useCostumeStockStore } from '../stores/costumeStore'
import toast from 'react-hot-toast'
import { CostumeStock } from '@renderer/types/costume-stock'
import { CostumeBill } from '@renderer/types/costume-billing'

const CostumeBilling: React.FC = (): React.ReactElement => {
  const navigate = useNavigate()
  const { loading, error, costumeStock, getCostumeStock, createCostumeBilling } = useCostumeStockStore()
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  
  // Costume Selection State
  const [selectedCategory, setSelectedCategory] = useState<CostumeCategory>(CostumeCategory.HALF_PANT)
  const [selectedSize, setSelectedSize] = useState<CostumeSize>(CostumeSize.M)
  const [costumeQuantity, setCostumeQuantity] = useState<number | null>(null)
  
  // Pricing and Discount State
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>(
    'percentage'
  )
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi'>(
    'cash'
  )

  // Add new state for multiple costume selections
  const [selectedCostumes, setSelectedCostumes] = useState<CostumeStock[]>([])
  
  // Billing state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [billSuccess, setBillSuccess] = useState(false)
  const [billError, setBillError] = useState<string | null>(null)
  const [billId, setBillId] = useState<string | null>(null)

  const paymentModeIcons = {
    cash: <FaUser className="w-5 h-5 text-[#DC004E]" />,
    card: <FaCreditCard className="w-5 h-5 text-[#DC004E]" />,
    upi: <FaQrcode className="w-5 h-5 text-[#DC004E]" />
  }

  const subtotal = selectedCostumes.reduce((acc, costume) => acc + costume.quantity * costume.pricePerUnit, 0)
  const discountAmount =
    discountType === 'percentage' ? (discount / 100) * subtotal : discount
  const total = subtotal - discountAmount

  function handleMobileNumberChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const inputNumber = e.target.value.slice(0, 10)
    setCustomerNumber(inputNumber)
  }

  // Function to add costume to selection
  const addCostumeToSelection = () => {
    if (!selectedCategory || !selectedSize || !costumeQuantity) {
      toast.error('Please select category, size, and quantity')
      return
    }

    /// get stock from costumeStock
    const stock = costumeStock.find(
      item => item.category === selectedCategory && item.size === selectedSize
    )
    if (!stock) {
      toast.error('No stock available for this costume')
      return
    }
    if(stock.quantity === 0) {
      toast.error(`${stock.category} ${stock.size} is out of stock`)
      return
    }

    const newCostume: CostumeStock = {
      _id: stock._id,
      category: stock.category,
      size: stock.size,
      quantity: costumeQuantity,
      pricePerUnit: stock.pricePerUnit,
      refundPrice: stock.refundPrice
    }

    setSelectedCostumes([...selectedCostumes, newCostume])

    // Reset selection fields
    setSelectedCategory(CostumeCategory.HALF_PANT)
    setSelectedSize(CostumeSize.M)
    setCostumeQuantity(0)
    
    // Show success toast
    toast.success(`Added ${costumeQuantity} ${selectedCategory} (${selectedSize})`)
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

  // Reset form after successful billing
  const resetForm = useCallback(() => {
    setCustomerName('')
    setCustomerNumber('')
    setSelectedCostumes([])
    setDiscount(0)
    setDiscountType('percentage')
    setPaymentMode('cash')
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

    // Get access token from localStorage
    const access_token = localStorage.getItem('access_token')
    
    // Validate access token
    if (!access_token) {
      toast.error('Authentication error. Please log in again.')
      return
    }

    const billDetails: CostumeBill = {
      customerName,
      customerNumber,
      costumes: selectedCostumes.map(costume => ({
        _id: costume._id,
        quantity: costume.quantity,
        amount: costume.quantity * costume.pricePerUnit
      })),
      discount,
      discountType,
      paymentMode,
      subtotal,
      discountAmount,
      total,
      gstAmount: 0,
      isReturned: false,
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
  if (loading && !isSubmitting) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#DC004E]"></div>
      <span className="ml-4 text-lg font-medium text-gray-700">Loading costume data...</span>
    </div>
  )

  // Show error state
  if (error && !billError) return (
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
            {billId && <span className="block font-medium mt-2">Bill ID: {billId}</span>}
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
                  <CreditCard className="h-4 w-4 mr-2 text-[#DC004E]" />
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
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      ${selectedCategory === category 
                        ? 'bg-[#DC004E] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                    disabled={isSubmitting}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection with Visual Indicators */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(CostumeSize).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`
                      px-4 py-2 rounded-lg transition-all duration-200 
                      ${selectedSize === size 
                        ? 'bg-[#DC004E] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                    disabled={isSubmitting}
                  >
                    {size}
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
                  onClick={() => setCostumeQuantity(Math.max(0, (costumeQuantity || 0) - 1))}
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
                  value={costumeQuantity || ''}
                  onChange={(e) => setCostumeQuantity(Number(e.target.value))}
                  className="w-16 text-center py-2 border rounded-md focus:ring-2 focus:ring-[#DC004E]"
                  min="0"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setCostumeQuantity((costumeQuantity || 0) + 1)}
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
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
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
              disabled={!selectedCategory || !selectedSize || !costumeQuantity || isSubmitting}
              className={`
                w-full py-3 rounded-lg transition-all duration-200 
                ${(!selectedCategory || !selectedSize || !costumeQuantity || isSubmitting)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#DC004E] text-white hover:bg-[#b0003e]'}
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
                  {costume.category} - Size {costume.size} (Qty: {costume.quantity}) - ₹{costume.pricePerUnit} per unit = ₹{costume.quantity * costume.pricePerUnit}
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

        {/* Costume and Payment Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#DC004E] transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaTshirt className="h-6 w-6 text-[#DC004E] mr-2" />
            Payment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Payment Mode */}
            <div>
              <label
                htmlFor="paymentMode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Payment Mode
              </label>
              <div className="flex items-center space-x-2">
                <select
                  id="paymentMode"
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(e.target.value as 'cash' | 'card' | 'upi')
                  }
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-gray-50"
                  disabled={isSubmitting}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                </select>
                <div className="ml-2">{paymentModeIcons[paymentMode]}</div>
              </div>
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percentage')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-white"
                disabled={isSubmitting}
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </div>

            {/* Discount Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Amount
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E]"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="mt-6 text-right">
            <p className="text-gray-700">
              Subtotal: ₹{subtotal}
            </p>
            <p className="text-gray-700">
              Discount: ₹{discountAmount}
            </p>
            <p className="text-lg font-bold text-[#DC004E]">
              Total: ₹{total}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            disabled={isSubmitting || selectedCostumes.length === 0}
            className={`
              px-6 py-3 rounded-lg transition-colors duration-200 flex items-center gap-2 ml-auto
              ${isSubmitting || selectedCostumes.length === 0
                ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                : 'bg-[#DC004E] text-white hover:bg-[#b0003e]'}
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
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
