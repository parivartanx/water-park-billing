// import React from 'react'
// import { useAuthStore } from '../stores/authStore'

// const ZustandExample: React.FC = () => {
//   // Access auth store state and actions
//   const { isAuthenticated, user, login, logout } = useAuthStore()

//   // Access theme store state
//   const { primaryColor, accentColor, resetToDefaults } = useThemeStore()

//   // Example login handler - in a real app, this would come from a form
//   const handleLogin = () => {
  
//   }

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
//         Zustand Store Example
//       </h2>

//       <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//         <h3 className="font-semibold mb-2">Auth Store Status:</h3>
//         <p className="mb-2">
//           Authentication Status:
//           <span
//             className={`ml-2 px-2 py-1 rounded text-white ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}
//           >
//             {isAuthenticated ? 'Logged In' : 'Logged Out'}
//           </span>
//         </p>

//         {user && (
//           <div className="mt-2">
//             <p>User: {user.name}</p>
//             <p>Email: {user.email}</p>
//             <p>Role: {user.role}</p>
//           </div>
//         )}
//       </div>

//       <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//         <h3 className="font-semibold mb-2">Theme Store:</h3>
//         <div className="flex gap-2 mb-2">
//           <div
//             className="w-10 h-10 rounded-full"
//             style={{ backgroundColor: primaryColor }}
//             title="Primary Color"
//           ></div>
//           <div
//             className="w-10 h-10 rounded-full"
//             style={{ backgroundColor: accentColor }}
//             title="Accent Color"
//           ></div>
//         </div>
//       </div>

//       <div className="flex gap-4">
//         {!isAuthenticated ? (
//           <button
//             onClick={handleLogin}
//             className="px-4 py-2 bg-gradient-to-r from-[#DC004E] to-[#A30342] text-white rounded-lg hover:opacity-90 transition-opacity"
//           >
//             Login
//           </button>
//         ) : (
//           <button
//             onClick={logout}
//             className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
//           >
//             Logout
//           </button>
//         )}

//         <button
//           onClick={resetToDefaults}
//           className="px-4 py-2 border border-[#FFB800] text-[#A30342] rounded-lg hover:bg-yellow-50"
//         >
//           Reset Theme
//         </button>
//       </div>
//     </div>
//   )
// }

// export default ZustandExample
