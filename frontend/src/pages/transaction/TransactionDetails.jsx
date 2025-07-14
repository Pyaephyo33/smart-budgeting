import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '../../components/Container';
import { toast } from 'react-toastify';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [txn, setTxn] = useState(null);

  useEffect(() => {
    const fetchTxn = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setTxn(await res.json());
      } else {
        toast.error('Failed to fetch details');
        navigate('/transactions');
      }
    };

    fetchTxn();
  }, [id, navigate]);

  if (!txn) return <p className="p-6">Loading...</p>;

  return (
    <Container>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Transaction Details</h2>
        <ul className="text-gray-700 dark:text-gray-300 space-y-2">
            <li><strong>ID:</strong> {txn.id}</li>
            <li><strong>Amount:</strong> £{txn.amount}</li>
            <li><strong>Type:</strong> {txn.type}</li>
            <li><strong>Method:</strong> {txn.payment_method}</li>
            <li><strong>Date:</strong> {txn.date}</li>
            <li><strong>Notes:</strong> {txn.notes}</li>
            <li><strong>Account:</strong> {txn.account || '—'}</li>
            <li><strong>Envelope:</strong> {txn.envelope || '—'}</li>
            <li><strong>Category:</strong> {txn.category || '—'}</li>
            <li><strong>Goal:</strong> {txn.goal || '—'}</li>
            <li><strong>Status:</strong> {txn.is_refunded ? 'Refunded' : 'Completed'}</li>
            </ul>
      </div>
    </Container>
  );
};

export default TransactionDetail;
