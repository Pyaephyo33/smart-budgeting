import React from 'react';
import { Bar } from 'react-chartjs-2';

const TopCategoriesBar = ({ data }) => {
  const barData = {
    labels: data.map((c) => c.category),
    datasets: [{
      label: 'Top Categories',
      data: data.map((c) => c.amount),
      backgroundColor: '#10b981'
    }]
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Top Spending Categories</h2>
      <Bar data={barData} />
    </div>
  );
};

export default TopCategoriesBar;
