import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SyllabusModal = ({ program, onClose, onSelectProposal, isSelected }) => {
  const [activeTab, setActiveTab] = useState('syllabus');

  if (!program) return null;

  const handlePrintSyllabus = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="syllabus-modal-card"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="syllabus-modal-header">
            <div className="syllabus-modal-title">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                <span className="program-category-badge">{program.department}</span>
                <span className="program-code">{program.code}</span>
              </div>
              <h2>{program.title}</h2>
              <p>⏱️ Duration: <strong>{program.duration}</strong> • Level: <strong>{program.level}</strong></p>
            </div>
            <button className="btn-close-modal" onClick={onClose}>✕</button>
          </div>

          {/* Navigation Tabs */}
          <div className="syllabus-modal-nav no-print">
            <button
              className={`modal-tab-btn ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
            >
              📖 Module-by-Module Syllabus
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'hardware' ? 'active' : ''}`}
              onClick={() => setActiveTab('hardware')}
            >
              🧰 Practical Kits & Infrastructure
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'outcomes' ? 'active' : ''}`}
              onClick={() => setActiveTab('outcomes')}
            >
              🏆 Outcomes & Certification
            </button>
          </div>

          {/* Modal Body */}
          <div className="syllabus-modal-body">
            {activeTab === 'syllabus' && (
              <div>
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', borderLeft: '4px solid #38bdf8', padding: '14px 18px', borderRadius: '0 8px 8px 0', marginBottom: '24px' }}>
                  <h4 style={{ margin: '0 0 6px', color: '#38bdf8', fontSize: '0.95rem' }}>Course Overview & Objective</h4>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>{program.desc}</p>
                  <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>🎯 <strong>Target Batch:</strong> {program.targetBatch} | 📌 <strong>Prerequisites:</strong> {program.prerequisites}</p>
                </div>

                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px' }}>Detailed Module Curriculum</h3>

                <div className="module-timeline">
                  {program.modules && program.modules.map((mod, idx) => (
                    <div key={idx} className="module-item">
                      <div className="module-icon-bubble">{mod.moduleNumber || idx + 1}</div>
                      <div className="module-content-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h4>{mod.title}</h4>
                          <span style={{ fontSize: '0.78rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                            {mod.duration || '4 Hours'}
                          </span>
                        </div>
                        <ul className="module-topics-list">
                          {mod.topics && mod.topics.map((t, tidx) => (
                            <li key={tidx}>{t}</li>
                          ))}
                        </ul>
                        {mod.project && (
                          <div className="module-project-highlight">
                            🛠️ <strong>Practical Hands-on Project:</strong> {mod.project}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'hardware' && (
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '16px' }}>🧰 Hardware & Software Kits Provided</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Every batch of students is equipped with dedicated industrial-grade hardware kits and software sandboxes to ensure 100% practical, hands-on learning.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '30px' }}>
                  {program.hardwareKit && program.hardwareKit.map((item, i) => (
                    <div key={i} style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.4rem' }}>📦</span>
                      <span style={{ color: '#f0f5ff', fontWeight: 600, fontSize: '0.9rem' }}>{item}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '18px', borderRadius: '14px' }}>
                  <h4 style={{ color: '#10b981', margin: '0 0 8px', fontSize: '1rem' }}>🏢 Institutional Lab Setup Requirements</h4>
                  <ul style={{ color: '#cbd5e1', fontSize: '0.88rem', paddingLeft: '20px', margin: 0, lineHeight: 1.6 }}>
                    <li>Standard Computer Lab with Projector & Audio setup</li>
                    <li>Internet Connectivity (WiFi / LAN)</li>
                    <li>Power Outlets for Hardware Testing Benches</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'outcomes' && (
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '16px' }}>🏆 Learning Outcomes & Industry Certifications</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', borderRadius: '14px' }}>
                    <h4 style={{ color: '#38bdf8', marginTop: 0 }}>📜 Verifiable Certification</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6' }}>
                      Every student completing the workshop receives an official ISO-aligned, Blockchain-Verifiable QR Certificate recognized by industry hiring partners.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px', borderRadius: '14px' }}>
                    <h4 style={{ color: '#f59e0b', marginTop: 0 }}>🚀 Project Portfolio</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6' }}>
                      Students publish complete working GitHub repositories and project demonstration videos suitable for placement interviews & NAAC accreditation data.
                    </p>
                  </div>
                </div>

                <h4 style={{ color: '#fff', marginBottom: '12px' }}>Key Program Highlights</h4>
                <ul style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {program.highlights && program.highlights.map((h, idx) => (
                    <li key={idx}>✓ {h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div style={{ padding: '16px 30px', background: 'rgba(10, 15, 26, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="brochure-btn-secondary no-print" onClick={handlePrintSyllabus}>
              🖨️ Print / Save Syllabus PDF
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className={`btn-select-proposal ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectProposal(program)}
              >
                {isSelected ? '✓ Program Added to Proposal' : '+ Add to College Proposal'}
              </button>
              <button className="brochure-btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SyllabusModal;
