import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '../../components/Container';
import { toast } from 'react-toastify';

const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    payment_method: '',
    type: '',
    date: '',
    notes: '',
    envelope_id: '',
    category_id: '',
    goal_id: ''
  });

  const [envelopes, setEnvelopes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        const txnRes = await fetch(`/api/transactions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const txnData = await txnRes.json();

        setForm({
          payment_method: txnData.payment_method || 'cash',
          type: txnData.type,
          date: txnData.date,
          notes: txnData.notes || '',
          envelope_id: txnData.envelope_id || '',
          category_id: txnData.category_id || '',
          goal_id: txnData.goal_id || '',
        });

        const dropdown = await fetch('/api/transactions/dropdown-data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dd = await dropdown.json();
        setEnvelopes(dd.envelopes || []);
        setCategories(dd.categories || []);
        setGoals(dd.goals || []);
      } catch {
        toast.error('Failed to load transaction');
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success('Transaction updated');
      navigate('/transactions');
    } else {
      const err = await res.json();
      toast.error(err.message || 'Failed to update');
    }
  };

  return (
    <Container>
      <section className="py-6 px-4">
        <div className="max-w-2xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Transaction</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <select name="type" value={form.type} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select name="payment_method" value={form.payment_method} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank</option>
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <select name="envelope_id" value={form.envelope_id} onChange={handleChange} className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="">No Envelope</option>
                {envelopes.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <select name="category_id" value={form.category_id} onChange={handleChange} className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select name="goal_id" value={form.goal_id} onChange={handleChange} className="px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="">No Goal</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
            >
              Update Transaction
            </button>
          </form>
        </div>
      </section>
    </Container>
  );
};

export default EditTransaction;
