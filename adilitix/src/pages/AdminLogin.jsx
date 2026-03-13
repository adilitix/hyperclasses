import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const rawBase = import.meta.env.VITE_SERVER_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hyperclass.onrender.com');
    const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('adilitix_admin', 'true');
                localStorage.setItem('adilitix_username', data.username);
                localStorage.setItem('adilitix_role', data.role);
                if (data.permissions) {
                    localStorage.setItem('adilitix_permissions', JSON.stringify(data.permissions));
                } else {
                    localStorage.removeItem('adilitix_permissions');
                }
                navigate('/admin-dashboard');
            } else {
                setError(data.message || 'Invalid credentials');
            }
        } catch (err) {
            setError('Server connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <nav className="navbar" style={{ position: 'absolute' }}>
                <Link to="/" className="back-link"><ArrowLeft size={20} /> Home</Link>
                <div className="logo">ADILITIX</div>
            </nav>

            <div className="login-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="login-card"
                >
                    <div className="login-icon"><Lock size={30} /></div>
                    <h1>Admin Access</h1>
                    <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Restricted to Adilitix Management</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>Admin ID</label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                placeholder="Enter admin ID"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && <p className="error-msg">{error}</p>}
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Login to Dashboard'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLogin;
