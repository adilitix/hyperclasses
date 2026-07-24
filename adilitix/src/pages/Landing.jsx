import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, MapPin, Phone, UserCheck, BookOpen, Cpu, Layers, Sparkles, ShieldCheck, Zap, Box, Printer, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

const Landing = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="adilitix-container" style={{ background: '#05070a' }}>
            {/* Corporate Navigation Header */}
            <nav className="navbar" style={{ background: 'rgba(5, 7, 10, 0.92)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Link to="/">
                    <Logo size="medium" showText={true} textSub="ROBOTICS" />
                </Link>
                <div className="nav-links">
                    <Link to="/programs" style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={16} /> Academic Brochure
                    </Link>
                    <Link to="/programs">Training & Syllabi</Link>
                    <Link to="/about">About Enterprise</Link>
                    <Link to="/shop">Hardware Store</Link>
                    <Link to="/verify">Verify Certificate</Link>
                    <Link to="/inquiry" className="nav-btn-subtle" style={{ color: 'var(--ad-orange)', border: '1px solid var(--ad-orange)' }}>
                        Institutional Inquiry
                    </Link>
                </div>
            </nav>

            {/* Corporate Hero Section */}
            <header className={`hero ${isVisible ? 'fade-in' : ''}`} style={{ padding: '80px 8% 60px' }}>
                <div className="hero-content" style={{ maxWidth: '720px' }}>
                    <div className="udyam-badge" style={{ background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.25)', color: 'var(--ad-orange)', fontSize: '0.8rem', padding: '6px 14px', borderRadius: '30px' }}>
                        <Award size={15} /> MSME REGISTERED ENTERPRISE: UDYAM-KL-06-0070364
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.18, color: '#ffffff', margin: '20px 0 16px', letterSpacing: '-0.5px' }}
                    >
                        Autonomous Robotics Systems & <br />
                        <span style={{ color: 'var(--ad-orange)' }}>Technical Education</span> for Institutions
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '28px' }}
                    >
                        Adilitix Robotics is an MSME-registered technology enterprise delivering industry-standard technical training, autonomous robotics education, and custom engineering product development for educational institutions and corporate clients.
                    </motion.p>

                    <div className="cta-group" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        <Link to="/programs" className="cta-primary" style={{ background: 'linear-gradient(135deg, #f97316, #dd6b20)', border: 'none', padding: '12px 24px', fontSize: '0.92rem', fontWeight: 700, borderRadius: '8px' }}>
                            🎓 VIEW COLLEGE BROCHURE & SYLLABI <ArrowRight size={17} />
                        </Link>
                        <Link to="/inquiry" className="cta-secondary" style={{ padding: '12px 24px', fontSize: '0.92rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}>
                            SUBMIT INSTITUTIONAL INQUIRY
                        </Link>
                    </div>
                </div>

                {/* Corporate Enterprise Card */}
                <div className="hero-image">
                    <div className="company-card-hero" style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '16px', padding: '24px' }}>
                        <Logo size="small" showText={true} textSub="ROBOTICS" />
                        <div style={{ margin: '14px 0', height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
                        <p style={{ color: 'var(--ad-orange)', fontWeight: '700', fontSize: '0.88rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <UserCheck size={16} /> Founder & CEO: Aadil S P
                        </p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontWeight: '500', fontSize: '0.85rem', marginBottom: '6px' }}>
                            <MapPin size={15} color="var(--ad-orange)" /> 1st Floor, Aswathy Building, Main Road, Kollam, Kerala
                        </p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem' }}>
                            <Phone size={14} color="#38bdf8" /> Direct Hotline: +91 8075355024
                        </p>
                    </div>
                </div>
            </header>

            {/* Corporate Proof Banner */}
            <section style={{ padding: '36px 8%', background: 'rgba(11, 17, 32, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--ad-orange)', fontWeight: 900, margin: 0 }}>7+ Years</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Engineering Trainer Experience</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', color: '#38bdf8', fontWeight: 900, margin: 0 }}>200+</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Institutional Workshops Conducted</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', color: '#10b981', fontWeight: 900, margin: 0 }}>200+</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Students Trained</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', color: '#f59e0b', fontWeight: 900, margin: 0 }}>MSME</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Government Verified Enterprise</p>
                    </div>
                </div>
            </section>

            {/* FEATURED SHOWCASE 1: Unitree Go2 Pro Quadruped Robot */}
            <section style={{ padding: '80px 8%', maxWidth: '1250px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38bdf8', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
                            🐕 ADVANCED HARDWARE EXPERIENCE TRACK
                        </div>
                        <h2 style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
                            Enhance Your Workshop with the <span style={{ color: '#38bdf8' }}>Unitree Go2 Pro</span>
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '20px' }}>
                            Every 3-day institutional workshop includes a complimentary interactive showcase and live field demonstration of our industrial quadruped robot, the <strong>Unitree Go2 Pro</strong>.
                        </p>
                        <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: 0, listStyle: 'none', marginBottom: '28px' }}>
                            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={16} color="#38bdf8" /> Real-time spatial tracking camera & LiDAR breakdown
                            </li>
                            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={16} color="#38bdf8" /> Multi-sensor telemetry arrays & dynamic balance kinematics
                            </li>
                            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={16} color="#38bdf8" /> Live field demonstration & student interaction session
                            </li>
                        </ul>
                        <Link to="/inquiry" className="cta-primary" style={{ background: '#38bdf8', color: '#05070a', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, padding: '10px 20px', borderRadius: '8px', fontSize: '0.88rem' }}>
                            Include Unitree Go2 Pro in Your Program <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                        <img src="/unitree_go2_pro.jpg" alt="Unitree Go2 Pro Quadruped Robot" style={{ width: '100%', height: '360px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(5,7,10,0.95), transparent)', padding: '20px' }}>
                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>Unitree Go2 Pro Quadruped Robot</div>
                            <div style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>Industrial Autonomous Quadruped Demonstration Track</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED SHOWCASE 2: On-Site 3D Printing & Prototyping Infrastructure */}
            <section style={{ padding: '80px 8%', background: 'rgba(11, 17, 32, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.25)', color: 'var(--ad-orange)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
                            🖨️ ON-SITE FABRICATION & PROTOTYPING INFRASTRUCTURE
                        </div>
                        <h2 style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 900 }}>
                            On-Site Additive Manufacturing & <span style={{ color: 'var(--ad-orange)' }}>Custom 3D Printing</span>
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '750px', margin: '12px auto 0', lineHeight: 1.6 }}>
                            Adilitix Robotics brings industrial-grade 3D printers directly to host campuses for hands-on fabrication masterclasses, alongside custom high-precision 3D printing services for institutions, student projects, and industrial clients.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
                        {/* Bambu Lab P1S Combo */}
                        <div style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <img src="/bambulab_p1s.jpg" alt="Bambu Lab P1S Combo 3D Printer" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ad-orange)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Industrial Production</span>
                                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, margin: '6px 0 10px' }}>Bambu Lab P1S Combo</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
                                    Enclosed high-speed CoreXY 3D printer with Automatic Material System (AMS) for multi-color engineering parts, carbon fiber filaments, and precision prototypes brought on-site.
                                </p>
                                <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                                    ✓ On-Site Campus Production Setup
                                </div>
                            </div>
                        </div>

                        {/* Bambu Lab A1 Mini */}
                        <div style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            <img src="/bambulab_a1_mini.jpg" alt="Bambu Lab A1 Mini 3D Printer" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>High-Speed Iteration</span>
                                <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, margin: '6px 0 10px' }}>Bambu Lab A1 Mini</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
                                    Precision high-speed desktop 3D printer with AMS Lite multi-filament support for rapid student prototyping, component casing iteration, and mechanical joint testing.
                                </p>
                                <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                                    ✓ Rapid Student Iteration Workbench
                                </div>
                            </div>
                        </div>

                        {/* Custom 3D Printing & Prototyping Services */}
                        <div style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manufacturing Service</span>
                                <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800, margin: '8px 0 12px' }}>Custom 3D Printing & Fabrication Services</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                                    Get custom 3D printed parts, CAD design optimization, and hardware prototyping done by Adilitix Robotics. We fabricate precision parts for engineering student final-year projects, research labs, and industrial clients.
                                </p>
                                <ul style={{ color: '#cbd5e1', fontSize: '0.85rem', paddingLeft: 0, listStyle: 'none', lineHeight: 1.8 }}>
                                    <li>✓ High-Precision PLA, PETG & Carbon Fiber Prints</li>
                                    <li>✓ CAD Modeling & Parametric Enclosure Design</li>
                                    <li>✓ Fast Turnaround for Institutional & Student Projects</li>
                                </ul>
                            </div>
                            <Link to="/inquiry" className="cta-primary" style={{ marginTop: '24px', background: 'linear-gradient(135deg, #f97316, #dd6b20)', border: 'none', textAlign: 'center', display: 'block', padding: '12px', fontSize: '0.88rem', fontWeight: 800, borderRadius: '8px' }}>
                                ORDER CUSTOM 3D PRINTS / PROTOTYPES
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Institutional Technical Domains */}
            <section style={{ padding: '80px 8%', maxWidth: '1250px', margin: '0 auto' }}>
                <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap color="var(--ad-orange)" size={24} /> Institutional Technical Training Domains
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div className="service-card" style={{ background: 'rgba(11, 17, 32, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '14px' }}>
                        <Cpu size={28} color="var(--ad-orange)" />
                        <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '14px 0 8px', fontWeight: 800 }}>Embedded Systems & ESP32</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                            Bare-metal C/C++ programming, Wi-Fi communication stacks, timer interrupts, ESP32 multi-core architecture, and hardware PWM motor drivers.
                        </p>
                    </div>
                    <div className="service-card" style={{ background: 'rgba(11, 17, 32, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '14px' }}>
                        <Layers size={28} color="#38bdf8" />
                        <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '14px 0 8px', fontWeight: 800 }}>Autonomous Mobile & Fixed Robotics</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                            2WD/4WD autonomous rovers, differential drive kinematics, multi-axis desktop robotic arm manipulators, and automated pick-and-place sorting loops.
                        </p>
                    </div>
                    <div className="service-card" style={{ background: 'rgba(11, 17, 32, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '14px' }}>
                        <Sparkles size={28} color="#10b981" />
                        <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '14px 0 8px', fontWeight: 800 }}>AI, Computer Vision & MediaPipe</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                            Python OpenCV image processing, Google MediaPipe hand landmark tracking, facial boundary profiling, and PySerial vision-guided hardware control loops.
                        </p>
                    </div>
                    <div className="service-card" style={{ background: 'rgba(11, 17, 32, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '24px', borderRadius: '14px' }}>
                        <Printer size={28} color="#f59e0b" />
                        <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: '14px 0 8px', fontWeight: 800 }}>Additive Manufacturing & 3D Printing</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5 }}>
                            Code-based OpenSCAD parametric modeling, slicer calibration math, 3D printer mechanical troubleshooting, and Tech Entrepreneurship lectures.
                        </p>
                    </div>
                </div>
            </section>

            {/* Corporate Callout Footer Section */}
            <section style={{ padding: '60px 8%', background: 'rgba(11, 17, 32, 0.9)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', color: '#fff', fontWeight: 900, marginBottom: '14px' }}>Partner with Adilitix Robotics</h2>
                    <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '28px' }}>
                        Transform technical education at your college or institution with our MSME-verified engineering workshops, industrial hardware tracks, and custom prototyping services.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/programs" className="cta-primary" style={{ background: 'linear-gradient(135deg, #f97316, #dd6b20)', border: 'none', padding: '12px 28px', fontSize: '0.92rem', fontWeight: 700, borderRadius: '8px' }}>
                            EXPLORE ACADEMIC SYLLABI & PROPOSALS
                        </Link>
                        <Link to="/inquiry" className="cta-secondary" style={{ padding: '12px 28px', fontSize: '0.92rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                            CONTACT ENGINEERING TEAM
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
