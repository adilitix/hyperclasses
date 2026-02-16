import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const VerifyCertificate = () => {
    const [certId, setCertId] = React.useState('');
    const [status, setStatus] = React.useState('idle'); // idle, verifying, success, error
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
            <nav className="navbar" style={{ position: 'absolute' }}>
                <Link to="/" className="back-link"><ArrowLeft size={20} /> Back</Link>
                <div className="logo">ADILITIX</div>
            </nav>

            <div className="registration-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="registration-form-card"
                    style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '600px', width: '100%' }}
                >
                    <div className="login-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', margin: '0 auto 20px' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1>Certificate Verification</h1>
                    <p style={{ opacity: 0.6, marginBottom: '30px' }}>Enter the certificate ID to verify authenticity.</p>

                    <form onSubmit={handleVerify} className="form-group" style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="e.g. ADX-RO-001"
                            value={certId}
                            onChange={(e) => setCertId(e.target.value)}
                            style={{ textAlign: 'center', fontSize: '1.2rem', padding: '15px', textTransform: 'uppercase' }}
                        />
                        <button type="submit" disabled={status === 'verifying'} className="cta-primary" style={{ width: '100%', marginTop: '20px' }}>
                            {status === 'verifying' ? 'Verifying...' : 'VERIFY NOW'}
                        </button>
                    </form>

                    {status === 'success' && result && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '12px', marginTop: '20px' }}
                        >
                            <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <ShieldCheck size={24} /> Valid Certificate
                            </div>
                            <div style={{ textAlign: 'left', color: '#14532d', lineHeight: '1.6' }}>
                                <p><b>Student:</b> {result.studentName}</p>
                                <p><b>Workshop:</b> {result.workshopName || result.workshopId}</p>
                                <p><b>Completed:</b> {new Date(result.completedAt).toLocaleDateString()}</p>
                                <p><b>Certificate ID:</b> {result.certificateId}</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '20px', borderRadius: '12px', marginTop: '20px' }}
                        >
                            <b>Invalid Certificate ID.</b>
                            <p style={{ fontSize: '0.9rem', marginTop: '5px' }}>Please check the ID and try again.</p>
                        </motion.div>
                    )}

                    <p style={{ marginTop: '30px', fontSize: '0.8rem', opacity: 0.4 }}>
                        Adilitix Secure Verification System
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
