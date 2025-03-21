import React, { useState } from 'react'
import { Lock, DollarSign, Wallet, PlusCircle } from 'lucide-react'

const AddLocker: React.FC = (): React.ReactElement => {
  const [pricePerUnit, setPricePerUnit] = useState<number | null>(null)
  const [refundPricePerUnit, setRefundPricePerUnit] = useState<number | null>(null)
  const [lockerNumberFrom, setLockerNumberFrom] = useState<number | null>(null)
  const [lockerNumberTo, setLockerNumberTo] = useState<number | null>(null)

  // Automatically calculate locker count based on locker number range
  const lockerCount =
    lockerNumberFrom !== null && lockerNumberTo !== null && lockerNumberTo >= lockerNumberFrom
      ? lockerNumberTo - lockerNumberFrom + 1
      : 0

  const handleSave = (): void => {
    // Validation
    if (
      lockerNumberFrom === null ||
      lockerNumberTo === null ||
      lockerNumberFrom <= 0 ||
      lockerNumberTo <= 0
    ) {
      alert('Please enter valid locker numbers')
      return
    }

    if (
      pricePerUnit === null ||
      refundPricePerUnit === null ||
      pricePerUnit < 0 ||
      refundPricePerUnit < 0
    ) {
      alert('Please enter valid prices')
      return
    }

    console.log('Locker details saved:', {
      pricePerUnit,
      refundPricePerUnit,
      lockerCount,
      lockerNumberFrom,
      lockerNumberTo
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-2xl rounded-2xl border-l-8 border-[#DC004E] overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
          <div className="p-6 bg-gradient-to-r from-[#DC004E]/10 to-transparent">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-4 mb-2">
              <Lock className="h-8 w-8 text-[#DC004E]" />
              Add New Lockers
            </h1>
            <p className="text-gray-500 text-sm">Configure and manage your locker inventory</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#DC004E]" />
                  Locker Number From
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={lockerNumberFrom ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : Number(e.target.value)
                      setLockerNumberFrom(value)
                    }}
                    className="w-full px-4 py-3 border-2 border-transparent bg-gray-100 rounded-lg focus:outline-none focus:border-[#DC004E] focus:bg-white transition-all duration-300"
                    placeholder="Start of locker range"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#DC004E] transition-colors" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#DC004E]" />
                  Locker Number To
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={lockerNumberTo ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : Number(e.target.value)
                      setLockerNumberTo(value)
                    }}
                    className="w-full px-4 py-3 border-2 border-transparent bg-gray-100 rounded-lg focus:outline-none focus:border-[#DC004E] focus:bg-white transition-all duration-300"
                    placeholder="End of locker range"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#DC004E] transition-colors" />
                  </div>
                </div>
              </div>

              <div className="group md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#DC004E]" />
                  Locker Count
                </label>
                <div className="w-full px-4 py-3 border-2 border-transparent bg-gray-100 rounded-lg">
                  <span className="font-bold text-gray-800">{lockerCount}</span>
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#DC004E]" />
                  Price Per Unit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={pricePerUnit ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : Number(e.target.value)
                      setPricePerUnit(value)
                    }}
                    className="w-full px-4 py-3 border-2 border-transparent bg-gray-100 rounded-lg focus:outline-none focus:border-[#DC004E] focus:bg-white transition-all duration-300"
                    placeholder="Locker rental price"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400 group-focus-within:text-[#DC004E] transition-colors" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-[#DC004E]" />
                  Refund Price Per Unit
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={refundPricePerUnit ?? ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : Number(e.target.value)
                      setRefundPricePerUnit(value)
                    }}
                    className="w-full px-4 py-3 border-2 border-transparent bg-gray-100 rounded-lg focus:outline-none focus:border-[#DC004E] focus:bg-white transition-all duration-300"
                    placeholder="Refund amount per locker"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Wallet className="h-5 w-5 text-gray-400 group-focus-within:text-[#DC004E] transition-colors" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Refund amount when locker key is returned
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleSave}
                className="px-8 py-3 bg-[#DC004E] text-white font-semibold rounded-lg 
                  hover:bg-[#b0003e] focus:outline-none focus:ring-2 focus:ring-offset-2 
                  focus:ring-[#DC004E] transition-all duration-300 
                  transform hover:scale-105 active:scale-95 
                  shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <PlusCircle size={20} />
                Save Lockers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddLocker
