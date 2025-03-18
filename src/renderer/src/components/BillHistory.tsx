/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';

interface Bill {
  id: number;
  customerName: string;
  phone: string;
  date: string;
  quantity: number;
  type: 'ticket' | 'locker' | 'costume';
  totalAmount: number;
  returned: boolean;
}

const BillHistory: React.FC = (): React.ReactElement => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterType, setFilterType] = useState<'ticket' | 'locker' | 'costume' | ''>('');

  useEffect(() => {
    // Placeholder for fetching bill history
    console.log('Fetching bill history');
    // Simulate fetching data
    setBills([
      { id: 1, customerName: 'John Doe', phone: '123-456-7890', date: '2023-10-01', quantity: 2, type: 'ticket', totalAmount: 100, returned: false },
      { id: 2, customerName: 'Jane Smith', phone: '987-654-3210', date: '2023-10-02', quantity: 1, type: 'locker', totalAmount: 150, returned: true },
    ]);
  }, []);

  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const matchesDate = (!start || billDate >= start) && (!end || billDate <= end);
    const matchesType = !filterType || bill.type === filterType;
    return matchesDate && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Bill History</h1>
        <p className="text-gray-500 mt-1">View past billing records</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
            placeholder="Start Date"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
            placeholder="End Date"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'ticket' | 'locker' | 'costume' | '')}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E]"
          >
            <option value="">All Types</option>
            <option value="ticket">Ticket</option>
            <option value="locker">Locker</option>
            <option value="costume">Costume</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
        {/* <h2 className="text-lg font-semibold text-gray-800 mb-4">Past Bills</h2> */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold border-b pb-2 mb-2">
            <span className="text-gray-800">Customer Name</span>
            <span className="text-gray-800">Phone</span>
            <span className="text-gray-800">Date</span>
            <span className="text-gray-800">Quantity</span>
            <span className="text-gray-800">Type</span>
            <span className="text-gray-800">Amount</span>
            <span className="text-gray-800">Returned</span>
            <span className="text-gray-800">Action</span>
          </div>
          {filteredBills.map((bill) => (
            <div key={bill.id} className="flex justify-between items-center text-sm border-b pb-2 mb-2">
              <span className="text-gray-600">{bill.customerName}</span>
              <span className="text-gray-600">{bill.phone}</span>
              <span className="text-gray-600">{bill.date}</span>
              <span className="text-gray-600">{bill.quantity}</span>
              <span className="text-gray-600">{bill.type}</span>
              <span className="font-medium">${bill.totalAmount.toFixed(2)}</span>
              <span className="text-gray-600">{bill.returned ? 'Yes' : 'No'}</span>
              <button
                type="button"
                onClick={() => console.log('Viewing bill ID:', bill.id)}
                className="px-4 py-2 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#ad2939] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                View Bill
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillHistory; 