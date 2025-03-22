export interface User {
    id: string
    name: string
    email: string
    role: 'costume' | 'ticket' | 'locker'
    phone?: string
    date?: string
    createdAt?: string
    updatedAt?: string
  }