import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        course: '',
        email: '',
        eventId: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const rawBase = import.meta.env.VITE_SERVER_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hyperclass.onrender.com');
    const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

    useEffect(() => {
        Promise.all([
            fetch(`${BASE_URL}/api/events`).then(res => res.json()).catch(() => []),
            fetch(`${BASE_URL}/api/workshops`).then(res => res.json()).catch(() => [])
        ]).then(([liveEvents, workshops]) => {
            const goEvents = (liveEvents || []).filter(e => e.isWorkshop === true).map(e => ({
                id: e.id,
                name: e.name,
                source: 'live'
            }));
            const wsEvents = (workshops || []).map(w => ({
                id: w.id,
                name: w.title,
                source: 'workshop'
            }));
            const merged = [...goEvents];
            wsEvents.forEach(w => {
                if (!merged.find(m => m.id === w.id)) {
                    merged.push(w);
                }
            });
            setEvents(merged);
        }).catch(err => console.error('Failed to fetch events:', err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/adilitix/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error(err);
            alert('Registration failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="registration-container">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="registration-form-card"
                    style={{ textAlign: 'center' }}
                >
                    <div style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--ad-orange)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <CheckCircle2 size={40} />
                    </div>
                    <h2>Workshop Enrollment Successful!</h2>
                    <p style={{ color: 'var(--ad-text-dim)', margin: '14px 0 24px' }}>
                        Thank you <b>{formData.name}</b>. Your enrollment for <b>Adilitix Robotics Workshop</b> has been received. Venue & access details will be sent to <b>{formData.email}</b>.
                    </p>
                    <Link to="/" className="cta-primary" style={{ justifyContent: 'center' }}>Back to Home</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="registration-page">
            <nav className="navbar">
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={20} color="var(--ad-orange)" /> Back to Main
                </Link>
                <Logo size="small" showText={true} textSub="WORKSHOPS" />
            </nav>

            <div className="registration-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="registration-form-card"
                >
                    <div className="form-header" style={{ marginBottom: '28px' }}>
                        <h1 style={{ color: '#fff', fontSize: '1.8rem' }}>Adilitix Robotics Enrollment</h1>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', marginTop: '6px' }}>
                            Join our practical robotics, IoT, and embedded firmware workshops at Aswathy Building, Kollam.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="reg-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Aadil S P"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="aadil@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="+91 8075355024"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Institution / Branch of Study</label>
                            <input
                                type="text"
                                name="course"
                                placeholder="B.Tech Robotics / Mechanical / Electronics"
                                value={formData.course}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Select Workshop Session</label>
                            <select
                                name="eventId"
                                value={formData.eventId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a robotics workshop session</option>
                                {events.map(evt => (
                                    <option key={evt.id} value={evt.id}>
                                        {evt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="submit-btn" style={{ width: '100%', marginTop: '10px' }}>
                            {loading ? 'Registering...' : 'Complete Enrollment'} <Send size={18} />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
