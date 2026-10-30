import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Layers, Sparkles, CheckCircle2, ArrowRight, BookOpen, Clock, Users, ShieldCheck, Zap, Briefcase, Award, Plus, FileText, Search, Printer, Share2 } from 'lucide-react';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import SyllabusModal from '../components/SyllabusModal';
import ProposalModal from '../components/ProposalModal';
import SyllabusEditorModal from '../components/SyllabusEditorModal';
import { INITIAL_PROGRAMS } from '../data/programsData';
import { getToken } from '../lib/api';
import '../styles/brochure.css';

const Programs = () => {

    // Only locally drafted syllabi are stored in the browser. The published catalogue always comes from
    // programsData, so edits to it reach returning visitors (the old code cached the whole list forever).
    const [customPrograms, setCustomPrograms] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('adilitix_brochure_custom_programs') || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    });
    const programs = [...customPrograms, ...INITIAL_PROGRAMS];
    const isAdmin = !!getToken();

    const [selectedDept, setSelectedDept] = useState('All departments');
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
        try {
            localStorage.removeItem('adilitix_brochure_programs');
            localStorage.setItem('adilitix_brochure_custom_programs', JSON.stringify(customPrograms));
        } catch { /* storage unavailable */ }
    }, [customPrograms]);

    useEffect(() => {
        try {
            localStorage.setItem('adilitix_proposal_basket', JSON.stringify(selectedPrograms));
        } catch { /* storage unavailable */ }
    }, [selectedPrograms]);

    // Programs list several departments in one string (e.g. "Mechatronics, ECE, EEE & Mechanical"),
    // so each filter matches on keywords rather than exact equality.
    const departments = [
        { label: 'All departments', match: null },
        { label: 'Robotics & Mechatronics', match: /robotics|mechatronics/i },
        { label: 'Electronics & Electrical', match: /electronics|ECE|EEE/ },
        { label: 'Computer Science & AI', match: /CSE|computer|artificial intelligence/i },
        { label: 'Mechanical & Production', match: /mechanical|production/i },
    ];

    const activeDept = departments.find(d => d.label === selectedDept) || departments[0];

    const filteredPrograms = programs.filter(p => {
        const matchDept = !activeDept.match || activeDept.match.test(p.department || '');
        const matchSearch = !searchQuery.trim() ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase());

        return matchDept && matchSearch;
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
        setCustomPrograms([newProg, ...customPrograms]);
    };

    return (
        <div className={`brochure-container ${presentationMode ? 'presentation-mode' : ''}`} style={{ background: 'var(--bg)' }}>
            
            <SiteHeader />

            {/* Hero Header */}
            <section className="brochure-hero" style={{ paddingTop: '56px' }}>
                <span className="eyebrow">Workshops for colleges · 2026 catalogue</span>
                <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700 }}>
                    Hands-on engineering workshops
                </h1>
                <p style={{ color: 'var(--ad-text-dim)', fontSize: '1.05rem', maxWidth: '680px', margin: '12px auto 28px' }}>
                    Three-day bootcamps run by trainers with 7+ years of experience and 200+ workshops across Kerala. Open any
                    programme for its day-by-day syllabus, pick the ones you want, and generate a proposal for your HOD.
                </p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
                    <Link to="/inquiry" className="btn btn-primary btn-sm">Book a workshop</Link>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPresentationMode(!presentationMode)}>
                        {presentationMode ? 'Exit presenter mode' : 'Presenter mode'}
                    </button>
                    {isAdmin && (
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddEditorModal(true)}>
                            <Plus size={14} /> Add syllabus
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div style={{ maxWidth: '580px', margin: '0 auto 20px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search by topic, e.g. ESP32, OpenCV, 3D printing"
                        aria-label="Search programmes"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--surface)',
                            border: '1px solid var(--border-strong)',
                            color: 'var(--text)',
                            fontSize: '0.95rem'
                        }}
                    />
                </div>
            </section>

            {/* Department Filter Tabs */}
            <section className="brochure-controls">
                <div className="brochure-dept-tabs">
                    {departments.map(({ label }) => (
                        <button
                            key={label}
                            className={`dept-tab-btn ${selectedDept === label ? 'active' : ''}`}
                            onClick={() => setSelectedDept(label)}
                            aria-pressed={selectedDept === label}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="duration-level-filters">
                    <div style={{ fontSize: '0.875rem', color: 'var(--ad-text-dim)' }}>
                        {filteredPrograms.length} {filteredPrograms.length === 1 ? 'programme' : 'programmes'}
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
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="program-card-header">
                                <div className="program-card-badge-row">
                                    <span className="program-category-badge" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-strong)', background: 'transparent' }}>
                                        {prog.department}
                                    </span>
                                    <span className="program-duration-badge" style={{ color: 'var(--text-muted)' }}>
                                        <Clock size={13} /> {prog.duration}
                                    </span>
                                </div>
                                <div>
                                    <span className="program-code">{prog.code}</span>
                                    <h3 className="program-title" style={{ fontSize: '1.15rem', color: 'var(--text)' }}>{prog.title}</h3>
                                </div>
                            </div>

                            <div className="program-card-body">
                                <p className="program-desc" style={{ color: 'var(--ad-text-dim)', fontSize: '0.88rem' }}>{prog.desc}</p>

                                <div className="program-tags-row">
                                    <span className="tag-item">{prog.targetBatch}</span>
                                    <span className="tag-item">{prog.level}</span>
                                </div>

                                <ul className="program-highlights-list">
                                    {prog.highlights && prog.highlights.slice(0, 3).map((h, hidx) => (
                                        <li key={hidx} style={{ fontSize: '0.82rem' }}>{h}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="program-card-footer" style={{ background: 'var(--bg)' }}>
                                <button
                                    className="btn-view-syllabus"
                                    onClick={() => setActiveSyllabusProgram(prog)}
                                >
                                    <BookOpen size={14} /> View Syllabus
                                </button>

                                <button
                                    className={`btn-select-proposal ${isSelected ? 'selected' : ''}`}
                                    onClick={() => toggleSelectProgram(prog)}
                                >
                                    {isSelected ? <><CheckCircle2 size={14} /> Added</> : <><Plus size={14} /> Add to proposal</>}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
                {filteredPrograms.length === 0 && (
                    <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--ad-text-dim)', padding: '48px 0' }}>
                        No programmes match your search. Try a different topic or department.
                    </p>
                )}
            </section>

            {/* Floating HOD Proposal Basket Bar */}
            {selectedPrograms.length > 0 && (
                <motion.div
                    className="hod-proposal-bar"
                    
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                >
                    <div className="proposal-bar-info">
                        <div className="proposal-badge-count">
                            {selectedPrograms.length}
                        </div>
                        <div className="proposal-bar-text">
                            <h4>Proposal</h4>
                            <p>{selectedPrograms.map(p => p.code).join(', ')}</p>
                        </div>
                    </div>

                    <div className="proposal-bar-actions">
                        <button className="brochure-btn-secondary" onClick={() => setSelectedPrograms([])}>
                            Clear
                        </button>
                        <button className="brochure-btn-primary" onClick={() => setShowProposalModal(true)}>
                            <FileText size={15} /> Generate proposal
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

            <SiteFooter />

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
