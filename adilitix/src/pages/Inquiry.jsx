import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, Building, Phone, Mail, Award, BookOpen } from 'lucide-react';
import Logo from '../components/Logo';

const Inquiry = () => {
    const [formData, setFormData] = useState({
        name: '',
        institution: '',
        department: '',
        phone: '',
        email: '',
        preferredDates: '',
        program: 'Institutional Robotics Workshop / Bootcamp',
        requirements: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const rawBase = import.meta.env.VITE_SERVER_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hyperclass.onrender.com');
    const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.name} (${formData.institution})`,
                    phone: formData.phone,
                    requirements: `INSTITUTIONAL & PROJECT INQUIRY:\nInstitution/Company: ${formData.institution}\nDepartment/Role: ${formData.department}\nService Requested: ${formData.program}\nPreferred Dates: ${formData.preferredDates}\nEmail: ${formData.email}\nNotes: ${formData.requirements}`,
                    items: [{ id: 'inquiry-proposal', name: `Inquiry: ${formData.program}`, quantity: 1 }]
                })
            });
            const data = await res.json();
            if (data.success || res.ok) {
                setSubmitted(true);
            } else {
                setSubmitted(true);
            }
        } catch (err) {
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="registration-container" style={{ padding: '40px 16px' }}>
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="registration-form-card" style={{ maxWidth: '580px', padding: '32px 28px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--ad-orange)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle2 size={36} />
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>Inquiry Submitted!</h2>
                    <p style={{ color: 'var(--ad-text-dim)', margin: '12px 0 20px', lineHeight: '1.6', fontSize: '0.92rem' }}>
                        Thank you <b>{formData.name}</b>. Founder & CEO <b>Aadil S P</b> and the Adilitix Robotics team will contact you on <b>{formData.phone}</b> or <b>{formData.email}</b>.
                    </p>
                    <div style={{ background: 'rgba(5, 7, 10, 0.8)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--ad-border-navy)', marginBottom: '24px', textAlign: 'left', fontSize: '0.85rem', color: '#94a3b8' }}>
                        <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>Adilitix Robotics Center:</p>
                        <p>1st Floor, Aswathy Building, Main Road, Kollam, Kerala</p>
                        <p>Phone: +91 8075355024</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <Link to="/" className="cta-secondary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>Home</Link>
                        <Link to="/programs" className="cta-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>View Syllabi</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="registration-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} color="var(--ad-orange)" /> Home
                </Link>
                <Logo size="small" showText={true} textSub="INQUIRY" />
                <Link to="/programs" style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={16} /> College Brochure
                </Link>
            </nav>

            <div className="registration-container" style={{ padding: '40px 16px' }}>
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="registration-form-card" style={{ maxWidth: '620px', padding: '28px 32px' }}>
                    <div className="form-header" style={{ marginBottom: '20px' }}>
                        <div className="udyam-badge" style={{ marginBottom: '8px', fontSize: '0.72rem', padding: '4px 10px' }}>
                            <Building size={13} /> COLLEGES, STUDENTS & INDUSTRY CLIENTS
                        </div>
                        <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>Request Workshops or Custom Project</h1>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.88rem', margin: 0, lineHeight: '1.4' }}>
                            Partner with Adilitix Robotics (Kollam, Kerala) for 7+ yrs expert training & robotics development.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="reg-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Full Name & Role</label>
                                <input
                                    type="text"
                                    placeholder="Prof. / Student / HOD Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ padding: '9px 12px', fontSize: '0.88rem' }}
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.78rem', marginBottom: '4px' }}>College / Company</label>
                                <input
                                    type="text"
                                    placeholder="Institution / Company Name"
                                    value={formData.institution}
                                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                                    required
                                    style={{ padding: '9px 12px', fontSize: '0.88rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Department / Stream</label>
                                <input
                                    type="text"
                                    placeholder="ECE / CSE / Mech / Robotics"
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    required
                                    style={{ padding: '9px 12px', fontSize: '0.88rem' }}
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Phone / WhatsApp *</label>
                                <input
                                    type="tel"
                                    placeholder="+91 8075355024"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    style={{ padding: '9px 12px', fontSize: '0.88rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="faculty@college.edu.in"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    style={{ padding: '9px 12px', fontSize: '0.88rem' }}
                                />
                            </div>
                            <div className="form-group" style={{ margin: 0 }}>
                                <label style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Preferred Dates / Month</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Next Month / Immediate"
                                    value={formData.preferredDates}
                                    onChange={e => setFormData({ ...formData, preferredDates: e.target.value })}
                                    required
                                    style={{ padding: '9px 12px', fontSize: '0.88rem' }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Select Required Program</label>
                            <select
                                value={formData.program}
                                onChange={e => setFormData({ ...formData, program: e.target.value })}
                                required
                                style={{ padding: '9px 12px', fontSize: '0.88rem' }}
                            >
                                <option value="Autonomous Mobile Robotics & ESP32 (3-Day)">Autonomous Mobile Robotics & ESP32 (3-Day Bootcamp)</option>
                                <option value="Full-Stack Web Dev with MERN & Next.js">Full-Stack Web Dev with MERN & Next.js</option>
                                <option value="Applied Generative AI & LLMs">Applied Generative AI & LLMs</option>
                                <option value="Industrial IoT & Smart Devices">Industrial IoT & Smart Devices</option>
                                <option value="Cyber Security & Cloud Defense">Cyber Security & Cloud Defense</option>
                                <option value="Electric Vehicle (EV) Systems & BMS">Electric Vehicle (EV) Systems & BMS</option>
                                <option value="Custom Product Development">Custom Product Development Service</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.78rem', marginBottom: '4px' }}>Specific Requirements / Participant Count</label>
                            <textarea
                                rows="2"
                                placeholder="Estimated participant count or specific custom topics..."
                                value={formData.requirements}
                                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                style={{ padding: '9px 12px', fontSize: '0.85rem' }}
                            />
                        </div>

                        <button type="submit" disabled={loading} className="submit-btn" style={{ width: '100%', padding: '12px', fontSize: '0.92rem', fontWeight: 700, borderRadius: '10px' }}>
                            {loading ? 'Submitting...' : 'SUBMIT REQUEST'} <Send size={16} />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Inquiry;
