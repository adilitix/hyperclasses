import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProposalModal = ({ selectedPrograms, onRemoveProgram, onClose, onClearAll }) => {
  const [collegeName, setCollegeName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [studentCount, setStudentCount] = useState(120);
  const [preferredDates, setPreferredDates] = useState('');
  const [durationMode, setDurationMode] = useState('3-Day Intensive Bootcamp');
  const [customNotes, setCustomNotes] = useState('');
  const [previewProposal, setPreviewProposal] = useState(false);

  const handleWhatsAppShare = () => {
    if (selectedPrograms.length === 0) return;
    const programTitles = selectedPrograms.map(p => `• ${p.title} (${p.code})`).join('\n');
    const msg = `*INSTITUTIONAL WORKSHOP PROPOSAL REQUEST*\n\n*Institution:* ${collegeName || 'College/University'}\n*Department:* ${departmentName || 'Engineering Dept'}\n*Contact Person:* ${contactName || 'HOD / Faculty Coordinator'}\n*Phone:* ${phone}\n*Expected Students:* ${studentCount} Students\n*Preferred Mode:* ${durationMode}\n*Proposed Dates:* ${preferredDates || 'Flexible'}\n\n*SELECTED PROGRAMS & SYLLABI:*\n${programTitles}\n\n*Special Notes:* ${customNotes || 'None'}\n\nPlease share the official proposal PDF and available schedule. Thank you!`;
    
    window.open(`https://wa.me/918075355024?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="syllabus-modal-card"
          style={{ maxWidth: previewProposal ? '900px' : '850px' }}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {/* Header */}
          <div className="syllabus-modal-header">
            <div className="syllabus-modal-title">
              <h2>📋 Institutional Program Proposal Builder</h2>
              <p>Tailor academic programs, estimate student batches, and generate official HOD brochure proposals.</p>
            </div>
            <button className="btn-close-modal" onClick={onClose}>✕</button>
          </div>

          {/* Toggle between Form & Formal Document Preview */}
          <div className="syllabus-modal-nav no-print">
            <button
              className={`modal-tab-btn ${!previewProposal ? 'active' : ''}`}
              onClick={() => setPreviewProposal(false)}
            >
              ✍️ Customize Proposal Details ({selectedPrograms.length} Selected)
            </button>
            <button
              className={`modal-tab-btn ${previewProposal ? 'active' : ''}`}
              onClick={() => setPreviewProposal(true)}
            >
              📄 Preview Official HOD Proposal Document
            </button>
          </div>

          <div className="syllabus-modal-body">
            {!previewProposal ? (
              /* FORM VIEW */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: 0, marginBottom: '16px' }}>
                    1. College & Department Details
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>College / University Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Amrita Vishwa Vidyapeetham / APJ Abdul Kalam Tech University"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Department</label>
                        <input
                          type="text"
                          placeholder="e.g. Dept of CSE / ECE"
                          value={departmentName}
                          onChange={(e) => setDepartmentName(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Contact Person (HOD/Faculty)</label>
                        <input
                          type="text"
                          placeholder="Dr. / Prof. Name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Phone / WhatsApp *</label>
                        <input
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Official Email</label>
                        <input
                          type="email"
                          placeholder="hod.cse@college.edu.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Est. Student Count</label>
                        <select
                          value={studentCount}
                          onChange={(e) => setStudentCount(Number(e.target.value))}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                        >
                          <option value={60}>60 Students (1 Batch)</option>
                          <option value={120}>120 Students (2 Batches)</option>
                          <option value={180}>180 Students (3 Batches)</option>
                          <option value={300}>300+ Students (Whole Year/Stream)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Preferred Duration</label>
                        <select
                          value={durationMode}
                          onChange={(e) => setDurationMode(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                        >
                          <option value="1-Day Hands-on Workshop">1-Day Hands-on Workshop</option>
                          <option value="3-Day Intensive Bootcamp">3-Day Intensive Bootcamp</option>
                          <option value="5-Day Mastery / 30-Hr VAC">5-Day Mastery / 30-Hr VAC</option>
                          <option value="Faculty Development Program (FDP)">Faculty Development Program (FDP)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Special Requests / Custom Syllabus Topics</label>
                      <textarea
                        rows={3}
                        placeholder="Mention any custom topics or lab requirements requested by HOD..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* SELECTED PROGRAMS SIDE PANEL */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>
                      2. Selected Programs ({selectedPrograms.length})
                    </h3>
                    {selectedPrograms.length > 0 && (
                      <button onClick={onClearAll} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>
                        Clear All
                      </button>
                    )}
                  </div>

                  {selectedPrograms.length === 0 ? (
                    <div style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '30px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                      <p>No programs selected yet.</p>
                      <p style={{ fontSize: '0.8rem' }}>Browse the brochure catalog and click <strong>"+ Add to College Proposal"</strong> on desired programs.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
                      {selectedPrograms.map((p) => (
                        <div key={p.id} style={{ background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>{p.code} • {p.department}</div>
                            <div style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 700 }}>{p.title}</div>
                            <div style={{ fontSize: '0.78rem', color: '#f59e0b' }}>⏱️ {p.duration}</div>
                          </div>
                          <button
                            onClick={() => onRemoveProgram(p.id)}
                            style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPrograms.length > 0 && (
                    <div style={{ marginTop: '20px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '14px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#fde68a', fontWeight: 700, marginBottom: '4px' }}>
                        💡 Institutional Proposal Advantage
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        Includes complete hardware kits for student groups, trainer honorarium, blockchain certificates, and NAAC documentation support.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* FORMAL DOCUMENT PREVIEW VIEW (PRINT READY) */
              <div style={{ background: '#fff', color: '#0f172a', padding: '36px', borderRadius: '12px', border: '1px solid #cbd5e1', fontFamily: 'Inter, sans-serif' }}>
                {/* Proposal Header / Letterhead */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '24px' }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>HYPERCLASS ACADEMY</h1>
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>Precision Engineering & Hardware Workshops</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Web: hyperclass.in | Contact: +91 80753 55024 | Email: admin@hyperclass.in</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7' }}>OFFICIAL ACADEMIC PROPOSAL</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Ref: HYP-PROP-{Date.now().toString().slice(-6)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Date: {new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* To & Institution */}
                <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Prepared For:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{contactName || 'The Head of Department'}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>{departmentName || 'Department of Engineering'}</div>
                  <div style={{ fontSize: '0.95rem', color: '#475569' }}>{collegeName || '[College / Institution Name]'}</div>
                  {phone && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Phone: {phone} | Email: {email}</div>}
                </div>

                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  Subject: Proposal for Hands-On Engineering Workshops & Value-Added Courses ({studentCount} Students)
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
                  Dear Professor / Head of Department,<br />
                  We are pleased to submit our comprehensive syllabus proposal for conducting industry-aligned technical workshops at <strong>{collegeName || 'your esteemed institution'}</strong>. Our programs are engineered to bridge the gap between academic curriculum and cutting-edge industry practice through 100% practical, project-based training.
                </p>

                {/* Programs Breakdown */}
                <h4 style={{ fontSize: '1rem', color: '#0284c7', marginTop: '24px', marginBottom: '12px' }}>Selected Syllabi & Program Modules:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {selectedPrograms.map((p, idx) => (
                    <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px', background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{idx + 1}. {p.title} ({p.code})</strong>
                        <span style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 700 }}>{p.duration}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 8px', lineHeight: 1.5 }}>{p.desc}</p>
                      <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
                        Key Highlights: {p.highlights && p.highlights.slice(0, 3).join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Terms & Signature */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '30px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Institutional Deliverables:</div>
                    <ul style={{ fontSize: '0.78rem', color: '#475569', paddingLeft: '16px', margin: '4px 0 0', lineHeight: 1.6 }}>
                      <li>Practical Hardware Kits & Sensor Modules per student group</li>
                      <li>Blockchain-verifiable QR Certificates for all students</li>
                      <li>Faculty Coordinator Mementos & NAAC Documentation Data</li>
                    </ul>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '40px' }}>For Hyperclass Academy</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textDecoration: 'overline' }}>Authorized Signatory</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Technical Director / Program Head</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ padding: '16px 30px', background: 'rgba(10, 15, 26, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="brochure-btn-secondary no-print" onClick={handlePrintDocument}>
              🖨️ Print / Save PDF Proposal
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              {!previewProposal ? (
                <button className="brochure-btn-secondary" onClick={() => setPreviewProposal(true)}>
                  📄 Preview Document
                </button>
              ) : (
                <button className="brochure-btn-secondary" onClick={() => setPreviewProposal(false)}>
                  ✍️ Edit Form
                </button>
              )}
              
              <button className="brochure-btn-primary" onClick={handleWhatsAppShare}>
                📱 Share via WhatsApp to HOD / Company
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProposalModal;
