import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import '../styles/landing.css';

const WorkshopsPage = () => {
    const navigate = useNavigate();
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);

    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

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

    const [filter, setFilter] = useState('All');
    const categories = ['All', 'Coding', 'Robotics', 'AI'];

    const workshops = [
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
        },
        {
            id: 'ai-ml',
            title: "AI & Machine Learning Fundamentals",
            category: "AI",
            duration: "3 Hours",
            level: "Beginner",
            live: true,
            desc: "Understand the basics of AI, train your first model, and explore real-world applications.",
            image: "🧠"
        },
        {
            id: 'iot-home',
            title: "IoT & Smart Home Automation",
            category: "Robotics",
            duration: "2.5 Hours",
            level: "Intermediate",
            live: true,
            desc: "Connect devices, automate your home, and learn about MQTT and cloud platforms.",
            image: "🏠"
        },
        {
            id: 'python-ds',
            title: "Advanced Python for Data Science",
            category: "Coding",
            duration: "3 Hours",
            level: "Advanced",
            live: true,
            desc: "Deep dive into data analysis, visualization, and predictive modeling using Python libraries.",
            image: "🐍"
        },
        {
            id: 'drone-build',
            title: "Build Your Own Drone",
            category: "Robotics",
            duration: "5 Hours",
            level: "Advanced",
            live: true,
            desc: "Assemble, program, and fly your own drone. Learn about flight dynamics and control systems.",
            image: "🚁"
        }
    ];

    const filteredWorkshops = filter === 'All' ? workshops : workshops.filter(w => w.category === filter);

    return (
        <div className="landing-container">
            <LandingNavbar />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Explore Our Interactive Workshops</h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748b' }}>Master new skills in coding, robotics, and AI through live, hands-on sessions.</p>
                    <p style={{ marginTop: '1rem', color: '#0ea5e9', fontWeight: 600 }}>Introductory Offers starting at Rs 99!</p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 600, padding: '0 0.5rem', color: '#64748b' }}>Category</span>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                style={{
                                    border: 'none',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '6px',
                                    background: filter === cat ? 'white' : 'transparent',
                                    color: filter === cat ? '#0f172a' : '#64748b',
                                    boxShadow: filter === cat ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                    {filteredWorkshops.map((w, i) => (
                        <motion.div
                            key={w.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="workshop-card-container"
                        >
                            <div className="workshop-card-content" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
                                <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '64px', height: '64px', background: '#f0f9ff',
                                        borderRadius: '16px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '2.25rem', flexShrink: 0
                                    }}>
                                        {w.image}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.3 }}>{w.title}</h3>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>
                                            {w.duration} • {w.level} • <span style={{ color: w.live ? '#ef4444' : '#64748b' }}>{w.live ? '🔴 Live' : 'Recorded'}</span>
                                        </div>
                                    </div>
                                </div>

                                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, flex: 1, marginBottom: '2rem' }}>
                                    {w.desc}
                                </p>

                                <div style={{ marginTop: 'auto' }}>
                                    <button
                                        className={`btn-gradient-primary ${selectedWorkshop === w.id ? 'active' : ''}`}
                                        style={{ width: '100%', padding: '0.9rem' }}
                                        onClick={() => setSelectedWorkshop(selectedWorkshop === w.id ? null : w.id)}
                                    >
                                        {selectedWorkshop === w.id ? 'Close' : 'Enroll Now'}
                                    </button>

                                    <AnimatePresence>
                                        {selectedWorkshop === w.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div className="tier-options" style={{
                                                    marginTop: '1.5rem',
                                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                                    gap: '0.75rem',
                                                    paddingTop: '1rem',
                                                    borderTop: '1px solid #f1f5f9'
                                                }}>
                                                    {workshopTiers.map((tier) => (
                                                        <div
                                                            key={tier.days}
                                                            className="tier-card"
                                                            onClick={() => handleEnroll(w.title, tier)}
                                                            style={{ padding: '0.75rem 0.25rem', minWidth: 0 }}
                                                        >
                                                            <span className="tier-days" style={{ fontSize: '0.75rem' }}>{tier.days} Day</span>
                                                            <span className="tier-price" style={{ fontSize: '1.1rem' }}>₹{tier.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

export default WorkshopsPage;
