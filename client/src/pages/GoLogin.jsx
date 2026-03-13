import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/go_login_unified.css';

const GoLogin = ({ forcedRole }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState(forcedRole || 'student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [eventId, setEventId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.body.classList.add('go-login-mode');
        return () => document.body.classList.remove('go-login-mode');
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let loginUsername = username.trim();
        let loginPassword = password.trim();
        let loginEventId = eventId.trim();

        // Student Login: password field is actually the Workshop ID / Access Key
        if (role === 'student') {
            loginEventId = loginPassword;
        }

        try {
            const res = await login(loginUsername, role === 'admin' ? loginPassword : null, role, loginEventId);

            if (res.success) {
                // Get fresh user from localstorage or context if possible, 
                // but login returns {success:true} usually.
                // However, AuthContext.login updates the 'user' state.
                // We need to wait for the state to update or use the data from login if it returned it.
                // Actually, our login implementation in AuthContext returns {success: true} after setting state.
                // Let's use the local storage as a fallback to check what was saved.
                const savedUser = JSON.parse(localStorage.getItem('user'));

                if (role === 'admin') {
                    navigate('/app');
                } else {
                    if (savedUser && savedUser.workshopId) {
                        navigate('/go/student/classroom');
                    } else {
                        navigate('/app');
                    }
                }
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
        <div className="go-unified-container">
            <header className="go-header">
                <div className="go-logo" onClick={() => navigate('/')}>
                    <div className="logo-box">H</div>
                    <span className="logo-text">Hyper<span>{forcedRole === 'admin' ? 'Admin' : 'Go'}</span></span>
                </div>
                <div className="go-tag">{forcedRole === 'admin' ? 'TRAINER ACCESS PORTAL' : 'ELITE WORKSHOP ENGINE'}</div>
            </header>

            <main className="go-main">
                <motion.div
                    className="go-glass-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {!forcedRole && (
                        <div className="go-role-tabs">
                            <button
                                className={`go-role-tab ${role === 'student' ? 'active' : ''}`}
                                onClick={() => { setRole('student'); setUsername(''); setPassword(''); setEventId(''); }}
                            >
                                STUDENT LOGIN
                            </button>
                            <button
                                className={`go-role-tab ${role === 'admin' ? 'active' : ''}`}
                                onClick={() => { setRole('admin'); setUsername(''); setPassword(''); }}
                            >
                                ADMIN LOGIN
                            </button>
                        </div>
                    )}

                    <h2 className="go-card-title">{role === 'student' ? 'STUDENT ACCESS' : 'MANAGEMENT ACCESS'}</h2>
                    <div className="go-underline"></div>

                    <form className="go-form" onSubmit={handleLogin}>
                        <div className="go-input-group">
                            <span className="go-icon">👤</span>
                            <input
                                type="text"
                                placeholder={role === 'student' ? "Your Name" : "Admin Username"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="go-input-group">
                            <span className="go-icon">🔑</span>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder={role === 'student' ? "Access Key (Event ID)" : "Password"}
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

                        {error && <div className="go-error">{error}</div>}

                        <button type="submit" className="go-submit" disabled={loading}>
                            {loading ? (
                                <span className="go-spinner-text">VERIFYING...</span>
                            ) : (
                                role === 'student' ? 'JOIN WORKSHOP SESSION' : 'LOGIN TO DASHBOARD'
                            )}
                        </button>
                    </form>

                    <p className="go-hint">
                        {role === 'student'
                            ? "Enter your name and the Access Key (Workshop ID) to join."
                            : "Enter management credentials for HyperGo Dashboard."}
                    </p>
                </motion.div>
            </main>

            <div className="go-footer">
                <button className="back-portal" onClick={() => navigate('/')}>← BACK TO PORTAL</button>
            </div>

            <div className="go-background-fx">
                <div className="fx-circle"></div>
                <div className="fx-grid"></div>
            </div>
        </div>
    );
};

export default GoLogin;
