/* eslint-disable prettier/prettier */
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LockerStock: React.FC = (): React.ReactElement => {
  const navigate = useNavigate();

  const totalLockers = 100; // Example total lockers
  const availableLockers = 75; // Example available lockers

  const handleAddLocker = (): void => {
    navigate('/add-locker');
  };

  return (
    <div className="space-y-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Locker Stock</h1>
        <p className="text-gray-500 mt-1">Manage your locker inventory</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-[#DC004E]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-blue-800">Total Lockers</h3>
            <p className="text-2xl font-extrabold text-blue-900">{totalLockers}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-green-800">Available Lockers</h3>
            <p className="text-2xl font-extrabold text-green-900">{availableLockers}</p>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={handleAddLocker}
            className="px-6 py-3 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#e3343a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Locker
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockerStock; 