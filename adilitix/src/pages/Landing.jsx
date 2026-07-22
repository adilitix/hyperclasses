import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, MapPin, Phone, Award, Layers, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

const Landing = () => {
    const [isVisible, setIsVisible] = useState(false);

    const HYPERCLASS_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://hyperclass.vercel.app';

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="adilitix-container">
            {/* Header Navigation */}
            <nav className="navbar">
                <Link to="/">
                    <Logo size="medium" showText={true} textSub="ROBOTICS" />
                </Link>
                <div className="nav-links">
                    <a href="#about">About</a>
                    <a href="#services">Capabilities</a>
                    <a href="#products">Hyperclass</a>
                    <Link to="/shop" className="nav-btn-subtle" style={{ color: 'var(--ad-orange)' }}>
                        <Cpu size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Component Store
                    </Link>
                    <Link to="/verify" className="nav-btn-subtle">Verify Certificate</Link>
                    <Link to="/admin-login" className="nav-btn-subtle" style={{ opacity: 0.7 }}>Portal</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className={`hero ${isVisible ? 'fade-in' : ''}`}>
                <div className="hero-content">
                    <div className="udyam-badge">
                        <Award size={16} /> Reg. No: UDYAM-KL-06-0070364
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Pioneering the <span className="highlight">Future</span> of Robotics & <span className="highlight-navy">Automation</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Adilitix Robotics designs intelligent hardware, collaborative workshop environments, and high-performance robotic components bridging imagination with reality.
                    </motion.p>
                    <div className="cta-group">
                        <Link to="/register" className="cta-primary">
                            Register for Workshop <ArrowRight size={18} />
                        </Link>
                        <button className="cta-secondary" onClick={() => window.location.href = HYPERCLASS_URL}>
                            Launch Hyperclass <ExternalLink size={16} style={{ marginLeft: '6px' }} />
                        </button>
                    </div>
                </div>

                {/* Hero Interactive Visual */}
                <div className="hero-image">
                    <div className="robot-sphere">
                        <div className="company-card-hero">
                            <Logo size="small" showText={true} textSub="ROBOTICS" />
                            <div style={{ margin: '16px 0 10px', height: '1px', background: 'var(--ad-border-navy)' }}></div>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: '600', fontSize: '0.85rem' }}>
                                <MapPin size={16} color="var(--ad-orange)" /> Aswathy Building, Kollam
                            </p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem', marginTop: '6px' }}>
                                <Phone size={14} color="#60a5fa" /> +91 8075355024
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Official Enterprise & Registration Details */}
            <section id="about" className="company-details-section">
                <div className="company-details-grid">
                    <div className="company-detail-card">
                        <div className="card-icon-box">
                            <Award size={28} />
                        </div>
                        <h3>Udyam Registered Enterprise</h3>
                        <p style={{ fontSize: '0.92rem', color: 'var(--ad-text-dim)', margin: '8px 0 14px' }}>
                            Officially registered MSME robotics enterprise delivering certified training, hardware components, and software solutions.
                        </p>
                        <div style={{ background: 'rgba(5, 7, 10, 0.7)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--ad-border-navy)', fontFamily: 'monospace', color: 'var(--ad-orange)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            UDYAM-KL-06-0070364
                        </div>
                    </div>

                    <div className="company-detail-card">
                        <div className="card-icon-box" style={{ background: 'rgba(29, 59, 151, 0.2)', color: '#60a5fa', borderColor: 'var(--ad-border-navy)' }}>
                            <MapPin size={28} />
                        </div>
                        <h3>Headquarters & Workshop Facility</h3>
                        <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: '600', margin: '8px 0 4px' }}>
                            1st floor, Aswathy Building, Main Road, Kollam.
                        </p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)' }}>
                            State-of-the-art laboratory for hardware prototyping, embedded systems design, and hands-on robotics workshops.
                        </p>
                    </div>

                    <div className="company-detail-card">
                        <div className="card-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                            <Phone size={28} />
                        </div>
                        <h3>Direct Contact & Support</h3>
                        <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: '600', margin: '8px 0 4px' }}>
                            Ph: +91 8075355024
                        </p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)' }}>
                            Reach out for workshop enrollments, bulk hardware component inquiries, or institutional collaborations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Capabilities */}
            <section id="services" className="products-section">
                <div className="section-header">
                    <h2>Core Capabilities & Offerings</h2>
                    <p>Building the foundation for next-generation roboticists and engineers.</p>
                </div>

                <div className="services-grid">
                    <div className="service-card">
                        <Cpu size={32} color="var(--ad-orange)" />
                        <h3>Hardware Component Supply</h3>
                        <p>High-grade sensors, microcontroller boards, motor drivers, and specialized robotics components for student and professional projects.</p>
                        <Link to="/shop" style={{ display: 'inline-block', marginTop: '16px', color: 'var(--ad-orange)', fontWeight: '700', fontSize: '0.9rem' }}>
                            Browse Store →
                        </Link>
                    </div>

                    <div className="service-card">
                        <Layers size={32} color="#60a5fa" />
                        <h3>Robotics & IoT Workshops</h3>
                        <p>Intensive hands-on training sessions covering microcontroller programming, sensor fusion, autonomous navigation, and embedded systems.</p>
                        <Link to="/register" style={{ display: 'inline-block', marginTop: '16px', color: '#60a5fa', fontWeight: '700', fontSize: '0.9rem' }}>
                            View Workshops →
                        </Link>
                    </div>

                    <div className="service-card">
                        <Sparkles size={32} color="#10b981" />
                        <h3>Hyperclass Collaboration</h3>
                        <p>Interactive real-time learning platform designed for live code execution, workshop analytics, and seamless trainer-student sync.</p>
                        <a href={HYPERCLASS_URL} style={{ display: 'inline-block', marginTop: '16px', color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>
                            Launch Hyperclass →
                        </a>
                    </div>

                    <div className="service-card">
                        <ShieldCheck size={32} color="#f59e0b" />
                        <h3>Verified Credentials</h3>
                        <p>Tamper-proof digital certificates issued to workshop graduates, instantly verifiable via our public validation portal.</p>
                        <Link to="/verify" style={{ display: 'inline-block', marginTop: '16px', color: '#f59e0b', fontWeight: '700', fontSize: '0.9rem' }}>
                            Verify Certificate →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Product Spotlight - Hyperclass */}
            <section id="products" className="products-section" style={{ paddingTop: 0 }}>
                <div className="product-card" onClick={() => window.location.href = HYPERCLASS_URL}>
                    <div className="product-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--ad-orange)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>FLAGSHIP PLATFORM</span>
                        </div>
                        <h3 style={{ fontSize: '2rem', color: '#fff', marginBottom: '12px' }}>Hyperclass Collaborative Workspace</h3>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                            The ultimate interactive workshop system built specifically for robotics engineers and live technical education.
                        </p>
                        <ul className="feature-list">
                            <li>Real-Time Live Code Sharing & Debugging</li>
                            <li>Interactive Polls & Hands-On Exercises</li>
                            <li>Automated Attendance & Participant Analytics</li>
                        </ul>
                        <span style={{ color: 'var(--ad-orange)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1rem' }}>
                            Explore Hyperclass Platform <ArrowRight size={18} />
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(5, 7, 10, 0.8)', borderRadius: '20px', padding: '40px', border: '1px solid var(--ad-border-navy)' }}>
                        <Logo size="large" showText={true} textSub="HYPERCLASS" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <Logo size="medium" showText={true} textSub="ROBOTICS" />
                    <div className="footer-reg-details">
                        <p><b>ADILITIX ROBOTICS</b> | Udyam Reg. No: <b>UDYAM-KL-06-0070364</b></p>
                        <p>1st floor, Aswathy Building, Main Road, Kollam. | Ph: <b>+91 8075355024</b></p>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
                        &copy; {new Date().getFullYear()} Adilitix Robotics. All rights reserved. Built for future-ready engineering.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
