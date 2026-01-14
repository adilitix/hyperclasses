import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './components/Login';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import { LandingThemeProvider } from './contexts/LandingThemeContext';
import TorchlightOverlay from './components/TorchlightOverlay';
import PricingPage from './pages/PricingPage';
import FeaturesPage from './pages/FeaturesPage';
import WorkshopsPage from './pages/WorkshopsPage';
import ContactPage from './pages/ContactPage';
import GoLogin from './pages/GoLogin';
import GoPortal from './pages/GoPortal';
import GoStudentWorkshop from './pages/GoStudentWorkshop';
import AdminLogin from './pages/AdminLogin';

// A unified login wrapper for the landing page header button
const AdminLoginRedirect = () => {
    const { user } = useAuth();
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        return <Navigate to="/app" replace />;
    }
    return <AdminLogin />;
};

const ComingSoon = ({ title }) => (
    <div style={{ height: '100vh', background: '#050505', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-2px', color: '#ff7b00' }}>{title}</h1>
        <p style={{ opacity: 0.5, fontSize: '1.2rem' }}>COMING SOON</p>
        <button onClick={() => window.history.back()} style={{ marginTop: '30px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>← GO BACK</button>
    </div>
);

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function LoginWrapper() {
    const { user } = useAuth();
    if (user) {
        if (user.role === 'student' && user.workshopId) {
            return <Navigate to="/go/student/classroom" replace />;
        }
        return <Navigate to="/app" replace />;
    }
    return <Login />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <LandingThemeProvider>
                        <TorchlightOverlay />
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/pricing" element={<PricingPage />} />
                            <Route path="/features" element={<FeaturesPage />} />
                            <Route path="/workshops" element={<WorkshopsPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/login" element={<LoginWrapper />} />
                            <Route path="/admin/login" element={<AdminLoginRedirect />} />
                            <Route path="/go/login" element={<GoLogin />} />
                            {/* Unified App handles these cases now */}
                            <Route path="/go/admin/classroom" element={<ComingSoon title="Admin Control" />} />
                            <Route path="/go/student/classroom" element={<GoStudentWorkshop />} />
                            <Route path="/app/*" element={
                                <ProtectedRoute>
                                    <Layout />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </LandingThemeProvider>
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
