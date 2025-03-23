
export interface Employee {
  id?: string;
  rev?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  isDeleted: boolean;
  password: string;
  status: string; // active, inactive
}
