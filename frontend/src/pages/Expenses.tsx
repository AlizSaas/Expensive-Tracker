import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CalendarRange, Download, PlusCircle, ReceiptText, TrendingDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { expensePageStyles } from '../../data/dummyStyles';
import AddTransactionModal from '../components/shared/AddTransactionModal';
import FinancialCard from '../components/shared/FinancialCard';
import TransactionItem from '../components/shared/TransactionItem';
import { EXPENSE_CATEGORIES, TIME_RANGES } from '../constants';
import {
  addExpense,
  deleteExpense,
  downloadExpenseExcel,
  getExpense,
  getExpenseOverview,
  updateExpense,
} from '../services/api';
import type { ExpenseOverviewData, TimeRange, Transaction, TransactionPayload } from '../types';
import { buildChartData, downloadBlob, extractErrorMessage, normalizeTransactions } from '../utils';

const fallbackOverview: ExpenseOverviewData = {
  totalExpense: 0,
  averageExpense: 0,
  numberOfTransactions: 0,
  recentTransactions: [],
};

const Expenses = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [overview, setOverview] = useState<ExpenseOverviewData>(fallbackOverview);
  const [range, setRange] = useState<TimeRange>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTransactions = async () => {
    const response = await getExpense();
    setTransactions(normalizeTransactions(response.data, 'expense'));
  };

  const fetchOverview = async (selectedRange: TimeRange) => {
    const response = await getExpenseOverview(selectedRange);
    setOverview(response.data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([fetchTransactions(), fetchOverview(range)]);
      } catch (requestError) {
        setError(extractErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [range]);

  const chartData = useMemo(() => buildChartData(transactions), [transactions]);

  const handleAddExpense = async (data: TransactionPayload) => {
    await addExpense(data);
    await Promise.all([fetchTransactions(), fetchOverview(range)]);
  };

  const handleUpdateExpense = async (id: string, data: TransactionPayload) => {
    await updateExpense(id, data);
    await Promise.all([fetchTransactions(), fetchOverview(range)]);
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    await Promise.all([fetchTransactions(), fetchOverview(range)]);
  };

  const handleExport = async () => {
    const blob = await downloadExpenseExcel();
    downloadBlob(blob, 'expense-report.xlsx');
  };

  return (
    <div className={expensePageStyles.container}>
      <section className={expensePageStyles.headerCard}>
        <div className={expensePageStyles.headerContainer}>
          <div>
            <h1 className={expensePageStyles.headerTitle}>Expenses</h1>
            <p className={expensePageStyles.headerSubtitle}>Watch where your money goes and stay ahead of spending.</p>
          </div>
          <button className={expensePageStyles.addButton} onClick={() => setModalOpen(true)} type="button">
            <PlusCircle className="h-5 w-5" />
            Add Expense
          </button>
        </div>

        <div className={expensePageStyles.timeframePositioning}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select className={expensePageStyles.filterSelect} onChange={(event) => setRange(event.target.value as TimeRange)} value={range}>
              {TIME_RANGES.map((timeRange) => (
                <option key={timeRange} value={timeRange}>
                  {timeRange}
                </option>
              ))}
            </select>
            <button className={expensePageStyles.chartExportButton} onClick={handleExport} type="button">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <section className={expensePageStyles.cardsGrid}>
        <FinancialCard
          borderColor={expensePageStyles.borderOrange}
          icon={ReceiptText}
          iconClassName={`${expensePageStyles.iconOrange} ${expensePageStyles.textOrange}`}
          subtitle="Total expenses for selected range"
          title="Total Expenses"
          value={overview.totalExpense}
        />
        <FinancialCard
          borderColor={expensePageStyles.borderAmber}
          icon={TrendingDown}
          iconClassName={`${expensePageStyles.iconAmber} ${expensePageStyles.textAmber}`}
          subtitle="Average expense per transaction"
          title="Average Expense"
          value={overview.averageExpense}
        />
        <FinancialCard
          borderColor={expensePageStyles.borderYellow}
          formatAsCurrency={false}
          icon={CalendarRange}
          iconClassName={`${expensePageStyles.iconYellow} ${expensePageStyles.textYellow}`}
          subtitle="Number of expense transactions"
          title="# Transactions"
          value={overview.numberOfTransactions}
        />
      </section>

      <section className={expensePageStyles.chartContainer}>
        <div className={expensePageStyles.chartHeader}>
          <h2 className={expensePageStyles.chartTitle}>Expenses Over Time</h2>
        </div>
        <div className={expensePageStyles.chartHeight}>
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData}>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value) => [Number(value ?? 0).toFixed(2).replace(/^/, '$'), 'Expense']} />
              <Bar dataKey="amount" fill="#f97316" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={expensePageStyles.transactionsContainer}>
        <h2 className={expensePageStyles.transactionsTitle}>All Expense Transactions</h2>
        {loading ? (
          <p className="text-gray-500">Loading expense data...</p>
        ) : transactions.length ? (
          <div className={expensePageStyles.transactionsList}>
            {transactions.map((transaction) => (
              <TransactionItem
                categories={EXPENSE_CATEGORIES}
                key={transaction._id ?? transaction.id ?? `${transaction.description}-${transaction.date}`}
                onDelete={handleDeleteExpense}
                onUpdate={handleUpdateExpense}
                transaction={transaction}
                type="expense"
              />
            ))}
          </div>
        ) : (
          <div className={expensePageStyles.emptyState}>
            <div className={expensePageStyles.emptyStateIcon}>
              <ReceiptText className="h-6 w-6 text-orange-500" />
            </div>
            <p className={expensePageStyles.emptyStateText}>No expenses recorded.</p>
            <p className={expensePageStyles.emptyStateSubtext}>Add an expense to start tracking your spending.</p>
          </div>
        )}
      </section>

      {modalOpen && <AddTransactionModal onAdd={handleAddExpense} onClose={() => setModalOpen(false)} type="expense" />}
    </div>
  );
};

export default Expenses;
