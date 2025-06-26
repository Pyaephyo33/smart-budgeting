import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages & Components
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// import Dashboard from './Dashboard'; // if used
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Navbar /> <Home /> <Footer /></>} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Optional */}
      </Routes>
    </Router>
  );
};

export default App;
