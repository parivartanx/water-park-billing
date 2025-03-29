import { employeeDB } from "../db";
import { decodeToken } from "./auth.controller";

// Define Employee interface
export interface Employee {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  joiningDate: string;
  role: string;
  status: string;
}

/**
 * Get employee details by id from access token
 * @param access_token JWT access token
 * @returns Employee data or error
 */
export const getEmployeeById = async (access_token: string) => {
  try {
    // Decode token to get employee id
    const decoded = decodeToken(access_token);
    if (!decoded) {
      return { error: 'Invalid access token' };
    }

    // Find employee by id
    const employee = await employeeDB.find({
      selector: {
        _id: decoded.id
      }
    });

    if (!employee.docs.length) {
      return { error: 'Employee not found' };
    }

    const employeeData = employee.docs[0] as unknown as Employee;
    
    // Remove sensitive information before sending to client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { password, ...safeEmployeeData } = employeeData;
    
    return { 
      success: true, 
      data: {
       ...employeeData
      }
    };
  } catch (error) {
    console.error('Error getting employee by id:', error);
    return { error: 'Failed to get employee details' };
  }
}