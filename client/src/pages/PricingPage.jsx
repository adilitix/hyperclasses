import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import '../styles/landing.css';

const PricingPage = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    return (
        <div className="landing-container pricing-page">
            <nav className="landing-nav">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span className="rocket">🚀</span> Hyperclass
                </div>
                <div className="nav-actions">
                    <button className="btn-ghost" onClick={() => navigate('/')}>Back to Home</button>
                    <button className="btn-primary" onClick={() => navigate('/login')}>Start Free Trial</button>
                </div>
            </nav>

            <header className="pricing-header">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Simple, transparent pricing
                </motion.h1>
                <p>Choose the plan that's right for you</p>
            </header>

            <div className="pricing-grid">
                {/* Free Plan */}
                <motion.div
                    className="pricing-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="plan-name">Free</div>
                    <div className="plan-price">$0<span>/mo</span></div>
                    <p className="plan-desc">Perfect for getting started</p>
                    <ul className="plan-features">
                        <li>✅ Access to basic workshops</li>
                        <li>✅ Community support</li>
                        <li>✅ Limited execution time</li>
                    </ul>
                    <button className="btn-secondary full-width" onClick={() => navigate('/login')}>Open</button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                    className="pricing-card featured"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="badge">Most Popular</div>
                    <div className="plan-name">Hyperclass Pro</div>
                    <div className="plan-price">$29<span>/mo</span></div>
                    <p className="plan-desc">For serious learners</p>
                    <ul className="plan-features">
                        <li>✅ Unlimited workshops</li>
                        <li>✅ Priority support</li>
                        <li>✅ Verified Certificates</li>
                        <li>✅ Advanced AI Assistant</li>
                    </ul>
                    <button className="btn-primary full-width" onClick={() => navigate('/login')}>Try for free</button>
                </motion.div>

                {/* Enterprise Plan */}
                <motion.div
                    className="pricing-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="plan-name">Enterprise</div>
                    <div className="plan-price">Custom</div>
                    <p className="plan-desc">For organizations & schools</p>
                    <ul className="plan-features">
                        <li>✅ Custom learning paths</li>
                        <li>✅ Dedicated account manager</li>
                        <li>✅ SSO Integration</li>
                        <li>✅ Analytics Dashboard</li>
                    </ul>
                    <button className="btn-secondary full-width" onClick={() => window.location.href = 'mailto:sales@hyperclass.com'}>Contact Us</button>
                </motion.div>
            </div>
        </div>
    );
};

export default PricingPage;
