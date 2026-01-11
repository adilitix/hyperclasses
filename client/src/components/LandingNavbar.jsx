import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingThemeToggle from './LandingThemeToggle';

const LandingNavbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleNav = (path) => {
        setIsMenuOpen(false);
        navigate(path);
    };

    return (
        <React.Fragment>
            <nav className="landing-nav">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: 'var(--text-white, #0f172a)', color: 'var(--bg-dark, #fff)', padding: '6px', borderRadius: '8px' }}>🚀</div>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-white, #0f172a)' }}>Hyper<span style={{ color: 'var(--primary-blue, #00f0ff)' }}>class</span></span>
                </div>

                {/* Desktop Links */}
                <div className="nav-links desktop-only">
                    <a onClick={() => navigate('/features')} style={{ cursor: 'pointer', fontWeight: 600 }}>Features</a>
                    <a onClick={() => navigate('/login')} style={{ cursor: 'pointer', fontWeight: 700, color: '#0ea5e9' }}>Flow (Live)</a>
                    <a onClick={() => navigate('/workshops')} style={{ cursor: 'pointer', fontWeight: 700, color: '#f59e0b' }}>Go (Workshops)</a>
                    <a onClick={() => navigate('/contact')} style={{ cursor: 'pointer', fontWeight: 600 }}>Contact</a>
                </div>

                {/* Desktop Actions */}
                <div className="nav-actions desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <LandingThemeToggle />
                    <button className="btn-primary" onClick={() => navigate('/login')} style={{ borderRadius: '30px' }}>Join Session</button>
                    <button className="btn-secondary" onClick={() => navigate('/go/login')} style={{ borderRadius: '30px', border: '1px solid #ff7b00', color: '#ff7b00' }}>Student Go</button>
                </div>

                {/* Mobile Menu Button */}
                <button className={`mobile-menu-btn ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu} aria-label="Toggle menu">
                    <div className="hamburger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <a onClick={() => handleNav('/features')}>Features</a>
                <a onClick={() => handleNav('/workshops')}>Workshops</a>
                <a onClick={() => handleNav('/contact')}>Contact Us</a>

                <div className="nav-actions-mobile">
                    <button className="btn-secondary" onClick={() => handleNav('/pricing')}>See Pricing</button>
                    <button className="btn-primary" onClick={() => handleNav('/login')}>Start Free Trial</button>
                </div>
            </div>
        </React.Fragment>
    );
};

export default LandingNavbar;
