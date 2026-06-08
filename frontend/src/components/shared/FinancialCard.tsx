import type { LucideIcon } from 'lucide-react';
import { formatCurrency } from '../../utils';

interface FinancialCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  borderColor: string;
  iconClassName: string;
  formatAsCurrency?: boolean;
}

const FinancialCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  borderColor,
  iconClassName,
  formatAsCurrency = true,
}: FinancialCardProps) => (
  <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${borderColor}`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-gray-800">
          {formatAsCurrency ? formatCurrency(value) : value}
        </h3>
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className={`rounded-xl p-3 ${iconClassName}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

export default FinancialCard;
