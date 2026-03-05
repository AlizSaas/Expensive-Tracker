// src/validators/incomeValidator.ts
import { z } from 'zod';

export const incomeSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(), // coerce converts string dates from req.body to Date
});

export type IncomeInput = z.infer<typeof incomeSchema>; // replaces your IIncome interface