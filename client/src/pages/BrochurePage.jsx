import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LandingFooter from '../components/LandingFooter';
import SyllabusModal from '../components/SyllabusModal';
import ProposalModal from '../components/ProposalModal';
import SyllabusEditorModal from '../components/SyllabusEditorModal';
import { INITIAL_PROGRAMS } from '../data/programsData';
import '../styles/brochure.css';

const BrochurePage = () => {
  const navigate = useNavigate();

  // Load saved programs or use initial data
  const [programs, setPrograms] = useState(() => {
    try {
      const saved = localStorage.getItem('hyperclass_brochure_programs');
      return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
    } catch {
      return INITIAL_PROGRAMS;
    }
  });

  // Department Filters
  const [selectedDept, setSelectedDept] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected programs for Proposal Basket
  const [selectedPrograms, setSelectedPrograms] = useState(() => {
    try {
      const saved = localStorage.getItem('hyperclass_proposal_basket');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Presentation Mode Toggle (HOD Tablet/Projector View)
  const [presentationMode, setPresentationMode] = useState(false);

  // Modals state
  const [activeSyllabusProgram, setActiveSyllabusProgram] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showAddEditorModal, setShowAddEditorModal] = useState(false);

  // Save to local storage when state changes
  useEffect(() => {
    localStorage.setItem('hyperclass_brochure_programs', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('hyperclass_proposal_basket', JSON.stringify(selectedPrograms));
  }, [selectedPrograms]);

  // Unique list of departments
  const departments = [
    'All',
    'Robotics & Mechatronics',
    'Computer Science & IT',
    'Electronics & Electrical',
    'Artificial Intelligence & Data Science',
    'Cyber Security & Cloud'
  ];

  // Filter logic
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
    <div className={`brochure-container ${presentationMode ? 'presentation-mode' : ''}`}>
      <div className="brochure-bg-glow" />

      {/* Header Bar */}
      <header className="brochure-header">
        <div className="brochure-brand" onClick={() => navigate('/')}>
          <div className="brochure-brand-logo">H</div>
          <div className="brochure-brand-title">
            <span className="brochure-brand-name">Hyperclass</span>
            <span className="brochure-brand-tag">Academic Brochure & Syllabi</span>
          </div>
        </div>

        <div className="brochure-header-actions">
          <button
            className={`brochure-btn-secondary ${presentationMode ? 'active' : ''}`}
            onClick={() => setPresentationMode(!presentationMode)}
            title="Toggle high-contrast full view for displaying on tablets/projectors during college visits"
          >
            {presentationMode ? '📺 Exit Presentation Mode' : '📺 HOD Presenter Mode'}
          </button>

          <button className="brochure-btn-secondary" onClick={() => setShowAddEditorModal(true)}>
            ➕ Add / Paste Syllabus
          </button>

          <button className="brochure-btn-secondary" onClick={() => navigate('/workshops')}>
            Go Workshops
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <section className="brochure-hero">
        <div className="brochure-badge">
          🎓 INSTITUTIONAL ACADEMIC CATALOG 2026
        </div>
        <h1>
          Industry-Engineered Syllabi & <br />
          <span className="gradient-text">Hands-On Programs for Colleges</span>
        </h1>
        <p>
          Explore our complete department-wise curriculum, practical hardware kit specifications, day-by-day modules, and verifiable outcomes. Designed for HODs, Deans, and Faculty Coordinators.
        </p>

        {/* Search Bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto 20px', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search by topic, technology (e.g. ESP32, React, Generative AI, ROS2, Python)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '30px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#fff',
              fontSize: '0.95rem',
              outline: 'none',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
            }}
          />
        </div>
      </section>

      {/* Filter Tabs Section */}
      <section className="brochure-controls">
        <div className="brochure-dept-tabs">
          {departments.map((dept) => (
            <button
              key={dept}
              className={`dept-tab-btn ${selectedDept === dept ? 'active' : ''}`}
              onClick={() => setSelectedDept(dept)}
            >
              {dept === 'All' ? '🌐 All Departments' : dept}
            </button>
          ))}
        </div>

        <div className="duration-level-filters">
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
            Showing {filteredPrograms.length} Academic Programs
          </div>

          <div className="filter-pill-group">
            <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>Filter Duration:</span>
            {['All', '1-Day', '3-Day', '5-Day'].map((dur) => (
              <button
                key={dur}
                className={`filter-pill ${durationFilter === dur ? 'active' : ''}`}
                onClick={() => setDurationFilter(dur)}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="program-card-header">
                <div className="program-card-badge-row">
                  <span className="program-category-badge">{prog.department}</span>
                  <span className="program-duration-badge">⏱️ {prog.duration}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '2rem' }}>{prog.imageIcon || '💻'}</span>
                  <div>
                    <span className="program-code">{prog.code}</span>
                    <h3 className="program-title">{prog.title}</h3>
                  </div>
                </div>
              </div>

              <div className="program-card-body">
                <p className="program-desc">{prog.desc}</p>

                <div className="program-tags-row">
                  <span className="tag-item">🎯 {prog.targetBatch}</span>
                  <span className="tag-item">⚡ {prog.level}</span>
                </div>

                <ul className="program-highlights-list">
                  {prog.highlights && prog.highlights.slice(0, 3).map((h, hidx) => (
                    <li key={hidx}>{h}</li>
                  ))}
                </ul>
              </div>

              <div className="program-card-footer">
                <button
                  className="btn-view-syllabus"
                  onClick={() => setActiveSyllabusProgram(prog)}
                >
                  📖 View Syllabus
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
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
        >
          <div className="proposal-bar-info">
            <div className="proposal-badge-count">{selectedPrograms.length}</div>
            <div className="proposal-bar-text">
              <h4>HOD Proposal Basket</h4>
              <p>{selectedPrograms.map(p => p.code).join(', ')}</p>
            </div>
          </div>

          <div className="proposal-bar-actions">
            <button className="brochure-btn-secondary" onClick={() => setSelectedPrograms([])}>
              Clear
            </button>
            <button className="brochure-btn-primary" onClick={() => setShowProposalModal(true)}>
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

      {/* Footer */}
      <div style={{ marginTop: '80px' }}>
        <LandingFooter />
      </div>
    </div>
  );
};

export default BrochurePage;
