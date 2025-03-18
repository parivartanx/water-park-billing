/* eslint-disable prettier/prettier */
import React, { useState } from 'react';

interface Employee {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  joiningDate: string;
}

const Profile: React.FC = (): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false);

  const employee: Employee = {
    name: 'John Doe',
    phoneNumber: '123-456-7890',
    email: 'john.doe@example.com',
    password: 'password123', // Actual password for demonstration
    joiningDate: '2023-01-15',
  };

  return (
    <div className="space-y-6">
      <div className="mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Employee Profile</h1>
        <p className="text-gray-500 mt-1">View your personal details</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#DC004E]">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Name</span>
            <span className="font-medium">{employee.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Phone Number</span>
            <span className="font-medium">{employee.phoneNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{employee.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Password</span>
            <span className="font-medium">{showPassword ? employee.password : '********'}</span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-4 px-2 py-1 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#8b2230] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showPassword ? 'Hide' : 'Show'} Password
            </button>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Joining Date</span>
            <span className="font-medium">{employee.joiningDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 