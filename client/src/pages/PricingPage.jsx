import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import '../styles/landing.css';

const PricingPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    const handleEnroll = (planName) => {
        const message = `HI im interested in the Hyperclass ${planName} plan`;
        window.open(`https://wa.me/918075355024?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="landing-container pricing-page">
            <LandingNavbar />

            <header className="pricing-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Introductory Pricing & Bundles
                </motion.h1>
                <p>Start your engineering journey today with our flexible plans</p>
            </header>

            <div className="pricing-grid">
                {/* One Day Plan */}
                <motion.div
                    className="pricing-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="plan-name">Introductory</div>
                    <div className="plan-price">Rs 99<span>/Day</span></div>
                    <p className="plan-desc">Perfect for a quick start</p>
                    <ul className="plan-features">
                        <li>✅ Single Workshop Access</li>
                        <li>✅ Community Support</li>
                        <li>✅ Live Q&A session</li>
                    </ul>
                    <button className="btn-secondary full-width" onClick={() => handleEnroll('1-Day Introductory')}>Enroll Now</button>
                </motion.div>

                {/* Most Popular plan - 3 Day */}
                <motion.div
                    className="pricing-card featured"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="badge">Most Popular</div>
                    <div className="plan-name">Deep Dive</div>
                    <div className="plan-price">Rs 299<span>/3 Days</span></div>
                    <p className="plan-desc">For serious learners</p>
                    <ul className="plan-features">
                        <li>✅ Intensive Workshop Series</li>
                        <li>✅ Verified Certificate</li>
                        <li>✅ Project-Based Learning</li>
                        <li>✅ AI-Powered Debugging</li>
                    </ul>
                    <button className="btn-primary full-width" onClick={() => handleEnroll('3-Day Deep Dive')}>Enroll Now</button>
                </motion.div>

                {/* Five Day plan */}
                <motion.div
                    className="pricing-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="badge" style={{ background: '#10b981' }}>Most Effective</div>
                    <div className="plan-name">Mastery</div>
                    <div className="plan-price">Rs 499<span>/5 Days</span></div>
                    <p className="plan-desc">Complete certification</p>
                    <ul className="plan-features">
                        <li>✅ Full Curriculum Access</li>
                        <li>✅ Advanced Project Build</li>
                        <li>✅ Internship Opportunities</li>
                        <li>✅ Life-time Community Access</li>
                    </ul>
                    <button className="btn-secondary full-width" onClick={() => handleEnroll('5-Day Mastery')}>Enroll Now</button>
                </motion.div>
            </div>

            <section className="pricing-bundles" style={{ background: 'transparent' }}>
                <div className="bundle-offer">
                    <div className="offer-badge">SPECIAL OFFER</div>
                    <h3>Buy 2 workshops, get 1 FREE! 🎁</h3>
                    <p>Expand your expertise across multiple domains with our limited-time bundle.</p>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default PricingPage;
