import React from 'react';

const FutureForecastWidget = ({ forecast }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow text-center">
    <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Next 30-Day Forecast</h2>
    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">£{forecast || '—'}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Projected based on recent expenses</p>
  </div>
);

export default FutureForecastWidget;
