import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import {
  LayoutDashboard,
  Ticket,
  Lock,
  Shirt,
  FileText,
  User,
  Box,
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

import { useAuthStore } from '../stores/authStore'

const Sidebar = (): JSX.Element => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isStockOpen, setIsStockOpen] = useState(false)

  const { logout } = useAuthStore()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Ticket, label: 'Ticket Billing', path: '/ticket-billing' },
    { icon: Lock, label: 'Locker Billing', path: '/locker-billing' },
    { icon: Shirt, label: 'Costume Billing', path: '/costume-billing' },
    { icon: FileText, label: 'Bill History', path: '/bill-history' },
    { icon: User, label: 'Profile', path: '/profile' }
  ]

  const stockItems = [
    { icon: Lock, label: 'Locker', path: '/locker' },
    { icon: Shirt, label: 'Costume', path: '/costume' }
  ]

  const MenuItem = ({
    item,
    isActive
  }: {
    item: {
      icon: React.ComponentType<{ className?: string }>
      label: string
      path: string
    }
    isActive: boolean
     
  }) => {
    const Icon = item.icon
    return (
      <Link
        to={item.path}
        className={`
          flex items-center px-6 py-3 
          text-white/90 hover:bg-pink-700/20 
          transition-all duration-300 
          group relative
          ${isActive ? 'bg-pink-800/50 border-r-4 border-[#FFB800]' : ''}
        `}
      >
        <div
          className={`
          p-2 rounded-lg mr-4 
          ${isActive ? 'bg-[#FFB800]/20' : 'bg-white/10'}
          group-hover:bg-[#FFB800]/30
          transition-colors
        `}
        >
          <Icon
            className={`
              w-5 h-5 
              ${isActive ? 'text-[#FFB800]' : 'text-white/80'}
              group-hover:text-[#FFB800]
              transition-colors
            `}
          />
        </div>
        <span className="font-medium">{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="fixed h-screen w-64 bg-gradient-to-b from-[#DC004E] to-[#A30342] shadow-2xl flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-pink-300/20">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo"
            className="w-12 h-12 rounded-full shadow-lg transform hover:scale-110 transition-transform"
          />
          <h1 className="text-white text-2xl font-bold tracking-wider">
            Lagoon Park
          </h1>
        </div>
      </div>

      {/* Menu Section */}
      <nav className="mt-2 flex-grow overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
          />
        ))}

        {/* Stock Dropdown */}
        <div>
          <button
            className="
              flex items-center px-6 py-3 w-full 
              text-white/90 hover:bg-pink-700/20 
              transition-colors focus:outline-none
              group
            "
            onClick={() => setIsStockOpen(!isStockOpen)}
          >
            <div
              className={`
              p-2 rounded-lg mr-4 
              ${isStockOpen ? 'bg-[#FFB800]/20' : 'bg-white/10'}
              group-hover:bg-[#FFB800]/30
              transition-colors
            `}
            >
              <Box
                className={`
                  w-5 h-5 
                  ${isStockOpen ? 'text-[#FFB800]' : 'text-white/80'}
                  group-hover:text-[#FFB800]
                  transition-colors
                `}
              />
            </div>
            <span className="font-medium">Stock</span>
            <span className="ml-auto">
              {isStockOpen ? (
                <ChevronUp className="text-white/80 w-4 h-4" />
              ) : (
                <ChevronDown className="text-white/80 w-4 h-4" />
              )}
            </span>
          </button>
          {isStockOpen && (
            <div className="bg-pink-900/30 py-2">
              {stockItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    block px-16 py-2 
                    text-white/80 hover:bg-pink-800/50 
                    transition-colors 
                    ${location.pathname === item.path ? 'bg-pink-800/50 border-r-4 border-[#FFB800]' : ''}
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout Section at Bottom */}
      <div className="border-t border-pink-300/20">
        <Link
          to="/logout"
          onClick={() => {
            logout()
            navigate('/login')
          }}  
          className="
            flex items-center px-6 py-4 
            text-white/90 hover:bg-pink-700/20 
            transition-all group
          "
        >
          <div
            className="
            p-2 rounded-lg mr-4 
            bg-white/10 
            group-hover:bg-[#FFB800]/30
            transition-colors
          "
          >
            <LogOut
              className="
                w-5 h-5 
                text-white/80 
                group-hover:text-[#FFB800]
                transition-colors
              "
            />
          </div>
          <span className="font-medium">Logout</span>
        </Link>
      </div>
    </div>
  )
}

export default Sidebar
