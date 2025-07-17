import React, { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { toast } from 'react-toastify';

const SpendingTipsPanel = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/dashboard/tips', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch tips');
        const data = await res.json();
        setTips(data.tips || []);
      } catch (err) {
        toast.error('Error loading spending tips');
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-full">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <Lightbulb className="text-yellow-500" size={20} />
        Smart Spending Tips
      </h2>

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading tips...</p>
      ) : tips.length > 0 ? (
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          {tips.map((tip, i) => (
            <li key={i} className="leading-snug">{tip}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No personalized tips available.</p>
      )}
    </div>
  );
};

export default SpendingTipsPanel;
