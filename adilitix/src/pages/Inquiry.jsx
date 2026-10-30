import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { BASE_URL } from '../lib/api';
import { INITIAL_PROGRAMS } from '../data/programsData';

// Options mirror what we actually offer: the services on the home page plus every brochure programme.
const SERVICE_OPTIONS = [
    'Robot dog event rental (Unitree Go2 Pro)',
    'Custom 3D printing / CAD design',
    'Custom project or product development',
    ...INITIAL_PROGRAMS.map(p => `Workshop: ${p.title}`),
    'Something else',
];

const Inquiry = () => {
    const [formData, setFormData] = useState({
        name: '',
        institution: '',
        department: '',
        phone: '',
        email: '',
        preferredDates: '',
        program: SERVICE_OPTIONS[0],
        requirements: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.institution ? `${formData.name} (${formData.institution})` : formData.name,
                    phone: formData.phone,
                    requirements: `INSTITUTIONAL & PROJECT INQUIRY:\nInstitution/Company: ${formData.institution}\nDepartment/Role: ${formData.department}\nService Requested: ${formData.program}\nPreferred Dates: ${formData.preferredDates}\nEmail: ${formData.email}\nNotes: ${formData.requirements}`,
                    items: [{ id: 'inquiry-proposal', name: `Inquiry: ${formData.program}`, quantity: 1 }]
                })
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
            } else {
                setError(data.message || 'Could not send your inquiry. Please try again or call us.');
            }
        } catch {
            setError('Could not reach the server. Please check your connection and try again, or call +91 80753 55024.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="shop-page">
            <SiteHeader />

            <main className="container section" style={{ paddingTop: 'clamp(40px, 6vw, 72px)' }}>
                <div className="grid-2" style={{ alignItems: 'start' }}>
                    <div>
                        <span className="eyebrow">Contact</span>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 700 }}>Tell us what you need.</h1>
                        <p className="section-lead">
                            Event bookings, printing jobs, workshops or a custom build. Share a few details and we will reply with a plan
                            and a quote, usually within one working day.
                        </p>
                        <div className="contact-list" style={{ marginTop: 32 }}>
                            <div><Phone size={18} /><a href="tel:+918075355024">+91 80753 55024</a></div>
                            <div><Mail size={18} /><a href="mailto:contact@adilitix.com">contact@adilitix.com</a></div>
                            <div><MapPin size={18} /><span>1st Floor, Aswathy Building, Main Road, Kollam, Kerala</span></div>
                        </div>
                    </div>

                    <div className="registration-form-card" style={{ maxWidth: 'none' }}>
                        {submitted ? (
                            <div role="status">
                                <div className="icon-tile" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
                                    <CheckCircle2 size={20} />
                                </div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Thanks, {formData.name}. We have your request.</h2>
                                <p className="muted" style={{ margin: '10px 0 24px' }}>
                                    We will get back to you on {formData.phone}
                                    {formData.email ? <> or {formData.email}</> : null}.
                                </p>
                                <div className="cta-group">
                                    <Link to="/" className="btn btn-secondary">Back to home</Link>
                                    <Link to="/programs" className="btn btn-primary">Browse workshops</Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="inq-service">What can we help with?</label>
                                    <select id="inq-service" value={formData.program} onChange={update('program')} required>
                                        {SERVICE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>

                                <div className="responsive-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="inq-name">Your name</label>
                                        <input id="inq-name" type="text" autoComplete="name" value={formData.name} onChange={update('name')} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inq-org">Organisation <span className="subtle">(optional)</span></label>
                                        <input id="inq-org" type="text" autoComplete="organization" placeholder="College or company" value={formData.institution} onChange={update('institution')} />
                                    </div>
                                </div>

                                <div className="responsive-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="inq-phone">Phone / WhatsApp</label>
                                        <input id="inq-phone" type="tel" autoComplete="tel" inputMode="tel" pattern="[0-9+ ()-]{10,}" title="Enter at least 10 digits" value={formData.phone} onChange={update('phone')} required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inq-email">Email</label>
                                        <input id="inq-email" type="email" autoComplete="email" value={formData.email} onChange={update('email')} required />
                                    </div>
                                </div>

                                <div className="responsive-form-grid">
                                    <div className="form-group">
                                        <label htmlFor="inq-dept">Department <span className="subtle">(optional)</span></label>
                                        <input id="inq-dept" type="text" placeholder="e.g. ECE, HOD" value={formData.department} onChange={update('department')} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="inq-dates">Preferred dates <span className="subtle">(optional)</span></label>
                                        <input id="inq-dates" type="text" placeholder="e.g. mid-December" value={formData.preferredDates} onChange={update('preferredDates')} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="inq-notes">Details</label>
                                    <textarea id="inq-notes" rows="4" placeholder="Event venue, part dimensions, number of participants, anything that helps us quote." value={formData.requirements} onChange={update('requirements')} />
                                </div>

                                {error && <p role="alert" className="form-error">{error}</p>}
                                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                                    {loading ? 'Sending…' : <>Send inquiry <Send size={16} /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
};

export default Inquiry;
