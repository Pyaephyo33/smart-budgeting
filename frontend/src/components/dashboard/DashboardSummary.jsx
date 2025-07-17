import React from 'react';
import { PiggyBank, CalendarDays, BarChart3 } from 'lucide-react';

const DashboardSummary = ({ summary, forecast }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-blue-100 dark:bg-blue-900 text-gray-800 dark:text-white rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-3">
          <PiggyBank className="w-6 h-6" />
          <div>
            <div className="text-sm">Total Balance</div>
            <div className="text-xl font-bold">£{summary.total_balance}</div>
          </div>
        </div>
      </div>
      <div className="bg-orange-100 dark:bg-orange-900 text-gray-800 dark:text-white rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6" />
          <div>
            <div className="text-sm">Monthly Spending</div>
            <div className="text-xl font-bold">£{summary.monthly_spending}</div>
          </div>
        </div>
      </div>
      <div className="bg-green-100 dark:bg-green-900 text-gray-800 dark:text-white rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6" />
          <div>
            <div className="text-sm">Forecasted (7d)</div>
            <div className="text-xl font-bold">£{forecast || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSummary;
