import bcrypt from 'bcrypt';
import { z } from 'zod';

const SALT_ROUNDS = 10;

export const signUpSchema = z.object({
  // Email OR username (admin/shop use username, customer/driver use email)
  email: z.string().email('Invalid email address').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  phone: z.string().min(10, 'Phone number is required').optional(), // Required for customer/driver
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['customer', 'driver', 'shop', 'admin'], { 
    errorMap: () => ({ message: 'Please select a role' }) 
  }),
}).refine((data) => {
  // Admin/shop must have username
  if ((data.role === 'admin' || data.role === 'shop') && !data.username) {
    return false;
  }
  // Customer/driver must have email and phone
  if ((data.role === 'customer' || data.role === 'driver') && (!data.email || !data.phone)) {
    return false;
  }
  return true;
}, {
  message: 'Invalid credentials for selected role',
  path: ['role']
});

export const signInSchema = z.object({
  // Can sign in with email, username, or phone
  identifier: z.string().min(1, 'Email, username, or phone is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['customer', 'driver', 'shop', 'admin'], { 
    errorMap: () => ({ message: 'Please select your role' }) 
  }),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
