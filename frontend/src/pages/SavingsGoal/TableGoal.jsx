import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, PlusCircle, Trash, BadgeDollarSign, RefreshCcw } from "lucide-react";
import Container from "../../components/Container";
import { toast } from "react-toastify";

const TableGoal = () => {
  const [goals, setGoals] = useState([]);
  const [overdueGoals, setOverdueGoals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchGoals = async () => {
    const res = await fetch("/api/goals/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setGoals(data);
  };

  const fetchOverdue = async () => {
    const res = await fetch("/api/goals/overdue", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) setOverdueGoals(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const res = await fetch(`/api/goals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      toast.success("Goal deleted");
      fetchGoals();
      fetchOverdue();
    } else {
      toast.error("Delete failed");
    }
  };

  const handleReset = async (id) => {
    const res = await fetch(`/api/goals/${id}/reset`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      toast.success("Goal reset");
      fetchGoals();
      fetchOverdue();
    } else {
      toast.error("Reset failed");
    }
  };

  const handleDeposit = async (id) => {
    const amount = prompt("Enter amount to deposit:");
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return toast.error("Invalid amount");
    const res = await fetch(`/api/goals/${id}/deposit`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: parsed }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchGoals();
      fetchOverdue();
    } else {
      toast.error(data.message || "Deposit failed");
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchOverdue();
    setLoading(false);
  }, []);

  const filtered = goals.filter((goal) =>
    goal.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Savings Goals</h1>
        <Link to="/savings-goals/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition duration-200">
          <PlusCircle size={20} /> Create Goal
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search goals..."
          className="w-full max-w-md px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((goal) => (
          <div key={goal.id} className={`bg-gray-100 dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-1 transform`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{goal.title}</h2>
              <div className="flex gap-2">
                <Link to={`/savings-goals/edit/${goal.id}`} className="text-gray-500 hover:text-blue-600"><Pencil size={18} /></Link>
                <button onClick={() => handleDeposit(goal.id)} className="text-emerald-600 hover:text-emerald-800"><BadgeDollarSign size={18} /></button>
                <button onClick={() => handleReset(goal.id)} className="text-indigo-600 hover:text-indigo-800"><RefreshCcw size={18} /></button>
                <button onClick={() => handleDelete(goal.id)} className="text-red-500 hover:text-red-700"><Trash size={18} /></button>
              </div>
            </div>
            <div className="space-y-1 text-sm">
             <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Target:</span> 
                <span className="text-green-700 dark:text-green-400"> ${goal.target_amount}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Saved:</span> 
                <span className="text-blue-700 dark:text-blue-400"> ${goal.current_saved}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Date:</span> 
                <span className="text-yellow-700 dark:text-yellow-400">{goal.target_date}</span>
            </p>

              {goal.achieved && <span className="inline-block bg-green-500 text-white px-2 py-0.5 rounded text-xs">Achieved</span>}
            </div>
            <div className="mt-4 h-2 w-full bg-gray-300 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${(goal.current_saved / goal.target_amount) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {overdueGoals.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">⚠️ Overdue Goals</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {overdueGoals.map((goal) => (
              <div key={goal.id} className="bg-red-100 dark:bg-red-900 rounded-xl p-5 shadow-md transition">
                <h5 className="text-md font-semibold text-red-800 dark:text-white mb-2">{goal.title}</h5>
                <p className="text-sm text-red-700 dark:text-red-300">Target: ${goal.target_amount}</p>
                <p className="text-sm text-red-700 dark:text-red-300">Saved: ${goal.current_saved}</p>
                <p className="text-sm text-red-700 dark:text-red-300">Date: {goal.target_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default TableGoal;
