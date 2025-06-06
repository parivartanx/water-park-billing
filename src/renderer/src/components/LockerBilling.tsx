import React, { useState, useMemo, useEffect } from 'react'
import {
  Lock,
  User,
  CreditCard,
  QrCode,
  Calculator,
  Search
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLockerStore } from '@renderer/stores/lockerStore'
import type { Locker } from '@renderer/types/locker'
import { useLockerBillingStore } from '@renderer/stores/lockerStore'
import { toast } from 'react-hot-toast'

const LockerBilling: React.FC = (): React.ReactElement => {
  const navigate = useNavigate()
  const [customerName, setCustomerName] = useState<string>('')
  const [mobileNumber, setMobileNumber] = useState<string>('')
  const [paymentMode, setPaymentMode] = useState<string>('cash')
  const [discount, setDiscount] = useState<number>(0)
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage')
  const [savedLockers, setSavedLockers] = useState<Locker[]>([])
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedLockers, setSelectedLockers] = useState<string[]>([])
  const { lockers, loading, error, getLockers } = useLockerStore()
  const { createLockerBilling, } = useLockerBillingStore()

  useEffect(() => {
    getLockers()
  }, [])

  const paymentModeIcons = {
    cash: <User className="w-5 h-5 text-[#DC004E]" />,
    card: <CreditCard className="w-5 h-5 text-[#DC004E]" />,
    upi: <QrCode className="w-5 h-5 text-[#DC004E]" />
  }

  const filteredLockers = useMemo(() => {
    return lockers.filter(
      (locker) =>
        locker.lockerNo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        locker.status === 'available'
    )
  }, [lockers, searchTerm])

  const addLocker = (): void => {
    if (selectedLockers.length > 0) {
      const newLockers = selectedLockers
        .map((lockerId) => {
          const locker = lockers.find((l) => l._id === lockerId)
          return locker && locker._id
            ? {
                ...locker,
                id: Date.now() + Math.random(),
              }
            : null
        })
        .filter(Boolean) as Locker[]

      setSavedLockers([...savedLockers, ...newLockers])
      setSelectedLockers([])
      setIsModalOpen(false)
    }
  }

  const removeLocker = (id: string): void => {
    setSavedLockers(savedLockers.filter((locker) => locker._id && locker._id !== id))
  }

  const toggleLockerSelection = (lockerId: string): void => {
    setSelectedLockers((prev) =>
      prev.includes(lockerId)
        ? prev.filter((id) => id !== lockerId)
        : [...prev, lockerId]
    )
  }

  const subtotal = savedLockers.reduce((acc, locker) => acc + locker.pricePerUnit, 0)
  const discountAmount =
    discountType === 'percentage' ? (discount / 100) * subtotal : discount
  const total = subtotal - discountAmount

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    console.log({
      customerName,
      mobileNumber,
      lockers: savedLockers,
      paymentMode,
      discount,
      discountType,
      subtotal,
      discountAmount,
      total
    })
    const lockerBilling = {
      lockerIds: savedLockers.map((locker) => locker._id!).filter((id): id is string => id !== undefined),
      customerName,
      mobileNumber,
      paymentMode,
      discount,
      discountType,
      subtotal,
      discountAmount,
      gstAmount: 0,
      total,
      isReturned: false
    }
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      /// show toast
      toast.error('Unauthorized to create locker billing')
      return;
    }
    createLockerBilling(lockerBilling, access_token).then(() => {
      /// clear form
      setCustomerName('')
      setMobileNumber('')
      setPaymentMode('cash')
      setDiscount(0)
      setDiscountType('percentage')
      setSavedLockers([])
      setSelectedLockers([])
      setIsModalOpen(false)
    }).catch((error) => {
      console.log(error)
    })
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {loading ? (
        <div className="text-center text-gray-500 py-4">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">
          Error: {error}
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Lock className="text-[#DC004E]" />
            Locker Billing
          </h1>
          <button
            type="button"
            onClick={() => navigate('/return-locker')}
            className="px-4 py-2 bg-[#DC004E] text-white rounded-lg hover:bg-[#b0003e] transition-colors duration-200 flex items-center gap-2"
          >
            <Lock size={20} />
            Return Locker
          </button>
        </div>
      )}

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

        {/* Locker Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#DC004E]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Locker Details
            </h2>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#DC004E] text-white rounded-lg hover:bg-[#b0003e] transition-colors duration-200 flex items-center gap-2"
            >
              <Lock size={20} />
              Select Lockers
            </button>
          </div>

          {savedLockers.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No lockers added yet. Click &apos;Select Lockers&apos; to get
              started.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedLockers.map((locker) => (
                <div
                  key={locker._id}
                  className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#DC004E] transition-all duration-300 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {locker.lockerNo}
                    </h3>
                    <span className="text-[#DC004E] font-bold">
                      ₹{locker.pricePerUnit.toString()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLocker(locker._id || '')}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Locker Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[600px] max-h-[80vh] flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Select Available Lockers
              </h2>

              {/* Search Bar */}
              <div className="mb-4 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search lockers..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-gray-50 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Locker Grid */}
              <div className="grid grid-cols-3 gap-4 overflow-y-auto flex-grow">
                {filteredLockers.map((locker) => (
                  <div
                    key={locker._id}
                    onClick={() => toggleLockerSelection(locker._id || '')}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${
                        selectedLockers.includes(locker._id || '')
                          ? 'border-[#DC004E] bg-[#DC004E]/10'
                          : 'border-gray-200 hover:border-[#DC004E]'
                      }
                    `}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{locker.lockerNo}</span>
                      <span className="text-[#DC004E]">
                        ₹{locker.pricePerUnit.toString()}
                      </span>
                    </div>
                    {locker._id && selectedLockers.includes(locker._id) && (
                      <div className="text-[#DC004E]">✓</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addLocker}
                  disabled={selectedLockers.length === 0}
                  className={`
                    px-4 py-2 rounded-lg transition-colors duration-200
                    ${
                      selectedLockers.length > 0
                        ? 'bg-[#DC004E] text-white hover:bg-[#b0003e]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  Add Selected Lockers
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Billing Details */}
        {savedLockers.length > 0 && (
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

export default LockerBilling
