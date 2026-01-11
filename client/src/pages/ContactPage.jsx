import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import '../styles/landing.css';

const ContactPage = () => {
    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Message sent! We will get back to you shortly.');
        setForm({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="landing-container">
            <LandingNavbar />

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--landing-text)' }}>Get in Touch with Our Team</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--landing-text-secondary)' }}>Have questions? We're here to help.</p>
                </div>

                <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '3rem', background: 'white', padding: '3rem', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                    {/* Form */}
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#0f172a' }}>Send Us a Message</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label className="input-label">Full Name</label>
                                <input type="text" className="modern-input" placeholder="e.g. John Doe" required style={{ marginBottom: 0 }}
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Email Address</label>
                                <input type="email" className="modern-input" placeholder="e.g. john.doe@example.com" required style={{ marginBottom: 0 }}
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Subject</label>
                                <input type="text" className="modern-input" placeholder="e.g. Workshop Inquiry" required style={{ marginBottom: 0 }}
                                    value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Message</label>
                                <textarea className="modern-input" placeholder="How can we assist you?" required style={{ marginBottom: 0, minHeight: '120px', resize: 'vertical' }}
                                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                            </div>
                            <button className="btn-primary" style={{ marginTop: '0.5rem' }}>Send Message</button>
                        </form>
                    </div>

                    {/* Info Side */}
                    <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>Contact Information</h3>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ background: '#e0f2fe', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>📧</div>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>Email</div>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>admin@hyperclass.in</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div style={{ background: '#e0f2fe', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>📞</div>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>Phone</div>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>+91 80753 55024</div>
                                    <div style={{ color: 'var(--landing-text-secondary)', fontSize: '0.8rem' }}>(Admin Aadil S P)</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{ background: '#e0f2fe', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>📍</div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--landing-text)' }}>Address</div>
                                    <div style={{ color: 'var(--landing-text-secondary)', fontSize: '0.9rem' }}>
                                        TinkerHub<br />
                                        Kochi, Kerala<br />
                                        India
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            {/* Map Placeholder */}
                            <div style={{ width: '100%', height: '150px', background: '#cbd5e1', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.5663784860046!2d76.32623347573455!3d9.970176373549642!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d514abec6bf%3A0xbd582caa5844192!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1709971234567!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

export default ContactPage;
