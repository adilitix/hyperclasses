import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, MapPin, Calendar, CheckCircle2, User, ShieldCheck, Cpu, Target, Rocket, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const About = () => {
    return (
        <div className="shop-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} color="var(--ad-orange)" /> Home
                </Link>
                <Logo size="small" showText={true} textSub="ABOUT US" />
                <Link to="/inquiry" className="nav-btn-subtle" style={{ color: 'var(--ad-orange)' }}>
                    Institutional Inquiry
                </Link>
            </nav>

            <div style={{ padding: '40px 8% 80px', maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <div className="udyam-badge" style={{ margin: '0 auto 16px' }}>
                        <Award size={16} /> MSME REGISTERED STARTUP
                    </div>
                    <h1 style={{ fontSize: '2.8rem', color: '#fff', fontWeight: '900', marginBottom: '16px' }}>
                        About <span className="highlight">Adilitix Robotics</span>
                    </h1>
                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7' }}>
                        Empowering students and institutions with hands-on, practical engineering, Edge AI, and autonomous robotics education.
                    </p>
                </header>

                {/* Founder & Leadership Spotlight */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="company-detail-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b00 0%, #ea580c 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.5rem' }}>
                                A
                            </div>
                            <div>
                                <h3 style={{ color: '#fff', fontSize: '1.4rem' }}>Aadil S P</h3>
                                <p style={{ color: 'var(--ad-orange)', fontWeight: '700', fontSize: '0.9rem' }}>Founder & CEO</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.98rem', lineHeight: '1.7' }}>
                            Founded by <b>Aadil S P</b>, Adilitix Robotics was established with a singular mission: to eliminate abstract, theory-only robotics education. We provide students and colleges with industry-standard hardware, embedded firmware mastery, and physical autonomous prototypes.
                        </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="company-detail-card">
                        <div className="card-icon-box" style={{ background: 'rgba(29, 59, 151, 0.2)', color: '#60a5fa', borderColor: 'var(--ad-border-navy)' }}>
                            <ShieldCheck size={28} />
                        </div>
                        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '8px' }}>Official MSME Startup</h3>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', lineHeight: '1.7', marginBottom: '16px' }}>
                            Government-registered Sole Proprietorship startup recognized under the Ministry of Micro, Small & Medium Enterprises (MSME).
                        </p>
                        <div style={{ background: 'rgba(5, 7, 10, 0.7)', padding: '12px', borderRadius: '10px', border: '1px solid var(--ad-border-navy)', color: 'var(--ad-orange)', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Udyam Reg. No: UDYAM-KL-06-0070364
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} /> Registered Date: December 10, 2025
                        </p>
                    </motion.div>
                </div>

                {/* Headquarters Location Card */}
                <div style={{ background: 'var(--ad-navy-card)', border: '1px solid var(--ad-border-navy)', borderRadius: '24px', padding: '40px', marginBottom: '60px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                        <MapPin size={28} color="var(--ad-orange)" />
                        <div>
                            <h2 style={{ color: '#fff', fontSize: '1.5rem' }}>Headquarters & Official Address</h2>
                            <p style={{ color: 'var(--ad-orange)', fontWeight: '600' }}>Kollam, Kerala, India</p>
                        </div>
                    </div>
                    <p style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '700', margin: '10px 0 6px' }}>
                        Viva Palace, Convent Road, Kollam, Kerala, India.
                    </p>
                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.95rem' }}>
                        Equipped facility for robotics development, hardware prototyping, 3D printing, embedded firmware engineering, and institutional workshops.
                    </p>
                </div>

                {/* Key Differentiators - Why Choose Us */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ color: '#fff', fontSize: '2rem', textAlign: 'center', marginBottom: '40px' }}>
                        Why Colleges & Institutions Choose Us
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div className="service-card">
                            <Target size={32} color="var(--ad-orange)" />
                            <h3>100% Practical & Project-Based</h3>
                            <p>Zero filler theory. Every student builds, wires, programs, and operates functional physical prototypes from day one.</p>
                        </div>
                        <div className="service-card">
                            <Cpu size={32} color="#60a5fa" />
                            <h3>Industry-Standard Stack</h3>
                            <p>Direct hands-on experience with modern microcontrollers (ESP32, FreeRTOS), OpenCV, MediaPipe, PySerial, and bare-metal C/C++.</p>
                        </div>
                        <div className="service-card">
                            <ShieldCheck size={32} color="#10b981" />
                            <h3>Government Recognized</h3>
                            <p>Recognized under MSME Udyam, ensuring formal institutional compliance, credit validation, and official certification.</p>
                        </div>
                    </div>
                </div>

                {/* R&D Consultancy */}
                <div className="product-card" style={{ cursor: 'default' }}>
                    <div className="product-info">
                        <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--ad-orange)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>TECHNICAL CONSULTANCY</span>
                        <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '12px 0' }}>R&D & Custom Engineering Consultancy</h2>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '20px' }}>
                            We partner with institutes and research projects for custom mechanical structure design, 3D printing/prototyping, embedded firmware engineering, and Edge AI vision integration.
                        </p>
                        <Link to="/inquiry" className="cta-primary">
                            Contact Founder / Request Proposal <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
