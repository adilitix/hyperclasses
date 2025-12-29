import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">
                    <span className="rocket">🚀</span> Hyperclass
                </div>
                <div className="nav-links">
                    <a href="#features">Features</a>
                    <a href="#workshops">Workshops</a>
                    <a href="#resources">Resources</a>
                    <a href="#" onClick={() => window.location.href = 'mailto:contact@hyperclass.com'}>Contact Us</a>
                </div>
                <div className="nav-actions">
                    <button className="btn-secondary" onClick={() => navigate('/pricing')}>See Pricing</button>
                    <button className="btn-primary" onClick={() => navigate('/login')}>Start Free Trial</button>
                </div>
            </nav>

            <header className="hero-section">
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Master New Skills with <br />
                        <span className="highlight-text">Hyperclass Interactive Workshops</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Join live, hands-on sessions in coding, robotics, and AI. <br />
                        Build your portfolio today.
                    </motion.p>
                    <motion.div
                        className="hero-buttons"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <button className="btn-primary" onClick={() => navigate('/login')}>Start Free Trial</button>
                        <button className="btn-secondary" onClick={() => navigate('/pricing')}>See Pricing</button>
                    </motion.div>
                </div>
                <div className="hero-image">
                    {/* Placeholder for the illustration - Using CSS/SVG or just a div for now if no image provided */}
                    <div className="illustration-placeholder">
                        <div className="screen-mockup">
                            <div className="code-window">
                                <div className="window-header">
                                    <span className="dot red"></span>
                                    <span className="dot yellow"></span>
                                    <span className="dot green"></span>
                                </div>
                                <div className="window-content">
                                    <div className="code-line">const learn = "Hyperclass";</div>
                                    <div className="code-line">await student.master(learn);</div>
                                    <div className="cursor">|</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="features-grid">
                <div className="feature-card">
                    <div className="icon">💬</div>
                    <h3>Live Collaboration</h3>
                    <p>Live peer collaboration and AI interaction in coding and robotics workshops.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">📝</div>
                    <h3>Project-Based Learning</h3>
                    <p>Target project-based learning with hands-on projects and student tracking.</p>
                </div>
                <div className="feature-card">
                    <div className="icon">🏅</div>
                    <h3>Verified Certificates</h3>
                    <p>Verified certificates to shine your new work with developments.</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
