import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Programs from './pages/Programs';
import About from './pages/About';
import Inquiry from './pages/Inquiry';
import Register from './pages/Register';
import Shop from './pages/Shop';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import VerifyCertificate from './pages/VerifyCertificate';
import OfficeStatus from './pages/OfficeStatus';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import './App.css';

function App() {
  const getBasename = () => {
    return window.location.pathname.startsWith('/adilitix') ? '/adilitix' : '';
  };

  return (
    <Router basename={getBasename()}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:folder/:id" element={<ProjectDetail />} />
        <Route path="/projects/shakthikulangara/robotics" element={<ProjectDetail />} />
        <Route path="/shakthikulangara/robotics" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/inquiry" element={<Inquiry />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/office" element={<OfficeStatus />} />
      </Routes>
    </Router>
  );
}

export default App;
