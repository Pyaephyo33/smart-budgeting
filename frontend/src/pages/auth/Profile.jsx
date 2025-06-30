import React, { useEffect, useState } from 'react';
import Container from '../../components/Container';
import { useNavigate } from 'react-router-dom';

const colorOptions = [
  'from-pink-100 to-pink-200 dark:from-pink-700 dark:to-pink-600',
  'from-yellow-100 to-yellow-200 dark:from-yellow-700 dark:to-yellow-600',
  'from-green-100 to-green-200 dark:from-green-700 dark:to-green-600',
  'from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700',
  'from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-600',
  'from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-700'
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, accountRes] = await Promise.all([
          fetch('/api/users/profile', { headers }),
          fetch('/api/accounts/', { headers })
        ]);

        if (profileRes.status === 401 || profileRes.status === 403 || accountRes.status === 401 || accountRes.status === 403) {
          throw new Error('Unauthorized');
        }

        if (!profileRes.ok || !accountRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const profileData = await profileRes.json();
        const accountsData = await accountRes.json();

        setUser(profileData);
        setAccounts(accountsData);
      } catch (err) {
        console.error("Auth or data fetch error:", err.message);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Logout request failed');
    }
    localStorage.removeItem('token');
    navigate('/auth');
  };

  const total = accounts.reduce((acc, a) => acc + a.balance, 0);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto animate-spin"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your profile...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-10">
        {user && (
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              👋 Hello, {user.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 inline-block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
            >
              Logout
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {accounts.map((acc, idx) => (
            <div
              key={acc.id}
              className={`bg-gradient-to-br ${
                colorOptions[idx % colorOptions.length]
              } p-4 rounded-lg shadow-md hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-1`}
            >
              <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-1">
                {acc.account_type}
              </h3>
              <p className="text-xl font-bold text-gray-800 dark:text-white">
                £{acc.balance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Opened: {
                  (() => {
                    const date = acc.created_at?.split(' ')[0]; // "2025-06-10"
                    if (!date) return '';
                    const [year, month] = date.split('-');
                    const monthNames = [
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ];
                    return `${monthNames[parseInt(month) - 1]} ${year}`;
                  })()
                }
              </p>


            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md text-center">
          <h4 className="text-lg font-semibold text-gray-700 dark:text-white mb-2">Total Balance</h4>
          <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">
            £{total.toFixed(2)}
          </p>
        </div>
      </div>
    </Container>
  );
};

export default Profile;
