import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const SignIn = (): JSX.Element => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSignIn = (e: React.FormEvent): void => {
    e.preventDefault()

    // Simple validation
    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }

    // For demo purposes - replace with actual authentication logic
    if (username === 'admin' && password === 'password') {
      // Use the auth context login method
      login({ username, role: 'ticket' })
      navigate('/')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#d65e88] to-[#A30342] p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Lagoon Park</h1>
            <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-[#FFB800] text-red-700 px-4 py-3 rounded mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignIn}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#DC004E]" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E]"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#DC004E]" />
                </div>
                <input
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DC004E]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#DC004E] focus:ring-[#DC004E] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#FFB800] hover:bg-[#DC004E] text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              Sign In
            </motion.button>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Demo credentials: username: admin, password: password
            </p>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-4 text-center text-white/90 text-sm">
        &copy; {new Date().getFullYear()} Water Park Billing System | All rights reserved
      </div>
    </div>
  )
}

export default SignIn
