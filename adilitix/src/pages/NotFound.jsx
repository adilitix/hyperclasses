import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

const NotFound = ({
    title = 'Page not found',
    message = 'The page you are looking for does not exist or has moved.',
    backTo = '/',
    backLabel = 'Back to home',
}) => {
    useEffect(() => {
        // Keep search engines from indexing the SPA's soft 404s.
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex';
        document.head.appendChild(meta);
        return () => meta.remove();
    }, []);

    return (
        <div className="shop-page" style={{ display: 'flex', flexDirection: 'column' }}>
            <SiteHeader />
            <main className="container" style={{ flex: 1, padding: '96px var(--gutter)' }}>
                <span className="eyebrow">404</span>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700 }}>{title}</h1>
                <p className="muted" style={{ fontSize: '1.05rem', margin: '12px 0 32px', maxWidth: '52ch' }}>{message}</p>
                <div className="cta-group">
                    <Link to={backTo} className="btn btn-primary"><ArrowLeft size={16} /> {backLabel}</Link>
                    <Link to="/inquiry" className="btn btn-secondary">Contact us</Link>
                </div>
            </main>
            <SiteFooter />
        </div>
    );
};

export default NotFound;
