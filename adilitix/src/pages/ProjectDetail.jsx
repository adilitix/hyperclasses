import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Copy, Check, Play, Cpu, AlertTriangle, HelpCircle, Layers, CheckCircle2, Award, ExternalLink } from 'lucide-react';
import Logo from '../components/Logo';
import { projectsData } from '../data/projectsData';

const ProjectDetail = () => {
    const { id, folder } = useParams();
    const navigate = useNavigate();
    const resolvedId = (folder && id) ? (projectsData[`${folder}/${id}`] ? `${folder}/${id}` : `${folder}-${id}`) : id;
    const project = projectsData[resolvedId] || projectsData[id] || projectsData['iot'];

    const [activeTab, setActiveTab] = useState('overview');
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (project.code) {
            navigator.clipboard.writeText(project.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadCode = () => {
        if (!project.code) return;
        const blob = new Blob([project.code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = project.codeFileName || `${project.id}_firmware.ino`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tabs = [
        { id: 'overview', label: '📌 Overview & Pitch' },
        { id: 'circuit', label: '🔌 Circuit & Pinout' },
        { id: 'steps', label: '🛠️ Step-by-Step Guide' },
        { id: 'code', label: '💻 Full Ready Code' },
        { id: 'working', label: '⚙️ Math & Physics' },
        { id: 'applications', label: '🚀 Applications' },
        { id: 'simulator', label: '🎮 Live Simulator' },
        { id: 'troubleshooting', label: '🚨 Troubleshooting' },
        { id: 'viva', label: '🎤 Viva Voce Defense' },
    ];

    return (
        <div className="shop-page" style={{ minHeight: '100vh', background: '#05070a', color: '#f8fafc' }}>
            {/* Top Navigation */}
            <nav className="navbar" style={{ background: 'rgba(5, 7, 10, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 1000 }}>
                <Link to="/projects" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} color="var(--ad-orange)" /> All Projects
                </Link>
                <Logo size="small" showText={true} textSub="BLUEPRINT" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {project.simulatorUrl && (
                        <a
                            href={project.simulatorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nav-btn-subtle"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(249, 115, 22, 0.15)', border: '1px solid var(--ad-orange)', color: 'var(--ad-orange)', padding: '8px 14px', fontSize: '0.82rem', borderRadius: '8px', fontWeight: 700 }}
                        >
                            <Play size={14} /> Open Live Test Website
                        </a>
                    )}
                    {project.reportPdf && (
                        <a
                            href={project.reportPdf}
                            download
                            className="nav-btn-subtle"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ad-orange)', padding: '8px 14px', fontSize: '0.82rem' }}
                        >
                            <Download size={14} /> PDF Report
                        </a>
                    )}
                </div>
            </nav>

            {/* Project Hero Header */}
            <header style={{ padding: '40px 8% 30px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '2.2rem' }}>{project.icon}</span>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        background: `${project.badgeColor}20`,
                        color: project.badgeColor,
                        border: `1px solid ${project.badgeColor}40`
                    }}>
                        {project.category}
                    </span>
                </div>

                <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', lineHeight: '1.25', marginBottom: '12px' }}>
                    {project.title}
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--ad-text-dim)', maxWidth: '850px', lineHeight: '1.6', marginBottom: '24px' }}>
                    {project.tagline}
                </p>

                {/* 60-Second Pitch Box */}
                <div style={{ background: 'rgba(14, 26, 52, 0.85)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '16px', padding: '20px 24px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ad-orange)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <Award size={16} /> 60-Second Exhibition Pitch for Judges
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.94rem', lineHeight: '1.7', fontStyle: 'italic' }}>
                        "{project.pitch}"
                    </p>
                </div>

                {/* Key Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '30px' }}>
                    {project.metrics.map((m, i) => (
                        <div key={i} style={{ background: 'rgba(14, 26, 52, 0.6)', border: '1px solid var(--ad-border-navy)', borderRadius: '14px', padding: '16px 20px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--ad-text-dim)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>{m.label}</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: project.accentColor || '#38bdf8' }}>{m.val}</span>
                        </div>
                    ))}
                </div>

                {/* Sub-Navigation Tabs */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '12px',
                                fontSize: '0.88rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: activeTab === tab.id ? '1px solid var(--ad-orange)' : '1px solid rgba(255, 255, 255, 0.08)',
                                background: activeTab === tab.id ? 'rgba(249, 115, 22, 0.15)' : 'rgba(14, 26, 52, 0.5)',
                                color: activeTab === tab.id ? 'var(--ad-orange)' : 'var(--ad-text-dim)'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Tab Contents */}
            <main style={{ padding: '0 8% 80px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* 1. OVERVIEW & BOM */}
                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                            <div style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={18} color="#ef4444" /> Problem Statement
                                </h3>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', lineHeight: '1.7' }}>{project.problem}</p>
                            </div>

                            <div style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle2 size={18} color="#10b981" /> Core Engineering Innovation
                                </h3>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', lineHeight: '1.7' }}>{project.innovation}</p>
                            </div>
                        </div>

                        {/* Bill of Materials (BOM) */}
                        <div style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                            <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Cpu size={18} color="#38bdf8" /> Bill of Materials (BOM)
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--ad-text-dim)', textAlign: 'left' }}>
                                            <th style={{ padding: '12px 14px' }}>Component</th>
                                            <th style={{ padding: '12px 14px' }}>Specifications</th>
                                            <th style={{ padding: '12px 14px' }}>Qty</th>
                                            <th style={{ padding: '12px 14px' }}>Functional Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {project.bom.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#e2e8f0' }}>
                                                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#fff' }}>{item.component}</td>
                                                <td style={{ padding: '12px 14px', color: 'var(--ad-text-dim)' }}>{item.specs}</td>
                                                <td style={{ padding: '12px 14px', color: project.accentColor }}>{item.qty}</td>
                                                <td style={{ padding: '12px 14px' }}>{item.role}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. CIRCUIT & PINOUT */}
                {activeTab === 'circuit' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800, marginBottom: '6px' }}>
                                Microcontroller Pinout & Wiring Interconnections
                            </h3>
                            <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.88rem' }}>
                                Exact hardware pin routing with color codes and electrical protocols.
                            </p>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--ad-text-dim)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px 14px' }}>Module / Sensor</th>
                                        <th style={{ padding: '12px 14px' }}>Device Pin</th>
                                        <th style={{ padding: '12px 14px' }}>MCU Target Pin</th>
                                        <th style={{ padding: '12px 14px' }}>Wire Color</th>
                                        <th style={{ padding: '12px 14px' }}>Protocol & Signal Specs</th>
                                        <th style={{ padding: '12px 14px' }}>Connection Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {project.pinout.map((pin, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', color: '#e2e8f0' }}>
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#fff' }}>{pin.module}</td>
                                            <td style={{ padding: '12px 14px', color: 'var(--ad-orange)' }}>{pin.pin}</td>
                                            <td style={{ padding: '12px 14px' }}><code style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>{pin.mcuPin}</code></td>
                                            <td style={{ padding: '12px 14px' }}>{pin.color}</td>
                                            <td style={{ padding: '12px 14px', color: 'var(--ad-text-dim)' }}>{pin.protocol}</td>
                                            <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#cbd5e1' }}>{pin.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* 3. STEP-BY-STEP BUILD GUIDE */}
                {activeTab === 'steps' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {project.steps.map((st) => (
                            <div key={st.step} style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem' }}>
                                    {st.step}
                                </div>
                                <h4 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 800 }}>{st.title}</h4>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.88rem', lineHeight: '1.6' }}>{st.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 4. CODE */}
                {activeTab === 'code' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(14, 26, 52, 0.85)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>{project.codeFileName || 'firmware.ino'}</span>
                                <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.82rem', marginLeft: '12px' }}>C++ / Arduino IDE Ready</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleCopyCode}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: copied ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                                <button
                                    onClick={handleDownloadCode}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Download size={14} /> Download File
                                </button>
                            </div>
                        </div>

                        <pre style={{
                            background: '#05070a',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: '12px',
                            padding: '20px',
                            overflowX: 'auto',
                            maxHeight: '520px',
                            fontSize: '0.85rem',
                            lineHeight: '1.5',
                            fontFamily: "'JetBrains Mono', monospace",
                            color: '#38bdf8'
                        }}>
                            <code>{project.code}</code>
                        </pre>
                    </motion.div>
                )}

                {/* 5. MATH & SCIENTIFIC PRINCIPLES */}
                {activeTab === 'working' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {project.math.map((m, idx) => (
                            <div key={idx} style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                                <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 800, marginBottom: '12px' }}>{m.title}</h3>
                                <div style={{ background: '#05070a', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '14px 20px', color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px' }}>
                                    {m.formula}
                                </div>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', lineHeight: '1.7' }}>{m.explanation}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 6. APPLICATIONS */}
                {activeTab === 'applications' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        {project.applications.map((app, idx) => (
                            <div key={idx} style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                                <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 800, marginBottom: '10px' }}>{app.title}</h4>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem', lineHeight: '1.6' }}>{app.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 7. LIVE SIMULATOR */}
                {activeTab === 'simulator' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(14, 26, 52, 0.85)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800 }}>Interactive On-Page Hardware Simulator</h3>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.85rem' }}>Test virtual sensor readings, actuation cycles, and on-device logic directly in your browser.</p>
                            </div>
                            {project.simulatorUrl && (
                                <a
                                    href={project.simulatorUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: 'rgba(56, 189, 248, 0.15)',
                                        border: '1px solid rgba(56, 189, 248, 0.3)',
                                        color: '#38bdf8',
                                        fontSize: '0.85rem',
                                        fontWeight: 700
                                    }}
                                >
                                    <ExternalLink size={14} /> Fullscreen Simulator
                                </a>
                            )}
                        </div>

                        {project.simulatorUrl ? (
                            <div style={{ width: '100%', height: '620px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <iframe
                                    src={project.simulatorUrl}
                                    title={`${project.title} Simulator`}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                            </div>
                        ) : (
                            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ad-text-dim)' }}>
                                <p>Interactive standalone GUI simulator is available in the project package.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* 8. TROUBLESHOOTING */}
                {activeTab === 'troubleshooting' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                        {project.troubleshooting.map((tb, idx) => (
                            <div key={idx} style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '18px', padding: '24px' }}>
                                <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={18} /> {tb.problem}
                                </div>
                                <div style={{ marginBottom: '8px', fontSize: '0.85rem', color: 'var(--ad-text-dim)' }}>
                                    <strong style={{ color: '#fff' }}>Root Cause:</strong> {tb.cause}
                                </div>
                                <div style={{ fontSize: '0.88rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    <strong>Solution:</strong> {tb.fix}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 9. VIVA VOCE DEFENSE */}
                {activeTab === 'viva' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {project.viva.map((v, idx) => (
                            <div key={idx} style={{ background: 'rgba(14, 26, 52, 0.7)', border: '1px solid var(--ad-border-navy)', borderRadius: '18px', padding: '24px' }}>
                                <h4 style={{ fontSize: '1.05rem', color: 'var(--ad-orange)', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HelpCircle size={18} /> {v.q}
                                </h4>
                                <div style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.7', background: 'rgba(5, 7, 10, 0.5)', padding: '14px 18px', borderRadius: '12px', borderLeft: '3px solid #10b981' }}>
                                    <strong style={{ color: '#10b981', display: 'block', marginBottom: '4px' }}>Evaluator Defense:</strong>
                                    {v.a}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default ProjectDetail;
