import React, { useState } from 'react'

interface Employee {
  name: string
  phoneNumber: string
  email: string
  password: string
  joiningDate: string
}

const Profile: React.FC = (): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const employee: Employee = {
    name: 'John Doe',
    phoneNumber: '123-456-7890',
    email: 'john.doe@example.com',
    password: 'password123', // Actual password for demonstration
    joiningDate: '2023-01-15',
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your personal details</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header with Avatar */}
          <div className="bg-gradient-to-r from-[#DC004E] to-[#FF1F71] px-6 py-8">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#DC004E] text-3xl font-bold border-4 border-white shadow-md">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                <p className="text-pink-100 mt-1">
                  Employee since
                  {formatDate(employee.joiningDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid gap-6">
              <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#DC004E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="ml-4 flex-grow">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{employee.email}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-[#DC004E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="ml-4 flex-grow">
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-gray-900 font-medium">{employee.phoneNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-[#DC004E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4" />
                  </svg>
                  <div className="ml-4 flex-grow">
                    <p className="text-sm text-gray-500">Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-900 font-medium">{showPassword ? employee.password : '••••••••'}</p>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="ml-4 px-3 py-1 text-sm bg-white border border-[#DC004E] text-[#DC004E] rounded-full hover:bg-pink-50 transition-colors duration-200 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          )}
                        </svg>
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#b0003e] transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
