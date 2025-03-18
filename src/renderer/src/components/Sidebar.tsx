import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import logo from '../assets/logo.png'

const Sidebar = (): JSX.Element => {
  const location = useLocation()
  const [isStockOpen, setIsStockOpen] = useState(false)

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/' },
    { icon: '🎫', label: 'Ticket Billing', path: '/ticket-billing' },
    { icon: '🔐', label: 'Locker Billing', path: '/locker-billing' },
    { icon: '👔', label: 'Costume Billing', path: '/costume-billing' },
    { icon: '📜', label: 'Bill History', path: '/bill-history' },
    { icon: '👤', label: 'Profile', path: '/profile' }
  ]

  const stockItems = [
    { icon: '🔐', label: 'Locker', path: '/locker' },
    { icon: '👔', label: 'Costume', path: '/costume' }
  ]

  return (
    <div className="fixed h-screen w-64 bg-[#DC004E] shadow-lg flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-pink-300/20">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-white text-xl font-bold">Lagoon Park</h1>
        </div>
      </div>

      {/* Menu Section */}
      <nav className="mt-0">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-white/90 hover:bg-pink-700 transition-colors ${
              location.pathname === item.path ? 'bg-pink-800 border-r-4 border-[#FFB800]' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        {/* Stock Dropdown */}
        <div>
          <button
            className="flex items-center px-6 py-3 w-full text-white/90 hover:bg-pink-700 transition-colors focus:outline-none"
            onClick={() => setIsStockOpen(!isStockOpen)}
          >
            <span className="mr-3">📦</span>
            <span>Stock</span>
            <span className="ml-auto">{isStockOpen ? '▲' : '▼'}</span>
          </button>
          {isStockOpen && (
            <div className="bg-pink-900/50">
              {stockItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-10 py-2 text-white/80 hover:bg-pink-800 transition-colors ${
                    location.pathname === item.path ? 'bg-pink-800 border-r-4 border-[#FFB800]' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout Section at Bottom */}
      <div className="mt-auto">
        <Link
          to="/logout"
          className="flex items-center px-6 py-3 text-white/90 hover:bg-pink-700 transition-colors"
        >
          <span className="mr-3">↪️</span>
          <span>Logout</span>
        </Link>
      </div>
    </div>
  )
}

export default Sidebar
