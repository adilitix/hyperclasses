import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Shop from './pages/Shop';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import './App.css';

function App() {
  const getBasename = () => {
    return window.location.pathname.startsWith('/adilitix') ? '/adilitix' : '';
  };

  console.log('App: Current path:', window.location.pathname, 'Basename:', getBasename());

  return (
    <Router basename={getBasename()}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/verify" element={<VerifyCertificate />} />
      </Routes>
    </Router>
  );
}

export default App;
