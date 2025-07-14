import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Container from '../../components/Container';
import { toast } from 'react-toastify';

const EditTransaction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setForm(data);
      } else {
        toast.error('Failed to fetch transaction');
        navigate('/transactions');
      }
    };

    fetchTransaction();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success('Transaction updated');
      navigate('/transactions');
    } else {
      toast.error('Update failed');
    }
  };

  if (!form) return <p className="p-6">Loading...</p>;

  return (
    <Container>
      <section className="py-6 px-4">
        <div className="max-w-2xl ml-0 md:ml-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit Transaction</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="text" name="notes" value={form.notes} onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" />
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input type="date" name="date" value={form.date} onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" />
            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              Update
            </button>
          </form>
        </div>
      </section>
    </Container>
  );
};

export default EditTransaction;
