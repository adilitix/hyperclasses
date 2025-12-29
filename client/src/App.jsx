import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './components/Login';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';

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
        return <Navigate to="/app" replace />;
    }
    return <Login />;
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/login" element={<LoginWrapper />} />
                        <Route path="/app/*" element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
