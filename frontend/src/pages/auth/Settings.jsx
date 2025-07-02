import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '../../components/Container';
import { UserPlus, User } from 'lucide-react';
import { toast } from 'react-toastify';

const Settings = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, name: data.name, email: data.email }));
      } else {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch('/api/users/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Settings updated');
    } else {
      toast.error(data.message || 'Update failed');
    }
  };

  return (
    <Container>
      <div className="flex justify-start px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 w-full max-w-xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" /> User Settings
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-white">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-2 rounded border bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="pt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg">Save Changes</button>
            </div>
          </form>

          <div className="pt-6 border-t text-center">
            <p className="text-sm text-white mb-3">Need another account?</p>
            <button onClick={() => navigate('/user-account')} className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow flex items-center gap-2 mx-auto">
              <UserPlus className="w-4 h-4" /> Create Account
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Settings;
