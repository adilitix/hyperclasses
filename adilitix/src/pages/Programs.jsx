import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Layers, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, Users, ShieldCheck, Zap } from 'lucide-react';
import Logo from '../components/Logo';

const Programs = () => {
    return (
        <div className="shop-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} color="var(--ad-orange)" /> Home
                </Link>
                <Logo size="small" showText={true} textSub="PROGRAMS" />
                <Link to="/inquiry" className="nav-btn-subtle" style={{ color: 'var(--ad-orange)' }}>
                    Book for College →
                </Link>
            </nav>

            <div style={{ padding: '40px 8% 80px', maxWidth: '1300px', margin: '0 auto' }}>
                <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <div className="udyam-badge" style={{ margin: '0 auto 16px' }}>
                        <BookOpen size={16} /> PRACTICAL ENGINEERING SYLLABUS
                    </div>
                    <h1 style={{ fontSize: '2.8rem', color: '#fff', fontWeight: '900', marginBottom: '16px' }}>
                        Educational Workshops & <span className="highlight">Signature Programs</span>
                    </h1>
                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto', lineHeight: '1.7' }}>
                        100% project-based, hands-on training engineered for schools, polytechnics, and engineering institutions. Zero filler theory—focus on functional physical prototypes from day one.
                    </p>
                </header>

                {/* Core Domains Overview Grid */}
                <div style={{ marginBottom: '70px' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap color="var(--ad-orange)" size={24} /> Technical Core Domains Covered
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div className="service-card">
                            <Cpu size={28} color="var(--ad-orange)" />
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '12px 0 8px' }}>Embedded & Microcontrollers</h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                                Low-level C/C++ bare-metal programming, ISR interrupts, multi-core ESP32/Arduino architecture, and FreeRTOS RTOS task scheduling.
                            </p>
                        </div>
                        <div className="service-card">
                            <Layers size={28} color="#60a5fa" />
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '12px 0 8px' }}>Robotics & Actuation</h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                                2WD & 4WD autonomous rover mechanics, linkage kinematics, motor driver control, high-density foam chassis fabrication, and 3D prototyping.
                            </p>
                        </div>
                        <div className="service-card">
                            <Sparkles size={28} color="#10b981" />
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '12px 0 8px' }}>Edge AI & Computer Vision</h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                                Python vision pipelines using OpenCV & MediaPipe (real-time object tracking, ArUco marker navigation, gesture control, facial presence).
                            </p>
                        </div>
                        <div className="service-card">
                            <ShieldCheck size={28} color="#f59e0b" />
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '12px 0 8px' }}>Hardware-Software Integration</h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                                High-speed PySerial communication protocols bridging PC-based computer vision software with real-time hardware microcontrollers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Signature Programs Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Program 1: RoboMaker Summer Camp */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="product-card">
                        <div className="product-info" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--ad-orange)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>SIGNATURE BOOTCAMP</span>
                                <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 50 Hours Intensive</span>
                            </div>
                            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '12px' }}>RoboMaker Summer Camp</h2>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                Designed for <b>School & Early-College Students</b>. A 50-hour hands-on journey covering foundational electronics, digital prototyping, chassis fabrication, and Edge AI tracking.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ background: 'rgba(5, 7, 10, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ad-border-navy)' }}>
                                    <h4 style={{ color: 'var(--ad-orange)', fontSize: '0.95rem', marginBottom: '6px' }}>Module 1: Fabrication</h4>
                                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>High-density foam chassis cutting, motor mounting, power regulation, and mechanical linkage assembly.</p>
                                </div>
                                <div style={{ background: 'rgba(5, 7, 10, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ad-border-navy)' }}>
                                    <h4 style={{ color: '#60a5fa', fontSize: '0.95rem', marginBottom: '6px' }}>Module 2: Firmware</h4>
                                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>Microcontroller programming, PWM motor speed modulation, sensor interfacing, and obstacle avoidance.</p>
                                </div>
                                <div style={{ background: 'rgba(5, 7, 10, 0.7)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ad-border-navy)' }}>
                                    <h4 style={{ color: '#10b981', fontSize: '0.95rem', marginBottom: '6px' }}>Module 3: Edge AI Vision</h4>
                                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>OpenCV gesture tracking, color-based object pursuit, and PySerial PC-to-rover real-time control.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <Link to="/inquiry" className="cta-primary">
                                    Request RoboMaker Proposal <ArrowRight size={18} />
                                </Link>
                                <Link to="/register" className="cta-secondary">
                                    Enroll Individual Student
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Program 2: The Robotics Blueprint */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="product-card">
                        <div className="product-info" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ background: 'rgba(29, 59, 151, 0.3)', color: '#60a5fa', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>COLLEGE / POLYTECHNIC</span>
                                <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> Engineering Depts</span>
                            </div>
                            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '12px' }}>The Robotics Blueprint</h2>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                Tailored for <b>Engineering Colleges & Polytechnic Departments</b>. Deep-dive autonomous robotics, telemetry, bare-metal ESP32 programming, and computer vision integration.
                            </p>
                            <ul className="feature-list" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '10px 20px', marginBottom: '24px' }}>
                                <li>Bare-Metal C/C++ & Interrupt Handlers</li>
                                <li>Multi-Core Task Management with FreeRTOS</li>
                                <li>ArUco Marker Autonomous Navigation</li>
                                <li>MediaPipe Facial & Hand Telemetry</li>
                                <li>Custom Chassis CAD Prototyping</li>
                                <li>PySerial Microcontroller Communication</li>
                            </ul>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <Link to="/inquiry" className="cta-primary">
                                    Book Blueprint for College <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Program 3: Custom Institutional Bootcamps & VACs */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="product-card">
                        <div className="product-info" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>ACADEMIC COMPLIANCE</span>
                                <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>Credit-Based VAC</span>
                            </div>
                            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '12px' }}>Custom Institutional Bootcamps & VACs</h2>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                Value Added Courses (VAC) structured specifically for <b>Computer Science, ECE, MCA, and Robotics Departments</b>. Aligned with MSME startup certification standards.
                            </p>
                            <p style={{ color: '#f8fafc', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.7' }}>
                                All participants receive official Udyam-recognized <b>Adilitix Robotics Certificates</b> verifiable through our digital verification portal.
                            </p>
                            <Link to="/inquiry" className="cta-primary">
                                Request Custom Curriculum & Proposal <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Programs;
