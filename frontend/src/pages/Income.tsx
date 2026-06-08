import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpCircle, CalendarRange, Download, PlusCircle, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { incomeStyles } from '../../data/dummyStyles';
import AddTransactionModal from '../components/shared/AddTransactionModal';
import FinancialCard from '../components/shared/FinancialCard';
import TransactionItem from '../components/shared/TransactionItem';
import { INCOME_CATEGORIES, TIME_RANGES } from '../constants';
import {
  addIncome,
  deleteIncome,
  downloadIncomeExcel,
  getIncome,
  getIncomeOverview,
  updateIncome,
} from '../services/api';
import type { IncomeOverviewData, TimeRange, Transaction, TransactionPayload } from '../types';
import { buildChartData, downloadBlob, extractErrorMessage, normalizeTransactions } from '../utils';

const fallbackOverview: IncomeOverviewData = {
  totalIncome: 0,
  averageIncome: 0,
  numberOfTransactions: 0,
  recentTransactions: [],
};

const Income = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [overview, setOverview] = useState<IncomeOverviewData>(fallbackOverview);
  const [range, setRange] = useState<TimeRange>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTransactions = async () => {
    const response = await getIncome();
    setTransactions(normalizeTransactions(response.data, 'income'));
  };

  const fetchOverview = async (selectedRange: TimeRange) => {
    const response = await getIncomeOverview(selectedRange);
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

  const handleAddIncome = async (data: TransactionPayload) => {
    await addIncome(data);
    await Promise.all([fetchTransactions(), fetchOverview(range)]);
  };

  const handleUpdateIncome = async (id: string, data: TransactionPayload) => {
    await updateIncome(id, data);
    await Promise.all([fetchTransactions(), fetchOverview(range)]);
  };

  const handleDeleteIncome = async (id: string) => {
    await deleteIncome(id);
    await Promise.all([fetchTransactions(), fetchOverview(range)]);
  };

  const handleExport = async () => {
    const blob = await downloadIncomeExcel();
    downloadBlob(blob, 'income-report.xlsx');
  };

  return (
    <div className={incomeStyles.wrapper}>
      <section className={incomeStyles.headerContainer}>
        <div className={incomeStyles.header}>
          <div>
            <h1 className={incomeStyles.headerTitle}>Income</h1>
            <p className={incomeStyles.headerSubtitle}>Manage earnings, monitor trends, and export reports.</p>
          </div>
          <button className={incomeStyles.addButton} onClick={() => setModalOpen(true)} type="button">
            <PlusCircle className="h-5 w-5" />
            Add Income
          </button>
        </div>

        <div className={incomeStyles.timeFrameContainer}>
          <div className={incomeStyles.filterContainer}>
            <select className={incomeStyles.filterSelect} onChange={(event) => setRange(event.target.value as TimeRange)} value={range}>
              {TIME_RANGES.map((timeRange) => (
                <option key={timeRange} value={timeRange}>
                  {timeRange}
                </option>
              ))}
            </select>
            <button className={incomeStyles.exportButton} onClick={handleExport} type="button">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <section className={incomeStyles.summaryGrid}>
        <FinancialCard
          borderColor={incomeStyles.borderGreen}
          icon={Wallet}
          iconClassName={`${incomeStyles.iconGreen} ${incomeStyles.textGreen}`}
          subtitle="Total income for selected range"
          title="Total Income"
          value={overview.totalIncome}
        />
        <FinancialCard
          borderColor={incomeStyles.borderBlue}
          icon={ArrowUpCircle}
          iconClassName={`${incomeStyles.iconBlue} ${incomeStyles.textBlue}`}
          subtitle="Average income per transaction"
          title="Average Income"
          value={overview.averageIncome}
        />
        <FinancialCard
          borderColor={incomeStyles.borderPurple}
          formatAsCurrency={false}
          icon={CalendarRange}
          iconClassName={`${incomeStyles.iconPurple} ${incomeStyles.textPurple}`}
          subtitle="Number of income transactions"
          title="# Transactions"
          value={overview.numberOfTransactions}
        />
      </section>

      <section className={incomeStyles.chartContainer}>
        <div className={incomeStyles.chartHeaderContainer}>
          <h2 className={incomeStyles.chartTitle}>Income Over Time</h2>
        </div>
        <div className={incomeStyles.chartHeight}>
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value) => [Number(value ?? 0).toFixed(2).replace(/^/, '$'), 'Income']} />
              <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={incomeStyles.listContainer}>
        <h2 className={incomeStyles.sectionTitle}>All Income Transactions</h2>
        {loading ? (
          <p className="text-gray-500">Loading income data...</p>
        ) : transactions.length ? (
          <div className={incomeStyles.transactionList}>
            {transactions.map((transaction) => (
              <TransactionItem
                categories={INCOME_CATEGORIES}
                key={transaction._id ?? transaction.id ?? `${transaction.description}-${transaction.date}`}
                onDelete={handleDeleteIncome}
                onUpdate={handleUpdateIncome}
                transaction={transaction}
                type="income"
              />
            ))}
          </div>
        ) : (
          <div className={incomeStyles.emptyStateContainer}>
            <div className={incomeStyles.emptyStateIcon}>
              <Wallet className="h-6 w-6 text-green-600" />
            </div>
            <p className={incomeStyles.emptyStateText}>No income yet.</p>
            <p className={incomeStyles.emptyStateSubtext}>Add your first income source to populate this view.</p>
          </div>
        )}
      </section>

      {modalOpen && <AddTransactionModal onAdd={handleAddIncome} onClose={() => setModalOpen(false)} type="income" />}
    </div>
  );
};

export default Income;
