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

// envelope
import TableEnvelope from './pages/envelope/TableEnvelope';
import CreateEnvelope from './pages/envelope/CreateEnvelope';
import EditEnvelope from './pages/envelope/EditEnvelope';

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
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
};

export default App;
