import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import '../styles/landing.css';

const WorkshopsPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    const [filter, setFilter] = useState('All');
    const categories = ['All', 'Coding', 'Robotics', 'AI'];

    const workshops = [
        {
            title: "Intro to Robotics with ESP32",
            category: "Robotics",
            duration: "2 Hours",
            level: "Beginner",
            live: true,
            desc: "Build your first internet-connected robot. Learn sensor integration and basic control.",
            image: "🤖"
        },
        {
            title: "Full-Stack Web Dev with MERN",
            category: "Coding",
            duration: "4 Hours",
            level: "Intermediate",
            live: true,
            desc: "Build a complete web application from scratch using MongoDB, Express, React, and Node.js.",
            image: "💻"
        },
        {
            title: "AI & Machine Learning Fundamentals",
            category: "AI",
            duration: "3 Hours",
            level: "Beginner",
            live: true,
            desc: "Understand the basics of AI, train your first model, and explore real-world applications.",
            image: "🧠"
        },
        {
            title: "IoT & Smart Home Automation",
            category: "Robotics",
            duration: "2.5 Hours",
            level: "Intermediate",
            live: true,
            desc: "Connect devices, automate your home, and learn about MQTT and cloud platforms.",
            image: "🏠"
        },
        {
            title: "Advanced Python for Data Science",
            category: "Coding",
            duration: "3 Hours",
            level: "Advanced",
            live: true,
            desc: "Deep dive into data analysis, visualization, and predictive modeling using Python libraries.",
            image: "🐍"
        },
        {
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
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '60px', height: '60px', background: '#f8fafc',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '2rem'
                                }}>
                                    {w.image}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{w.title}</h3>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        {w.duration} | {w.level} | {w.live ? '🔴 Live' : 'Recorded'}
                                    </div>
                                </div>
                            </div>

                            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.5, flex: 1, marginBottom: '1.5rem' }}>
                                {w.desc}
                            </p>

                            <button
                                className="btn-primary"
                                style={{ width: '100%', borderRadius: '8px' }}
                                onClick={() => navigate('/login')}
                            >
                                Enroll Now
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

export default WorkshopsPage;
