/* eslint-disable prettier/prettier */
import React, { useState } from 'react';

type CostumeDetails = {
  customerName: string;
  costumeQuantity: number;
  totalAmount: number;
};

const ReturnCostume: React.FC = (): React.ReactElement => {
  const [customerNumber, setCustomerNumber] = useState('');
  const [costumeDetails, setCostumeDetails] = useState<CostumeDetails | null>(null);

  const handleRemoveDetails = (): void => {
    setCostumeDetails(null);
    console.log('Costume details removed');
  };

  const fetchCostumeDetails = (): void => {
    // Placeholder for fetching logic
    console.log('Fetching costume details for customer number:', customerNumber);
    // Simulate fetching data
    setCostumeDetails({
      customerName: 'John Doe',
      costumeQuantity: 3,
      totalAmount: 60,
    });
    setCustomerNumber(''); // Clear input field after fetching
  };

  return (
    <div className="space-y-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Return Costume</h1>
        <p className="text-gray-500 mt-1">Enter customer number to fetch costume details</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Number</label>
            <input
              type="tel"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value.slice(0, 10))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchCostumeDetails}
              className="px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#DC004E] focus:outline-none focus:ring-2 focus:ring-[#DC004E] focus:ring-offset-2"
            >
              Fetch Details
            </button>
          </div>
        </div>
      </div>

      {costumeDetails && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E] mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Costume Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Customer Name</span>
              <span className="font-medium">{costumeDetails.customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Costume Quantity</span>
              <span className="font-medium">{costumeDetails.costumeQuantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount</span>
              <span className="font-medium">${costumeDetails.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleRemoveDetails}
              className="px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => console.log('Refund processed for customer number:', customerNumber)}
          className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Refund
        </button>
      </div>
    </div>
  );
};

export default ReturnCostume; 