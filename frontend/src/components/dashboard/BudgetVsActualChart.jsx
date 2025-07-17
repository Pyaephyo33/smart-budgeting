import React from 'react';

const BudgetVsActualChart = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Budget vs Actual</h2>
    {data.map((item, i) => {
      const pct = Math.min(100, (item.spent / item.budget) * 100);
      return (
        <div key={i} className="mb-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{item.envelope}</div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${item.spent > item.budget ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${pct}%` }}
            ></div>
          </div>
          <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            £{item.spent} / £{item.budget}
          </div>
        </div>
      );
    })}
  </div>
);

export default BudgetVsActualChart;
