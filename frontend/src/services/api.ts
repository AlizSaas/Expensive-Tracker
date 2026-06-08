import axios from 'axios';
import type {
  AuthResponse,
  BasicResponse,
  DashboardResponse,
  ExpenseOverviewData,
  IncomeOverviewData,
  OverviewResponse,
  TimeRange,
  TransactionPayload,
  TransactionsResponse,
  UserResponse,
} from '../types';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export const registerUser = async (name: string, email: string, password: string) => {
  const { data } = await api.post<AuthResponse>('/api/users/register', { name, email, password });
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data } = await api.post<AuthResponse>('/api/users/login', { email, password });
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get<UserResponse>('/api/users/me');
  return data;
};

export const updateUserProfile = async (name: string, email: string) => {
  const { data } = await api.put<UserResponse>('/api/users/profile', { name, email });
  return data;
};

export const updateUserPassword = async (oldPassword: string, newPassword: string) => {
  const { data } = await api.put<BasicResponse>('/api/users/password', { oldPassword, newPassword });
  return data;
};

export const addIncome = async (payload: TransactionPayload) => {
  const { data } = await api.post<BasicResponse>('/api/income/add', payload);
  return data;
};

export const getIncome = async () => {
  const { data } = await api.get<TransactionsResponse>('/api/income/get');
  return data;
};

export const updateIncome = async (id: string, payload: TransactionPayload) => {
  const { data } = await api.put<BasicResponse>(`/api/income/update/${id}`, payload);
  return data;
};

export const deleteIncome = async (id: string) => {
  const { data } = await api.delete<BasicResponse>(`/api/income/delete/${id}`);
  return data;
};

export const getIncomeOverview = async (range: TimeRange) => {
  const { data } = await api.get<OverviewResponse<IncomeOverviewData>>('/api/income/overview', {
    params: { range },
  });
  return data;
};

export const downloadIncomeExcel = async () => {
  const { data } = await api.get<Blob>('/api/income/downloadexcel', {
    responseType: 'blob',
  });
  return data;
};

export const addExpense = async (payload: TransactionPayload) => {
  const { data } = await api.post<BasicResponse>('/api/expense/add', payload);
  return data;
};

export const getExpense = async () => {
  const { data } = await api.get<TransactionsResponse>('/api/expense/get');
  return data;
};

export const updateExpense = async (id: string, payload: TransactionPayload) => {
  const { data } = await api.put<BasicResponse>(`/api/expense/update/${id}`, payload);
  return data;
};

export const deleteExpense = async (id: string) => {
  const { data } = await api.delete<BasicResponse>(`/api/expense/delete/${id}`);
  return data;
};

export const getExpenseOverview = async (range: TimeRange) => {
  const { data } = await api.get<OverviewResponse<ExpenseOverviewData>>('/api/expense/overview', {
    params: { range },
  });
  return data;
};

export const downloadExpenseExcel = async () => {
  const { data } = await api.get<Blob>('/api/expense/downloadexcel', {
    responseType: 'blob',
  });
  return data;
};

export const getDashboard = async () => {
  const { data } = await api.get<DashboardResponse>('/api/dashboard');
  return data;
};
