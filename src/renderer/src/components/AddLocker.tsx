/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';

const AddLocker: React.FC = (): React.ReactElement => {
  const [pricePerUnit, setPricePerUnit] = useState(0);
  const [lockerCount, setLockerCount] = useState(0);
  const [lockerNumberFrom, setLockerNumberFrom] = useState(0);
  const [lockerNumberTo, setLockerNumberTo] = useState(0);

  // Automatically calculate locker count based on locker number range
  useEffect(() => {
    if (lockerNumberTo >= lockerNumberFrom) {
      setLockerCount(lockerNumberTo - lockerNumberFrom + 1);
    } else {
      setLockerCount(0);
    }
  }, [lockerNumberFrom, lockerNumberTo]);

  const handleSave = (): void => {
    console.log('Locker details saved:', {
      pricePerUnit,
      lockerCount,
      lockerNumberFrom,
      lockerNumberTo,
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Add Locker</h1>
        <p className="text-gray-500 mt-1">Enter locker details below</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locker Number From</label>
            <input
              type="number"
              value={lockerNumberFrom}
              onChange={(e) => setLockerNumberFrom(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locker Number To</label>
            <input
              type="number"
              value={lockerNumberTo}
              onChange={(e) => setLockerNumberTo(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Locker Count</label>
            <input
              type="number"
              value={lockerCount}
              onChange={(e) => setLockerCount(Number(e.target.value))}
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

export default AddLocker; 