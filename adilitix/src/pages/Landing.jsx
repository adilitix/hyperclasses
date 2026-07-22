import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, MapPin, Phone, Award, Layers, ExternalLink, Sparkles, Target, Zap, CheckCircle2, UserCheck, BookOpen } from 'lucide-react';
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
            {/* Navigation Header */}
            <nav className="navbar">
                <Link to="/">
                    <Logo size="medium" showText={true} textSub="ROBOTICS" />
                </Link>
                <div className="nav-links">
                    <Link to="/programs">Programs & VAC</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/shop">Hardware Store</Link>
                    <Link to="/verify">Verify Cert</Link>
                    <Link to="/inquiry" className="nav-btn-subtle" style={{ color: 'var(--ad-orange)' }}>
                        Book Workshop
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className={`hero ${isVisible ? 'fade-in' : ''}`}>
                <div className="hero-content">
                    <div className="udyam-badge">
                        <Award size={16} /> MSME Govt Reg: UDYAM-KL-06-0070364
                    </div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Empowering Hands-On <span className="highlight">Engineering</span>, Edge AI & <span className="highlight-navy">Robotics</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Adilitix Robotics empowers students and educational institutions with 100% practical, project-based engineering, Edge AI vision, and autonomous robotics education.
                    </motion.p>
                    <div className="cta-group">
                        <Link to="/inquiry" className="cta-primary">
                            Book a Workshop for Your College / School <ArrowRight size={18} />
                        </Link>
                        <Link to="/programs" className="cta-secondary">
                            Explore Signature Programs
                        </Link>
                    </div>
                </div>

                {/* Hero Card & Visual */}
                <div className="hero-image">
                    <div className="robot-sphere">
                        <div className="company-card-hero">
                            <Logo size="small" showText={true} textSub="ROBOTICS" />
                            <div style={{ margin: '14px 0 10px', height: '1px', background: 'var(--ad-border-navy)' }}></div>
                            <p style={{ color: 'var(--ad-orange)', fontWeight: '800', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <UserCheck size={16} /> Founder & CEO: Aadil S P
                            </p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc', fontWeight: '600', fontSize: '0.82rem' }}>
                                <MapPin size={15} color="var(--ad-orange)" /> Viva Palace, Convent Road, Kollam
                            </p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem', marginTop: '6px' }}>
                                <Phone size={14} color="#60a5fa" /> +91 8075355024
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Official Enterprise Banner */}
            <section className="company-details-section">
                <div className="company-details-grid">
                    <div className="company-detail-card">
                        <div className="card-icon-box">
                            <Award size={28} />
                        </div>
                        <h3>Govt-Recognized MSME Startup</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--ad-text-dim)', margin: '8px 0 14px' }}>
                            Sole Proprietorship startup recognized under Ministry of Micro, Small & Medium Enterprises.
                        </p>
                        <div style={{ background: 'rgba(5, 7, 10, 0.7)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--ad-border-navy)', color: 'var(--ad-orange)', fontFamily: 'monospace', fontSize: '0.88rem', fontWeight: 'bold' }}>
                            UDYAM-KL-06-0070364
                        </div>
                    </div>

                    <div className="company-detail-card">
                        <div className="card-icon-box" style={{ background: 'rgba(29, 59, 151, 0.2)', color: '#60a5fa', borderColor: 'var(--ad-border-navy)' }}>
                            <MapPin size={28} />
                        </div>
                        <h3>Headquarters & Workshop Lab</h3>
                        <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: '600', margin: '8px 0 4px' }}>
                            Viva Palace, Convent Road, Kollam, Kerala, India.
                        </p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)' }}>
                            R&D facility for hardware prototyping, embedded firmware engineering, and institutional workshops.
                        </p>
                    </div>

                    <div className="company-detail-card">
                        <div className="card-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                            <UserCheck size={28} />
                        </div>
                        <h3>Executive Leadership</h3>
                        <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: '600', margin: '8px 0 4px' }}>
                            Founder & CEO: Aadil S P
                        </p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)' }}>
                            Direct oversight on workshop curriculum, bare-metal ESP32 programming, and institutional collaborations.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Differentiators - Why Choose Us */}
            <section className="products-section">
                <div className="section-header">
                    <h2>Why Choose Adilitix Robotics</h2>
                    <p>Building functional physical prototypes from day one with zero filler theory.</p>
                </div>

                <div className="services-grid">
                    <div className="service-card">
                        <Target size={32} color="var(--ad-orange)" />
                        <h3>100% Practical & Project-Based</h3>
                        <p>Zero filler theory; focus on assembling, wiring, and programming functional physical prototypes from day one.</p>
                    </div>

                    <div className="service-card">
                        <Cpu size={32} color="#60a5fa" />
                        <h3>Industry-Standard Tech Stack</h3>
                        <p>Hands-on experience with ESP32 microcontrollers, bare-metal C/C++, FreeRTOS, OpenCV, MediaPipe, and PySerial protocols.</p>
                    </div>

                    <div className="service-card">
                        <ShieldCheck size={32} color="#10b981" />
                        <h3>Government Compliance & Certs</h3>
                        <p>Recognized under MSME Udyam, providing formal academic compliance, VAC credits, and verifiable digital certificates.</p>
                    </div>
                </div>
            </section>

            {/* Signature Programs Overview */}
            <section className="products-section" style={{ paddingTop: 0 }}>
                <div className="section-header">
                    <h2>Signature Educational Programs</h2>
                    <p>Designed for colleges, polytechnics, and school students.</p>
                </div>

                <div className="services-grid">
                    <div className="service-card">
                        <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--ad-orange)', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800' }}>50-HOUR BOOTCAMP</span>
                        <h3 style={{ marginTop: '10px' }}>RoboMaker Summer Camp</h3>
                        <p>Designed for school & early-college students. Digital prototyping, chassis fabrication, and OpenCV Edge AI pursuit.</p>
                        <Link to="/programs" style={{ display: 'inline-block', marginTop: '16px', color: 'var(--ad-orange)', fontWeight: '700' }}>
                            View Program Details →
                        </Link>
                    </div>

                    <div className="service-card">
                        <span style={{ background: 'rgba(29, 59, 151, 0.3)', color: '#60a5fa', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800' }}>ENGINEERING DEPTS</span>
                        <h3 style={{ marginTop: '10px' }}>The Robotics Blueprint</h3>
                        <p>Deep-dive autonomous robotics for college engineering departments. Telemetry, FreeRTOS, and ArUco marker navigation.</p>
                        <Link to="/programs" style={{ display: 'inline-block', marginTop: '16px', color: '#60a5fa', fontWeight: '700' }}>
                            View Program Details →
                        </Link>
                    </div>

                    <div className="service-card">
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800' }}>ACADEMIC VAC</span>
                        <h3 style={{ marginTop: '10px' }}>Institutional VAC Courses</h3>
                        <p>Credit-based specialized courses tailored for Computer Science, ECE, MCA, and Robotics departments.</p>
                        <Link to="/inquiry" style={{ display: 'inline-block', marginTop: '16px', color: '#10b981', fontWeight: '700' }}>
                            Request Proposal →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Hyperclass Platform Banner */}
            <section id="products" className="products-section" style={{ paddingTop: 0 }}>
                <div className="product-card" onClick={() => window.location.href = HYPERCLASS_URL}>
                    <div className="product-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--ad-orange)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>INTEGRATED PLATFORM</span>
                        </div>
                        <h3 style={{ fontSize: '2rem', color: '#fff', marginBottom: '12px' }}>Hyperclass Learning Workspace</h3>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                            Automated student registration, live code debugging, participant feedback loops, and digital certificate verification.
                        </p>
                        <ul className="feature-list">
                            <li>Real-Time Live Code Sharing</li>
                            <li>Automated Attendance & Analytics</li>
                            <li>Tamper-Proof Certificate Generation</li>
                        </ul>
                        <span style={{ color: 'var(--ad-orange)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1rem' }}>
                            Launch Hyperclass Workspace <ArrowRight size={18} />
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
                        <p><b>ADILITIX ROBOTICS</b> | Founder & CEO: <b>Aadil S P</b></p>
                        <p>Udyam Reg No: <b>UDYAM-KL-06-0070364</b> (MSME Registered Dec 10, 2025)</p>
                        <p>Viva Palace, Convent Road, Kollam, Kerala, India. | Ph: <b>+91 8075355024</b></p>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
                        &copy; {new Date().getFullYear()} Adilitix Robotics. All rights reserved. Empowering future-ready engineering.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
