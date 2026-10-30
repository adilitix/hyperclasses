import React from 'react';
import { Link } from 'react-router-dom';

const SiteFooter = () => (
    <footer className="site-footer">
        <div className="container site-footer-inner">
            <span>© {new Date().getFullYear()} Adilitix Robotics · Kollam, Kerala · UDYAM-KL-06-0070364</span>
            <Link to="/admin-login">Admin</Link>
        </div>
    </footer>
);

export default SiteFooter;
