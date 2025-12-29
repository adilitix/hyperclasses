import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <span className="rocket">🚀</span> Hyperclass
                </div>

                {/* Desktop Links */}
                <div className="nav-links">
                    <a onClick={() => navigate('/features')} style={{ cursor: 'pointer' }}>Features</a>
                    <a onClick={() => navigate('/workshops')} style={{ cursor: 'pointer' }}>Workshops</a>
                    <a onClick={() => navigate('/contact')} style={{ cursor: 'pointer' }}>Contact Us</a>
                </div>

                {/* Desktop Actions */}
                <div className="nav-actions">
                    <button className="btn-secondary" onClick={() => navigate('/pricing')}>See Pricing</button>
                    <button className="btn-primary" onClick={() => navigate('/login')}>Start Free Trial</button>
                </div>

                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
                    {isMenuOpen ? '✕' : '☰'}
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
