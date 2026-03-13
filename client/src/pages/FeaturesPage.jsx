import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import '../styles/landing.css';

const FeaturesPage = () => {
    useEffect(() => {
        document.body.classList.add('landing-mode');
        return () => document.body.classList.remove('landing-mode');
    }, []);

    const features = [
        { title: "Live Collaboration", icon: "💬", desc: "Interact with peers and instructors in real-time. Share code, debug together, and learn faster." },
        { title: "Project-Based Learning", icon: "📝", desc: "Build real-world projects that matter. From robotics to web apps, learn by doing." },
        { title: "Verified Certificates", icon: "🏅", desc: "Earn certificates upon completion to showcase your skills to employers and institutions." },
        { title: "AI-Powered Assistant", icon: "🤖", desc: "Get instant help with your code. Our AI assistant helps you debug and optimize your logic." },
        { title: "Hardware Integration", icon: "🔌", desc: "Seamlessly connect and program ESP32, Arduino, and other hardware directly from the browser." },
        { title: "Cloud Workspace", icon: "☁️", desc: "Access your projects from anywhere. No setup required, just login and start coding." }
    ];

    return (
        <div className="landing-container">
            <LandingNavbar />

            <motion.div
                className="content-wrapper features-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ maxWidth: '1200px', margin: '0 auto' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--landing-text)' }}>Platform Features</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--landing-text-secondary)' }}>Everything you need to master new skills effectively.</p>
                </div>

                <div className="features-grid">
                    {features.map((f, i) => (
                        <div key={i} className="feature-card">
                            <div className="icon">{f.icon}</div>
                            <h3>{f.title}</h3>
                            <p>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            <LandingFooter />
        </div>
    );
};

export default FeaturesPage;
