import React, { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLockerStockStore } from '../stores/lockerStore'

const LockerStock: React.FC = (): React.ReactElement => {
  const navigate = useNavigate()

  const { lockerStock, loading, error, getLockerStock } = useLockerStockStore()

  const getLockerStockFunc = useCallback(() => {
    getLockerStock()
  }, [getLockerStock])

  useEffect(() => {
    getLockerStockFunc()
  }, [getLockerStockFunc])

  const handleAddLocker = (): void => {
    navigate('/add-locker')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }
  if (!lockerStock) {
    return <div>No locker stock found</div>
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Locker Stock</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage your locker inventory
            </p>
          </div>
          <button
            onClick={handleAddLocker}
            className="flex items-center px-4 py-2 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#b0003e] transition-colors duration-200 shadow-md hover:shadow-lg"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Locker
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Lockers Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Total Lockers
                  </h3>
                  <p className="text-3xl font-bold text-[#DC004E] mt-2">
                    {lockerStock.totalLockers}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Total capacity of the locker facility
              </div>
            </div>
          </div>

          {/* Available Lockers Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Available Lockers
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {lockerStock.availableLockers}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Lockers ready for new customers
              </div>
            </div>
          </div>

          {/* Occupied Lockers Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Occupied Lockers
                  </h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {lockerStock.occupiedLockers}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Currently in use by customers
              </div>
            </div>
          </div>
        </div>

        {/* Usage Progress Bar */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Locker Usage
            </h3>
            <div className="text-sm font-medium text-gray-600">
              {lockerStock.occupiedLockers} of {lockerStock.totalLockers} lockers in use
            </div>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                  Occupancy Rate
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-red-600">
                  {Math.round((lockerStock.occupiedLockers / lockerStock.totalLockers) * 100)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
              <div
                style={{ width: `${(lockerStock.occupiedLockers / lockerStock.totalLockers) * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#DC004E] transition-all duration-500"
              />
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#DC004E] mr-2" />
              <span>
                Occupied ({Math.round((lockerStock.occupiedLockers / lockerStock.totalLockers) * 100)}%)
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <span>
                Available ({Math.round((lockerStock.availableLockers / lockerStock.totalLockers) * 100)}
                %)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LockerStock
