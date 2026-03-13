import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/go_login.css';

const GoStudentLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock login for demo
        alert('Logging in securely...');
        navigate('/workshops');
    };

    return (
        <div className="go-login-container">
            {/* Header */}
            <header className="go-login-header">
                <div className="go-logo" onClick={() => navigate('/')}>
                    <div className="logo-symbol">H</div>
                    <span className="logo-text">Hyper<span>class</span></span>
                </div>
                <button className="admin-login-btn" onClick={() => navigate('/login')}>
                    ADMIN LOGIN
                </button>
            </header>

            {/* Main Content */}
            <main className="go-login-main">
                <motion.div
                    className="login-glass-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="login-title">STUDENT LOGIN</h1>
                    <div className="title-underline"></div>

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <span className="input-icon">🎓</span>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <span className="input-icon">🎓</span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span className="lock-icon">🔒</span>
                        </div>

                        <button type="submit" className="login-submit-btn">
                            LOG IN SECURELY
                        </button>
                    </form>
                </motion.div>
            </main>

            {/* Decorative Stars/Particles (Simulated with div) */}
            <div className="star-element">✦</div>
        </div>
    );
};

export default GoStudentLogin;
