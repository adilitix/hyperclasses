import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Layers, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, Users, ShieldCheck, Zap, Briefcase, Award, Star } from 'lucide-react';
import Logo from '../components/Logo';

const Programs = () => {
    return (
        <div className="shop-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} color="var(--ad-orange)" /> Home
                </Link>
                <Logo size="small" showText={true} textSub="TRAINING & INTERNSHIPS" />
                <Link to="/inquiry" className="nav-btn-subtle" style={{ color: 'var(--ad-orange)' }}>
                    Book for Institution →
                </Link>
            </nav>

            <div style={{ padding: '40px 8% 80px', maxWidth: '1300px', margin: '0 auto' }}>
                <header style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <div className="udyam-badge" style={{ margin: '0 auto 16px' }}>
                        <Award size={16} /> INDUSTRY-GRADE ROBOTICS TRAINING & INTERNSHIPS
                    </div>
                    <h1 style={{ fontSize: '2.8rem', color: '#fff', fontWeight: '900', marginBottom: '16px' }}>
                        Best Robotics Training & <span className="highlight">Internships in Kerala</span>
                    </h1>
                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.15rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7' }}>
                        Led by trainers with <b>7+ years of industry experience</b>, <b>200+ workshops successfully conducted</b>, and <b>200+ students trained</b> across engineering colleges and technical institutes in Kollam & Kerala.
                    </p>
                </header>

                {/* Proof Stats */}
                <div style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '20px', padding: '24px', marginBottom: '60px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', textAlign: 'center' }}>
                        <div>
                            <span style={{ color: 'var(--ad-orange)', fontSize: '2.2rem', fontWeight: '900' }}>7+ Years</span>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>Trainer Expertise</p>
                        </div>
                        <div>
                            <span style={{ color: '#60a5fa', fontSize: '2.2rem', fontWeight: '900' }}>200+</span>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>Workshops Conducted</p>
                        </div>
                        <div>
                            <span style={{ color: '#10b981', fontSize: '2.2rem', fontWeight: '900' }}>200+</span>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>Students Trained</p>
                        </div>
                        <div>
                            <span style={{ color: '#f59e0b', fontSize: '2.2rem', fontWeight: '900' }}>MSME</span>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>Government Recognized</p>
                        </div>
                    </div>
                </div>

                {/* Core Domains Overview Grid */}
                <div style={{ marginBottom: '70px' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Zap color="var(--ad-orange)" size={24} /> Industry-Grade Technical Core Domains
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div className="service-card">
                            <Cpu size={28} color="var(--ad-orange)" />
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '12px 0 8px' }}>Embedded Systems & Microcontrollers</h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                                Bare-metal C/C++ programming, ISR interrupts, ESP32 multi-core architecture, and FreeRTOS task scheduling.
                            </p>
                        </div>
                        <div className="service-card">
                            <Layers size={28} color="#60a5fa" />
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '12px 0 8px' }}>Robotics Mechanics & Actuation</h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                                2WD/4WD autonomous rovers, motor drivers, high-density foam chassis fabrication, and 3D printing prototyping in Kollam.
                            </p>
                        </div>
                        <div className="service-card">
                            <Sparkles size={28} color="#10b981" />
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '12px 0 8px' }}>Edge AI & Computer Vision</h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                                Python OpenCV & MediaPipe vision pipelines (object tracking, ArUco navigation, gesture control, facial detection).
                            </p>
                        </div>
                        <div className="service-card">
                            <ShieldCheck size={28} color="#f59e0b" />
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '12px 0 8px' }}>Hardware-Software PySerial Integration</h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                                High-speed PySerial communications connecting computer vision software with real-time hardware microcontrollers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Signature Programs Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Program 1: Robotics Internships & Project Development */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="product-card">
                        <div className="product-info" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>INDUSTRY INTERNSHIP</span>
                                <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={14} /> Kollam & Kerala</span>
                            </div>
                            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '12px' }}>Robotics & Edge AI Internships</h2>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                Hands-on internship program for <b>B.Tech, Polytechnic, CS, ECE, MCA, and Robotics students</b> in Kerala. Work directly under trainers with 7+ years of experience on real hardware & product development projects.
                            </p>
                            <ul className="feature-list" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '10px 20px', marginBottom: '24px' }}>
                                <li>Real Industrial Project Development</li>
                                <li>Bare-Metal C/C++ & ESP32 Prototyping</li>
                                <li>Edge AI & OpenCV Vision Algorithms</li>
                                <li>3D Chassis Fabrication & Mechanical Assembly</li>
                                <li>Official MSME Government Internship Certificate</li>
                                <li>Digital Credential Verification on adilitix.com</li>
                            </ul>
                            <Link to="/inquiry" className="cta-primary">
                                Apply for Robotics Internship <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Program 2: RoboMaker Summer Camp */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="product-card">
                        <div className="product-info" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: 'var(--ad-orange)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>SIGNATURE BOOTCAMP</span>
                                <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 50 Hours Intensive</span>
                            </div>
                            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '12px' }}>RoboMaker Summer Camp</h2>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                Designed for <b>School & Early-College Students</b>. A 50-hour hands-on bootcamp covering foundational electronics, digital prototyping, foam chassis fabrication, and OpenCV Edge AI tracking.
                            </p>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <Link to="/inquiry" className="cta-primary">
                                    Book RoboMaker Camp <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Program 3: The Robotics Blueprint */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="product-card">
                        <div className="product-info" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ background: 'rgba(29, 59, 151, 0.3)', color: '#60a5fa', padding: '4px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' }}>COLLEGE WORKSHOP</span>
                                <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={14} /> Engineering Depts</span>
                            </div>
                            <h2 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '12px' }}>The Robotics Blueprint</h2>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '20px' }}>
                                Tailored for <b>Engineering Colleges & Polytechnic Departments</b>. Deep-dive autonomous robotics, sensor telemetry, bare-metal ESP32 programming, and computer vision integration.
                            </p>
                            <Link to="/inquiry" className="cta-primary">
                                Book Blueprint for College <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Programs;
