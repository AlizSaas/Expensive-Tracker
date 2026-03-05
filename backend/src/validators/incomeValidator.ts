// src/validators/incomeValidator.ts
import { z } from 'zod';

export const incomeSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(), 
});
export type IncomeInput = z.infer<typeof incomeSchema>;

// ✅ reuse instead of redefining
export const expenseSchema = incomeSchema;
export type ExpenseInput = IncomeInput;