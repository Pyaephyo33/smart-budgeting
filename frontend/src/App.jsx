import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import Auth from './pages/auth/Auth';
import Dashboard from './pages/Dashboard';

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
      </Routes>
    </Router>
  );
};

export default App;
