import React, { useState } from 'react'

const CostumeStock: React.FC = (): React.ReactElement => {
  const [fitting, setFitting] = useState<'half' | 'full'>('half')
  const [size, setSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M')
  const [quantity, setQuantity] = useState(0)
  const [pricePerUnit, setPricePerUnit] = useState(0)
  const [refundPrice, setRefundPrice] = useState(0)

  const handleSave = (): void => {
    console.log('Costume details saved:', {
      fitting,
      size,
      quantity,
      pricePerUnit,
      refundPrice
    })
  }

  const renderSizeCard = (sizeOption: string, fittingType: 'half' | 'full'): React.ReactElement => (
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
              <h3 className="text-lg font-semibold text-gray-900">Size {sizeOption}</h3>
              <p className="text-sm text-gray-500">{fittingType} Fitting</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#DC004E]">{quantity}</p>
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
          <p className="text-gray-600 mt-2">Monitor and manage your costume inventory</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
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
              Half Fitting
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sizeOption) => renderSizeCard(sizeOption, 'half'))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
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
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l-5-5-5 5"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12" />
              </svg>
              Full Fitting
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['S', 'M', 'L', 'XL', 'XXL'].map((sizeOption) => renderSizeCard(sizeOption, 'full'))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Stock
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitting Type
                  </label>
                  <select
                    value={fitting}
                    onChange={(e) => setFitting(e.target.value as 'half' | 'full')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-white"
                  >
                    <option value="half">Half</option>
                    <option value="full">Full</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as 'S' | 'M' | 'L' | 'XL' | 'XXL')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] bg-white"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Unit
                  </label>
                  <input
                    type="number"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
                  />
                </div>
              </div>
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Price
                  </label>
                  <input
                    type="number"
                    value={refundPrice}
                    onChange={(e) => setRefundPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleSave}
            className="flex items-center px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#b0003e] transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default CostumeStock
