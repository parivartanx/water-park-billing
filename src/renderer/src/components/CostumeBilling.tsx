import React, { useState } from 'react'
import { FaTshirt, FaUser, FaCreditCard, FaQrcode } from 'react-icons/fa'
import { Lock, Calculator, User, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CostumeBilling: React.FC = (): React.ReactElement => {
  const navigate = useNavigate()
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  const [costumeQuantity, setCostumeQuantity] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>(
    'percentage'
  )
  const [paymentMode, setPaymentMode] = useState<'cash' | 'card' | 'upi'>(
    'cash'
  )

  const paymentModeIcons = {
    cash: <FaUser className="w-5 h-5 text-[#DC004E]" />,
    card: <FaCreditCard className="w-5 h-5 text-[#DC004E]" />,
    upi: <FaQrcode className="w-5 h-5 text-[#DC004E]" />
  }

  const costumePrice = 20 // Example price per costume
  const subtotal = costumeQuantity * costumePrice
  const discountAmount =
    discountType === 'percentage' ? (discount / 100) * subtotal : discount
  const total = subtotal - discountAmount

  function handleMobileNumberChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    const inputNumber = e.target.value.slice(0, 10)
    setCustomerNumber(inputNumber)
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    // Validate mobile number
    if (customerNumber.length !== 10) {
      alert('Please enter a valid 10-digit mobile number')
      return
    }

    const billDetails = {
      customerName,
      customerNumber,
      costumeQuantity,
      discount,
      discountType,
      paymentMode,
      subtotal: costumeQuantity * costumePrice,
      discountAmount:
        discountType === 'percentage'
          ? (costumeQuantity * costumePrice * discount) / 100
          : discount,
      total:
        costumeQuantity * costumePrice -
        (discountType === 'percentage'
          ? (costumeQuantity * costumePrice * discount) / 100
          : discount)
    }

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
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#DC004E]">
          {/* Costume Quantity */}
          <div className="mb-6">
            <label
              htmlFor="costumeQuantity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Costume Quantity
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() =>
                  setCostumeQuantity(Math.max(0, costumeQuantity - 1))
                }
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                -
              </button>
              <input
                type="number"
                id="costumeQuantity"
                value={costumeQuantity}
                onChange={(e) => setCostumeQuantity(Number(e.target.value))}
                className="w-20 text-center px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-gray-50"
                min="0"
              />
              <button
                type="button"
                onClick={() => setCostumeQuantity(costumeQuantity + 1)}
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>

          {/* Discount Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Discount
              </label>
              <input
                type="number"
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-gray-50"
                placeholder="Enter discount"
                min="0"
              />
            </div>
            <div>
              <label
                htmlFor="discountType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Discount Type
              </label>
              <select
                id="discountType"
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
      </form>
    </div>
  )
}

export default CostumeBilling
