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
        // console.log(`Attempting login with email: ${email}, role: ${role}`)
        const response = await axios.post(`${apiEndPoint}/auth/login`, {
            email, 
            password, 
            role
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
        
        // Log the complete response for debugging
        // console.log('API Response:', JSON.stringify(response.data, null, 2))
        
        // Format the response to match the expected LoginResponse structure
        const data = response.data;
        
        // Check if the response has the expected structure
        if (!data) {
            console.error('Invalid response format: No data received')
            return { 
                error: 'Authentication failed: Invalid response format',
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
        
        // Handle different possible response structures
        const employeeData = data.employee || data.docs?.[0] || {};
        
        // Return properly formatted response
        return {
            employee: employeeData,
            accessToken: data.accessToken || data.access_token,
            refreshToken: data.refreshToken || data.refresh_token,
            error: data.error
        } as LoginResponse;
    } catch (error) {
        console.error('Error logging in:', error)
        if (axios.isAxiosError(error)) {
            console.error('API Error Response:', error.response?.data)
            return { 
                error: `Authentication failed: ${error.response?.data?.message || error.message}`,
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