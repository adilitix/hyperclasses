import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, XCircle } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { BASE_URL } from '../lib/api';

const VerifyCertificate = () => {
    const [certId, setCertId] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'invalid' | 'error'
    const [result, setResult] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        const id = certId.trim().toUpperCase();
        if (!id) return;

        setStatus('verifying');
        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/certificates/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ certificateId: id })
            });
            const data = await res.json();

            if (data.valid) {
                setResult(data.data);
                setStatus('success');
            } else {
                setResult(null);
                setStatus('invalid');
            }
        } catch {
            setResult(null);
            setStatus('error');
        }
    };

    return (
        <div className="verify-page shop-page">
            <SiteHeader />

            <main className="registration-container">
                <div className="registration-form-card" style={{ maxWidth: 520 }}>
                    <div className="icon-tile"><ShieldCheck size={20} /></div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Verify a certificate</h1>
                    <p className="muted" style={{ margin: '8px 0 24px' }}>
                        Enter the ID printed on an Adilitix Robotics workshop certificate to confirm it is genuine.
                    </p>

                    <form onSubmit={handleVerify}>
                        <div className="form-group">
                            <label htmlFor="cert-id">Certificate ID</label>
                            <input
                                id="cert-id"
                                type="text"
                                placeholder="e.g. ADX-RO-001"
                                value={certId}
                                onChange={(e) => setCertId(e.target.value)}
                                autoCapitalize="characters"
                                spellCheck={false}
                                required
                                style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                            />
                        </div>
                        <button type="submit" disabled={status === 'verifying'} className="btn btn-primary" style={{ width: '100%' }}>
                            {status === 'verifying' ? 'Checking…' : 'Verify'}
                        </button>
                    </form>

                    {status === 'success' && result && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="notice notice-success" style={{ marginTop: 24 }} role="status">
                            <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ShieldCheck size={18} /> Valid certificate
                            </div>
                            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', color: 'var(--text)', fontSize: '0.92rem' }}>
                                <dt className="subtle">Student</dt><dd>{result.studentName}</dd>
                                <dt className="subtle">Workshop</dt><dd>{result.workshopName || result.workshopId}</dd>
                                <dt className="subtle">Issued</dt>
                                <dd>{result.completedAt ? new Date(result.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</dd>
                                <dt className="subtle">ID</dt><dd style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{result.certificateId}</dd>
                            </dl>
                        </motion.div>
                    )}

                    {status === 'invalid' && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="notice notice-error" style={{ marginTop: 24 }} role="alert">
                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><XCircle size={18} /> No matching certificate</div>
                            <p style={{ fontSize: '0.875rem', marginTop: 4 }}>Check the ID for typos and try again. Contact us if you believe this is a mistake.</p>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <div className="notice notice-error" style={{ marginTop: 24 }} role="alert">
                            We could not reach the verification service. Please try again in a moment.
                        </div>
                    )}
                </div>
            </main>

            <SiteFooter />
        </div>
    );
};

export default VerifyCertificate;
