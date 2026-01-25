import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, ClipboardCheck, Settings } from 'lucide-react';

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
            <nav className="navbar">
                <div className="logo">ADILITIX</div>
                <div className="nav-links">
                    <Link to="/">About</Link>
                    <a href="#products">Products</a>
                    <Link to="/shop" className="nav-btn-subtle" style={{ color: 'var(--ad-primary)' }}>Buy Components</Link>
                    <Link to="/verify" className="nav-btn-subtle">Verify Certificate</Link>
                    <Link to="/admin-login" className="nav-btn-subtle" style={{ opacity: 0.6 }}>Manage</Link>
                </div>
            </nav>

            <header className={`hero ${isVisible ? 'fade-in' : ''}`}>
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Pioneering the <span className="highlight">Future</span> of Robotics
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        We build intelligent machines that bridge the gap between imagination and reality.
                    </motion.p>
                    <div className="cta-group">
                        <Link to="/register" className="cta-primary">Register for Workshop <ArrowRight size={18} /></Link>
                        <button className="cta-secondary" onClick={() => window.location.href = HYPERCLASS_URL}>View Hyperclass</button>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="robot-sphere">
                        <div className="inner-glow"></div>
                    </div>
                </div>
            </header>

            <section id="products" className="products-section">
                <h2>Our First Product</h2>
                <div className="product-card clickable" onClick={() => window.location.href = HYPERCLASS_URL}>
                    <div className="product-info">
                        <h3>Hyperclass</h3>
                        <p>The ultimate collaborative workshop platform. Designed by robotics engineers for seamless real-time learning.</p>
                        <ul className="feature-list">
                            <li>Real-time Code Sharing</li>
                            <li>Live Polls & Interaction</li>
                            <li>Workshop Management</li>
                        </ul>
                        <span className="learn-more">Launch Hyperclass →</span>
                    </div>
                    <div className="product-preview">
                        <div className="preview-screen">
                            <div className="pulse"></div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="vision" className="vision-section">
                <div className="vision-card">
                    <h2>Our Vision</h2>
                    <p>
                        At Adilitix, we believe that robotics should be accessible, intuitive, and transformative.
                        From educational platforms like <strong>Hyperclass</strong> to autonomous navigation systems,
                        we are redefining how humans interact with technology.
                    </p>
                </div>
            </section>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-logo">ADILITIX</div>
                    <p>&copy; 2026 Adilitix Robotics. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
