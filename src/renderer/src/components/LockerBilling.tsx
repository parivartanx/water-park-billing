/* eslint-disable prettier/prettier */
import React, { useState } from 'react'
import { Calculator } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const LockerBilling: React.FC = (): React.ReactElement => {
  const [customerName, setCustomerName] = useState('')
  const [customerNumber, setCustomerNumber] = useState('')
  const [discount, setDiscount] = useState(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage')
  const [savedLockers, setSavedLockers] = useState<{ number: string; amount: number }[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newLockerNumber, setNewLockerNumber] = useState('')
  const navigate = useNavigate()

  const subtotal = savedLockers.reduce((acc, locker) => acc + locker.amount, 0)
  const discountAmount = discountType === 'percentage' ? (discount / 100) * subtotal : discount
  const total = subtotal - discountAmount

  const handleSaveBill = (): void => {
    console.log('Bill saved:', {
      customerName,
      customerNumber,
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
      discount,
      discountType,
      subtotal,
      discountAmount,
      total
    })
  }

  const addLocker = (): void => {
    setIsModalOpen(true)
  }

  const saveNewLocker = (): void => {
    if (newLockerNumber) {
      const newLocker = { number: newLockerNumber, amount: 50 }
      setSavedLockers([...savedLockers, newLocker])
      setNewLockerNumber('')
      setIsModalOpen(false)
    }
  }

  const removeSavedLocker = (index: number): void => {
    setSavedLockers(savedLockers.filter((_, i) => i !== index))
  }

  const navigateToReturnLocker = (): void => {
    navigate('/return-locker')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Locker Billing</h1>
          <p className="text-gray-500 mt-1">Create a new locker booking</p>
        </div>
        <button
          type="button"
          onClick={navigateToReturnLocker}
          className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Return Locker
        </button>
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

        {/* Add Locker Button */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Locker Details</h2>
          <button
            type="button"
            onClick={addLocker}
            className="px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#DC004E] focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:ring-offset-2"
          >
            Add Locker
          </button>
        </div>

        {/* Display Saved Lockers */}
        {savedLockers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Lockers</h3>
            <ul className="space-y-2">
              {savedLockers.map((locker, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>Locker {locker.number}</span>
                  <span>${locker.amount.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => removeSavedLocker(index)}
                    className="px-2 py-1 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal for Adding Locker */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Locker</h2>
              <input
                type="text"
                value={newLockerNumber}
                onChange={(e) => setNewLockerNumber(e.target.value)}
                placeholder="Enter Locker Number"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] mb-4"
              />
              <button
                type="button"
                onClick={saveNewLocker}
                className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="ml-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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

export default LockerBilling
