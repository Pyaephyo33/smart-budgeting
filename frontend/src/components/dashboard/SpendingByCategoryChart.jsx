import React from 'react';
import { Pie } from 'react-chartjs-2';

const SpendingByCategoryChart = ({ data }) => {
  const pieData = {
    labels: data.map((c) => c.category),
    datasets: [{
      data: data.map((c) => c.amount),
      backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#e11d48']
    }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Spending by Category</h2>
      <Pie data={pieData} />
    </div>
  );
};

export default SpendingByCategoryChart;
