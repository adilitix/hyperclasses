import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const NAV_ITEMS = [
    { to: '/programs', label: 'Workshops' },
    { to: '/projects', label: 'Projects' },
    { to: '/shop', label: 'Store' },
    { to: '/about', label: 'About' },
    { to: '/verify', label: 'Verify certificate' },
];

// Shared top bar for every public page. `actions` renders extra controls (e.g. the cart) beside the CTA.
const SiteHeader = ({ actions = null }) => {
    // The menu remembers which page it was opened on, so navigating anywhere closes it.
    const { pathname } = useLocation();
    const [openOn, setOpenOn] = useState(null);
    const open = openOn === pathname;
    const toggle = () => setOpenOn(open ? null : pathname);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // The mobile menu sits outside <header>: the header's backdrop-filter would otherwise become the
    // containing block for the menu's position: fixed and clip it to the header's height.
    return (
        <>
        <header className="site-header">
            <div className="container site-header-inner">
                <Link to="/" aria-label="Adilitix Robotics home">
                    <Logo size="small" showText={true} textSub="ROBOTICS" />
                </Link>

                <nav className="site-nav" aria-label="Main">
                    {NAV_ITEMS.map(item => (
                        <NavLink key={item.to} to={item.to}>{item.label}</NavLink>
                    ))}
                </nav>

                <div className="site-header-actions">
                    {actions}
                    <Link to="/inquiry" className="btn btn-primary btn-sm btn-header-cta">Contact us</Link>
                    <button
                        type="button"
                        className="menu-toggle"
                        onClick={toggle}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>
        </header>

        <nav id="mobile-nav" className={`mobile-nav ${open ? 'open' : ''}`} aria-label="Mobile">
            <Link to="/">Home</Link>
            {NAV_ITEMS.map(item => (
                <Link key={item.to} to={item.to}>{item.label}</Link>
            ))}
            <Link to="/inquiry" className="btn btn-primary">Contact us</Link>
        </nav>
        </>
    );
};

export default SiteHeader;
