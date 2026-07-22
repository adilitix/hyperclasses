import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import Logo from '../components/Logo';

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
        <div className="registration-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} color="var(--ad-orange)" /> Home
                </Link>
                <Logo size="small" showText={true} textSub="PORTAL" />
            </nav>

            <div className="registration-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="registration-form-card"
                    style={{ maxWidth: '450px' }}
                >
                    <div style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--ad-orange)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid var(--ad-border)' }}>
                        <Lock size={28} />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.6rem', textAlign: 'center' }}>Enterprise Admin Portal</h1>
                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem', textAlign: 'center', margin: '6px 0 24px' }}>
                        Restricted Access | Adilitix Robotics Management
                    </p>

                    <form onSubmit={handleSubmit} className="reg-form">
                        <div className="form-group">
                            <label>Admin ID</label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                placeholder="Enter admin username"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password / PIN</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '14px', textAlign: 'center' }}>{error}</p>}
                        <button type="submit" className="submit-btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                            {loading ? 'Authenticating...' : 'Login to Management Console'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLogin;
