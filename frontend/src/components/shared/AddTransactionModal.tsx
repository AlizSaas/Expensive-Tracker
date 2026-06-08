import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { modalStyles } from '../../../data/dummyStyles';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants';
import type { TransactionPayload, TransactionType } from '../../types';

interface AddTransactionModalProps {
  type: TransactionType;
  onAdd: (data: TransactionPayload) => Promise<void>;
  onClose: () => void;
}

const AddTransactionModal = ({ type, onAdd, onClose }: AddTransactionModalProps) => {
  const [loading, setLoading] = useState(false);
  const categories = useMemo(() => (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES), [type]);
  const palette = type === 'income' ? modalStyles.colorClasses.teal : modalStyles.colorClasses.orange;
  const [form, setForm] = useState<TransactionPayload>({
    description: '',
    amount: 0,
    category: categories[0],
    date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onAdd({ ...form, amount: Number(form.amount) });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modalContainer}>
        <div className={modalStyles.modalHeader}>
          <h2 className={modalStyles.modalTitle}>Add {type === 'income' ? 'Income' : 'Expense'}</h2>
          <button className={modalStyles.closeButton} onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className={modalStyles.form} onSubmit={handleSubmit}>
          <div>
            <label className={modalStyles.label} htmlFor="description">
              Description
            </label>
            <input
              className={modalStyles.input(palette.ring)}
              id="description"
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              required
              value={form.description}
            />
          </div>

          <div>
            <label className={modalStyles.label} htmlFor="amount">
              Amount
            </label>
            <input
              className={modalStyles.input(palette.ring)}
              id="amount"
              min="0"
              onChange={(event) => setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))}
              required
              step="0.01"
              type="number"
              value={form.amount}
            />
          </div>

          <div>
            <label className={modalStyles.label} htmlFor="category">
              Category
            </label>
            <select
              className={modalStyles.input(palette.ring)}
              id="category"
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              value={form.category}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={modalStyles.label} htmlFor="date">
              Date
            </label>
            <input
              className={modalStyles.input(palette.ring)}
              id="date"
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              required
              type="date"
              value={form.date}
            />
          </div>

          <button className={modalStyles.submitButton(palette.button)} disabled={loading} type="submit">
            {loading ? 'Saving...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
