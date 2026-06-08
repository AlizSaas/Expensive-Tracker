import axios from 'axios';
import type { Transaction, TransactionType, User } from './types';

export const formatCurrency = (value: number | string | undefined | null) =>
  `$${Number(value ?? 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const getInitials = (value?: string) => {
  if (!value) return 'ET';
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

export const getTransactionId = (transaction: Transaction) =>
  transaction._id ?? transaction.id ?? `${transaction.description}-${transaction.date}`;

export const normalizeTransactions = (
  transactions: Transaction[] | undefined,
  type: TransactionType,
): Transaction[] => (transactions ?? []).map((transaction) => ({ ...transaction, type: transaction.type ?? type }));

export const buildChartData = (transactions: Transaction[]) => {
  const totals = transactions.reduce<Record<string, number>>((acc, transaction) => {
    const label = new Date(transaction.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    acc[label] = (acc[label] ?? 0) + Number(transaction.amount);
    return acc;
  }, {});

  return Object.entries(totals).map(([date, amount]) => ({ date, amount }));
};

export const extractErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const sortTransactionsByDate = (transactions: Transaction[]) =>
  [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const mergeStoredUser = (storedUser: string | null): User | null => {
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};
