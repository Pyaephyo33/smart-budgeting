import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import Container from '../../components/Container';
import { toast } from 'react-toastify';

const EditEnvelope = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', budgeted_amount: '', cycle_type: 'monthly' });

  useEffect(() => {
    const fetchEnvelope = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/envelopes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const found = data.find(e => e.id === parseInt(id));
      if (found) setForm(found);
    };
    fetchEnvelope();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/envelopes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: form.name,
        budgeted_amount: parseFloat(form.budgeted_amount),
        cycle_type: form.cycle_type
      })
    });

    if (res.ok) {
      toast.success("Envelope updated successfully");
      navigate('/envelopes');
    } else {
      toast.error("Update failed");
    }

  };

  return (
    <Container>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 w-full max-w-xl ml-0 md:ml-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Pencil className="w-5 h-5" /> Edit Envelope
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Budgeted Amount</label>
            <input name="budgeted_amount" type="number" value={form.budgeted_amount} onChange={handleChange} required className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Cycle Type</label>
            <select name="cycle_type" value={form.cycle_type} onChange={handleChange} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => navigate('/envelopes')} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-5 py-2 rounded-lg transition duration-200">Back</button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition duration-200">Save Changes</button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default EditEnvelope;
