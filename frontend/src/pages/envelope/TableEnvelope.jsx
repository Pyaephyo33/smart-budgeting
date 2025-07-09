import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Pencil, PlusCircle, Trash2, Search, CalendarPlus, XCircle
} from 'lucide-react';
import Container from '../../components/Container';
import BudgetPlanning from './BudgetPlanning';
import { toast } from 'react-toastify';

const TableEnvelope = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [envelopes, setEnvelopes] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  const token = localStorage.getItem('token');

  const fetchEnvelopes = async () => {
    try {
      const res = await fetch('/api/envelopes/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setEnvelopes(data);
    } catch {
      toast.error("Failed to load envelopes");
    }
  };

  useEffect(() => {
    const localPlans = JSON.parse(localStorage.getItem('budgetPlans')) || [];
    setPlans(localPlans);
    fetchEnvelopes();
  }, []);

  const handleAddPlan = (newPlan) => {
    if (plans.some(p => p.name === newPlan.name && p.cycle_type === newPlan.cycle_type)) return;
    const updated = [...plans, newPlan];
    setPlans(updated);
    localStorage.setItem('budgetPlans', JSON.stringify(updated));
    setShowModal(false);
  };

  const clearPlans = () => {
    setPlans([]);
    localStorage.removeItem('budgetPlans');
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this envelope?")) return;
    const res = await fetch(`/api/envelopes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast.success("Envelope deleted");
      setEnvelopes(envelopes.filter(e => e.id !== id));
    } else {
      toast.error("Failed to delete");
    }
  };

  const saveAllPlans = async () => {
    setIsSaving(true);
    let saved = [];

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      const res = await fetch('/api/envelopes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plan)
      });

      if (res.ok) {
        setSavedIds(prev => [...prev, i]);
        saved.push(plan);
        await new Promise(res => setTimeout(res, 300));
      }
    }

    if (saved.length > 0) {
      toast.success(`${saved.length} plan(s) saved`);
      await fetchEnvelopes(); // Live refresh
      clearPlans();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error("No plans saved");
    }

    setIsSaving(false);
  };

  const filteredEnvelopes = envelopes.filter(env =>
    env.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPlans = plans.filter(env =>
    env.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <section className="py-4">
        <div className="w-full xl:w-11/12 mb-6 px-4 mx-auto">
          <div className="relative flex flex-col min-w-0 break-words bg-white dark:bg-gray-800 w-full shadow-xl rounded-lg">
            <div className="rounded-t px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <h3 className="font-semibold text-base text-gray-800 dark:text-white">Envelope List</h3>
              <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute top-3 left-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search envelopes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition duration-300"
                  />
                </div>
                <Link to="/envelopes/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded hover:bg-blue-700 transition-all duration-150">
                  <PlusCircle className="w-4 h-4" /> Create
                </Link>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase rounded hover:bg-indigo-700 transition-all duration-150">
                  <CalendarPlus className="w-4 h-4" /> Plan Budget
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {filteredEnvelopes.length > 0 ? filteredEnvelopes.map((env) => (
                <div key={env.id} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{env.name}</h2>
                    <div className="flex gap-2">
                      <Link to={`/envelopes/edit/${env.id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(env.id)} className="text-red-500 hover:text-red-700" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-semibold text-gray-500 dark:text-gray-400">Budgeted:</span> <span className="text-green-600 dark:text-green-400 font-medium">£{env.budgeted_amount}</span></p>
                    <p><span className="font-semibold text-gray-500 dark:text-gray-400">Cycle:</span> <span className="text-yellow-600 dark:text-yellow-400 font-medium capitalize">{env.cycle_type}</span></p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 italic">No envelopes found.</div>
              )}
            </div>

            {plans.length > 0 && (
              <div className="bg-indigo-50 dark:bg-gray-900 px-6 py-6 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">🧮 Temporary Budget Planning</h4>
                  <div className="flex gap-3">
                    <button onClick={clearPlans} className="flex items-center gap-2 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-all">
                      <XCircle className="w-4 h-4" /> Clear All
                    </button>
                    <button onClick={saveAllPlans} disabled={isSaving} className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-all ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white`}>
                      {isSaving ? (
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                      ) : (
                        <PlusCircle className="w-4 h-4" />
                      )}
                      {isSaving ? "Saving..." : "Save All Plans"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlans.map((plan, index) => (
                    <div key={index} className={`bg-indigo-100 dark:bg-indigo-800 rounded-xl p-5 shadow-md transform transition duration-500 ${savedIds.includes(index) ? 'opacity-0 translate-y-3 blur-sm scale-[0.98]' : 'opacity-100'}`}>
                      <h5 className="text-md font-semibold text-indigo-900 dark:text-white mb-2">{plan.name}</h5>
                      <p className="text-sm">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Budgeted:</span>{' '}
                        <span className="text-green-700 dark:text-green-400 font-semibold">£{plan.budgeted_amount}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-600 dark:text-gray-300">Cycle:</span>{' '}
                        <span className="text-yellow-700 dark:text-yellow-400 capitalize">{plan.cycle_type}</span>
                      </p>
                      <p className="mt-3 text-xs italic text-gray-500 dark:text-gray-400">(Not yet saved to database)</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <BudgetPlanning onAdd={handleAddPlan} onClose={() => setShowModal(false)} />
      )}
    </Container>
  );
};

export default TableEnvelope;
