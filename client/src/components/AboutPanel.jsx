import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

function AboutPanel({ trainerUsername }) {
    const { user } = useAuth();
    const socket = useSocket();
    const [settings, setSettings] = useState(null);
    const [trainer, setTrainer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Website Settings
        fetch(`${API_BASE_URL}/api/settings`)
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error('Error fetching settings:', err));

        // Fetch Trainer Info if username provided
        if (trainerUsername) {
            fetch(`${API_BASE_URL}/api/trainer/${trainerUsername}`)
                .then(res => res.json())
                .then(data => setTrainer(data))
                .catch(err => console.error('Error fetching trainer:', err));
        } else if (user.role === 'admin' || user.role === 'superadmin') {
            // For admins, show their own profile in "Know your trainer" section maybe?
            // Or just hide it. The user said "students should view the about of their trainer"
        }

        setLoading(false);
    }, [trainerUsername, user]);

    useEffect(() => {
        if (!socket) return;
        socket.on('settings_update', (newSettings) => {
            setSettings(newSettings);
        });
        return () => socket.off('settings_update');
    }, [socket]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

    const aboutWebsite = settings?.aboutWebsite || {
        productName: 'HyperClass',
        companyName: 'Adilitix Robotics',
        summary: 'A real-time interactive workshop management system.',
        features: [],
        specialities: []
    };

    return (
        <div className="about-panel" style={{ height: '100%', overflowY: 'auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="about-content-wrapper"
                style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem' }}
            >
                {/* Trainer Section (Only for students or if viewing specific trainer) */}
                {trainer && (
                    <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--primary-glow)' }}>
                        <div className="trainer-header" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="trainer-avatar" style={{
                                width: '70px', height: '70px', borderRadius: '50%',
                                background: 'var(--primary)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                                boxShadow: '0 0 20px var(--primary-glow)', flexShrink: 0
                            }}>
                                👨‍🏫
                            </div>
                            <div>
                                <h2 className="cine-text trainer-tagline" style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>Know Your Trainer</h2>
                                <h3 style={{ margin: '0.25rem 0', opacity: 0.9, fontSize: '1rem' }}>{trainer.displayName}</h3>
                            </div>
                        </div>
                        <div style={{ lineHeight: '1.6', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px' }}>
                            {trainer.about.split('\n').map((para, i) => (
                                <p key={i} style={{ marginBottom: i === trainer.about.split('\n').length - 1 ? 0 : '1rem' }}>{para}</p>
                            ))}
                        </div>
                    </section>
                )}

                {/* Website Section */}
                <section className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <h1 className="cine-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--primary), #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {aboutWebsite.productName}
                        </h1>
                        <p style={{ fontSize: '1.1rem', opacity: 0.7, fontWeight: 500 }}>
                            A Product of <span style={{ color: 'var(--primary)' }}>{aboutWebsite.companyName}</span>
                        </p>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🚀</span> Speciality Summary
                        </h3>
                        <p style={{ lineHeight: '1.6', opacity: 0.9, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                            {aboutWebsite.summary}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                            {aboutWebsite.specialities.map((spec, i) => (
                                <span key={i} style={{
                                    padding: '0.4rem 0.8rem', background: 'rgba(56, 189, 248, 0.1)',
                                    border: '1px solid var(--primary)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--primary)'
                                }}>
                                    ✨ {spec}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>🛠️</span> Key Features
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {aboutWebsite.features.map((feat, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.05)' }}
                                    style={{
                                        padding: '1rem', background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                                    }}
                                >
                                    <span style={{ color: 'var(--primary)' }}>✅</span>
                                    <span style={{ fontSize: '0.9rem' }}>{feat}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                <footer style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
                    &copy; 2025 {aboutWebsite.companyName}. All rights reserved.
                </footer>
            </motion.div>
        </div>
    );
}

export default AboutPanel;
