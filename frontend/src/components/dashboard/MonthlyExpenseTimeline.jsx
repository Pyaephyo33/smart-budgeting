import React from 'react';
import { Line } from 'react-chartjs-2';

const MonthlyExpenseTimeline = ({ thisMonth, lastMonth }) => {
  const lineData = {
    labels: thisMonth.map((d) => d.date),
    datasets: [
      {
        label: 'This Month',
        data: thisMonth.map((d) => d.amount),
        borderColor: '#6366f1',
        fill: false
      },
      {
        label: 'Last Month',
        data: lastMonth.map((d) => d.amount),
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        fill: false
      }
    ]
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Monthly Timeline</h2>
      <Line data={lineData} />
    </div>
  );
};

export default MonthlyExpenseTimeline;
