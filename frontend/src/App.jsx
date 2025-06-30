import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages 
// client 
import Home from './pages/Home';
import Auth from './pages/auth/Auth';

// admin
import Dashboard from './pages/Dashboard';
import Profile from './pages/auth/Profile'

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute'; // make sure to put this file in components

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Navbar /> <Home /> <Footer /></>} />
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
      </Routes>
    </Router>
  );
};

export default App;
