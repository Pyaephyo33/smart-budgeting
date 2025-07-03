import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import Container from '../../components/Container';
import { toast } from 'react-toastify';

const CreateCategory = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', type: 'expense' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/categories/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      toast.success("Category created successfully");
      navigate('/categories');
    } else {
      toast.error("Failed to create category");
    }
  };

  return (
    <Container>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 w-full max-w-xl">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Create Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-white">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-600 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-white">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => navigate('/categories')} className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition">Back</button>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition">Submit</button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default CreateCategory;
