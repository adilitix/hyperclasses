import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, Cpu, ShieldCheck, CheckCircle2, Download, Play, Search, Layers, Zap, BookOpen } from 'lucide-react';
import Logo from '../components/Logo';
import { projectsData } from '../data/projectsData';

const Projects = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const projectsList = Object.values(projectsData);

    const categories = ['All', 'IoT & Climate Tech', 'Robotics & Autonomous AI', 'Applied Bio-Electronics & Wearables', 'Assistive Healthcare Tech', 'Robotics & Industrial Automation'];

    const filteredProjects = projectsList.filter(proj => {
        const matchCategory = selectedCategory === 'All' || proj.category === selectedCategory;
        const matchSearch = !searchQuery.trim() ||
            proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proj.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    return (
        <div className="shop-page" style={{ minHeight: '100vh', background: '#05070a', color: '#f8fafc' }}>
            {/* Top Navigation */}
            <nav className="navbar" style={{ background: 'rgba(5, 7, 10, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 1000 }}>
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} color="var(--ad-orange)" /> Home
                </Link>
                <Logo size="small" showText={true} textSub="PROJECTS" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/programs" className="nav-links" style={{ display: 'none', mdDisplay: 'block' }}>
                        Programs
                    </Link>
                    <Link to="/inquiry" className="nav-btn-subtle" style={{ color: 'var(--ad-orange)', padding: '8px 16px', fontSize: '0.85rem' }}>
                        Get Support
                    </Link>
                </div>
            </nav>

            {/* Hero Header */}
            <header style={{ padding: '60px 8% 40px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                <div className="udyam-badge" style={{ margin: '0 auto 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={15} /> APPLIED ENGINEERING & SASTHROLSAVAM PORTFOLIO
                </div>
                <h1 style={{ fontSize: '2.8rem', color: '#fff', fontWeight: '900', marginBottom: '16px', letterSpacing: '-0.5px' }}>
                    Applied Robotics, <span style={{ color: 'var(--ad-orange)' }}>IoT & AI Projects</span>
                </h1>
                <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.15rem', maxWidth: '780px', margin: '0 auto', lineHeight: '1.6' }}>
                    Complete project engineering suite with ready-to-flash microcontroller firmware, verified circuit pinout tables, mathematical formulations, live simulators, and exhibition viva defense cards.
                </p>

                {/* Filter and Search Bar */}
                <div style={{ margin: '36px auto 0', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ad-text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Search by project name, sensor, or domain..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 16px 14px 44px',
                                background: 'rgba(14, 26, 52, 0.6)',
                                border: '1px solid var(--ad-border-navy)',
                                borderRadius: '14px',
                                color: '#fff',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.82rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    border: selectedCategory === cat ? '1px solid var(--ad-orange)' : '1px solid rgba(255, 255, 255, 0.1)',
                                    background: selectedCategory === cat ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                    color: selectedCategory === cat ? 'var(--ad-orange)' : 'var(--ad-text-dim)'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Projects Grid */}
            <main style={{ padding: '0 8% 80px', maxWidth: '1240px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
                    {filteredProjects.map((project, idx) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                            style={{
                                background: 'rgba(14, 26, 52, 0.7)',
                                border: '1px solid var(--ad-border-navy)',
                                borderRadius: '24px',
                                padding: '28px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.3s ease',
                                backdropFilter: 'blur(12px)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            whileHover={{ y: -6, borderColor: 'var(--ad-orange)' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: project.accentColor || 'var(--ad-orange)' }} />

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '2rem' }}>{project.icon}</span>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.6px',
                                        padding: '4px 12px',
                                        borderRadius: '999px',
                                        background: `${project.badgeColor}20`,
                                        color: project.badgeColor,
                                        border: `1px solid ${project.badgeColor}40`
                                    }}>
                                        {project.badge}
                                    </span>
                                </div>

                                <h2 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800, lineHeight: '1.3', marginBottom: '8px' }}>
                                    {project.title}
                                </h2>
                                <p style={{ fontSize: '0.88rem', color: 'var(--ad-text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
                                    {project.tagline}
                                </p>

                                {/* Key Metrics Strip */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px', padding: '12px', background: 'rgba(5, 7, 10, 0.5)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    {project.metrics.slice(0, 2).map((m, i) => (
                                        <div key={i}>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--ad-text-dim)', display: 'block' }}>{m.label}</span>
                                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{m.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                                <Link
                                    to={`/projects/${project.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '0.92rem',
                                        boxShadow: '0 4px 14px rgba(56, 189, 248, 0.25)'
                                    }}
                                >
                                    <span>Inspect Blueprint & Code</span>
                                    <ArrowRight size={16} />
                                </Link>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {project.simulatorUrl && (
                                        <a
                                            href={project.simulatorUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                padding: '10px',
                                                borderRadius: '10px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: '#38bdf8',
                                                fontSize: '0.82rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            <Play size={14} /> Live Simulator
                                        </a>
                                    )}

                                    {project.reportPdf && (
                                        <a
                                            href={project.reportPdf}
                                            download
                                            style={{
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                padding: '10px',
                                                borderRadius: '10px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: 'var(--ad-orange)',
                                                fontSize: '0.82rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            <Download size={14} /> PDF Report
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ad-text-dim)' }}>
                        <p style={{ fontSize: '1.1rem' }}>No projects found matching "{searchQuery}". Try selecting another category.</p>
                    </div>
                )}
            </main>

            {/* Pre-Flight Checklist */}
            <section style={{ padding: '0 8% 80px', maxWidth: '1240px', margin: '0 auto' }}>
                <div style={{ background: 'rgba(14, 26, 52, 0.85)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '24px', padding: '36px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 10px', borderRadius: '6px' }}>
                            EXHIBITION PRE-FLIGHT CHECKLIST
                        </span>
                        <h2 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, marginTop: '10px' }}>
                            Stall 5-Minute Safety & Verification Checklist
                        </h2>
                        <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                            Before evaluators and visitors inspect your prototype, verify these critical points:
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {[
                            { title: 'Common Ground (GND) Bonded', text: 'Ensure the microcontroller GND, battery GND, and motor/relay power rail GND are all connected together.' },
                            { title: 'Serial Baud Synchronized', text: 'Arduino Serial Monitor must be configured to exactly 115200 baud in the IDE bottom-right corner.' },
                            { title: 'Isolated Motor Power Rail', text: 'Never drive high-current DC motors or 12V pumps directly from microcontroller 5V or 3.3V logic pins.' },
                            { title: 'Offline Hotspot Verified', text: 'Check that the ESP32 Wi-Fi SoftAP "ESP32-Smart-Monitor" (192.168.4.1) is accessible from your smartphone.' },
                            { title: 'Spare Batteries Charged', text: 'Keep a spare power bank or charged 3S LiPo battery at your stall to prevent shutdown during viva evaluation.' },
                            { title: '60-Second Pitch Prepared', text: 'Every team member should know the problem, mathematical model, and unique advantage of the prototype.' }
                        ].map((chk, i) => (
                            <div key={i} style={{ background: 'rgba(5, 7, 10, 0.6)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px' }}>
                                <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong style={{ color: '#fff', fontSize: '0.92rem', display: 'block', marginBottom: '4px' }}>{chk.title}</strong>
                                    <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.82rem', lineHeight: '1.5' }}>{chk.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Projects;
