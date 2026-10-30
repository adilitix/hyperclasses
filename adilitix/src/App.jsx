import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import './App.css';

// Everything except the home page is split into its own chunk so first load stays small.
const Programs = lazy(() => import('./pages/Programs'));
const About = lazy(() => import('./pages/About'));
const Inquiry = lazy(() => import('./pages/Inquiry'));
const Register = lazy(() => import('./pages/Register'));
const Shop = lazy(() => import('./pages/Shop'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const OfficeStatus = lazy(() => import('./pages/OfficeStatus'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Route changes should start at the top of the new page, unless they target an anchor.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  const getBasename = () => {
    return window.location.pathname.startsWith('/adilitix') ? '/adilitix' : '';
  };

  return (
    <Router basename={getBasename()}>
      <ScrollToTop />
      <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:folder/:id" element={<ProjectDetail />} />
          <Route path="/shakthikulangara/robotics" element={<Navigate to="/projects/shakthikulangara/robotics" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/inquiry" element={<Inquiry />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/office" element={<OfficeStatus />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
