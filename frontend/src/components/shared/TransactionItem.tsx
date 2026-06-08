import { ArrowDownLeft, ArrowUpRight, Check, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { transactionItemStyles } from '../../../data/dummyStyles';
import type { Transaction, TransactionPayload, TransactionType } from '../../types';
import { formatCurrency, formatDate, getTransactionId } from '../../utils';

interface TransactionItemProps {
  transaction: Transaction;
  type: TransactionType;
  categories: string[];
  onUpdate: (id: string, data: TransactionPayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const styleMap = {
  income: {
    bg: 'bg-green-50',
    iconBg: 'bg-green-100 text-green-600 rounded-lg p-2',
    border: 'border-green-200',
    ring: 'ring-green-500',
    text: 'text-green-600',
    button: 'bg-green-500 text-white hover:bg-green-600',
  },
  expense: {
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100 text-orange-600 rounded-lg p-2',
    border: 'border-orange-200',
    ring: 'ring-orange-500',
    text: 'text-orange-600',
    button: 'bg-orange-500 text-white hover:bg-orange-600',
  },
} as const;

const TransactionItem = ({ transaction, type, categories, onUpdate, onDelete }: TransactionItemProps) => {
  const id = getTransactionId(transaction);
  const classes = styleMap[type];
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TransactionPayload>({
    description: transaction.description,
    amount: Number(transaction.amount),
    category: transaction.category,
    date: transaction.date?.split('T')[0] ?? '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(id, { ...form, amount: Number(form.amount) });
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(id);
    } finally {
      setLoading(false);
    }
  };

  const Icon = type === 'income' ? ArrowUpRight : ArrowDownLeft;

  return (
    <div className={transactionItemStyles.container(isEditing, classes)}>
      <div className={transactionItemStyles.mainContainer}>
        <div className={transactionItemStyles.iconContainer('shrink-0', classes)}>
          <Icon className="h-4 w-4" />
        </div>

        <div className={transactionItemStyles.contentContainer}>
          {isEditing ? (
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className={transactionItemStyles.input(false, classes)}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Description"
                value={form.description}
              />
              <select
                className={transactionItemStyles.input(false, classes)}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                value={form.category}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                className={transactionItemStyles.input(false, classes)}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                type="date"
                value={form.date}
              />
              <input
                className={transactionItemStyles.amountInput(false, classes)}
                min="0"
                onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))}
                step="0.01"
                type="number"
                value={form.amount}
              />
            </div>
          ) : (
            <>
              <p className={transactionItemStyles.description}>{transaction.description}</p>
              <p className={transactionItemStyles.details}>
                {transaction.category} • {formatDate(transaction.date)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className={transactionItemStyles.actionsContainer}>
        {!isEditing && (
          <div className={transactionItemStyles.amountContainer}>
            <span className={transactionItemStyles.amountText('text-lg font-bold', classes)}>
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        )}

        <div className={transactionItemStyles.buttonsContainer}>
          {isEditing ? (
            <>
              <button className={transactionItemStyles.saveButton(classes)} disabled={loading} onClick={handleSave} type="button">
                <Check className="h-4 w-4" />
              </button>
              <button className={transactionItemStyles.cancelButton} onClick={() => setIsEditing(false)} type="button">
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button className={transactionItemStyles.editButton(classes)} disabled={loading} onClick={() => setIsEditing(true)} type="button">
                <Pencil className="h-4 w-4" />
              </button>
              <button className={transactionItemStyles.deleteButton(classes)} disabled={loading} onClick={handleDelete} type="button">
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
