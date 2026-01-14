import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (credentials.username === 'aadil' && credentials.password === 'Aadil@123') {
            localStorage.setItem('adilitix_admin', 'true');
            navigate('/admin-dashboard');
        } else {
            setError('Invalid credentials for Adilitix Admin.');
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
                        <button type="submit" className="login-btn">Login to Dashboard</button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLogin;
