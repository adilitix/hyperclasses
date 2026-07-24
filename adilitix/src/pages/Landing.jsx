import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Cpu, MapPin, Phone, Award, Layers, ExternalLink, Sparkles, Target, Zap, CheckCircle2, UserCheck, BookOpen, Users, Star, Briefcase, Box } from 'lucide-react';
import Logo from '../components/Logo';

const Landing = () => {
    const [isVisible, setIsVisible] = useState(false);

    const HYPERCLASS_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://hyperclass.adilitix.com';

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
                    <Link to="/programs" style={{ color: '#38bdf8', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={16} /> 🎓 College Brochure
                    </Link>
                    <Link to="/programs">Training & Internships</Link>
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
                        Best <span className="highlight">Robotics Workshops</span>, Training & <span className="highlight-navy">Product Development</span> in Kerala
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Adilitix Robotics is Kerala's premier robotics training center, project development company, and hardware prototyping hub in Kollam. Led by industry trainers with 7+ years of hands-on expertise.
                    </motion.p>
                    <div className="cta-group" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        <Link to="/programs" className="cta-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}>
                            🎓 COLLEGE BROCHURE & SYLLABI <ArrowRight size={18} />
                        </Link>
                        <Link to="/inquiry" className="cta-secondary">
                            Book a Workshop
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
                                <MapPin size={15} color="var(--ad-orange)" /> 1st Floor, Aswathy Building, Main Road, Kollam
                            </p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem', marginTop: '6px' }}>
                                <Phone size={14} color="#60a5fa" /> +91 8075355024
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Impact & Proof Stats Banner */}
            <section style={{ padding: '40px 8%', background: 'rgba(14, 26, 52, 0.7)', borderTop: '1px solid var(--ad-border-navy)', borderBottom: '1px solid var(--ad-border-navy)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--ad-orange)', fontWeight: '900', margin: 0 }}>7+ Years</h2>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', fontWeight: '600', marginTop: '4px' }}>Industry Expert Trainers</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', color: '#60a5fa', fontWeight: '900', margin: 0 }}>200+</h2>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', fontWeight: '600', marginTop: '4px' }}>Workshops Conducted</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', color: '#10b981', fontWeight: '900', margin: 0 }}>200+</h2>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', fontWeight: '600', marginTop: '4px' }}>Students Trained</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', color: '#f59e0b', fontWeight: '900', margin: 0 }}>100%</h2>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', fontWeight: '600', marginTop: '4px' }}>Practical Hands-On Focus</p>
                    </div>
                </div>
            </section>

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
                        <h3>Official Headquarters & Lab</h3>
                        <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: '600', margin: '8px 0 4px' }}>
                            1st Floor, Aswathy Building, Main Road, Kollam, Kerala, India.
                        </p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)' }}>
                            Full-fledged R&D center for product development, 3D printing prototyping, and robotics bootcamps.
                        </p>
                    </div>

                    <div className="company-detail-card">
                        <div className="card-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                            <UserCheck size={28} />
                        </div>
                        <h3>Expert Engineering Team</h3>
                        <p style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: '600', margin: '8px 0 4px' }}>
                            Led by Founder & CEO Aadil S P
                        </p>
                        <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)' }}>
                            7+ years of experience delivering industry-grade robotics training and embedded system design across Kerala.
                        </p>
                    </div>
                </div>
            </section>

            {/* Comprehensive Services: Workshops, Internships & Product Development */}
            <section className="products-section">
                <div className="section-header">
                    <h2>Robotics Training, Internships & Project Development</h2>
                    <p>Building functional physical prototypes with zero filler theory for students and institutions in Kollam & Kerala.</p>
                </div>

                <div className="services-grid">
                    <div className="service-card">
                        <BookOpen size={32} color="var(--ad-orange)" />
                        <h3>Robotics Workshops & Bootcamps</h3>
                        <p>Practical multi-day bootcamps for engineering colleges, polytechnics, and schools covering ESP32, bare-metal C/C++, and 2WD/4WD autonomous rovers.</p>
                        <Link to="/programs" style={{ display: 'inline-block', marginTop: '16px', color: 'var(--ad-orange)', fontWeight: '700' }}>
                            Explore Workshop Programs →
                        </Link>
                    </div>

                    <div className="service-card">
                        <Briefcase size={32} color="#60a5fa" />
                        <h3>Robotics & Edge AI Internships</h3>
                        <p>Industry-grade internships for B.Tech, CS, ECE, MCA, and Robotics students in Kerala. Master OpenCV computer vision, MediaPipe, and hardware PySerial bridging.</p>
                        <Link to="/programs" style={{ display: 'inline-block', marginTop: '16px', color: '#60a5fa', fontWeight: '700' }}>
                            Apply for Internships →
                        </Link>
                    </div>

                    <div className="service-card">
                        <Box size={32} color="#10b981" />
                        <h3>Product & Project Development</h3>
                        <p>Complete project development and product prototyping company in Kollam. 3D printing chassis design, PCB/embedded firmware, and custom Edge AI automation.</p>
                        <Link to="/inquiry" style={{ display: 'inline-block', marginTop: '16px', color: '#10b981', fontWeight: '700' }}>
                            Request R&D Proposal →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Core Differentiators - Why Choose Us */}
            <section className="products-section" style={{ paddingTop: 0 }}>
                <div className="section-header">
                    <h2>Why Adilitix Robotics Stands Out</h2>
                    <p>Empowering 200+ trained students with real-world engineering skills.</p>
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

            {/* Hyperclass Platform Banner */}
            <section id="products" className="products-section" style={{ paddingTop: 0 }}>
                <div className="product-card" onClick={() => window.location.href = HYPERCLASS_URL}>
                    <div className="product-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--ad-orange)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>INTEGRATED WORKSPACE</span>
                        </div>
                        <h3 style={{ fontSize: '2rem', color: '#fff', marginBottom: '12px' }}>Hyperclass Learning Workspace</h3>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                            Automated student registration, live code debugging, participant feedback loops, and digital certificate verification for 200+ workshops.
                        </p>
                        <ul className="feature-list">
                            <li>Real-Time Live Code Sharing</li>
                            <li>Automated Attendance & Analytics</li>
                            <li>Tamper-Proof Digital Certificate Verification</li>
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
                        <p><b>ADILITIX ROBOTICS</b> | Founder & CEO: <b>Aadil S P</b> (7+ Years Experience)</p>
                        <p>Premier Robotics Workshop, Training, Internship & Product Development Company in Kollam, Kerala.</p>
                        <p>Udyam Reg No: <b>UDYAM-KL-06-0070364</b> (MSME Registered Dec 10, 2025)</p>
                        <p>1st Floor, Aswathy Building, Main Road, Kollam, Kerala, India. | Ph: <b>+91 8075355024</b></p>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
                        &copy; {new Date().getFullYear()} Adilitix Robotics. All rights reserved. 200+ Workshops Conducted | 200+ Students Trained.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
