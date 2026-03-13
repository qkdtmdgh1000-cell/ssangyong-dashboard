import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiCard({ title, value, unit, change, changeLabel, icon: Icon }) {
  const isPositive = change > 0;
  const isNeutral = change == null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{title}</span>
        {Icon && (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Icon size={16} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
          {value}
        </span>
        {unit && <span className="text-sm text-gray-500 dark:text-gray-400">{unit}</span>}
      </div>
      {!isNeutral && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{isPositive ? '+' : ''}{change?.toFixed(1)}%</span>
          {changeLabel && <span className="text-gray-400 dark:text-gray-500 ml-1">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}
