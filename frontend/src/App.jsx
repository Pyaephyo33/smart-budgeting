import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



// Pages 
// client 
import Home from './pages/Home';
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
