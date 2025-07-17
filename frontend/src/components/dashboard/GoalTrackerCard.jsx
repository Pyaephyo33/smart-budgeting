import React from 'react';

const GoalTrackerCard = ({ goals }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
    {goals.map((goal, i) => {
      const pct = Math.min(100, (goal.current / goal.target) * 100);
      return (
        <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{goal.title}</div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: `${pct}%` }}></div>
          </div>
          <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
            £{goal.current} / £{goal.target}
          </div>
        </div>
      );
    })}
  </div>
);

export default GoalTrackerCard;
