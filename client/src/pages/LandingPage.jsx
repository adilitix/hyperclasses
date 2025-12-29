import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import '../styles/landing.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);

    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    const workshopTiers = [
        { days: 1, price: 99, label: 'Introductory - 1 Day' },
        { days: 3, price: 299, label: 'Deep Dive - 3 Days' },
        { days: 5, price: 499, label: 'Mastery - 5 Days' },
    ];

    const handleEnroll = (workshopName, tier) => {
        const message = `HI im interested in your ${workshopName.toUpperCase()} workshop (${tier.label} at Rs ${tier.price})`;
        window.open(`https://wa.me/918075355024?text=${encodeURIComponent(message)}`, '_blank');
        setSelectedWorkshop(null);
    };

    return (
        <div className="landing-container">
            <LandingNavbar />

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

            <section className="student-gateway">
                <div className="section-content">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                    >
                        Are you a student? 🎓
                    </motion.h2>
                    <p>Start your journey into high-tech engineering with guided projects and peer learning.</p>
                    <button className="btn-primary" onClick={() => navigate('/workshops')}>Explore Student Path</button>
                </div>
            </section>

            <section className="free-resources">
                <div className="section-header">
                    <h2>Free "Gateway" Content</h2>
                    <p>Get a taste of our teaching quality with these free resources.</p>
                </div>
                <div className="resources-grid">
                    <div className="resource-card">
                        <div className="resource-icon">📚</div>
                        <h3>Mini-Courses</h3>
                        <p>Bite-sized lessons on Python and Arduino basics.</p>
                    </div>
                    <div className="resource-card">
                        <div className="resource-icon">📄</div>
                        <h3>Cheat Sheets</h3>
                        <p>Essential syntax and wiring diagrams for your projects.</p>
                    </div>
                    <div className="resource-card">
                        <div className="resource-icon">📊</div>
                        <h3>Infographics</h3>
                        <p>Visual guides to complex robotics concepts.</p>
                    </div>
                </div>
            </section>

            <section className="youtube-marketing">
                <div className="youtube-content">
                    <div className="youtube-text">
                        <h2>Learn with "Robotics Bro" 🤖</h2>
                        <p>Check out our YouTube channel for educational, amusing, and inspiring content that will motivate you to build the future.</p>
                        <a href="https://www.youtube.com/@RoboticsBro" target="_blank" rel="noopener noreferrer" className="btn-primary">Watch on YouTube</a>
                    </div>
                    <div className="youtube-preview">
                        <div className="video-mock" onClick={() => window.open('https://www.youtube.com/@RoboticsBro', '_blank')}>
                            <img src="/assets/youtube_thumbnail.png" alt="Robotics Bro YouTube" className="youtube-thumb" />
                            <div className="play-overlay">
                                <span className="play-btn">▶</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="available-workshops">
                <div className="section-header">
                    <h2>Workshops Available Now</h2>
                    <p>Join our hands-on workshops and master cutting-edge technology. <br /><strong>Introductory Offer: Starting at just Rs 99!</strong></p>
                </div>
                <div className="workshops-list">
                    {[
                        { id: 'robotics', name: 'Robotics', icon: '🤖' },
                        { id: 'cv', name: 'Computer Vision', icon: '👁️' },
                        { id: 'embedded', name: 'Embedded Systems', icon: '📟' },
                        { id: 'ai', name: 'AI & Machine Learning', icon: '🧠' }
                    ].map((workshop) => (
                        <div key={workshop.id} className="workshop-card-container">
                            <div className="workshop-item">
                                <div className="workshop-info">
                                    <span className="workshop-icon">{workshop.icon}</span>
                                    <h3>{workshop.name}</h3>
                                </div>
                                <button
                                    className={`btn-gradient-primary ${selectedWorkshop === workshop.id ? 'active' : ''}`}
                                    onClick={() => setSelectedWorkshop(selectedWorkshop === workshop.id ? null : workshop.id)}
                                >
                                    {selectedWorkshop === workshop.id ? 'Close' : 'Enroll Now'}
                                </button>
                            </div>
                            <AnimatePresence>
                                {selectedWorkshop === workshop.id && (
                                    <motion.div
                                        className="tier-selection"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="tier-options">
                                            {workshopTiers.map((tier) => (
                                                <div key={tier.days} className="tier-card" onClick={() => handleEnroll(workshop.name, tier)}>
                                                    <span className="tier-days">{tier.days} Day{tier.days > 1 ? 's' : ''}</span>
                                                    <span className="tier-price">Rs {tier.price}</span>
                                                    <span className="tier-label">{tier.days === 1 ? 'Intro' : tier.days === 3 ? 'Value' : 'Mastery'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </section>

            <section className="pricing-bundles">
                <div className="section-header">
                    <h2>Tiered Pricing & Bundles</h2>
                    <p>Invest in your skills and save more with our workshop bundles.</p>
                </div>
                <div className="bundle-offer">
                    <div className="offer-badge">SPECIAL OFFER</div>
                    <h3>Buy 2 workshops, get 1 FREE! 🎁</h3>
                    <p>Expand your expertise across multiple domains with our limited-time bundle.</p>
                    <div className="pricing-infographic-container">
                        <img src="/assets/pricing_infographic.png" alt="Workshop Pricing Infographic" className="pricing-infographic" />
                    </div>
                </div>
            </section>

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

            <LandingFooter />
        </div>
    );
};

export default LandingPage;
