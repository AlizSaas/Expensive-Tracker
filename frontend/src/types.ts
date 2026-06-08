export type TransactionType = 'income' | 'expense';
export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

export interface TransactionPayload {
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Transaction extends TransactionPayload {
  _id?: string;
  id?: string;
  type?: TransactionType;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface UserResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface BasicResponse {
  success: boolean;
  message?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  message?: string;
}

export interface IncomeOverviewData {
  totalIncome: number;
  averageIncome: number;
  numberOfTransactions: number;
  recentTransactions: Transaction[];
}

export interface ExpenseOverviewData {
  totalExpense: number;
  averageExpense: number;
  numberOfTransactions: number;
  recentTransactions: Transaction[];
}

export interface OverviewResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardData {
  monthlyIncome: number;
  monthlyExpense: number;
  savings: number;
  savingsRate: number;
  recentTransactions: Transaction[];
  expenseDistribution: Array<{ name: string; value: number }>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
}
