import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [eventId, setEventId] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(username.trim(), role === 'student' ? null : password.trim(), role, eventId.trim());
        if (!res.success) {
            setError(res.message);
        }
    };

    return (
        <div className="landing-container login-split-container">
            {/* Left Side - Marketing */}
            <div className="login-left" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                    <button
                        className="btn-ghost"
                        onClick={() => navigate('/')}
                        style={{
                            fontSize: '1rem',
                            color: '#334155',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(4px)',
                            borderRadius: '30px',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        <span>🏠</span> Home
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
                        HyperFlow
                    </h1>
                    <p style={{ fontSize: '1.5rem', color: '#475569', marginBottom: '2.5rem' }}>
                        Join the Flow. Real-time engineering collaboration.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        {[
                            { icon: '⚡', title: 'Real-time', desc: 'Instant code syncing' },
                            { icon: '🛰️', title: 'Global', desc: 'Connect from anywhere' },
                            { icon: '🛡️', title: 'Secure', desc: 'Encrypted communication' }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                className="mini-feature-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.1) }}
                            >
                                <div style={{ fontSize: '1.5rem', background: '#0f172a', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{feature.title}</div>
                                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{feature.desc}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="login-right">
                <div className="login-form-container">
                    <div style={{ textAlign: 'center', marginBottom: '2rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <span className="rocket" style={{ fontSize: '1.8rem' }}>🛰️</span>
                            <span>HyperFlow Login</span>
                        </div>
                    </div>

                    <div className="role-switcher-custom">
                        <button
                            className={`role-btn-custom ${role === 'student' ? 'student-active' : ''}`}
                            onClick={() => setRole('student')}
                        >
                            Student
                        </button>
                        <button
                            className={`role-btn-custom ${role === 'admin' ? 'admin-active' : ''}`}
                            onClick={() => setRole('admin')}
                        >
                            Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <label className="input-label">Username</label>
                            <input
                                type="text"
                                className="modern-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={role === 'student' ? 'e.g. Aadil' : 'Admin Username'}
                                required
                            />
                        </div>

                        {role === 'student' && (
                            <div>
                                <label className="input-label">Event ID</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={eventId}
                                    onChange={(e) => setEventId(e.target.value)}
                                    placeholder="Enter event ID provided"
                                    required
                                />
                            </div>
                        )}

                        {role === 'admin' && (
                            <div style={{ position: 'relative' }}>
                                <label className="input-label">Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="modern-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '38px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        opacity: 0.5
                                    }}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem', background: '#fef2f2', padding: '0.75rem', borderRadius: '12px' }}>
                                {error}
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn-gradient-primary"
                            style={{ width: '100%' }}
                        >
                            Join Flow Session
                        </motion.button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button className="btn-ghost" onClick={() => navigate('/')} style={{ fontSize: '0.9rem' }}>
                            ← Back to Portal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
