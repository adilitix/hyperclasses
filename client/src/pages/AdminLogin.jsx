import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/landing_split.css'; // Reuse portal aesthetics
import '../styles/go_login_unified.css'; // Reuse Go login aesthetics for the form

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoverType, setHoverType] = useState('flow'); // 'flow' or 'go'

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await login(username.trim(), password.trim(), 'admin', '');
            if (res.success) {
                navigate('/app');
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="landing-portal admin-login-portal">
            <header className="absolute-header">
                <div className="header-left">
                    <div className="portal-logo" onClick={() => navigate('/')}>
                        <div className="logo-symbol">H</div>
                        <span className="logo-text">Hyper<span>class</span> Trainer</span>
                    </div>
                </div>
            </header>

            <main className="portal-grid" style={{
                minHeight: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                overflowY: 'auto'
            }}>
                {/* Left Side: Information & Selection */}
                <div className="login-info-side" style={{
                    flex: window.innerWidth < 768 ? 'none' : '1.2',
                    padding: window.innerWidth < 768 ? '100px 6% 40px' : '8% 6%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: '#050505',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: window.innerWidth < 768 ? 'auto' : '100vh'
                }}>
                    <div className="info-content" style={{ position: 'relative', zIndex: 10 }}>
                        <span className="side-badge" style={{ marginBottom: '20px' }}>MANAGEMENT ACCESS</span>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '2rem', lineHeight: 1.1 }}>
                            Trainers <br /> <span style={{ color: 'var(--primary)' }}>Command Center</span>
                        </h1>

                        <div className="choice-cards" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <motion.div
                                className={`choice-card ${hoverType === 'flow' ? 'active' : ''}`}
                                onMouseEnter={() => setHoverType('flow')}
                                style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${hoverType === 'flow' ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <h3 style={{ margin: '0 0 10px 0', color: hoverType === 'flow' ? 'var(--primary)' : '#fff' }}>⚡ HyperFlow</h3>
                                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Live classroom engine with real-time code broadcasting and interactive polling systems.</p>
                            </motion.div>

                            <motion.div
                                className={`choice-card ${hoverType === 'go' ? 'active' : ''}`}
                                onMouseEnter={() => setHoverType('go')}
                                style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${hoverType === 'go' ? '#ff7b00' : 'rgba(255,255,255,0.1)'}`,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <h3 style={{ margin: '0 0 10px 0', color: hoverType === 'go' ? '#ff7b00' : '#fff' }}>🚀 HyperGo</h3>
                                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Self-paced workshop manager for structured curriculum, tracking progress, and certification.</p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Dynamic Background FX */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={hoverType}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            exit={{ opacity: 0 }}
                            className="dynamic-bg"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: hoverType === 'flow'
                                    ? 'radial-gradient(circle at center, var(--primary), transparent)'
                                    : 'radial-gradient(circle at center, #ff7b00, transparent)',
                                filter: 'blur(100px)',
                                zIndex: 1
                            }}
                        />
                    </AnimatePresence>
                </div>

                {/* Right Side: Login Form */}
                <div className="login-form-side" style={{
                    flex: window.innerWidth < 768 ? 'none' : '0.8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(20px)',
                    borderLeft: '1px solid rgba(255,255,255,0.05)',
                    padding: window.innerWidth < 768 ? '40px 20px 100px' : '0'
                }}>
                    <motion.div
                        className="go-glass-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ width: '100%', maxWidth: '400px', padding: '40px', background: 'transparent', boxShadow: 'none' }}
                    >
                        <h2 className="go-card-title">TRAINER LOGIN</h2>
                        <div className="go-underline" style={{ width: '40px', margin: '15px 0 30px' }}></div>

                        <form className="go-form" onSubmit={handleLogin}>
                            <div className="go-input-group">
                                <span className="go-icon">👤</span>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="go-input-group">
                                <span className="go-icon">🔑</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="go-eye"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>

                            {error && <div className="go-error" style={{ marginBottom: '20px' }}>{error}</div>}

                            <button type="submit" className="go-submit" disabled={loading} style={{ background: hoverType === 'flow' ? 'var(--primary)' : '#ff7b00', color: '#000' }}>
                                {loading ? 'AUTHENTICATING...' : 'ENTER DASHBOARD'}
                            </button>
                        </form>

                        <button
                            className="back-portal"
                            onClick={() => navigate('/')}
                            style={{ marginTop: '30px', opacity: 0.5, fontSize: '0.8rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                            ← BACK TO PORTAL
                        </button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminLogin;
