import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Lock, User, Ticket, Shirt, Key } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type Role = 'ticket' | 'costume' | 'locker'

interface RoleConfig {
  title: string
  icon: JSX.Element
  color: string
}

const roleConfigs: Record<Role, RoleConfig> = {
  ticket: {
    title: 'Ticket Counter',
    icon: <Ticket className="h-6 w-6" />,
    color: '#4CAF50'
  },
  costume: {
    title: 'Costume Counter',
    icon: <Shirt className="h-6 w-6" />,
    color: '#2196F3'
  },
  locker: {
    title: 'Locker Counter',
    icon: <Key className="h-6 w-6" />,
    color: '#FF9800'
  }
}

const SignIn = (): JSX.Element => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [localError, setLocalError] = useState('')
  
  // Get auth store state and actions
  const { login, loading, error: authError } = useAuthStore()
  const navigate = useNavigate()
  const { validateAuth } = useAuth()
  
  /// use callback function for login
  const handleLogin = useCallback(async () => {
    try {
      // Call the login function from auth store
      // console.log('Logging in with:', { username, password, role: selectedRole })
      const result = await login(username, password, selectedRole || '')
      if (result.success) {
        // Validate authentication after login
        const isValid = validateAuth()
        
        if (isValid) {
          // Navigate to dashboard after successful login and validation
          navigate('/')
        } else {
          setLocalError('Authentication failed. Please try again.')
        }
      } else {
        setLocalError(result.error || 'Login failed. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setLocalError('Login failed. Please try again.')
    }
  }, [username, password, selectedRole, login, navigate, validateAuth])

  const handleSignIn =(e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!selectedRole) {
      setLocalError('Please select a role')
      return
    }

    if (!username || !password) {
      setLocalError('Please fill in all fields')
      return
    }
    handleLogin()
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setLocalError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#DC004E] to-[#A30342] p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Lagoon Park</h1>
            <p className="text-gray-600 mt-2">Select your role to sign in</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {(Object.keys(roleConfigs) as Role[]).map((role) => (
              <motion.button
                key={role}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRoleSelect(role)}
                className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                  selectedRole === role
                    ? `bg-opacity-20 ring-2 ring-offset-2`
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  backgroundColor: `${roleConfigs[role].color}${
                    selectedRole === role ? '33' : '11'
                  }`,
                  ...(selectedRole === role ? { ringColor: roleConfigs[role].color } : {})
                }}
              >
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: roleConfigs[role].color }}
                >
                  {roleConfigs[role].icon}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {roleConfigs[role].title}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Error Messages */}
          {(localError || authError) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            >
              {localError || authError}
            </motion.div>
          )}

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E]"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 px-4 text-white font-bold rounded-lg transition duration-200"
              style={{
                backgroundColor: selectedRole
                  ? roleConfigs[selectedRole].color
                  : '#9CA3AF'
              }}
              disabled={!selectedRole || loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          {/* {selectedRole && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Demo credentials for {roleConfigs[selectedRole].title}:
                <br />
                Username: {roleConfigs[selectedRole].credentials.username}
                <br />
                Password: {roleConfigs[selectedRole].credentials.password}
              </p>
            </div>
          )} */}
        </div>
      </motion.div>

      <div className="absolute bottom-4 text-center text-white/90 text-sm">
        &copy; {new Date().getFullYear()} Water Park Billing System | All rights
        reserved
      </div>
    </div>
  )
}

export default SignIn
