import { X } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SyllabusEditorModal = ({ onSaveProgram, onClose }) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState(() => `ADI-CUST-${Math.floor(100 + Math.random() * 900)}`);
  const [department, setDepartment] = useState('Computer Science & IT');
  const [category, setCategory] = useState('Coding');
  const [duration, setDuration] = useState('3-Day Intensive Bootcamp');
  const [desc, setDesc] = useState('');
  const [targetBatch] = useState('2nd & 3rd Year Engineering');
  const [prerequisites] = useState('Basic programming concepts');

  const [rawSyllabusText, setRawSyllabusText] = useState('');

  const [modules, setModules] = useState([
    {
      moduleNumber: 1,
      title: 'Module 1: Foundations & Architecture',
      duration: 'Day 1 (4 Hours)',
      topics: ['Introduction to Core Technology', 'Environment Setup & Circuitry'],
      project: 'Lab 1: Initial Prototype Build'
    }
  ]);

  const handleAddModule = () => {
    setModules([
      ...modules,
      {
        moduleNumber: modules.length + 1,
        title: `Module ${modules.length + 1}: Advanced Implementation`,
        duration: `Day ${modules.length + 1} (4 Hours)`,
        topics: ['Advanced concepts', 'Testing and Debugging'],
        project: `Lab ${modules.length + 1}: System Integration`
      }
    ]);
  };

  const handleParseRawText = () => {
    if (!rawSyllabusText.trim()) return;
    const lines = rawSyllabusText.split('\n').filter(l => l.trim() !== '');

    const parsedMods = [];
    let currentMod = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (/^(module|day|unit)\s*\d+/i.test(trimmed) || !currentMod) {
        if (currentMod) parsedMods.push(currentMod);
        currentMod = {
          moduleNumber: parsedMods.length + 1,
          title: trimmed.replace(/^[-*•]/, '').trim(),
          duration: '4 Hours',
          topics: [],
          project: 'Hands-on Lab Exercise'
        };
      } else if (currentMod) {
        currentMod.topics.push(trimmed.replace(/^[-*•\d+.]/, '').trim());
      }
    });

    if (currentMod) parsedMods.push(currentMod);
    if (parsedMods.length > 0) setModules(parsedMods);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      alert('Please enter a Program Title');
      return;
    }

    const newProgram = {
      id: `prog-custom-${Date.now()}`,
      title,
      code,
      department,
      category,
      duration,
      level: 'All Streams',
      targetBatch,
      desc: desc || title,
      imageIcon: category === 'Robotics' ? '🤖' : category === 'AI & Data' ? '🧠' : '💻',
      prerequisites,
      hardwareKit: ['Custom Workshop Kit & Component Shield', 'Digital Workbook & Sandboxes'],
      highlights: ['100% Practical project-based curriculum', 'Verifiably certified', 'Placement portfolio project'],
      modules
    };

    onSaveProgram(newProgram);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="syllabus-modal-card"
          style={{ maxWidth: '800px' }}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="syllabus-modal-header">
            <div className="syllabus-modal-title">
              <h2>Add / Paste New Program Syllabus</h2>
              <p>Easily add custom college syllabi, workshop tracks, or tailored courses.</p>
            </div>
            <button className="btn-close-modal" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>

          <form onSubmit={handleSubmit} className="syllabus-modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Program Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Drone Engineering & Embedded Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)' }}
                >
                  <option value="Computer Science & IT">Computer Science & IT</option>
                  <option value="Robotics & Mechatronics">Robotics & Mechatronics</option>
                  <option value="Electronics & Electrical">Electronics & Electrical</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Cyber Security & Cloud">Cyber Security & Cloud</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Program Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Category</label>
                <input
                  type="text"
                  placeholder="e.g. Robotics / Coding"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Days / 30-Hr VAC"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Course Description / Objectives</label>
              <textarea
                rows={2}
                placeholder="Brief summary of what students will build and learn..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text)' }}
              />
            </div>

            {/* Quick Paste Raw Text Section */}
            <div style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px dashed rgba(249, 115, 22, 0.3)', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--ad-orange)', fontWeight: 700 }}>Quick Syllabus Text Converter</span>
                <button type="button" onClick={handleParseRawText} style={{ background: 'var(--ad-orange)', color: 'var(--text)', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                  Auto-Convert to Modules
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Paste raw syllabus outline here..."
                value={rawSyllabusText}
                onChange={(e) => setRawSyllabusText(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'rgba(10, 15, 26, 0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: '0.82rem' }}
              />
            </div>

            {/* Modules List */}
            <h4 style={{ color: 'var(--text)', margin: '0 0 10px' }}>Modules ({modules.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {modules.map((m, idx) => (
                <div key={idx} style={{ background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px' }}>
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[idx].title = e.target.value;
                      setModules(updated);
                    }}
                    style={{ width: '100%', fontWeight: 700, color: 'var(--ad-orange)', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px', fontSize: '0.95rem' }}
                  />
                  <input
                    type="text"
                    placeholder="Practical project (e.g. Lab 1: Building Bot)"
                    value={m.project}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[idx].project = e.target.value;
                      setModules(updated);
                    }}
                    style={{ width: '100%', color: '#fde68a', background: 'none', border: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              ))}
              <button type="button" onClick={handleAddModule} style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', color: 'var(--ad-orange)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                + Add Another Module
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" className="brochure-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="brochure-btn-primary" style={{ background: 'var(--ad-orange)' }}>
                Save Program Syllabus
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SyllabusEditorModal;
