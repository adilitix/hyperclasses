import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingFooter from '../components/LandingFooter';
import '../styles/go_catalog.css';

const WorkshopsPage = () => {
    const navigate = useNavigate();
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [view, setView] = useState('catalog'); // 'catalog' or 'register' (simulated)

    const [workshops, setWorkshops] = useState([
        {
            id: 'robotics-esp32',
            title: "Intro to Robotics with ESP32",
            category: "Robotics",
            duration: "2 Hours",
            level: "Beginner",
            live: true,
            desc: "Build your first internet-connected robot. Learn sensor integration and basic control.",
            image: "🤖"
        },
        {
            id: 'mern-stack',
            title: "Full-Stack Web Dev with MERN",
            category: "Coding",
            duration: "4 Hours",
            level: "Intermediate",
            live: true,
            desc: "Build a complete web application from scratch using MongoDB, Express, React, and Node.js.",
            image: "💻"
        }
    ]);

    const [filter, setFilter] = useState('All');
    const categories = ['All', 'Coding', 'Robotics', 'AI'];

    const workshopTiers = [
        { days: 1, price: 99, label: 'Introductory - 1 Day' },
        { days: 3, price: 299, label: 'Deep Dive - 3 Days' },
        { days: 5, price: 499, label: 'Mastery - 5 Days' },
    ];

    const handleEnroll = (workshopTitle, tier) => {
        const message = `HI im interested in your ${workshopTitle.toUpperCase()} workshop (${tier.label} at Rs ${tier.price})`;
        window.open(`https://wa.me/918075355024?text=${encodeURIComponent(message)}`, '_blank');
        setSelectedWorkshop(null);
    };

    const fetchWorkshops = async () => {
        try {
            const res = await fetch('/api/workshops');
            const data = await res.json();
            if (data && data.length > 0) setWorkshops(data);
        } catch (err) {
            console.error('Failed to fetch workshops', err);
        }
    };

    useEffect(() => {
        fetchWorkshops();
        document.body.classList.add('go-mode');
        return () => document.body.classList.remove('go-mode');
    }, []);

    const filteredWorkshops = filter === 'All' ? workshops : workshops.filter(w => w.category === filter);

    return (
        <div className="go-catalog-container">
            {/* Header */}
            <header className="go-catalog-header">
                <div className="go-logo" onClick={() => navigate('/')}>
                    <div className="logo-symbol">H</div>
                    <span className="logo-text">Hyper<span>class</span> GO</span>
                </div>
                <nav className="catalog-nav">
                    <button className="nav-item active" onClick={() => setView('catalog')}>CATALOG</button>
                    <button className="nav-item" onClick={() => navigate('/go/login')}>LOGIN</button>
                    <button className="register-workshop-btn" onClick={() => setView('register')}>
                        REGISTER FOR WORKSHOP
                    </button>
                </nav>
            </header>

            <main className="catalog-main">
                <div className="catalog-hero">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        THE FUTURE IS <span className="highlight">HANDS-ON</span>
                    </motion.h1>
                    <p>Select your discipline and start building today.</p>

                    <div className="catalog-filters">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="workshop-grid">
                    {filteredWorkshops.map((w, i) => (
                        <motion.div
                            key={w.id}
                            className="workshop-go-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="card-badge">{w.category}</div>
                            <div className="card-vis">
                                <span className="huge-icon">{w.image}</span>
                            </div>
                            <div className="card-info">
                                <h3>{w.title}</h3>
                                <div className="meta">
                                    <span>{w.duration}</span> • <span>{w.level}</span>
                                </div>
                                <p>{w.desc}</p>
                            </div>
                            <div className="card-footer">
                                <button className="enroll-btn" onClick={() => setSelectedWorkshop(selectedWorkshop === w.id ? null : w.id)}>
                                    {selectedWorkshop === w.id ? 'CLOSE' : 'ENROLL NOW'}
                                </button>
                            </div>

                            <AnimatePresence>
                                {selectedWorkshop === w.id && (
                                    <motion.div
                                        className="tier-reveal"
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                    >
                                        <div className="tier-grid">
                                            {workshopTiers.map(tier => (
                                                <div key={tier.days} className="tier-go-item" onClick={() => handleEnroll(w.title, tier)}>
                                                    <div className="tier-days">{tier.days} DAY</div>
                                                    <div className="tier-price">₹{tier.price}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </main>

            <LandingFooter />

            {/* Simulated Registration Modal */}
            <AnimatePresence>
                {view === 'register' && (
                    <motion.div
                        className="registration-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="registration-card">
                            <button className="close-reg" onClick={() => setView('catalog')}>✕</button>
                            <h2>START YOUR JOURNEY</h2>
                            <p>Fill in your details to get a preference call from our team.</p>
                            <form className="reg-form" onSubmit={(e) => { e.preventDefault(); alert('Registered! We will contact you.'); setView('catalog'); }}>
                                <input type="text" placeholder="Full Name" required />
                                <input type="email" placeholder="Email Address" required />
                                <input type="tel" placeholder="Phone Number" required />
                                <select required>
                                    <option value="">Select Workshop</option>
                                    {workshops.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                                </select>
                                <button type="submit" className="reg-submit">SEND REQUEST</button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkshopsPage;
