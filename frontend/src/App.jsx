import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



// Pages 
// client 
import Home from './pages/Home';
import Contact from './pages/Contact';
import Features from './pages/Features';
import FAQ from './pages/FAQ';
import Auth from './pages/auth/Auth';

// admin
import Dashboard from './pages/Dashboard';
import Profile from './pages/auth/Profile';
import Settings from './pages/auth/Settings';
import UserAccount from './pages/auth/UserAccount';

// envelope
import TableEnvelope from './pages/envelope/TableEnvelope';
import CreateEnvelope from './pages/envelope/CreateEnvelope';
import EditEnvelope from './pages/envelope/EditEnvelope';

// Category
import TableCategory from './pages/Category/TableCategory';
import CreateCategory from './pages/Category/CreateCategory';
import EditCategory from './pages/Category/EditCategory';

// Savings Goals
import TableGoal from './pages/SavingsGoal/TableGoal';
import CreateGoal from './pages/SavingsGoal/CreateGoal';
import EditGoal from './pages/SavingsGoal/EditGoal';

// Transaction
import CreateTransaction from './pages/transaction/CreateTransaction';
import EditTransaction from './pages/transaction/EditTransaction';
import TransactionList from './pages/transaction/TransactionList';
import TransactionDetail from './pages/transaction/TransactionDetails';
import ExpenseTracking from './pages/transaction/ExpenseTracking';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Navbar />
            <Home />
            <Footer />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <Contact />
          </>
        } />
        <Route path="/faq" element={
          <>
            <Navbar />
            <FAQ />
          </>
        } />
        <Route path="/features" element={
          <>
            <Navbar />
            <Features />
          </>
        } />


        <Route path="/auth" element={<Auth />} />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path='/settings' element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />

        <Route path="/user-account" element={
          <PrivateRoute>
            <UserAccount />
          </PrivateRoute>
        } />

        {/* Envelope routes (admin only) */}
        <Route path="/envelopes" element={
          <PrivateRoute>
            <TableEnvelope />
          </PrivateRoute>
        } />
        <Route path="/envelopes/create" element={
          <PrivateRoute>
            <CreateEnvelope />
          </PrivateRoute>
        } />
        <Route path="/envelopes/edit/:id" element={
          <PrivateRoute>
            <EditEnvelope />
          </PrivateRoute>
        } />

        {/* Savings Goal routes */}
        <Route path="/savings-goals" element={
          <PrivateRoute>
            <TableGoal />
          </PrivateRoute>
        } />
        <Route path="/savings-goals/create" element={
          <PrivateRoute>
            <CreateGoal />
          </PrivateRoute>
        } />
        <Route path="/savings-goals/edit/:id" element={
          <PrivateRoute>
            <EditGoal />
          </PrivateRoute>
        } />

        {/* Transaction routes */}
        <Route path="/transactions" element={
          <PrivateRoute>
            <TransactionList />
          </PrivateRoute>
        } />
        <Route path="/transactions/create" element={
          <PrivateRoute>
            <CreateTransaction />
          </PrivateRoute>
        } />
        <Route path="/transactions/edit/:id" element={
          <PrivateRoute>
            <EditTransaction />
          </PrivateRoute>
        } />
        <Route path="/transactions/:id" element={
          <PrivateRoute>
            <TransactionDetail />
          </PrivateRoute>
        } />
        <Route path="/expense-tracking" element={
          <PrivateRoute>
            <ExpenseTracking />
          </PrivateRoute>
        } />


        {/* Category routes */}

        <Route path="/categories" element={
          <PrivateRoute>
            <TableCategory />
          </PrivateRoute>
        } />

        <Route path="/categories/create" element={
          <PrivateRoute>
            <CreateCategory />
          </PrivateRoute>
        } />

        <Route path="/categories/edit/:id" element={
          <PrivateRoute>
            <EditCategory />
          </PrivateRoute>
        } />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;
