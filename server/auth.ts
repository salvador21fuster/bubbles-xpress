import bcrypt from 'bcrypt';
import { z } from 'zod';

const SALT_ROUNDS = 10;

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['customer', 'driver'], { errorMap: () => ({ message: 'Please select Customer or Driver' }) }),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['customer', 'driver'], { errorMap: () => ({ message: 'Please select Customer or Driver' }) }),
});

export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
