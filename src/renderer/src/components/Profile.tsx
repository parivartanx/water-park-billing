import React, { useState, useEffect } from 'react'
import { useEmployeeStore } from '../stores/employeeStore'
import { Spin, message, Form, Input, Modal, Button, Skeleton } from 'antd'
import { LoadingOutlined, EditOutlined, EyeOutlined, EyeInvisibleOutlined, MailOutlined, PhoneOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

const Profile: React.FC = (): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  
  // Get the employee data and auth token
  const { loading, error, employee, getEmployeeById, updateProfile } = useEmployeeStore()

  // Load employee data when component mounts
  useEffect(() => {
    const loadEmployeeData = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        await getEmployeeById(token)
      }
    }
    
    loadEmployeeData()
  }, [getEmployeeById])

  // Reset form when entering edit mode
  useEffect(() => {
    if (isEditing && employee) {
      form.setFieldsValue({
        name: employee.name,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
      })
    }
  }, [isEditing, employee, form])

  // Format date helper
  const formatDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      console.error(error)
      return 'Unknown date'
    }
  }

  // Handle form submission
  const handleUpdate = async (values: Record<string, string>) => {
    try {
      await updateProfile(values)
      setIsEditing(false)
      message.success('Profile updated successfully!')
    } catch (error) {
      console.error(error)
      message.error('Failed to update profile. Please try again.')
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false)
    form.resetFields()
  }

  // // Show confirmation modal for changing password
  // const showChangePasswordModal = () => {
  //   setIsModalVisible(true)
  // }

  // Handle password change
  const handlePasswordChange = (values: Record<string, string>) => {
    // Use values to update password in a real implementation
    console.log('Password change requested:', values.newPassword?.length)
    message.success('Password changed successfully!')
    setIsModalVisible(false)
  }

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
        <Spin indicator={antIcon} />
      </div>
    )
  }

  // If error, show error message
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => {
              const token = localStorage.getItem('access_token')
              if (token) getEmployeeById(token)
            }}
            className="mt-4 px-4 py-2 bg-[#DC004E] text-white font-medium rounded-lg hover:bg-[#b0003e]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // If no employee data, show placeholder
  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </div>
      </div>
    )
  }

  // Main profile view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your personal details</p>
        </div>

        {/* Profile Card */}
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
                  Employee since {' '}
                  {formatDate(employee.joiningDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          {isEditing ? (
            // Edit Profile Form
            <div className="p-6">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdate}
                initialValues={{
                  name: employee.name,
                  email: employee.email,
                  phoneNumber: employee.phoneNumber,
                }}
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input placeholder="Your full name" />
                </Form.Item>
                
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Your email address" />
                </Form.Item>
                
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Your phone number" />
                </Form.Item>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    onClick={handleCancelEdit}
                    icon={<CloseOutlined />}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    style={{ backgroundColor: '#DC004E', borderColor: '#DC004E' }}
                  >
                    Save Changes
                  </Button>
                </div>
              </Form>
            </div>
          ) : (
            // View Profile Details
            <div className="p-6">
              <div className="grid gap-6">
                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <MailOutlined className="text-lg text-[#DC004E]" />
                    <div className="ml-4 flex-grow">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900 font-medium">{employee.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <PhoneOutlined className="text-lg text-[#DC004E]" />
                    <div className="ml-4 flex-grow">
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="text-gray-900 font-medium">{employee.phoneNumber}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="text-lg text-[#DC004E]">🔑</div>
                    <div className="ml-4 flex-grow">
                      <p className="text-sm text-gray-500">Password</p>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 font-medium">{showPassword ? employee.password : '••••••••'}</p>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              console.log(employee.password)
                              setShowPassword(!showPassword)
                            }}
                            icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            size="small"
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </Button>
                          {/* <Button
                            onClick={showChangePasswordModal}
                            type="primary"
                            size="small"
                            style={{ backgroundColor: '#DC004E', borderColor: '#DC004E' }}
                          >
                            Change
                          </Button> */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role and Status - Read Only */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-lg text-[#DC004E]">👤</div>
                    <div className="ml-4 flex-grow">
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="text-gray-900 font-medium capitalize">{employee.role || 'Staff'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => setIsEditing(true)}
                  type="primary"
                  icon={<EditOutlined />}
                  size="large"
                  style={{ backgroundColor: '#DC004E', borderColor: '#DC004E' }}
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        title="Change Password"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Enter your current password" />
          </Form.Item>
          
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter your new password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password placeholder="Enter your new password" />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your new password" />
          </Form.Item>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#DC004E', borderColor: '#DC004E' }}>
              Update Password
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Profile
