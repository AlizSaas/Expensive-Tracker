import { ArrowDownCircle, ArrowUpCircle, PiggyBank, PieChartIcon, Wallet } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { COLORS, dummyTransactions, financialOverviewData, gaugeData } from '../../data/dummy';
import { dashboardStyles, styles } from '../../data/dummyStyles';
import { TIME_RANGES } from '../constants';
import FinancialCard from '../components/shared/FinancialCard';
import { getDashboard } from '../services/api';
import type { DashboardData, TimeRange, Transaction } from '../types';
import { formatCurrency, formatDate, sortTransactionsByDate } from '../utils';

const fallbackTransactions = sortTransactionsByDate(
  dummyTransactions.slice(0, 5).map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
    type: (transaction.type === 'income' ? 'income' : 'expense') as 'income' | 'expense',
  })),
);

const Dashboard = () => {
  const [timeFrame, setTimeFrame] = useState<TimeRange>('monthly');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await getDashboard();
        setDashboardData(response.data);
      } catch {
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboardData();
  }, [timeFrame]);

  const recentTransactions = useMemo(() => {
    if (dashboardData?.recentTransactions?.length) {
      return sortTransactionsByDate(dashboardData.recentTransactions).slice(0, 5);
    }
    return fallbackTransactions;
  }, [dashboardData]);

  const expenseDistribution = dashboardData?.expenseDistribution?.length
    ? dashboardData.expenseDistribution
    : financialOverviewData;

  const metrics = dashboardData ?? {
    monthlyIncome: gaugeData[0].value,
    monthlyExpense: gaugeData[1].value,
    savings: gaugeData[2].value,
    savingsRate: 40,
    recentTransactions: [],
    expenseDistribution: financialOverviewData,
  };

  return (
    <div className={dashboardStyles.container}>
      <section className={dashboardStyles.headerContainer}>
        <div className={dashboardStyles.headerContent}>
          <div>
            <h1 className={dashboardStyles.headerTitle}>Financial Dashboard</h1>
            <p className={dashboardStyles.headerSubtitle}>
              Track income, expenses, and savings with a real-time overview.
            </p>
          </div>
          <span className={dashboardStyles.balanceBadge}>{loading ? 'Refreshing...' : 'Live data'}</span>
        </div>

        <div className={dashboardStyles.timeFrameContainer}>
          <div className={dashboardStyles.timeFrameWrapper}>
            {TIME_RANGES.map((range) => (
              <button
                className={dashboardStyles.timeFrameButton(timeFrame === range)}
                key={range}
                onClick={() => setTimeFrame(range)}
                type="button"
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={dashboardStyles.summaryGrid}>
        <FinancialCard
          borderColor="border-l-4 border-teal-500"
          icon={Wallet}
          iconClassName="bg-teal-100 text-teal-600"
          subtitle="Income received this month"
          title="Monthly Income"
          value={metrics.monthlyIncome}
        />
        <FinancialCard
          borderColor="border-l-4 border-orange-500"
          icon={ArrowDownCircle}
          iconClassName="bg-orange-100 text-orange-600"
          subtitle="Expenses recorded this month"
          title="Monthly Expense"
          value={metrics.monthlyExpense}
        />
        <FinancialCard
          borderColor="border-l-4 border-cyan-500"
          icon={PiggyBank}
          iconClassName="bg-cyan-100 text-cyan-600"
          subtitle={`Savings rate: ${Number(metrics.savingsRate ?? 0).toFixed(1)}%`}
          title="Savings"
          value={metrics.savings}
        />
      </section>

      <section className={styles.grid.main}>
        <div className={styles.grid.leftColumn}>
          <div className={dashboardStyles.pieChartContainer}>
            <div className={dashboardStyles.pieChartHeader}>
              <div>
                <h2 className={dashboardStyles.pieChartTitle}>
                  <PieChartIcon className="h-5 w-5 text-cyan-500" />
                  Expense Distribution
                </h2>
                <p className={dashboardStyles.pieChartSubtitle}>Category breakdown for your current spending.</p>
              </div>
            </div>

            <div className={dashboardStyles.pieChartHeight}>
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie data={expenseDistribution} dataKey="value" nameKey="name" outerRadius={110} paddingAngle={4}>
                    {expenseDistribution.map((entry, index) => (
                      <Cell fill={COLORS[index % COLORS.length]} key={entry.name} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className={styles.grid.rightColumn}>
          <div className={styles.cards.base}>
            <div className={styles.transactions.cardHeader}>
              <h2 className={styles.transactions.cardTitle}>
                <ArrowUpCircle className="h-5 w-5 text-teal-500" />
                Recent Transactions
              </h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">Last 5</span>
            </div>

            <div className={styles.transactions.listContainer}>
              {recentTransactions.map((transaction: Transaction) => {
                const type = transaction.type ?? 'expense';
                return (
                  <div className={styles.transactions.transactionItem} key={`${transaction.description}-${transaction.date}`}>
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${styles.colors.transaction.bg(type)}`}>
                        {type === 'income' ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                      </div>
                      <div className={styles.transactions.details}>
                        <p className={styles.transactions.description}>{transaction.description}</p>
                        <p className={styles.transactions.meta}>
                          {transaction.category} • {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <p className={styles.transactions.amount(type)}>{formatCurrency(transaction.amount)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
