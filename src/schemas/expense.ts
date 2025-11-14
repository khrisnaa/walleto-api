import { z } from 'zod';

// --- CREATE EXPENSE ---
export const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  description: z.string().optional(),
  merchant: z.string().optional(),
  date: z.string().datetime().optional(),
});

// --- UPDATE EXPENSE ---
export const updateExpenseSchema = z.object({
  title: z.string().optional(),
  amount: z.number().positive().optional(),
  category: z.string().optional(),
  paymentMethod: z.string().optional(),
  description: z.string().optional(),
  merchant: z.string().optional(),
  date: z.string().datetime().optional(),
});
