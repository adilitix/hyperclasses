import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2, Building, Calendar, Phone, Mail, Award, Briefcase, Box } from 'lucide-react';
import Logo from '../components/Logo';

const Inquiry = () => {
    const [formData, setFormData] = useState({
        name: '',
        institution: '',
        department: '',
        phone: '',
        email: '',
        preferredDates: '',
        program: 'Robotics Workshop & Bootcamp',
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
            <div className="registration-container">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="registration-form-card" style={{ textAlign: 'center' }}>
                    <div style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--ad-orange)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <CheckCircle2 size={44} />
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '1.8rem' }}>Inquiry Received!</h2>
                    <p style={{ color: 'var(--ad-text-dim)', margin: '14px 0 24px', lineHeight: '1.7' }}>
                        Thank you <b>{formData.name}</b>. Founder & CEO <b>Aadil S P</b> and the Adilitix Robotics engineering team (7+ Yrs Exp) will review your request for <b>{formData.program}</b> and contact you on <b>{formData.phone}</b> or <b>{formData.email}</b>.
                    </p>
                    <div style={{ background: 'rgba(5, 7, 10, 0.8)', padding: '16px', borderRadius: '12px', border: '1px solid var(--ad-border-navy)', marginBottom: '24px', textAlign: 'left', fontSize: '0.9rem', color: '#94a3b8' }}>
                        <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}>Official Address & Support:</p>
                        <p>Adilitix Robotics 1st Floor, Aswathy Building, Main Road, Kollam, Kerala</p>
                        <p>Phone: +91 8075355024</p>
                    </div>
                    <Link to="/" className="cta-primary" style={{ justifyContent: 'center' }}>Back to Home</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="registration-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} color="var(--ad-orange)" /> Home
                </Link>
                <Logo size="small" showText={true} textSub="INQUIRY" />
            </nav>

            <div className="registration-container">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="registration-form-card" style={{ maxWidth: '700px' }}>
                    <div className="form-header" style={{ marginBottom: '28px' }}>
                        <div className="udyam-badge" style={{ marginBottom: '12px' }}>
                            <Building size={14} /> COLLEGES, STUDENTS & INDUSTRY CLIENTS
                        </div>
                        <h1 style={{ color: '#fff', fontSize: '2rem' }}>Request Workshops, Internships or Project Development</h1>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.95rem', marginTop: '6px' }}>
                            Partner with <b>Adilitix Robotics</b> in Kollam & Kerala for 7+ yrs expert training, robotics internships, and custom product development.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="reg-form">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label>Full Name & Designation</label>
                                <input
                                    type="text"
                                    placeholder="Prof. / Student / Client Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>College / School / Organization</label>
                                <input
                                    type="text"
                                    placeholder="Institution / Company Name"
                                    value={formData.institution}
                                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label>Department / Stream</label>
                                <input
                                    type="text"
                                    placeholder="ECE / CS / Mechanical / Robotics / MCA"
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="+91 8075355024"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="faculty@college.edu.in / student@gmail.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Preferred Dates / Timeline</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Next Month / Immediate"
                                    value={formData.preferredDates}
                                    onChange={e => setFormData({ ...formData, preferredDates: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Select Service Required</label>
                            <select
                                value={formData.program}
                                onChange={e => setFormData({ ...formData, program: e.target.value })}
                                required
                            >
                                <option value="Robotics Workshop & Bootcamp">Institutional Robotics Workshop / Bootcamp</option>
                                <option value="Robotics & Edge AI Internship">Robotics & Edge AI Student Internship</option>
                                <option value="Product & Project Development">Product & Academic Project Development Service</option>
                                <option value="RoboMaker Summer Camp">RoboMaker Summer Camp (50-Hour School & Early College)</option>
                                <option value="The Robotics Blueprint">The Robotics Blueprint (Engineering Depts)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Specific Requirements & Project Details</label>
                            <textarea
                                rows="3"
                                placeholder="Provide specific project details, estimated participant count, or custom hardware requirements..."
                                value={formData.requirements}
                                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                            />
                        </div>

                        <button type="submit" disabled={loading} className="submit-btn" style={{ width: '100%', marginTop: '10px' }}>
                            {loading ? 'Submitting...' : 'SUBMIT INQUIRY'} <Send size={18} />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Inquiry;
