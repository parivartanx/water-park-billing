import { createContext } from 'react'

// export interface User {
//   username: string
//   role: string
// }

export interface AuthContextType {
  isAuthenticated: boolean
  logout: () => void
  validateAuth: () => boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
