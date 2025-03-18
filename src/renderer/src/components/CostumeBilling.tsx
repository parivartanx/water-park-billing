/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { FaTshirt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const CostumeBilling: React.FC = (): React.ReactElement => {
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  const [costumeQuantity, setCostumeQuantity] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage')

  const costumePrice = 20 // Example price per costume
  const subtotal = costumeQuantity * costumePrice
  const discountAmount = discountType === 'percentage' ? (discount / 100) * subtotal : discount
  const total = subtotal - discountAmount

  const navigate = useNavigate()

  const handleSaveBill = (): void => {
    console.log('Bill saved:', {
      customerName,
      customerNumber,
      costumeQuantity,
      discount,
      discountType,
      subtotal,
      discountAmount,
      total
    })
  }

  const handlePrintBill = (): void => {
    console.log('Bill printed:', {
      customerName,
      customerNumber,
      costumeQuantity,
      discount,
      discountType,
      subtotal,
      discountAmount,
      total
    })
  }

  const incrementQuantity = (): void => {
    setCostumeQuantity(costumeQuantity + 1)
  }

  const decrementQuantity = (): void => {
    if (costumeQuantity > 0) {
      setCostumeQuantity(costumeQuantity - 1)
    }
  }

  const handleReturnCostume = (): void => {
    navigate('/return-costume')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Costume Billing</h1>
        <button
          type="button"
          onClick={handleReturnCostume}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Return Costume
        </button>
      </div>
      <div className="mb-1">
        <p className="text-gray-500 mt-1">Create a new costume booking</p>
      </div>

      <form className="space-y-8">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Number
              </label>
              <input
                type="tel"
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value.slice(0, 10))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
                required
              />
            </div>
          </div>
        </div>

        {/* Costume Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaTshirt className="mr-2 text-[#DC004E]" /> Costume Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2 mr-4">
                Costume Quantity
              </label>
              <button
                type="button"
                onClick={decrementQuantity}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                value={costumeQuantity}
                onChange={(e) => setCostumeQuantity(Number(e.target.value))}
                className="w-16 mx-2 px-2 py-1 border rounded-lg text-center focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              />
              <button
                type="button"
                onClick={incrementQuantity}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Amount and Discount */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Amount and Discount</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bill Summary</h2>
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
    </div>
  )
}

export default CostumeBilling
