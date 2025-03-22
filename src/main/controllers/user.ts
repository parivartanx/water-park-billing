import { localDB } from '../db'
import { User } from '../types/user'

export const createUser = async (user: User): Promise<void> => {
  try {
    await localDB.put(user)
  } catch (error) {
    console.error('Error creating user:', error)
  }
}
