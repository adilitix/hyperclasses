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
    const [error, setError] = useState('');

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
        const res = await login(username, password, role);
        if (!res.success) {
            setError(res.message);
        }
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'grid',
            gridTemplateColumns: '1fr minmax(400px, 30%)', // Responsive split
            background: 'var(--bg-color)',
            overflow: 'hidden'
        }} className="landing-page-container">

            {/* LEFT SIDE - Marketing & Visuals */}
            <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '4rem',
                color: 'white',
                overflow: 'hidden'
            }}>
                {/* Background Carousel */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImage}
                        initial={{ opacity: 0, scale: 1.1 }}
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
                            filter: 'blur(2px) brightness(0.7)'
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
                        <h1 style={{
                            fontSize: '5rem', // Made bigger
                            fontWeight: 800,
                            marginBottom: '0.5rem',
                            background: 'linear-gradient(to right, #00f0ff, #ffffff)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
                            fontFamily: 'Orbitron, sans-serif' // Ensuring futuristic font if available, or fallback
                        }}>
                            HyperClass
                        </h1>
                        <div style={{
                            display: 'inline-block',
                            background: 'rgba(255, 190, 11, 0.2)',
                            color: 'var(--warning)',
                            border: '1px solid var(--warning)',
                            padding: '0.2rem 0.8rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            marginBottom: '2rem',
                            fontWeight: 'bold',
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            Pre-release v0.9
                        </div>
                        <h2 style={{
                            fontSize: '2rem',
                            color: 'var(--primary)',
                            marginBottom: '2rem',
                            fontWeight: 300
                        }}>
                            Advanced Workshop Management Made Easy
                        </h2>
                        <p style={{
                            fontSize: '1.2rem',
                            lineHeight: 1.6,
                            maxWidth: '600px',
                            color: '#e0e6ed',
                            marginBottom: '3rem',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            Experience the future of education with real-time code syncing,
                            AI-powered insights, and a seamless holographic interface.
                        </p>

                        {/* Feature Grid */}
                        <div style={{ display: 'flex', gap: '2rem' }}>
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
                                        padding: '1.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        width: '150px'
                                    }}
                                >
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.2rem' }}>{feature.title}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{feature.desc}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SIDE - Login Form */}
            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(5, 5, 16, 0.95)',
                borderLeft: '1px solid var(--glass-border)',
                backdropFilter: 'blur(20px)',
                boxShadow: '-10px 0 50px rgba(0,0,0,0.5)',
                zIndex: 10
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
                                required
                            />
                        </div>

                        {role === 'admin' && (
                            <div className="animate-fade-in">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8', textAlign: 'left' }}>Password</label>
                                <input
                                    type="password"
                                    className="input-field"
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                    @media (max-width: 900px) {
                        .landing-page-container {
                            grid-template-columns: 1fr !important;
                            overflow-y: auto !important;
                        }
                        .landing-page-container > div:first-child {
                            padding: 2rem !important;
                            min-height: 50vh;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}

export default Login;
