import React, { useState } from 'react'

const CostumeStock: React.FC = (): React.ReactElement => {
  const [category, setCategory] = useState<'half' | 'full' | 'ladies' | 'kids'>('half')
  const [size, setSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M')
  const [quantity, setQuantity] = useState<number | null>(null)
  const [pricePerUnit, setPricePerUnit] = useState<number | null>(null)
  const [refundPrice, setRefundPrice] = useState<number | null>(null)

  const handleSave = (): void => {
    console.log('Costume details saved:', {
      category,
      size,
      quantity,
      pricePerUnit,
      refundPrice
    })
  }

  const renderSizeCard = (
    sizeOption: string,
    categoryType: 'half' | 'full' | 'ladies' | 'kids'
  ): React.ReactElement => (
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
              <h3 className="text-lg font-semibold text-gray-900">
                Size {sizeOption}
              </h3>
              <p className="text-sm text-gray-500">{categoryType} Category</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#DC004E]">{quantity ?? 0}</p>
            <p className="text-sm text-gray-500">In Stock</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Costume Stock</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage your costume inventory
          </p>
        </div>

        <div className="space-y-8">
          {['half', 'full', 'ladies', 'kids'].map((categoryType) => (
            <div key={categoryType} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center capitalize">
                <svg
                  className="w-6 h-6 mr-2 text-[#DC004E]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {categoryType} Category
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['S', 'M', 'L', 'XL', 'XXL'].map((sizeOption) =>
                  renderSizeCard(sizeOption, categoryType as 'half' | 'full' | 'ladies' | 'kids')
                )}
              </div>
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
              className="px-4 py-2 bg-[#DC004E] text-white rounded-lg hover:bg-[#b0003e] transition-colors duration-200 flex items-center gap-2"
            >
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
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Selection */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'half' | 'full' | 'ladies' | 'kids')}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent appearance-none"
                >
                  <option value="half">Half</option>
                  <option value="full">Full</option>
                  <option value="ladies">Ladies</option>
                  <option value="kids">Kids</option>
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

            {/* Size Selection */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <div className="relative">
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value as 'S' | 'M' | 'L' | 'XL' | 'XXL')}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent appearance-none"
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity 
                <span className="text-gray-500 ml-1 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={quantity ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value)
                    setQuantity(value)
                  }}
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Per Unit Input */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Unit 
                <span className="text-gray-500 ml-1 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={pricePerUnit ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value)
                    setPricePerUnit(value)
                  }}
                  placeholder="Enter price"
                  className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">₹</span>
                </div>
              </div>
            </div>

            {/* Refund Price Input */}
            <div className="group relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Price 
                <span className="text-gray-500 ml-1 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={refundPrice ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value)
                    setRefundPrice(value)
                  }}
                  placeholder="Enter refund price"
                  className="w-full px-4 py-3 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">₹</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#b0003e] transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save Changes
          </button>
        </div> */}
      </div>
    </div>
  )
}

export default CostumeStock
