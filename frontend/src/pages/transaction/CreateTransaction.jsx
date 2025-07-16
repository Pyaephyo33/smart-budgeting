import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../../components/Container';
import { toast } from 'react-toastify';
import clsx from 'clsx';

const CreateTransaction = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState('with-account');
  const [form, setForm] = useState({
    account_id: '',
    amount: '',
    type: 'expense',
    payment_method: 'cash',
    date: '',
    notes: '',
    envelope_id: '',
    category_id: '',
    goal_id: ''
  });

  const [errors, setErrors] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [envelopes, setEnvelopes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchDropdownData = async () => {
      try {
        const res = await fetch('/api/transactions/dropdown-data', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Failed to fetch dropdown data');
        const data = await res.json();

        setAccounts(data.accounts || []);
        setEnvelopes(data.envelopes || []);
        setCategories(data.categories || []);
        setGoals(data.goals || []);
      } catch (err) {
        toast.error("Failed to load dropdown options");
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (mode === 'with-account' && !form.account_id) err.account_id = 'Account is required';
    if (!form.amount) err.amount = 'Amount is required';
    if (!form.type) err.type = 'Type is required';
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      ...form,
      account_id: mode === 'with-account' ? form.account_id : null,
      amount: parseFloat(form.amount),
      envelope_id: form.envelope_id || null,
      category_id: form.category_id || null,
      goal_id: form.goal_id || null,
    };

    const res = await fetch('/api/transactions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success('Transaction created successfully');
      navigate('/transactions');
    } else {
      const err = await res.json();
      toast.error(err.message || 'Failed to create transaction');
    }
  };

  return (
    <Container>
      <section className="py-6 px-4">
      <div className="max-w-2xl ml-0 bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg transition">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Create Transaction</h2>
            <button onClick={() => navigate(-1)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back</button>
          </div>

          {/* Toggle */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={() => setMode('with-account')}
              className={clsx(
                'px-4 py-2 text-sm rounded-full shadow transition-all duration-300',
                mode === 'with-account'
                  ? 'bg-green-600 text-white scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              )}
            >
              Use Account
            </button>
            <button
              onClick={() => setMode('without-account')}
              className={clsx(
                'px-4 py-2 text-sm rounded-full shadow transition-all duration-300',
                mode === 'without-account'
                  ? 'bg-purple-600 text-white scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              )}
            >
              Without Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 transition-all duration-500 ease-in-out">
            {mode === 'with-account' && (
              <select
                name="account_id"
                value={form.account_id}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_type} (Balance: £{acc.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            )}
            {errors.account_id && <p className="text-red-500 text-sm">{errors.account_id}</p>}

            <input
              type="number"
              name="amount"
              placeholder="Amount (£)"
              required
              value={form.amount}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}

            <div className="flex flex-col sm:flex-row gap-4">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full sm:w-1/2 px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                name="payment_method"
                value={form.payment_method}
                onChange={handleChange}
                className="w-full sm:w-1/2 px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
              </select>
            </div>

            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select
                name="envelope_id"
                value={form.envelope_id}
                onChange={handleChange}
                className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="">No Envelope</option>
                {envelopes.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>

              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                name="goal_id"
                value={form.goal_id}
                onChange={handleChange}
                className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                <option value="">No Goal</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>

            <textarea
              name="notes"
              placeholder="Notes (optional)"
              rows="3"
              value={form.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Submit Transaction
            </button>
          </form>
        </div>
      </section>
    </Container>
  );
};

export default CreateTransaction;
