import React, { useState } from 'react'
import { FaTshirt, FaUser, FaCreditCard, FaQrcode } from 'react-icons/fa'
import { Lock, Calculator, User, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CostumeBilling: React.FC = (): React.ReactElement => {
  const navigate = useNavigate()
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  
  // Costume Selection State
  const [selectedCategory, setSelectedCategory] = useState<'half' | 'full' | 'ladies' | 'kids'>('half')
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M')
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
  const [selectedCostumes, setSelectedCostumes] = useState<{
    category: 'half' | 'full' | 'ladies' | 'kids';
    size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
    quantity: number;
  }[]>([]);

  const paymentModeIcons = {
    cash: <FaUser className="w-5 h-5 text-[#DC004E]" />,
    card: <FaCreditCard className="w-5 h-5 text-[#DC004E]" />,
    upi: <FaQrcode className="w-5 h-5 text-[#DC004E]" />
  }

  const costumePrice = 20 // Example price per costume
  const subtotal = selectedCostumes.reduce((acc, costume) => acc + costume.quantity * costumePrice, 0)
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
      alert('Please select category, size, and quantity');
      return;
    }

    const newCostume = {
      category: selectedCategory,
      size: selectedSize,
      quantity: costumeQuantity
    };

    setSelectedCostumes([...selectedCostumes, newCostume]);

    // Reset selection fields
    setSelectedCategory('half');
    setSelectedSize('M');
    setCostumeQuantity(0);
  };

  // Function to remove a costume from selection
  const removeCostumeFromSelection = (index: number) => {
    const updatedCostumes = selectedCostumes.filter((_, i) => i !== index);
    setSelectedCostumes(updatedCostumes);
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    
    // Validate mobile number
    if (customerNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    // Validate costume selection
    if (selectedCostumes.length === 0) {
      alert('Please add at least one costume');
      return;
    }

    const billDetails = {
      customerName,
      customerNumber,
      costumes: selectedCostumes,
      discount,
      discountType,
      paymentMode,
      subtotal,
      discountAmount,
      total
    };

    console.log('Bill saved:', billDetails)
    // Additional logic for saving or processing the bill
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
                {['half', 'full', 'ladies', 'kids'].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category as 'half' | 'full' | 'ladies' | 'kids')}
                    className={`
                      px-4 py-2 rounded-lg transition-all duration-200 
                      ${selectedCategory === category 
                        ? 'bg-[#DC004E] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
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
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size as 'S' | 'M' | 'L' | 'XL' | 'XXL')}
                    className={`
                      px-4 py-2 rounded-lg transition-all duration-200 
                      ${selectedSize === size 
                        ? 'bg-[#DC004E] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
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
                />
                <button
                  type="button"
                  onClick={() => setCostumeQuantity((costumeQuantity || 0) + 1)}
                  className="bg-gray-100 p-2 rounded-r-lg hover:bg-gray-200"
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
              disabled={!selectedCategory || !selectedSize || !costumeQuantity}
              className={`
                w-full py-3 rounded-lg transition-all duration-200 
                ${(!selectedCategory || !selectedSize || !costumeQuantity)
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
                  {costume.category} - Size {costume.size} (Qty: {costume.quantity})
                </span>
                <button
                  type="button"
                  onClick={() => removeCostumeFromSelection(index)}
                  className="text-red-500 hover:text-red-700"
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
              />
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="mt-6 text-right">
            <p className="text-gray-700 font-semibold">
              Price per Costume: ₹{costumePrice}
            </p>
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
            className="px-6 py-3 bg-[#DC004E] text-white rounded-lg hover:bg-[#b0003e] transition-colors duration-200 flex items-center gap-2 ml-auto"
          >
            <Calculator size={20} />
            Generate Bill
          </button>
        </div>
      </form>
    </div>
  )
}

export default CostumeBilling
