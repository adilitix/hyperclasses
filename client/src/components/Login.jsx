import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/landing_split.css'; // Reuse portal aesthetics
import '../styles/go_login_unified.css'; // Reuse Go login aesthetics for the form components

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [eventId, setEventId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [detectedType, setDetectedType] = useState(null); // 'flow' or 'go'

    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    // Dynamic type detection while typing
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (eventId.trim().length >= 1) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/check-event/${eventId.trim()}`);
                    const data = await res.json();
                    if (data.success) {
                        setDetectedType(data.type);
                    } else {
                        setDetectedType(null);
                    }
                } catch (err) {
                    setDetectedType(null);
                }
            } else {
                setDetectedType(null);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [eventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await login(username.trim(), null, 'student', eventId.trim());
        setLoading(false);
        if (!res.success) {
            setError(res.message);
        }
    };

    const { user } = useAuth();
    useEffect(() => {
        if (user && user.role === 'student') {
            // Live Go sessions (isWorkshop: true but no static workshopId) should use the main app layout
            if (user.workshopId) {
                navigate('/go/student/classroom');
            } else {
                navigate('/app');
            }
        }
    }, [user, navigate]);

    // Visual configuration based on detected type
    const isGo = detectedType === 'go';
    const primaryColor = isGo ? '#ff7b00' : '#3b82f6';
    const secondaryColor = isGo ? '#ffc107' : '#00f0ff';
    const brandName = isGo ? 'HyperGo' : 'HyperFlow';
    const hubTitle = isGo ? 'Workshop Project' : 'Live Engineering';

    return (
        <div className="landing-portal admin-login-portal">
            <header className="absolute-header">
                <div className="header-left">
                    <div className="portal-logo" onClick={() => navigate('/')}>
                        <div className="logo-symbol">H</div>
                        <span className="logo-text">Hyper<span>class</span> Student</span>
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
                {/* Left Side: Information */}
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
                        <span className="side-badge" style={{
                            marginBottom: '20px',
                            background: isGo ? 'rgba(255,123,0,0.1)' : 'rgba(59,130,246,0.1)',
                            color: primaryColor,
                            border: `1px solid ${primaryColor}`,
                            transition: 'all 0.5s'
                        }}>STUDENT ACCESS</span>

                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '2rem', lineHeight: 1.1, color: '#fff' }}>
                            Students <br />
                            <span style={{ color: primaryColor, transition: 'color 0.5s' }}>Command Center</span>
                        </h1>

                        <div className="choice-cards" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '500px' }}>
                            <motion.div
                                animate={{
                                    border: !isGo ? `1px solid ${primaryColor}` : '1px solid rgba(255,255,255,0.1)',
                                    background: !isGo ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)'
                                }}
                                style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <h3 style={{ margin: '0 0 10px 0', color: !isGo ? primaryColor : '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>⚡</span> HyperFlow
                                </h3>
                                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', color: '#fff', lineHeight: 1.5 }}>
                                    Live classroom engine with real-time code broadcasting and interactive polling systems.
                                </p>
                            </motion.div>

                            <motion.div
                                animate={{
                                    border: isGo ? `1px solid ${primaryColor}` : '1px solid rgba(255,255,255,0.1)',
                                    background: isGo ? 'rgba(255,123,0,0.05)' : 'rgba(255,255,255,0.02)'
                                }}
                                style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <h3 style={{ margin: '0 0 10px 0', color: isGo ? primaryColor : '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.2rem' }}>🚀</span> HyperGo
                                </h3>
                                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem', color: '#fff', lineHeight: 1.5 }}>
                                    Self-paced workshop manager for structured curriculum, tracking progress, and certification.
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Dynamic Radial Glow Background */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={detectedType || 'default'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.15 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: `radial-gradient(circle at center, ${primaryColor}, transparent)`,
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
                    background: '#000', // Solid black like the image
                    position: 'relative',
                    padding: window.innerWidth < 768 ? '40px 20px 100px' : '0'
                }}>
                    <motion.div
                        className="go-glass-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            width: '100%',
                            maxWidth: '420px',
                            padding: '50px 40px',
                            background: 'rgba(20,20,20,0.4)',
                            border: `1px solid ${isGo ? 'rgba(255,123,0,0.15)' : 'rgba(59,130,246,0.15)'}`,
                            borderRadius: '32px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <h2 className="go-card-title" style={{ color: '#fff', textAlign: 'center', fontSize: '1.8rem', letterSpacing: '2px' }}>STUDENT LOGIN</h2>
                        <motion.div
                            className="go-underline"
                            animate={{ backgroundColor: primaryColor }}
                            style={{ width: '40px', margin: '15px auto 40px' }}
                        />

                        <form className="go-form" onSubmit={handleSubmit}>
                            <div className="go-input-group" style={{ marginBottom: '10px' }}>
                                <span className="go-icon" style={{ fontSize: '1.2rem', opacity: 0.7 }}>👤</span>
                                <input
                                    type="text"
                                    placeholder="Your Name (e.g. Aadil)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{
                                        background: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        color: '#fff',
                                        fontSize: '0.95rem'
                                    }}
                                    required
                                />
                            </div>

                            <div className="go-input-group">
                                <span className="go-icon" style={{ fontSize: '1.2rem', opacity: 0.7 }}>🔑</span>
                                <input
                                    type="text"
                                    placeholder="Access Code / Event ID"
                                    value={eventId}
                                    onChange={(e) => setEventId(e.target.value)}
                                    style={{
                                        background: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        color: isGo ? primaryColor : '#fff',
                                        fontSize: '1rem',
                                        fontFamily: 'monospace'
                                    }}
                                    required
                                />
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="go-error"
                                        style={{ marginTop: '10px', padding: '12px', background: 'rgba(255,68,68,0.1)', color: '#ff4444', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className="go-submit"
                                disabled={loading}
                                style={{
                                    marginTop: '25px',
                                    background: isGo ? 'linear-gradient(135deg, #ff7b00, #ffc107)' : 'linear-gradient(135deg, #3b82f6, #00f0ff)',
                                    color: '#000',
                                    padding: '20px',
                                    fontSize: '1rem',
                                    borderRadius: '16px',
                                    fontWeight: 900,
                                    boxShadow: isGo ? '0 10px 20px rgba(255,123,0,0.3)' : '0 10px 20px rgba(59,130,246,0.3)',
                                    letterSpacing: '1px'
                                }}
                            >
                                {loading ? 'JOINING...' : 'ENTER LEARNING HUB'}
                            </button>
                        </form>

                        <button
                            className="back-portal"
                            onClick={() => navigate('/')}
                            style={{
                                marginTop: '35px',
                                alignSelf: 'center',
                                opacity: 0.4,
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                letterSpacing: '2px',
                                transition: 'opacity 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.opacity = '1'}
                            onMouseLeave={(e) => e.target.style.opacity = '0.4'}
                        >
                            ← BACK TO PORTAL
                        </button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

export default Login;
