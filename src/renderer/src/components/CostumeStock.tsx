import { CostumeCategory } from '@renderer/utils/enums'
import React, { useState, useEffect } from 'react'
import { useCostumeStockStore } from '../stores/costumeStore'
import { toast } from 'react-hot-toast'

const CostumeStock: React.FC = (): React.ReactElement => {
  const [category, setCategory] = useState<CostumeCategory>(CostumeCategory.MALE)
  const [quantity, setQuantity] = useState<number | null>(null)
  const [pricePerUnit, setPricePerUnit] = useState<number | null>(null)
  const [refundPrice, setRefundPrice] = useState<number | null>(null)
  const { loading, error, costumeStock, getCostumeStock, createCostumeStock } = useCostumeStockStore()

  // Fetch costume stock data on component mount
  useEffect(() => {
    fetchCostumeStock()
  }, [])

  const fetchCostumeStock = async () => {
    try {
      await getCostumeStock()
    } catch {
      toast.error('Failed to fetch costume stock data')
    }
  }

  const handleSave = async (): Promise<void> => {
    // Get access token from localStorage
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      toast.error('You are not authenticated. Please log in.')
      return
    }

    // Validate required fields
    if (!quantity || !pricePerUnit || !refundPrice) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createCostumeStock({
        category,
        quantity,
        pricePerUnit,
        refundPrice
      }, access_token)

      // Check if there was an error during creation
      if (error) {
        toast.error(error)
        return
      }

      // Reset form fields after successful creation
      setQuantity(null)
      setPricePerUnit(null)
      setRefundPrice(null)
            
      // Show success message
      toast.success('Stock updated successfully!')
      
      // Refresh costume stock data
      await fetchCostumeStock()
    } catch {
      toast.error('Failed to update costume stock')
    }
  }

  // Find stock quantity for a specific category
  const getStockQuantity = (categoryType: CostumeCategory): number => {
    const stockItem = costumeStock.find(
      item => item.category === categoryType
    )
    return stockItem ? stockItem.quantity : 0
  }

  const renderCategoryCard = (
    categoryType: CostumeCategory
  ): React.ReactElement => {
    const stockQuantity = getStockQuantity(categoryType)
    
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-pink-50 rounded-lg">
                <svg
                  className="w-6 h-6 text-[#DC004E]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7zm5-18v18m0-18h5a2 2 0 012 2v14a2 2 0 01-2 2h-5"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {categoryType} Costume
                </h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#DC004E]">{stockQuantity}</p>
              <p className="text-sm text-gray-500">In Stock</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Costume Stock</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage your costume inventory
            </p>
          </div>
          {loading && (
            <div className="flex items-center text-[#DC004E]">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                />
              </svg>
              <span>Loading...</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.values(CostumeCategory).map((categoryType) => (
            <div key={categoryType}>
              {renderCategoryCard(categoryType as CostumeCategory)}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-lg border-l-4 border-[#DC004E] p-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-[#DC004E]" 
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
              Update Stock
            </h2>
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`px-4 py-2 ${loading ? 'bg-gray-400' : 'bg-[#DC004E] hover:bg-[#b0003e]'} text-white rounded-lg transition-colors duration-200 flex items-center gap-2`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4" 
                      fill="none" 
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                    />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Selection */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CostumeCategory)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent appearance-none"
                  disabled={loading}
                >
                  <option value={CostumeCategory.MALE}>MALE</option>
                  <option value={CostumeCategory.FEMALE}>FEMALE</option>
                  <option value={CostumeCategory.FEMALE_DRESS}>FEMALE_DRESS</option>
                  <option value={CostumeCategory.FEMALE_FULLPANT}>FEMALE_FULLPANT</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg 
                    className="fill-current h-4 w-4" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center">
                <button 
                  type="button"
                  onClick={() => setQuantity(prev => prev !== null && prev > 0 ? prev - 1 : 0)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-l-lg text-gray-700"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <input
                  type="number"
                  value={quantity === null ? '' : quantity}
                  onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent text-center"
                  disabled={loading}
                  min="0"
                />
                <button 
                  type="button"
                  onClick={() => setQuantity(prev => prev !== null ? prev + 1 : 1)}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-r-lg text-gray-700"
                  disabled={loading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Price Per Unit Input */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Unit (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                <input
                  type="number"
                  value={pricePerUnit === null ? '' : pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Enter price per unit"
                  className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent"
                  disabled={loading}
                  min="0"
                  step="1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Amount charged per costume</p>
            </div>

            {/* Refund Price Input */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Refund Price (₹)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                <input
                  type="number"
                  value={refundPrice === null ? '' : refundPrice}
                  onChange={(e) => setRefundPrice(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Enter refund price"
                  className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent"
                  disabled={loading}
                  min="0"
                  step="1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Amount refunded when costume is returned</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg max-w-md">
              <h3 className="font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Stock Management Tip
              </h3>
              <p className="text-sm mt-1">
                Adding stock for a category that already exists will update the existing stock quantity.
                Make sure to check current stock levels before making changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CostumeStock
