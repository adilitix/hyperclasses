import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Send } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { BASE_URL } from '../lib/api';

const Register = () => {
    const [events, setEvents] = useState([]);
    const [eventsLoaded, setEventsLoaded] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        course: '',
        email: '',
        eventId: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const asList = (data) => (Array.isArray(data) ? data : []);
        Promise.all([
            fetch(`${BASE_URL}/api/events`).then(res => res.json()).catch(() => []),
            fetch(`${BASE_URL}/api/workshops`).then(res => res.json()).catch(() => [])
        ]).then(([liveEvents, workshops]) => {
            const merged = asList(liveEvents)
                .filter(e => e.isWorkshop === true)
                .map(e => ({ id: e.id, name: e.name }));
            asList(workshops).forEach(w => {
                if (!merged.find(m => m.id === w.id)) merged.push({ id: w.id, name: w.title });
            });
            setEvents(merged);
        }).finally(() => setEventsLoaded(true));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
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
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch {
            setError('Could not reach the server. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shop-page">
            <SiteHeader />

            <main className="registration-container">
                <div className="registration-form-card">
                    {submitted ? (
                        <div role="status">
                            <div className="icon-tile" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                                <CheckCircle2 size={20} />
                            </div>
                            <h1 style={{ fontSize: '1.4rem', fontWeight: 600 }}>You are registered</h1>
                            <p className="muted" style={{ margin: '10px 0 24px' }}>
                                Thanks, {formData.name}. Venue and joining details will be sent to {formData.email}.
                            </p>
                            <Link to="/" className="btn btn-primary">Back to home</Link>
                        </div>
                    ) : (
                        <>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Workshop registration</h1>
                            <p className="muted" style={{ margin: '8px 0 24px' }}>
                                Register for an upcoming robotics, IoT or embedded systems workshop.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="reg-event">Workshop session</label>
                                    <select id="reg-event" name="eventId" value={formData.eventId} onChange={handleChange} required disabled={eventsLoaded && events.length === 0}>
                                        <option value="">
                                            {!eventsLoaded ? 'Loading sessions…' : events.length ? 'Choose a session' : 'No open sessions right now'}
                                        </option>
                                        {events.map(evt => (
                                            <option key={evt.id} value={evt.id}>{evt.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="reg-name">Full name</label>
                                    <input id="reg-name" type="text" name="name" autoComplete="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="responsive-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="reg-email">Email</label>
                                        <input id="reg-email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="reg-phone">Phone</label>
                                        <input id="reg-phone" type="tel" name="phone" autoComplete="tel" inputMode="tel" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="reg-course">Institution and branch</label>
                                    <input id="reg-course" type="text" name="course" placeholder="e.g. TKM College, B.Tech ECE" value={formData.course} onChange={handleChange} required />
                                </div>
                                {error && <p role="alert" className="form-error">{error}</p>}
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                                    {loading ? 'Registering…' : <>Register <Send size={16} /></>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </main>

            <SiteFooter />
        </div>
    );
};

export default Register;
