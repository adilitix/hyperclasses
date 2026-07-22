import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

const VerifyCertificate = () => {
    const [certId, setCertId] = React.useState('');
    const [status, setStatus] = React.useState('idle');
    const [result, setResult] = React.useState(null);

    const rawBase = import.meta.env.VITE_SERVER_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hyperclass.onrender.com');
    const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!certId) return;

        setStatus('verifying');
        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/certificates/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ certificateId: certId })
            });
            const data = await res.json();

            if (data.valid) {
                setResult(data.data);
                setStatus('success');
            } else {
                setResult(null);
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="verify-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} color="var(--ad-orange)" /> Back to Main
                </Link>
                <Logo size="small" showText={true} textSub="VERIFICATION" />
            </nav>

            <div className="registration-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="registration-form-card"
                    style={{ textAlign: 'center' }}
                >
                    <div style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--ad-orange)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid var(--ad-border)' }}>
                        <ShieldCheck size={36} />
                    </div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>Certificate Verification</h1>
                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', margin: '8px 0 28px' }}>
                        Validate official <b>Adilitix Robotics</b> workshop credentials (Reg. UDYAM-KL-06-0070364).
                    </p>

                    <form onSubmit={handleVerify} className="form-group">
                        <input
                            type="text"
                            placeholder="e.g. ADX-RO-001"
                            value={certId}
                            onChange={(e) => setCertId(e.target.value)}
                            style={{ textAlign: 'center', fontSize: '1.2rem', padding: '16px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--ad-orange)', fontWeight: 'bold' }}
                        />
                        <button type="submit" disabled={status === 'verifying'} className="submit-btn" style={{ width: '100%', marginTop: '16px' }}>
                            {status === 'verifying' ? 'Verifying Credential...' : 'VERIFY CERTIFICATE'}
                        </button>
                    </form>

                    {status === 'success' && result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '20px', borderRadius: '16px', marginTop: '24px', textAlign: 'left' }}
                        >
                            <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShieldCheck size={22} /> Authentic Verified Certificate
                            </div>
                            <div style={{ color: '#f8fafc', fontSize: '0.92rem', lineHeight: '1.7' }}>
                                <p><b>Student:</b> {result.studentName}</p>
                                <p><b>Workshop:</b> {result.workshopName || result.workshopId}</p>
                                <p><b>Issue Date:</b> {new Date(result.completedAt || Date.now()).toLocaleDateString()}</p>
                                <p><b>Certificate ID:</b> <span style={{ color: 'var(--ad-orange)', fontFamily: 'monospace' }}>{result.certificateId}</span></p>
                                <p style={{ fontSize: '0.78rem', color: 'var(--ad-text-dim)', marginTop: '8px' }}>Issued by Adilitix Robotics, Kollam.</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '18px', borderRadius: '16px', marginTop: '24px' }}
                        >
                            <b>Invalid Certificate ID</b>
                            <p style={{ fontSize: '0.85rem', marginTop: '4px', opacity: 0.8 }}>
                                No matching record found. Please verify the ID format and try again.
                            </p>
                        </motion.div>
                    )}

                    <p style={{ marginTop: '30px', fontSize: '0.8rem', color: '#64748b' }}>
                        Adilitix Secure Verification System | Kollam, Kerala
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
