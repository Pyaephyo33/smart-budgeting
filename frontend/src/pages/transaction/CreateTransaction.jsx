import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Container from '../../components/Container'
import { toast } from 'react-toastify'


const CreateTransaction = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        amount: '',
        type: 'expense',
        payment_method: 'cash',
        date: '',
        notes: '',
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm({...form, [name]: value});
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const res = await fetch('/api/transactions/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                ...form,
                amount: parseFloat(form.amount),
            }),
        });

        if (res.ok) {
            toast.success("Transaction created successfully");
            navigate('/transactions');
        } else {
            const err = await res.json();
            toast.error(err.message || "Failed to create transaction");
        }
    };
  return (
    <Container>
        <section className="py-6 px-4">
        <div className="max-w-2xl ml-0 md:ml-6 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Add New Transaction</h2>
            <button onClick={() => navigate(-1)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Back</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input type="number" name="amount" placeholder="Amount (£)" required value={form.amount} onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" />
            <div className="flex gap-4">
              <select name="type" value={form.type} onChange={handleChange}
                className="w-1/2 px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select name="payment_method" value={form.payment_method} onChange={handleChange}
                className="w-1/2 px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <input type="date" name="date" value={form.date} onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" />
            <textarea name="notes" placeholder="Notes" rows="3" value={form.notes} onChange={handleChange}
              className="w-full px-4 py-2 rounded border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" />
            <button type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">
              Submit Transaction
            </button>
          </form>
        </div>
      </section>
    </Container>
  )
}

export default CreateTransaction
