import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import Container from '../../components/Container';
import { toast } from 'react-toastify';

const CreateGoal = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    target_amount: '',
    target_date: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/goals/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...form,
        target_amount: parseFloat(form.target_amount)
      })
    });

    if (res.ok) {
      toast.success("Goal created successfully");
      navigate('/savings-goals');
    } else {
      toast.error("Failed to create goal");
    }
  };

  return (
    <Container>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Create Goal
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Title</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-white mb-1">Target Amount</label>
            <input name="target_amount" type="number" value={form.target_amount} onChange={handleChange} required className="w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div>
            <label className="block text-white mb-1">Target Date</label>
            <input name="target_date" type="date" value={form.target_date} onChange={handleChange} required className="w-full px-4 py-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">Create</button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default CreateGoal;
