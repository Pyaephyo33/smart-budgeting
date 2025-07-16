import React, { useEffect, useState } from 'react';
import { Search, Eye, PlusCircle, XCircle, Pencil, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Container from '../../components/Container';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 15;

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const fetchTxns = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/transactions/', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setTransactions(data.reverse()); // latest first
    } else {
      toast.error('Failed to fetch transactions');
    }
  };

  useEffect(() => {
    fetchTxns();
  }, []);

  const handleRefund = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/transactions/${id}/refund`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success('Transaction refunded');
      fetchTxns();
      setSelectedTx(null);
    } else {
      const err = await res.json();
      toast.error(err.message || 'Refund failed');
    }
  };

  const filtered = transactions.filter(
    (tx) =>
      tx.notes?.toLowerCase().includes(search.toLowerCase()) &&
      (filterType === 'all' || tx.type === filterType)
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <Container>
      <section className="py-6">
        <div className="flex justify-between items-center mb-6 px-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Transaction History</h2>
          <div className="flex gap-2">
            <Link to="/transactions/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm shadow">
              <PlusCircle size={18} /> New
            </Link>
            <Link to="/expense-tracking" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm shadow">
              📊 Expense Tracking
            </Link>
          </div>
        </div>

        <div className="px-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // Reset page on new search
              }}
              placeholder="Search by notes..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm transition shadow ${
                  filterType === type
                    ? type === 'income'
                      ? 'bg-green-600 text-white'
                      : type === 'expense'
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
          {paginated.map((tx) => (
            <div key={tx.id} className="bg-gray-100 dark:bg-gray-800 p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  £{tx.amount.toFixed(2)}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedTx(tx)} title="View">
                    <Eye className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                  </button>
                  <button onClick={() => navigate(`/transactions/edit/${tx.id}`)} title="Edit">
                    <Pencil className="w-5 h-5 text-green-600 hover:text-green-800" />
                  </button>
                </div>
              </div>
              <p className="text-sm capitalize text-gray-600 dark:text-gray-300">{tx.type}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tx.date}</p>
              <p className="text-xs mt-2 text-gray-500 italic dark:text-gray-400">{tx.notes}</p>
              {tx.is_refunded && (
                <span className="inline-block mt-3 px-3 py-1 text-xs bg-yellow-200 text-yellow-800 rounded-full">
                  Refunded
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-xl w-full relative">
              <button
                onClick={() => setSelectedTx(null)}
                className="absolute top-3 right-3 text-gray-500 dark:text-gray-300 hover:text-red-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Transaction Details</h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>ID:</strong> {selectedTx.id}</p>
                <p><strong>Amount:</strong> £{selectedTx.amount.toFixed(2)}</p>
                <p><strong>Type:</strong> {selectedTx.type}</p>
                <p><strong>Payment Method:</strong> {selectedTx.payment_method}</p>
                <p><strong>Date:</strong> {selectedTx.date}</p>
                <p><strong>Notes:</strong> {selectedTx.notes}</p>
                <p><strong>Account:</strong> {selectedTx.account || '—'}</p>
                <p><strong>Envelope:</strong> {selectedTx.envelope || '—'}</p>
                <p><strong>Category:</strong> {selectedTx.category || '—'}</p>
                <p><strong>Goal:</strong> {selectedTx.goal || '—'}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={selectedTx.is_refunded ? 'text-yellow-600' : 'text-green-600'}>
                    {selectedTx.is_refunded ? 'Refunded' : 'Completed'}
                  </span>
                </p>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                {!selectedTx.is_refunded && selectedTx.type === 'expense' && (
                  <button
                    onClick={() => handleRefund(selectedTx.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow"
                  >
                    <RotateCcw size={16} />
                    Refund
                  </button>
                )}
                <button
                  onClick={() => setSelectedTx(null)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </Container>
  );
};

export default TransactionList;
