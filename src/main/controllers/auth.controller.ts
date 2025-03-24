    /// write auth controller to remote api 
import { apiEndPoint } from '../db'
import axios from 'axios'
import dotenv from 'dotenv'
import { jwtDecode, JwtPayload } from "jwt-decode";

dotenv.config()

// Custom JWT Payload interface
interface CustomJwtPayload extends JwtPayload {
  role: string;
  email: string;
  id: string;
}

// Define the response type structure
interface LoginResponse {
  employee: {
    id?: string;
    rev?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: string;
    isDeleted: boolean;
    password: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  error?: string;
  accessToken?: string;
  refreshToken?: string;
}

export const login = async (email: string, password: string, role: string) => {
    try {
        const response = await axios.post(`${apiEndPoint}/auth/login`, {
            email, 
            password, 
            role
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        
        // Format the response to match the expected LoginResponse structure
        const data = response.data;
        
        // Return properly formatted response
        return {
            employee: data.docs?.[0] || {},
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            error: data.error
        } as LoginResponse;
    } catch (error) {
        console.error('Error logging in:', error)
        return { 
            error: 'Authentication failed. Please try again.',
            employee: {
                name: '',
                email: '',
                phone: '',
                address: '',
                role: '',
                isDeleted: false,
                password: '',
                status: 'inactive'
            }
        } as LoginResponse
    }
}

export const decodeToken = (token: string): CustomJwtPayload | null => {
    try {
        return jwtDecode<CustomJwtPayload>(token);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}