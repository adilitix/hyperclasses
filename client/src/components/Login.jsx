import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

// Assets
const IMAGES = [
    '/assets/cyberpunk_classroom.png',
    '/assets/ai_network.png',
    '/assets/future_city.png'
];

function Login() {
    const { login } = useAuth();
    const [role, setRole] = useState('student');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [eventId, setEventId] = useState('');
    const [error, setError] = useState('');
    const [showLoginMobile, setShowLoginMobile] = useState(false); // Mobile toggle

    // Carousel State
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
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
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'row',
            background: 'var(--bg-color)',
            overflowX: 'hidden',
            overflowY: 'auto'
        }} className="landing-page-container">

            {/* LEFT SIDE - Marketing & Visuals */}
            <div className={`marketing-side ${showLoginMobile ? 'mobile-hide' : ''}`} style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem 6%',
                color: 'white',
                minHeight: '100vh'
            }}>
                {/* Background Carousel */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 0.4, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: `url(${IMAGES[currentImage]})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: 0,
                            filter: 'blur(2px) brightness(0.6)'
                        }}
                    />
                </AnimatePresence>

                {/* Content Overlay */}
                <div style={{ zIndex: 1, position: 'relative' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(255, 190, 11, 0.2)',
                            color: 'var(--warning)',
                            border: '1px solid var(--warning)',
                            padding: '0.3rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            marginBottom: '1.5rem',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            Pre-release v0.9
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                            fontWeight: 800,
                            marginBottom: '1rem',
                            background: 'linear-gradient(to right, #00f0ff, #ffffff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.1,
                            fontFamily: 'Orbitron, sans-serif'
                        }}>
                            HyperClass
                        </h1>

                        <h2 style={{
                            fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
                            color: 'var(--primary)',
                            marginBottom: '1.5rem',
                            fontWeight: 400,
                            maxWidth: '700px'
                        }}>
                            Advanced Workshop Management Made Easy
                        </h2>
                        <p style={{
                            fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
                            lineHeight: 1.6,
                            maxWidth: '600px',
                            color: '#cbd5e1',
                            marginBottom: '3rem'
                        }}>
                            Experience the future of education with real-time code syncing,
                            AI-powered insights, and a seamless holographic interface.
                        </p>

                        <button
                            className="btn btn-primary mobile-only-flex"
                            onClick={() => setShowLoginMobile(true)}
                            style={{ padding: '1.2rem 2.5rem', fontSize: '1.1rem', marginBottom: '3rem' }}
                        >
                            Connect to Mainframe →
                        </button>

                        {/* Feature Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '1.5rem',
                            maxWidth: '600px'
                        }} className="feature-grid mobile-hide">
                            {[
                                { icon: '⚡', title: 'Real-time', desc: 'Instant code syncing' },
                                { icon: '🤖', title: 'AI Powered', desc: 'Smart assistance' },
                                { icon: '🛡️', title: 'Secure', desc: 'Enterprise grade' }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="glass-panel"
                                    style={{
                                        padding: '1.25rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '12px'
                                    }}
                                >
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.2rem', fontSize: '0.9rem' }}>{feature.title}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6, lineHeight: '1.4' }}>{feature.desc}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE - Login Form */}
            <div className={`login-side ${!showLoginMobile ? 'mobile-hide' : ''}`} style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(5, 5, 25, 0.98)',
                borderLeft: '1px solid var(--glass-border)',
                backdropFilter: 'blur(24px)',
                boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
                zIndex: 10,
                width: '450px',
                flexShrink: 0
            }}>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="glass-panel"
                    style={{
                        padding: '3rem',
                        width: '100%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        border: '1px solid var(--primary-glow)',
                        boxShadow: '0 0 40px rgba(0, 240, 255, 0.05)',
                        background: 'rgba(20, 25, 40, 0.4)'
                    }}
                >
                    <div style={{ position: 'absolute', top: '2rem', left: '2rem' }} className="mobile-only-flex">
                        <button
                            onClick={() => setShowLoginMobile(false)}
                            className="btn btn-ghost"
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            ← Back
                        </button>
                    </div>

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{ display: 'inline-block', marginBottom: '1rem' }}
                    >
                        <Logo size={50} />
                    </motion.div>

                    <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', letterSpacing: '1px' }}>Initialize Session</h2>

                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
                        <button
                            className={`btn ${role === 'student' ? 'btn-primary' : ''}`}
                            style={{ flex: 1, background: role === 'student' ? '' : 'transparent', opacity: role === 'student' ? 1 : 0.7, border: role === 'student' ? 'none' : '1px solid transparent' }}
                            onClick={() => setRole('student')}
                        >
                            Student
                        </button>
                        <button
                            className={`btn ${role === 'admin' ? 'btn-primary' : ''}`}
                            style={{ flex: 1, background: role === 'admin' ? '' : 'transparent', opacity: role === 'admin' ? 1 : 0.7, border: role === 'admin' ? 'none' : '1px solid transparent' }}
                            onClick={() => setRole('admin')}
                        >
                            Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', textAlign: 'left' }}>Username</label>
                            <input
                                type="text"
                                className="input-field"
                                style={{ width: '100%', boxSizing: 'border-box' }}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoCorrect="off"
                                autoCapitalize="none"
                                required
                            />
                        </div>

                        {role === 'student' && (
                            <div className="animate-fade-in">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', textAlign: 'left' }}>Event ID</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                    value={eventId}
                                    onChange={(e) => setEventId(e.target.value)}
                                    placeholder="Enter event ID provided by instructor"
                                    autoCorrect="off"
                                    autoCapitalize="none"
                                    required
                                />
                            </div>
                        )}

                        {role === 'admin' && (
                            <div className="animate-fade-in">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', textAlign: 'left' }}>Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoCorrect="off"
                                    autoCapitalize="none"
                                    required
                                />
                            </div>
                        )}

                        {error && <div style={{ color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px var(--primary-glow)' }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1rem' }}
                        >
                            Connect to Mainframe
                        </motion.button>
                    </form>
                </motion.div>

                {/* Mobile/Responsive Style Injection */}
                <style>{`
                    @media (max-width: 1024px) {
                        .landing-page-container {
                            flex-direction: column !important;
                            height: auto !important;
                        }
                        .marketing-side {
                            padding: 3rem 1.5rem !important;
                            min-height: 100vh !important;
                            flex: none !important;
                            display: flex !important;
                        }
                        .login-side {
                            width: 100% !important;
                            height: 100vh !important;
                            padding: 3rem 0 !important;
                            border-left: none !important;
                            background: rgba(5, 5, 20, 1) !important;
                            display: flex !important;
                        }
                        .feature-grid {
                            grid-template-columns: 1fr !important;
                        }
                        .mobile-hide {
                            display: none !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        .marketing-side h1 {
                            font-size: 3rem !important;
                        }
                        .glass-panel {
                            padding: 1.5rem !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default Login;
