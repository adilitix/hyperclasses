import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingFooter = () => {
    const navigate = useNavigate();

    return (
        <footer className="landing-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <span className="rocket">🚀</span> Hyperclass
                    </div>
                    <p>Elevating engineering education through <b>Flow</b> (Live Learning) and <b>Go</b> (Elite Workshops).</p>
                </div>

                <div className="footer-links">
                    <div className="footer-column">
                        <h4>Platform</h4>
                        <a onClick={() => navigate('/features')}>Features</a>
                        <a onClick={() => navigate('/workshops')}>Workshops</a>
                        <a onClick={() => navigate('/pricing')}>Pricing</a>
                    </div>
                    <div className="footer-column">
                        <h4>Company</h4>
                        <a onClick={() => navigate('/contact')}>Contact Us</a>
                        <a href="#">About Us</a>
                        <a href="#">Careers</a>
                    </div>
                    <div className="footer-column">
                        <h4>Resources</h4>
                        <a href="#">Blog</a>
                        <a href="#">Community</a>
                        <a href="#">Help Center</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-info">
                    <p>&copy; {new Date().getFullYear()} Hyperclass. All rights reserved.</p>
                    <p className="msme-info">Adilitix MSME UDYAM-KL-06-0070364</p>
                </div>
                <div className="social-links">
                    <a href="https://www.youtube.com/@RoboticsBro" target="_blank" rel="noopener noreferrer" aria-label="YouTube">🎬</a>
                    <a href="#" aria-label="Twitter">𝕏</a>
                    <a href="#" aria-label="LinkedIn">in</a>
                    <a href="#" aria-label="Instagram">📸</a>
                </div>
            </div>
        </footer>
    );
};

export default LandingFooter;
