import React, { useState, useEffect } from 'react'
import { Search, CheckCircle, Package, X } from 'lucide-react'
import { useBillingHistoryStore } from '../stores/billingHistoriesStore'
// import toast from 'react-hot-toast'
import { useReturnStore } from '../stores/returnStore'

const ReturnItems = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)



  // Get billing store functions and state
  const { loading, lastUnifiedBilling, getLastUnifiedBilling } = useBillingHistoryStore()
 const { returnBillingCostumeAndLocker, loading: returnLoading, error: returnError, success: returnSuccess } = useReturnStore()
  // Derived state: show results if we have data
  const showResults = Boolean(lastUnifiedBilling)

  // Reset results when component unmounts
  useEffect(() => {
    return () => {
      useBillingHistoryStore.setState({ lastUnifiedBilling: null })
      useReturnStore.setState({ loading: false, error: null, success: null })
    }
  }, [])

  // Handle phone number input
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setPhoneNumber(value.slice(0, 10))
    if (error) setError('')
  }

  // Handle search
  const handleSearch = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      setError('Please log in first')
      return
    }

 
    setIsSearching(true)
    setError('')
    setSelectedItems([])

    try {
      await getLastUnifiedBilling(phoneNumber, accessToken)
    } catch (err) {
      console.error('Error fetching billing details:', err)
      setError('Failed to fetch customer details')
    } finally {
      setIsSearching(false)
    }
  }

  // Handle item selection
  const handleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Calculate total refund amount for selected items
  const calculateTotalRefund = () => {
    if (!lastUnifiedBilling) return 0
    
    let total = 0
    
    // Add locker refunds
    lastUnifiedBilling.lockers?.forEach(locker => {
      if (selectedItems.includes(locker._id || '')) {
        total += locker.refundPrice || 0
      }
    })

    // Add costume refunds
    lastUnifiedBilling.costumes?.forEach(costume => {
      if (selectedItems.includes(costume._id || '')) {
        total += costume.refundPrice || 0
      }
    })

    return total
  }

  // Handle return items
  const handleReturnItems = () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item to return')
      return
    }
   
      /// get access_token from localStorage
      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) {
        setError('Please log in first')
        return
      }
       /// get selected items where id exist in selectedItems

       const lockerIds = lastUnifiedBilling?.lockers?.filter(locker => selectedItems.includes(locker._id || '')).map(locker => locker._id || '') || []
       const costumeIds = lastUnifiedBilling?.costumes?.filter(costume => selectedItems.includes(costume._id || '')).map(costume => costume._id || '') || []

       if(lockerIds.length === 0 && costumeIds.length === 0) {
        setError('Please select at least one item to return')
        return
       }

       /// extract 
       returnBillingCostumeAndLocker(lastUnifiedBilling?._id || '', costumeIds, lockerIds, accessToken)
   
  }

  if(loading || returnLoading){
    // write loading UI 
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <p className="text-red-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(error || returnError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <X className="text-[#DC004E]" />
                Error
              </h2>
            </div>
            <div className="p-6">
              <p className="text-red-500">{error || returnError}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if(returnSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="text-[#DC004E]" />
                Success
              </h2>
            </div>
            <div className="p-6">
              <p className="text-green-500">{"Items returned successfully"}</p>
              <button className="bg-[#DC004E] text-white px-4 py-2 rounded-lg mt-4" onClick={() => {
                useBillingHistoryStore.setState({ lastUnifiedBilling: null })
                useReturnStore.setState({ loading: false, error: null, success: null })
                setPhoneNumber('')
                setSelectedItems([])
              }}>Return Another</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Search className="text-[#DC004E]" />
              Return Items
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Phone Number Input */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone Number
              </label>
              <div className="flex gap-4">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  placeholder="Enter 10-digit number"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#DC004E] focus:border-transparent transition-all"
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

            {/* Results Section */}
            {showResults && lastUnifiedBilling && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border-l-4 border-[#DC004E] p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Package className="h-6 w-6 text-[#DC004E]" />
                    Items to Return
                  </h2>

                  <div className="grid gap-4">
                    {/* Render Lockers */}
                    {lastUnifiedBilling.lockers?.map(locker => (
                      <div
                        key={locker._id}
                        className={`p-4 border rounded-lg ${
                          selectedItems.includes(locker._id || '') ? 'border-[#DC004E] bg-pink-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleItemSelection(locker._id || '')}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Locker #{locker.lockerNames?.map(name => name).join(', ')}</h4>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Amount: ₹{locker.price}</p>
                              <p>Refund Amount: ₹{locker.refundPrice || 0}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedItems.includes(locker._id || '') ? (
                              <CheckCircle className="w-6 h-6 text-[#DC004E]" />
                            ) : (
                              <div className="w-6 h-6 border-2 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Render Costumes */}
                    {lastUnifiedBilling.costumes?.map(costume => (
                      <div
                        key={costume._id}
                        className={`p-4 border rounded-lg ${
                          selectedItems.includes(costume._id || '') ? 'border-[#DC004E] bg-pink-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleItemSelection(costume._id || '')}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{costume.category || 'Costume'}</h4>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Amount: ₹{costume.amount}</p>
                              <p>Refund Amount: ₹{costume.refundPrice}</p>
                              <p>Category: {costume.category || 'Costume'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedItems.includes(costume._id || '') ? (
                              <CheckCircle className="w-6 h-6 text-[#DC004E]" />
                            ) : (
                              <div className="w-6 h-6 border-2 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Refund and Return Button */}
                  {(lastUnifiedBilling.lockers?.length || lastUnifiedBilling.costumes?.length) > 0 && (
                    <div className="flex justify-between items-center mt-6">
                      {selectedItems.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-green-800 font-medium">Total Refund Amount</p>
                          <p className="text-2xl font-bold text-green-600">₹{calculateTotalRefund()}</p>
                        </div>
                      )}
                      <button
                        onClick={handleReturnItems}
                        disabled={selectedItems.length === 0}
                        className="px-6 py-2 bg-[#DC004E] text-white rounded-lg hover:bg-[#A30342] disabled:bg-gray-400 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Return Selected Items ({selectedItems.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReturnItems
