import { z } from 'zod';

// --- REGISTER ---
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// --- LOGIN ---
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// --- FORGOT PASSWORD ---
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// --- RESET PASSWORD ---
export const ResetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
