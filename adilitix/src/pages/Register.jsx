import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

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
        // Fetch both live Go events and static workshops
        Promise.all([
            fetch(`${BASE_URL}/api/events`).then(res => res.json()).catch(() => []),
            fetch(`${BASE_URL}/api/workshops`).then(res => res.json()).catch(() => [])
        ]).then(([liveEvents, workshops]) => {
            // Live Go sessions
            const goEvents = (liveEvents || []).filter(e => e.isWorkshop === true).map(e => ({
                id: e.id,
                name: e.name,
                source: 'live'
            }));
            // Static workshops
            const wsEvents = (workshops || []).map(w => ({
                id: w.id,
                name: w.title,
                source: 'workshop'
            }));
            // Merge and deduplicate by ID
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
            <div className="registration-success-view">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-card"
                >
                    <div className="success-icon">✅</div>
                    <h2>Registration Successful!</h2>
                    <p>Thank you <b>{formData.name}</b>. We have received your registration for the workshop. You will receive further details via email.</p>
                    <Link to="/" className="cta-primary">Back to Home</Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="registration-page">
            <nav className="navbar" style={{ position: 'absolute' }}>
                <Link to="/" className="back-link"><ArrowLeft size={20} /> Back</Link>
                <div className="logo">ADILITIX</div>
            </nav>

            <div className="registration-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="registration-form-card"
                >
                    <div className="form-header">
                        <h1>Workshop Enrollment</h1>
                        <p>Join the next generation of roboticists.</p>
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
                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+91 9876543210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Course of Study</label>
                                <input
                                    type="text"
                                    name="course"
                                    placeholder="B.Tech Robotics"
                                    value={formData.course}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Select Event / Workshop</label>
                            <select
                                name="eventId"
                                value={formData.eventId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a session</option>
                                {events.map(evt => (
                                    <option key={evt.id} value={evt.id}>
                                        {evt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? 'Processing...' : 'Complete Registration'} <Send size={18} />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
