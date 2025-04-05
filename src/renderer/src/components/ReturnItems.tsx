import React, { useState } from 'react'
import { Phone, Search, Package, CheckCircle, X } from 'lucide-react'

interface CustomerItem {
  id: string
  type: 'locker' | 'costume'
  number?: string
  name?: string
  size?: string
  assignedTime: string
  assignedDate: string
  purchaseAmount: number
  securityDeposit: number
  entryTime: string
  timeLapsed: string
  quantity: number
}

const ReturnItems: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Mock data - replace with actual API calls
  const mockCustomerItems: CustomerItem[] = [
    {
      id: 'lock123',
      type: 'locker',
      number: 'L123',
      assignedTime: '14:30',
      assignedDate: '05/04/2025',
      purchaseAmount: 100,
      securityDeposit: 200,
      entryTime: '14:30',
      timeLapsed: '2h 30m',
      quantity: 1
    },
    {
      id: 'cost456',
      type: 'costume',
      name: 'Blue Swimmer',
      size: 'M',
      assignedTime: '14:30',
      assignedDate: '05/04/2025',
      purchaseAmount: 150,
      securityDeposit: 500,
      entryTime: '14:30',
      timeLapsed: '2h 30m',
      quantity: 1
    }
  ]

  const handleSearch = () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    
    setError('')
    setIsSearching(true)
    setSelectedItems([])
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSearching(false)
      setShowResults(true)
    }, 1000)
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setPhoneNumber(value.slice(0, 10))
    if (showResults) setShowResults(false)
    if (error) setError('')
  }

  const handleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  const handleReturnItems = () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item to return')
      return
    }
    alert(`Return process initiated for ${selectedItems.length} item(s)`)
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Search Customer Section */}
        <div className="bg-white rounded-2xl shadow-lg border-l-4 border-[#DC004E] p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Phone className="h-6 w-6 text-[#DC004E]" />
            Search Customer
          </h2>

          <div className="bg-gray-50 rounded-xl p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Phone Number
            </label>
            <div className="flex gap-4">
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DC004E] focus:border-transparent transition-all"
                placeholder="Enter 10-digit number"
                maxLength={10}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || phoneNumber.length !== 10}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                  isSearching || phoneNumber.length !== 10
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#DC004E] hover:bg-[#A30342] text-white'
                }`}
              >
                {isSearching ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Fetching Details...
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Fetch Details
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-red-500 text-sm flex items-center">
                <X className="h-4 w-4 mr-1" />
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="space-y-6">
            {/* Items Table */}
            <div className="bg-white rounded-2xl shadow-lg border-l-4 border-[#DC004E] p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package className="h-6 w-6 text-[#DC004E]" />
                Items to Return
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Lapsed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deposit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockCustomerItems.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleItemSelection(item.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedItems.includes(item.id) ? 'bg-pink-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                            selectedItems.includes(item.id)
                              ? 'border-[#DC004E] bg-[#DC004E]'
                              : 'border-gray-300'
                          }`}>
                            {selectedItems.includes(item.id) && (
                              <CheckCircle className="h-4 w-4 text-white" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.type === 'locker'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {item.type === 'locker' ? 'Locker' : 'Costume'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">
                            {item.type === 'locker' ? `Locker ${item.number}` : `${item.name} (${item.size})`}
                          </div>
                        </td>
                        <td className="px-4 py-4">{item.quantity}</td>
                        <td className="px-4 py-4">{item.entryTime}</td>
                        <td className="px-4 py-4">{item.timeLapsed}</td>
                        <td className="px-4 py-4">₹{item.purchaseAmount}</td>
                        <td className="px-4 py-4 text-green-600 font-medium">₹{item.securityDeposit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Return Summary */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Return Summary</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Items</div>
                    <div className="text-2xl font-bold text-gray-900">{selectedItems.length}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Deposit Refund</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{mockCustomerItems
                        .filter(item => selectedItems.includes(item.id))
                        .reduce((sum, item) => sum + item.securityDeposit, 0)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReturnItems}
                  className="w-full py-3 bg-[#DC004E] hover:bg-[#A30342] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Return Selected Items ({selectedItems.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReturnItems
