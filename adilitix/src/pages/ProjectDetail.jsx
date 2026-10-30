import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Copy, Check, Play, Cpu, AlertTriangle, HelpCircle, Layers, CheckCircle2, Award, ExternalLink } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import NotFound from './NotFound';
import { projectsData } from '../data/projectsData';

const ProjectDetail = () => {
    const { id, folder } = useParams();
    const resolvedId = (folder && id) ? (projectsData[`${folder}/${id}`] ? `${folder}/${id}` : `${folder}-${id}`) : id;
    const project = projectsData[resolvedId] || projectsData[id];

    const [activeTab, setActiveTab] = useState('overview');
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (project?.code) {
            navigator.clipboard.writeText(project.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadCode = () => {
        if (!project?.code) return;
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
        { id: 'overview', label: 'Overview' },
        { id: 'circuit', label: 'Circuit & pinout' },
        { id: 'steps', label: 'Build guide' },
        { id: 'code', label: 'Code' },
        { id: 'working', label: 'Math & physics' },
        { id: 'applications', label: 'Applications' },
        { id: 'simulator', label: 'Simulator' },
        { id: 'troubleshooting', label: 'Troubleshooting' },
        { id: 'viva', label: 'Viva questions' },
    ];

    if (!project) {
        return (
            <NotFound
                title="Project not found"
                message="We could not find that project. It may have been renamed or removed."
                backTo="/projects"
                backLabel="All projects"
            />
        );
    }

    return (
        <div className="shop-page" style={{ minHeight: '100vh', background: 'var(--bg)', color: '#f8fafc' }}>
            <SiteHeader />

            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', paddingTop: '20px' }}>
                <Link to="/projects" className="btn btn-ghost btn-sm">
                    <ArrowLeft size={16} /> All projects
                </Link>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {project.simulatorUrl && (
                        <a href={project.simulatorUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                            <Play size={14} /> Open live simulator
                        </a>
                    )}
                    {project.reportPdf && (
                        <a href={project.reportPdf} download className="btn btn-secondary btn-sm">
                            <Download size={14} /> PDF report
                        </a>
                    )}
                </div>
            </div>

            {/* Project Hero Header */}
            <header className="container" style={{ paddingTop: '28px', paddingBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
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

                <h1 style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.4rem)', fontWeight: 700, color: 'var(--text)', lineHeight: '1.25', marginBottom: '12px' }}>
                    {project.title}
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'var(--ad-text-dim)', maxWidth: '850px', lineHeight: '1.6', marginBottom: '24px' }}>
                    {project.tagline}
                </p>

                {/* 60-Second Pitch Box */}
                <div style={{ background: 'var(--surface)', border: '1px solid rgba(249, 115, 22, 0.3)', borderRadius: '16px', padding: '20px 24px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ad-orange)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', letterSpacing: '0.5px' }}>
                        <Award size={16} /> 60-Second Exhibition Pitch for Judges
                    </div>
                    <p style={{ color: '#e2e8f0', fontSize: '0.94rem', lineHeight: '1.7', fontStyle: 'italic' }}>
                        "{project.pitch}"
                    </p>
                </div>

                {/* Key Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '30px' }}>
                    {project.metrics.map((m, i) => (
                        <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: '14px', padding: '16px 20px', textAlign: 'center' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--ad-text-dim)', display: 'block', marginBottom: '4px' }}>{m.label}</span>
                            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: project.accentColor || '#38bdf8' }}>{m.val}</span>
                        </div>
                    ))}
                </div>

                {/* Sub-Navigation Tabs */}
                <div role="tablist" style={{ display: 'flex', gap: '4px', overflowX: 'auto', borderBottom: '1px solid var(--border)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 14px',
                                borderRadius: 0,
                                fontSize: '0.88rem',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                                marginBottom: '-1px',
                                background: 'transparent',
                                color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Tab Contents */}
            <main className="container" style={{ paddingBottom: '80px' }}>
                {/* 1. OVERVIEW & BOM */}
                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                                <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={18} color="#ef4444" /> Problem Statement
                                </h3>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', lineHeight: '1.7' }}>{project.problem}</p>
                            </div>

                            <div style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                                <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle2 size={18} color="#10b981" /> Core Engineering Innovation
                                </h3>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', lineHeight: '1.7' }}>{project.innovation}</p>
                            </div>
                        </div>

                        {/* Bill of Materials (BOM) */}
                        <div style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                            <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text)' }}>{item.component}</td>
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: 700, marginBottom: '6px' }}>
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
                                            <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text)' }}>{pin.module}</td>
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
                        {project.steps.map((st) => (
                            <div key={st.step} style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                                    {st.step}
                                </div>
                                <h4 style={{ fontSize: '1.05rem', color: 'var(--text)', fontWeight: 700 }}>{st.title}</h4>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.88rem', lineHeight: '1.6' }}>{st.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 4. CODE */}
                {activeTab === 'code' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}>{project.codeFileName || 'firmware.ino'}</span>
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
                                        color: 'var(--text)',
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
                                        background: 'var(--accent)',
                                        border: 'none',
                                        color: 'var(--text)',
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
                            background: 'var(--bg)',
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
                            <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                                <h3 style={{ fontSize: '1.15rem', color: 'var(--text)', fontWeight: 700, marginBottom: '12px' }}>{m.title}</h3>
                                <div style={{ background: 'var(--bg)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '14px 20px', color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
                                    {m.formula}
                                </div>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.92rem', lineHeight: '1.7' }}>{m.explanation}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 6. APPLICATIONS */}
                {activeTab === 'applications' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
                        {project.applications.map((app, idx) => (
                            <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                                <h4 style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 700, marginBottom: '10px' }}>{app.title}</h4>
                                <p style={{ color: 'var(--ad-text-dim)', fontSize: '0.9rem', lineHeight: '1.6' }}>{app.desc}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 7. LIVE SIMULATOR */}
                {activeTab === 'simulator' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: 700 }}>Interactive On-Page Hardware Simulator</h3>
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px' }}>
                        {project.troubleshooting.map((tb, idx) => (
                            <div key={idx} style={{ background: 'var(--surface)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                                <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={18} /> {tb.problem}
                                </div>
                                <div style={{ marginBottom: '8px', fontSize: '0.85rem', color: 'var(--ad-text-dim)' }}>
                                    <strong style={{ color: 'var(--text)' }}>Root Cause:</strong> {tb.cause}
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
                            <div key={idx} style={{ background: 'var(--surface)', border: '1px solid var(--ad-border-navy)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                                <h4 style={{ fontSize: '1.05rem', color: 'var(--ad-orange)', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HelpCircle size={18} /> {v.q}
                                </h4>
                                <div style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.7', background: 'var(--bg)', padding: '14px 18px', borderRadius: '12px', borderLeft: '3px solid #10b981' }}>
                                    <strong style={{ color: '#10b981', display: 'block', marginBottom: '4px' }}>Evaluator Defense:</strong>
                                    {v.a}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </main>
            <SiteFooter />
        </div>
    );
};

export default ProjectDetail;
