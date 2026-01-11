import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import LandingThemeToggle from '../components/LandingThemeToggle';
import { useLandingTheme } from '../contexts/LandingThemeContext';
import { useNavigate } from 'react-router-dom';
import '../styles/landing_v2.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const spotlightX = useSpring(mouseX, springConfig);
    const spotlightY = useSpring(mouseY, springConfig);
    const { theme } = useLandingTheme();

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const features = [
        {
            title: "HyperFlow Live",
            icon: "⚡",
            desc: "The ultimate live classroom engine. Real-time code broadcasting, instant polls, and high-fidelity collaboration for deep technical learning."
        },
        {
            title: "HyperGo Workshops",
            icon: "🚀",
            desc: "Premier project-based workshop platform. Structured hardware curriculum, progress tracking, and elite technical certifications."
        },
        {
            title: "Hardware Integration",
            icon: "🔌",
            desc: "Seamlessly connect and program ESP32, Arduino, and other hardware directly from the browser with our custom bridge."
        },
        {
            title: "Verified Certifications",
            icon: "📜",
            desc: "Every workshop completion earns you a blockchain-verified certificate, recognized by top industry partners."
        }
    ];

    return (
        <div className="landing-v2">
            {theme !== 'black' && (
                <motion.div
                    className="mouse-spotlight"
                    style={{
                        left: spotlightX,
                        top: spotlightY,
                    }}
                />
            )}
            <div className="gradient-bg" />

            {/* Header */}
            <header className="header-v2">
                <div className="portal-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <div className="logo-symbol" style={{
                        width: '40px',
                        height: '40px',
                        background: 'var(--text-white, white)',
                        color: 'var(--bg-dark, black)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        clipPath: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)'
                    }}>H</div>
                    <span className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 800, marginLeft: '12px', color: 'var(--text-white)' }}>
                        Hyper<span style={{ fontWeight: 300, opacity: 0.7 }}>class</span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <LandingThemeToggle />
                    <button className="admin-login-btn" onClick={() => navigate('/login')} style={{ background: 'var(--primary-orange)', border: 'none', color: 'white' }}>
                        LOGIN
                    </button>
                    <button className="admin-login-btn" onClick={() => navigate('/admin/login')}>
                        ADMIN
                    </button>
                </div>
            </header>

            {/* Floating Student Login */}
            <div className="student-login-float">
                <motion.button
                    className="student-login-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                >
                    <span>STUDENT LOGIN</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </motion.button>
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1 }}
                >
                    <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'rgba(0, 102, 255, 0.1)', filter: 'blur(100px)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '400px', height: '400px', background: 'rgba(255, 123, 0, 0.1)', filter: 'blur(120px)', borderRadius: '50%' }} />
                </motion.div>

                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    Precision engineering <br />meets <span style={{ color: 'var(--primary-blue)' }}>learning</span>
                </motion.h1>
                <motion.p
                    className="hero-subtitle"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    The ultimate platform for live engineering education and professional hardware workshops.
                </motion.p>

                <motion.div
                    className="hero-buttons"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    style={{ display: 'flex', gap: '20px' }}
                >
                    <button className="v2-submit" style={{ padding: '15px 40px', fontSize: '1rem' }} onClick={() => document.getElementById('features').scrollIntoView()}>
                        EXPLORE PLATFORM
                    </button>
                    <button className="admin-login-btn" style={{ padding: '15px 40px', fontSize: '1rem', background: 'transparent' }} onClick={() => navigate('/workshops')}>
                        VIEW CATALOG
                    </button>
                </motion.div>

                <motion.div
                    className="scroll-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <p style={{ fontSize: '0.7rem', letterSpacing: '4px', marginBottom: '10px', opacity: 0.5 }}>DISCOVER MORE</p>
                    <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, var(--primary-blue), transparent)', margin: '0 auto' }} />
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="section" id="features">
                <h2 className="section-title">One Platform, Two Engines</h2>
                <div className="features-grid-v2">
                    {features.map((f, i) => {
                        return (
                            <motion.div
                                key={i}
                                className="v2-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{
                                    y: -10,
                                    transition: { duration: 0.2 }
                                }}
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>

                                {/* Inner glow follows mouse subtly */}
                                <motion.div
                                    className="card-glow"
                                    style={{
                                        background: `radial-gradient(circle at center, var(--primary-blue), transparent 70%)`,
                                        position: 'absolute',
                                        width: '200px',
                                        height: '200px',
                                        borderRadius: '50%',
                                        zIndex: -1,
                                        opacity: 0,
                                        pointerEvents: 'none'
                                    }}
                                    whileHover={{ opacity: 0.1 }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* About Section */}
            <section className="section" style={{ background: 'rgba(255, 123, 0, 0.02)' }}>
                <div className="contact-v2">
                    <div className="contact-info-v2">
                        <h2 style={{ color: 'var(--primary-orange)' }}>Precision Learning Systems</h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                            Hyperclass is more than just a portal; it's a precision-engineered learning ecosystem.
                            We believe that technical education should be as dynamic as the technologies themselves.
                            Whether you're broadcasting code to a hundred students or tracking your progress through
                            a complex robotics track, Hyperclass provides the tools you need to succeed.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="v2-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h4 style={{ fontSize: '2rem', margin: '0' }}>5k+</h4>
                            <p style={{ margin: '0' }}>Students</p>
                        </div>
                        <div className="v2-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h4 style={{ fontSize: '2rem', margin: '0', color: 'var(--primary-blue)' }}>50+</h4>
                            <p style={{ margin: '0' }}>Workshops</p>
                        </div>
                        <div className="v2-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h4 style={{ fontSize: '2rem', margin: '0', color: 'var(--primary-blue)' }}>98%</h4>
                            <p style={{ margin: '0' }}>Completion Rate</p>
                        </div>
                        <div className="v2-card" style={{ padding: '20px', textAlign: 'center' }}>
                            <h4 style={{ fontSize: '2rem', margin: '0' }}>24/7</h4>
                            <p style={{ margin: '0' }}>Lab Access</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section">
                <div className="contact-v2">
                    <div className="contact-info-v2">
                        <h2>Get in Touch</h2>
                        <p>Have questions about our curriculum or want to partner with us for your institution?</p>
                        <div style={{ marginTop: '30px' }}>
                            <p>📧 admin@hyperclass.in</p>
                            <p>📞 +91 80753 55024</p>
                            <p>📍 Kochi, Kerala, India</p>
                        </div>
                    </div>
                    <form className="contact-form-v2" onSubmit={(e) => e.preventDefault()}>
                        <input type="text" placeholder="Full Name" className="v2-input" />
                        <input type="email" placeholder="Email Address" className="v2-input" />
                        <textarea placeholder="Your Message" className="v2-input" style={{ minHeight: '150px' }}></textarea>
                        <button type="submit" className="v2-submit">SEND MESSAGE</button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-v2">
                <p>&copy; {new Date().getFullYear()} Hyperclass Engineering. Precision Learning Systems.</p>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.8rem' }}>
                    <span style={{ cursor: 'pointer' }}>DOCUMENTATION</span>
                    <span style={{ cursor: 'pointer' }}>PRIVACY POLICY</span>
                    <span style={{ cursor: 'pointer' }}>TERMS OF SERVICE</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
