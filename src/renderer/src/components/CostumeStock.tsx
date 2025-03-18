/* eslint-disable prettier/prettier */
import React, { useState } from 'react';

const CostumeStock: React.FC = (): React.ReactElement => {
  const [fitting, setFitting] = useState<'half' | 'full'>('half');
  const [size, setSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [quantity, setQuantity] = useState(0);
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [refundPrice, setRefundPrice] = useState(0);

  const handleSave = (): void => {
    console.log('Costume details saved:', {
      fitting,
      size,
      quantity,
      pricePerUnit,
      refundPrice,
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Costume Stock</h1>
        <p className="text-gray-500 mt-1">Manage your costume inventory</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Half Fitting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {['S', 'M', 'L', 'XL', 'XXL'].map((sizeOption) => (
            <div key={`half-${sizeOption}`} className="bg-blue-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-blue-800">Size: {sizeOption}</h3>
              <p className="text-blue-600 mt-2 font-bold">Quantity: {quantity}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Full Fitting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {['S', 'M', 'L', 'XL', 'XXL'].map((sizeOption) => (
            <div key={`full-${sizeOption}`} className="bg-green-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-bold text-green-800">Size: {sizeOption}</h3>
              <p className="text-green-600 mt-2 font-bold">Quantity: {quantity}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fitting</label>
          <select
            value={fitting}
            onChange={(e) => setFitting(e.target.value as 'half' | 'full')}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
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
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
          >
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Price Per Unit</label>
          <input
            type="number"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Refund Price</label>
          <input
            type="number"
            value={refundPrice}
            onChange={(e) => setRefundPrice(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#e3343a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostumeStock; 