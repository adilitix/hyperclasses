import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, Layers, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, Users, ShieldCheck, Zap, Briefcase, Award, Plus, FileText, Search, Printer, Share2 } from 'lucide-react';
import Logo from '../components/Logo';
import SyllabusModal from '../components/SyllabusModal';
import ProposalModal from '../components/ProposalModal';
import SyllabusEditorModal from '../components/SyllabusEditorModal';
import { INITIAL_PROGRAMS } from '../data/programsData';
import '../styles/brochure.css';

const Programs = () => {
    const navigate = useNavigate();

    // Load saved programs or use initial dataset
    const [programs, setPrograms] = useState(() => {
        try {
            const saved = localStorage.getItem('adilitix_brochure_programs');
            return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
        } catch {
            return INITIAL_PROGRAMS;
        }
    });

    const [selectedDept, setSelectedDept] = useState('All');
    const [durationFilter, setDurationFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [presentationMode, setPresentationMode] = useState(false);

    // Proposal Basket
    const [selectedPrograms, setSelectedPrograms] = useState(() => {
        try {
            const saved = localStorage.getItem('adilitix_proposal_basket');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Modals
    const [activeSyllabusProgram, setActiveSyllabusProgram] = useState(null);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [showAddEditorModal, setShowAddEditorModal] = useState(false);

    useEffect(() => {
        localStorage.setItem('adilitix_brochure_programs', JSON.stringify(programs));
    }, [programs]);

    useEffect(() => {
        localStorage.setItem('adilitix_proposal_basket', JSON.stringify(selectedPrograms));
    }, [selectedPrograms]);

    const departments = [
        'All',
        'Robotics & Mechatronics',
        'Computer Science & IT',
        'Electronics & Electrical',
        'Artificial Intelligence & Data Science',
        'Cyber Security & Cloud'
    ];

    const filteredPrograms = programs.filter(p => {
        const matchDept = selectedDept === 'All' || p.department === selectedDept;
        const matchDuration = durationFilter === 'All' || p.duration.toLowerCase().includes(durationFilter.toLowerCase());
        const matchSearch = !searchQuery.trim() ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase());

        return matchDept && matchDuration && matchSearch;
    });

    const toggleSelectProgram = (program) => {
        const exists = selectedPrograms.some(p => p.id === program.id);
        if (exists) {
            setSelectedPrograms(selectedPrograms.filter(p => p.id !== program.id));
        } else {
            setSelectedPrograms([...selectedPrograms, program]);
        }
    };

    const handleSaveNewProgram = (newProg) => {
        setPrograms([newProg, ...programs]);
    };

    return (
        <div className={`brochure-container ${presentationMode ? 'presentation-mode' : ''}`} style={{ background: '#05070a' }}>
            <div className="brochure-bg-glow" />

            {/* Navigation Bar */}
            <nav className="navbar" style={{ background: 'rgba(5, 7, 10, 0.9)', borderColor: 'var(--ad-border-navy)' }}>
                <Link to="/" className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} color="var(--ad-orange)" /> Home
                </Link>
                <Logo size="small" showText={true} textSub="COLLEGE BROCHURE" />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                        className="brochure-btn-secondary"
                        onClick={() => setPresentationMode(!presentationMode)}
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                        {presentationMode ? '📺 Exit Presenter Mode' : '📺 HOD Presenter Mode'}
                    </button>
                    <button
                        className="brochure-btn-secondary"
                        onClick={() => setShowAddEditorModal(true)}
                        style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                    >
                        <Plus size={14} /> Add Syllabus
                    </button>
                    <Link to="/inquiry" className="nav-btn-subtle" style={{ color: 'var(--ad-orange)', fontSize: '0.85rem', padding: '6px 14px' }}>
                        Book Workshop →
                    </Link>
                </div>
            </nav>

            {/* Hero Header */}
            <section className="brochure-hero" style={{ paddingTop: '40px' }}>
                <div className="brochure-badge" style={{ background: 'rgba(249, 115, 22, 0.1)', borderColor: 'rgba(249, 115, 22, 0.3)', color: 'var(--ad-orange)' }}>
                    🎓 ADILITIX ROBOTICS ACADEMIC CATALOG 2026
                </div>
                <h1 style={{ fontSize: '2.8rem', fontWeight: 900 }}>
                    Institutional Programs & <br />
                    <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #f97316 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Syllabi Catalog for Colleges
                    </span>
                </h1>
                <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.1rem', maxWidth: '780px', margin: '0 auto 28px' }}>
                    Led by trainers with <b>7+ years of experience</b> and <b>200+ successful workshops</b> in Kollam & Kerala. Browse module breakdowns, hardware kit specs, and build official college proposals.
                </p>

                {/* Search Bar */}
                <div style={{ maxWidth: '580px', margin: '0 auto 20px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="🔍 Search by topic (e.g. ESP32, Robotics, Generative AI, MERN, Python)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            borderRadius: '30px',
                            background: 'rgba(11, 17, 32, 0.9)',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            color: '#fff',
                            fontSize: '0.92rem',
                            outline: 'none',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                        }}
                    />
                </div>
            </section>

            {/* Department Filter Tabs */}
            <section className="brochure-controls">
                <div className="brochure-dept-tabs">
                    {departments.map((dept) => (
                        <button
                            key={dept}
                            className={`dept-tab-btn ${selectedDept === dept ? 'active' : ''}`}
                            onClick={() => setSelectedDept(dept)}
                            style={selectedDept === dept ? { borderColor: 'var(--ad-orange)', color: 'var(--ad-orange)', background: 'rgba(249, 115, 22, 0.15)' } : {}}
                        >
                            {dept === 'All' ? '🌐 All Departments' : dept}
                        </button>
                    ))}
                </div>

                <div className="duration-level-filters">
                    <div style={{ fontSize: '0.85rem', color: 'var(--ad-text-dim)', fontWeight: 600 }}>
                        Showing {filteredPrograms.length} Academic Programs
                    </div>

                    <div className="filter-pill-group">
                        <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>Filter Duration:</span>
                        {['All', '1-Day', '3-Day', '5-Day'].map((dur) => (
                            <button
                                key={dur}
                                className={`filter-pill ${durationFilter === dur ? 'active' : ''}`}
                                onClick={() => setDurationFilter(dur)}
                                style={durationFilter === dur ? { borderColor: 'var(--ad-orange)', color: 'var(--ad-orange)', background: 'rgba(249, 115, 22, 0.15)' } : {}}
                            >
                                {dur}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="brochure-grid">
                {filteredPrograms.map((prog, idx) => {
                    const isSelected = selectedPrograms.some(p => p.id === prog.id);
                    return (
                        <motion.div
                            key={prog.id}
                            className="program-card"
                            style={{ background: 'rgba(11, 17, 32, 0.8)', borderColor: 'var(--ad-border-navy)' }}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="program-card-header">
                                <div className="program-card-badge-row">
                                    <span className="program-category-badge" style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--ad-orange)', borderColor: 'rgba(249, 115, 22, 0.3)' }}>
                                        {prog.department}
                                    </span>
                                    <span className="program-duration-badge" style={{ color: '#f59e0b' }}>
                                        <Clock size={13} /> {prog.duration}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '2rem' }}>{prog.imageIcon || '🤖'}</span>
                                    <div>
                                        <span className="program-code">{prog.code}</span>
                                        <h3 className="program-title" style={{ fontSize: '1.2rem', color: '#fff' }}>{prog.title}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="program-card-body">
                                <p className="program-desc" style={{ color: 'var(--ad-text-dim)', fontSize: '0.88rem' }}>{prog.desc}</p>

                                <div className="program-tags-row">
                                    <span className="tag-item">🎯 {prog.targetBatch}</span>
                                    <span className="tag-item">⚡ {prog.level}</span>
                                </div>

                                <ul className="program-highlights-list">
                                    {prog.highlights && prog.highlights.slice(0, 3).map((h, hidx) => (
                                        <li key={hidx} style={{ fontSize: '0.82rem' }}>{h}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="program-card-footer" style={{ background: 'rgba(5, 7, 10, 0.6)' }}>
                                <button
                                    className="btn-view-syllabus"
                                    onClick={() => setActiveSyllabusProgram(prog)}
                                    style={{ borderColor: 'rgba(249, 115, 22, 0.3)', color: 'var(--ad-orange)', background: 'rgba(249, 115, 22, 0.1)' }}
                                >
                                    <BookOpen size={14} /> View Syllabus
                                </button>

                                <button
                                    className={`btn-select-proposal ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleSelectProgram(prog)}
                                >
                                    {isSelected ? '✓ Selected' : '+ Pick'}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </section>

            {/* Floating HOD Proposal Basket Bar */}
            {selectedPrograms.length > 0 && (
                <motion.div
                    className="hod-proposal-bar"
                    style={{ background: 'rgba(11, 17, 32, 0.95)', borderColor: 'var(--ad-orange)' }}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                >
                    <div className="proposal-bar-info">
                        <div className="proposal-badge-count" style={{ background: 'var(--ad-orange)' }}>
                            {selectedPrograms.length}
                        </div>
                        <div className="proposal-bar-text">
                            <h4>HOD Proposal Basket</h4>
                            <p>{selectedPrograms.map(p => p.code).join(', ')}</p>
                        </div>
                    </div>

                    <div className="proposal-bar-actions">
                        <button className="brochure-btn-secondary" onClick={() => setSelectedPrograms([])}>
                            Clear
                        </button>
                        <button className="brochure-btn-primary" style={{ background: 'linear-gradient(135deg, #f97316, #dd6b20)' }} onClick={() => setShowProposalModal(true)}>
                            📋 Generate Official College Proposal
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Modals */}
            {activeSyllabusProgram && (
                <SyllabusModal
                    program={activeSyllabusProgram}
                    onClose={() => setActiveSyllabusProgram(null)}
                    onSelectProposal={toggleSelectProgram}
                    isSelected={selectedPrograms.some(p => p.id === activeSyllabusProgram.id)}
                />
            )}

            {showProposalModal && (
                <ProposalModal
                    selectedPrograms={selectedPrograms}
                    onRemoveProgram={(id) => setSelectedPrograms(selectedPrograms.filter(p => p.id !== id))}
                    onClose={() => setShowProposalModal(false)}
                    onClearAll={() => setSelectedPrograms([])}
                />
            )}

            {showAddEditorModal && (
                <SyllabusEditorModal
                    onSaveProgram={handleSaveNewProgram}
                    onClose={() => setShowAddEditorModal(false)}
                />
            )}
        </div>
    );
};

export default Programs;
