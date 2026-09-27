import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, MapPin, Phone, UserCheck, BookOpen, Cpu, Layers, Sparkles, ShieldCheck, Zap, Box, Printer, CheckCircle2, Calendar, PartyPopper, Menu, X } from 'lucide-react';
import Logo from '../components/Logo';

const Landing = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="adilitix-container" style={{ background: '#05070a' }}>
            {/* Corporate Navigation Header */}
            <nav className="navbar" style={{ background: 'rgba(5, 7, 10, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 1000 }}>
                <Link to="/" onClick={() => setMobileOpen(false)}>
                    <Logo size="medium" showText={true} textSub="ROBOTICS" />
                </Link>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle Navigation Menu"
                >
                    {mobileOpen ? <X size={26} color="#f97316" /> : <Menu size={26} color="#fff" />}
                </button>

                {/* Navigation Links */}
                <div className={`nav-links ${mobileOpen ? 'mobile-open' : ''}`}>
                    <Link to="/programs" onClick={() => setMobileOpen(false)} style={{ color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={16} /> Academic Brochure
                    </Link>
                    <Link to="/shop" onClick={() => setMobileOpen(false)}>Hardware Store</Link>
                    <Link to="/about" onClick={() => setMobileOpen(false)}>About Enterprise</Link>
                    <Link to="/verify" onClick={() => setMobileOpen(false)}>Verify Certificate</Link>
                    <Link to="/inquiry" onClick={() => setMobileOpen(false)} className="nav-btn-subtle" style={{ color: 'var(--ad-orange)', border: '1px solid var(--ad-orange)' }}>
                        Request Inquiry
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
                        style={{ fontWeight: 900, lineHeight: 1.18, color: '#ffffff', margin: '20px 0 16px', letterSpacing: '-0.5px' }}
                    >
                        Autonomous Systems, Event Rentals & <br className="desktop-only-br" />
                        <span style={{ color: 'var(--ad-orange)' }}>Custom Hardware Prototyping</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        style={{ color: '#94a3b8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '28px' }}
                    >
                        Adilitix Robotics is a premier technology enterprise specializing in high-tech quadruped robot rentals for corporate events & exhibitions, precision 3D printing & CAD prototyping, and institutional technical education.
                    </motion.p>

                    <div className="cta-group">
                        <a href="#event-rentals" className="cta-primary" style={{ background: 'linear-gradient(135deg, #f97316, #dd6b20)', border: 'none', padding: '12px 24px', fontSize: '0.92rem', fontWeight: 700, borderRadius: '8px' }}>
                            🐕 ROBOT DOG EVENT RENTALS <ArrowRight size={17} />
                        </a>
                        <a href="#prototyping" className="cta-secondary" style={{ padding: '12px 24px', fontSize: '0.92rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}>
                            🖨️ CUSTOM 3D PRINTING
                        </a>
                        <Link to="/programs" style={{ padding: '12px 20px', fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            🎓 Academic Workshops →
                        </Link>
                    </div>
                </div>

                {/* Corporate Enterprise Details Card */}
                <div className="hero-image">
                    <div className="company-card-hero">
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

            {/* Corporate Enterprise Proof Banner */}
            <section style={{ padding: '32px 8%', background: 'rgba(11, 17, 32, 0.6)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', color: 'var(--ad-orange)', fontWeight: 900, margin: 0 }}>7+ Years</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Industry Engineering Leadership</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', color: '#38bdf8', fontWeight: 900, margin: 0 }}>200+</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Successful Projects & Exhibitions</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '2.2rem', color: '#10b981', fontWeight: 900, margin: 0 }}>MSME</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Government Registered Enterprise</p>
                    </div>
                </div>
            </section>

            {/* SHOWCASE 1: Unitree Go2 Pro Quadruped Robot - Event Rentals & Exhibitions */}
            <section id="event-rentals" style={{ padding: '80px 8%', maxWidth: '1250px', margin: '0 auto' }}>
                <div className="responsive-grid-2col">
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.25)', color: 'var(--ad-orange)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px' }}>
                            🐕 ROBOTIC DOG EVENT RENTALS & EXHIBITIONS
                        </div>
                        <h2 style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 900, lineHeight: 1.2, marginBottom: '16px' }}>
                            Hire the <span style={{ color: 'var(--ad-orange)' }}>Unitree Go2 Pro</span> for Events, Expos & Weddings
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '20px' }}>
                            Elevate your event with a live autonomous quadruped robot demonstration. We provide the <strong>Unitree Go2 Pro</strong> with an expert on-site technical team for corporate exhibitions, brand launches, tech summits, trade shows, and premium wedding grand entrances.
                        </p>
                        <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.7, paddingLeft: 0, listStyle: 'none', marginBottom: '28px' }}>
                            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={16} color="var(--ad-orange)" /> <strong>Corporate Exhibitions & Trade Expos:</strong> High-impact crowd puller & live technology demonstration.
                            </li>
                            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={16} color="var(--ad-orange)" /> <strong>VIP Weddings & Grand Entrances:</strong> Futuristic guest interaction & ring/gift presentation routines.
                            </li>
                            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={16} color="var(--ad-orange)" /> <strong>Brand Launches & Activations:</strong> Customized choreography & interactive social media moments.
                            </li>
                            <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle2 size={16} color="var(--ad-orange)" /> <strong>Turnkey Execution:</strong> Delivered on-location with dedicated Adilitix technical operators & safety management.
                            </li>
                        </ul>
                        <Link to="/inquiry" className="cta-primary" style={{ background: 'linear-gradient(135deg, #f97316, #dd6b20)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 800, padding: '12px 24px', borderRadius: '8px', fontSize: '0.9rem' }}>
                            BOOK UNITREE GO2 PRO FOR YOUR EVENT <ArrowRight size={17} />
                        </Link>
                    </div>

                    <div style={{ background: 'rgba(11, 17, 32, 0.85)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(249, 115, 22, 0.3)', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
                        <img src="/unitree_go2_pro.png" alt="Unitree Go2 Pro Quadruped Robot" style={{ width: '100%', maxHeight: '360px', objectFit: 'contain', margin: '0 auto 16px', borderRadius: '16px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} />
                        <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>Unitree Go2 Pro Quadruped Robot</div>
                        <div style={{ color: 'var(--ad-orange)', fontSize: '0.82rem', fontWeight: 700, marginTop: '4px' }}>Available for Event Rentals across Kerala & South India</div>
                    </div>
                </div>
            </section>

            {/* SHOWCASE 2: Custom 3D Printing & Industrial Prototyping Services */}
            <section id="prototyping" style={{ padding: '80px 8%', background: 'rgba(11, 17, 32, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38bdf8', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '14px' }}>
                            🖨️ INDUSTRIAL FABRICATION & PROTOTYPING
                        </div>
                        <h2 style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 900 }}>
                            Custom 3D Printing & <span style={{ color: '#38bdf8' }}>Hardware Prototyping</span> Services
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '750px', margin: '12px auto 0', lineHeight: 1.6 }}>
                            High-precision 3D printing and CAD engineering services for startup prototypes, student projects, industrial clients, and custom enclosures. Powered by our multi-color Bambu Lab 3D printer fleet.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {/* Bambu Lab P1S Combo */}
                        <div style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                            <img src="/bambulab_p1s.png" alt="Bambu Lab P1S Combo 3D Printer" style={{ width: '100%', height: '220px', objectFit: 'contain', marginBottom: '16px', borderRadius: '14px' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ad-orange)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Enclosed CoreXY Multi-Color</span>
                            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, margin: '6px 0 10px' }}>Bambu Lab P1S Combo</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
                                Enclosed high-speed CoreXY 3D printer with Automatic Material System (AMS) for high-precision multi-color engineering parts, carbon fiber PLA, PETG, and durable prototype enclosures.
                            </p>
                            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                                ✓ Industrial Engineering Enclosures & Prototypes
                            </div>
                        </div>

                        {/* Bambu Lab A1 Mini */}
                        <div style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', overflow: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                            <img src="/bambulab_a1_mini.png" alt="Bambu Lab A1 Mini 3D Printer" style={{ width: '100%', height: '220px', objectFit: 'contain', marginBottom: '16px', borderRadius: '14px' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>High-Speed Precision Desktop</span>
                            <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, margin: '6px 0 10px' }}>Bambu Lab A1 Mini</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
                                Precision high-speed desktop 3D printer with AMS Lite multi-filament support for rapid component prototyping, custom brackets, lightweight models, and mechanical joint testing.
                            </p>
                            <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>
                                ✓ Fast Turnaround Rapid Prototyping
                            </div>
                        </div>

                        {/* Custom 3D Printing & Prototyping Order Card */}
                        <div style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Custom Manufacturing</span>
                                <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800, margin: '8px 0 12px' }}>Custom 3D Printing Service</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '20px' }}>
                                    Send us your 3D CAD files (.STL, .STEP, .OBJ) or project requirements for fast, high-quality custom 3D printing. We print parts for engineering projects, hardware startups, and commercial clients.
                                </p>
                                <ul style={{ color: '#cbd5e1', fontSize: '0.85rem', paddingLeft: 0, listStyle: 'none', lineHeight: 1.8 }}>
                                    <li>✓ High-Precision PLA, PETG & Carbon Fiber Prints</li>
                                    <li>✓ CAD Modeling & Parametric Enclosure Design</li>
                                    <li>✓ Doorstep Delivery & Fast Turnaround</li>
                                </ul>
                            </div>
                            <Link to="/inquiry" className="cta-primary" style={{ marginTop: '24px', background: '#38bdf8', color: '#05070a', border: 'none', textAlign: 'center', display: 'block', padding: '12px', fontSize: '0.88rem', fontWeight: 800, borderRadius: '8px' }}>
                                SUBMIT 3D PRINTING / CAD INQUIRY
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* SHOWCASE 3: Institutional Workshops & Academic Brochure Callout */}
            <section style={{ padding: '80px 8%', maxWidth: '1250px', margin: '0 auto' }}>
                <div style={{ background: 'rgba(11, 17, 32, 0.85)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '20px', padding: '40px' }} className="responsive-callout-banner">
                    <div>
                        <span style={{ color: 'var(--ad-orange)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            🎓 FOR COLLEGES & EDUCATIONAL INSTITUTIONS
                        </span>
                        <h2 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 900, margin: '8px 0 12px' }}>
                            Engineering Workshops & Departmental Syllabi
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, maxWidth: '750px' }}>
                            Are you a Principal, HOD, or Workshop Coordinator? Visit our dedicated Academic Brochure portal to explore 3-day bootcamps in IoT, AI & Computer Vision, 3D Engineering, Fixed Robotics Arms, and Autonomous Rovers, complete with module breakdowns and proposal generators.
                        </p>
                    </div>
                    <div>
                        <Link to="/programs" className="cta-primary" style={{ background: 'linear-gradient(135deg, #f97316, #dd6b20)', border: 'none', whiteSpace: 'nowrap', padding: '14px 28px', fontSize: '0.92rem', fontWeight: 800, borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            EXPLORE COLLEGE BROCHURE <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
