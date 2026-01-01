import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/landing_split.css';

const LandingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('split-portal-mode');
        return () => document.body.classList.remove('split-portal-mode');
    }, []);

    return (
        <div className="landing-portal">
            <header className="absolute-header">
                <div className="portal-logo" onClick={() => navigate('/')}>
                    <div className="logo-symbol">H</div>
                    <span className="logo-text">Hyper<span>class</span></span>
                </div>
                <div className="v-line"></div>
                <div className="header-tagline">THE FUTURE OF ENGINEERING</div>
            </header>

            <main className="portal-grid">
                {/* FLOW SIDE */}
                <motion.div
                    className="portal-pane flow-pane"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="pane-overlay"></div>
                    <div className="pane-content">
                        <div className="product-identity">
                            <span className="badge">LIVE PLATFORM</span>
                            <h1 className="product-title">HyperFlow</h1>
                        </div>
                        <p className="product-description">
                            <b>HyperFlow</b> is the ultimate live classroom engine for technical creators.
                            It features real-time code broadcasting, instant poll systems,
                            and high-fidelity screen sharing to bridge the gap between
                            instruction and execution. Built for rapid, interactive engineering learning.
                        </p>
                        <div className="pane-actions">
                            <button className="join-btn flow-btn" onClick={() => navigate('/login')}>
                                <span className="btn-icon">⚡</span> JOIN SESSION
                            </button>
                            <button className="about-btn" onClick={() => navigate('/features')}>
                                LEARN MORE
                            </button>
                        </div>
                    </div>
                    <div className="pane-decoration flow-glow"></div>
                </motion.div>

                {/* GO SIDE */}
                <motion.div
                    className="portal-pane go-pane"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="pane-overlay"></div>
                    <div className="pane-content">
                        <div className="product-identity">
                            <span className="badge go-badge">WORKSHOP ENGINE</span>
                            <h1 className="product-title go-title">HyperGo</h1>
                        </div>
                        <p className="product-description">
                            <b>HyperGo</b> is our premier project-based workshop platform.
                            Focusing on high-tech domains like Robotics, ESP32, and AI,
                            it provides structured workshop management, industry certifications,
                            and a dedicated engine for mastering complex hardware projects
                            at your own pace.
                        </p>
                        <div className="pane-actions">
                            <button className="join-btn go-btn" onClick={() => navigate('/go/login')}>
                                <span className="btn-icon">🚀</span> JOIN SESSION
                            </button>
                            <button className="about-btn" onClick={() => navigate('/workshops')}>
                                VIEW CATALOG
                            </button>
                        </div>
                    </div>
                    <div className="pane-decoration go-glow"></div>
                </motion.div>
            </main>

            <footer className="portal-footer">
                <p>&copy; {new Date().getFullYear()} Hyperclass Engineering. All rights reserved.</p>
                <div className="footer-links">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
