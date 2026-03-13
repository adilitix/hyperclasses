import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import '../styles/go_portal.css';

const GoDashboard = () => {
    const { user } = useAuth();
    const socket = useSocket();

    const [workshops, setWorkshops] = useState([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [activePageIndex, setActivePageIndex] = useState(-1);
    const [originalWsId, setOriginalWsId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('manager'); // manager, monitor
    const [workshopGate, setWorkshopGate] = useState(0);

    // Monitoring state
    const [monitorId, setMonitorId] = useState('');
    const [monitorResults, setMonitorResults] = useState([]);
    const [monitorActiveTab, setMonitorActiveTab] = useState('live');

    // Form states for Workshop
    const [wsName, setWsName] = useState('');
    const [wsId, setWsId] = useState('');
    const [wsCategory, setWsCategory] = useState('Robotics');

    const fetchWorkshops = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/workshops`);
            const data = await res.json();
            setWorkshops(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchWorkshops();
    }, []);

    useEffect(() => {
        if (socket) {
            const handleWSUpdate = (data) => {
                setWorkshops(data);
                if (selectedWorkshop) {
                    const fresh = data.find(w => w.id === selectedWorkshop.id || w.id === originalWsId);
                    if (fresh) setSelectedWorkshop(fresh);
                }
            };
            socket.on('workshops_update', handleWSUpdate);
            socket.on('workshop_monitor_update', data => setMonitorResults(data));
            socket.on('workshop_gate_update', gate => setWorkshopGate(gate));

            return () => {
                socket.off('workshops_update');
                socket.off('workshop_monitor_update');
            };
        }
    }, [socket, selectedWorkshop, originalWsId]);

    const handleJoinMonitor = (id) => {
        setMonitorId(id);
        setActiveTab('monitor');
        socket.emit('join_workshop_monitor', id);
    };

    const activePage = selectedWorkshop?.pages?.[activePageIndex] || null;

    const handleCreateWorkshop = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/workshops`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: wsName, id: wsId, category: wsCategory, pages: [] })
            });
            const data = await res.json();
            if (data.success) {
                setWsName(''); setWsId('');
                fetchWorkshops();
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDeleteWorkshop = async (id) => {
        if (!confirm('Delete workshop? This cannot be undone.')) return;
        await fetch(`${API_BASE_URL}/api/workshops/${id}`, { method: 'DELETE' });
        fetchWorkshops();
        if (selectedWorkshop?.id === id) setSelectedWorkshop(null);
    };

    const handleSaveWorkshop = async (forceId = null) => {
        const idToUse = forceId || originalWsId || selectedWorkshop.id;
        if (!selectedWorkshop) return;
        setLoading(true);
        try {
            await fetch(`${API_BASE_URL}/api/workshops/${idToUse}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedWorkshop)
            });
            fetchWorkshops();
            if (!forceId) alert('Workshop saved successfully!');
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const addPage = () => {
        if (!selectedWorkshop) return;
        const newPage = {
            id: 'p' + Date.now(),
            title: 'New Lesson',
            type: 'notes',
            content: '',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctOption: 0,
            timer: 0
        };
        const updated = { ...selectedWorkshop, pages: [...(selectedWorkshop.pages || []), newPage] };
        setSelectedWorkshop(updated);
        setActivePageIndex(updated.pages.length - 1);
    };

    const deletePage = (idx) => {
        const currentPages = selectedWorkshop.pages || [];
        const updatedPages = currentPages.filter((_, i) => i !== idx);
        setSelectedWorkshop({ ...selectedWorkshop, pages: updatedPages });
        if (activePageIndex === idx) setActivePageIndex(-1);
    };

    const updateActivePage = (field, value) => {
        if (!selectedWorkshop || activePageIndex === -1) return;
        const updatedPages = [...(selectedWorkshop.pages || [])];
        if (updatedPages[activePageIndex]) {
            updatedPages[activePageIndex] = { ...updatedPages[activePageIndex], [field]: value };
            setSelectedWorkshop({ ...selectedWorkshop, pages: updatedPages });
        }
    };

    // Autosave Logic
    useEffect(() => {
        if (!selectedWorkshop) return;
        const timer = setTimeout(() => {
            handleAutosave();
        }, 3000);
        return () => clearTimeout(timer);
    }, [selectedWorkshop]);

    const handleAutosave = async () => {
        if (!selectedWorkshop || !originalWsId) return;
        try {
            await fetch(`${API_BASE_URL}/api/workshops/${originalWsId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedWorkshop)
            });
            console.log('Autosaved workshop:', selectedWorkshop.title);
        } catch (err) { console.error('Autosave failed:', err); }
    };

    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const handlePreview = () => {
        const previewUser = { username: 'Admin (Preview)', role: 'student', workshopId: selectedWorkshop.id };
        localStorage.setItem('preview_user', JSON.stringify(previewUser));
        window.open(`/go/student/classroom`, '_blank');
    };

    return (
        <div className="go-dashboard-inner" style={{ padding: window.innerWidth < 768 ? '10px' : '20px', overflow: 'visible', minHeight: '100%' }}>
            <div className="portal-tabs" style={{ marginBottom: '20px', justifyContent: 'flex-start' }}>
                <button className={`p-tab ${activeTab === 'manager' ? 'active' : ''}`} onClick={() => setActiveTab('manager')}>CONTENT MANAGER</button>
                <button className={`p-tab ${activeTab === 'monitor' ? 'active' : ''}`} onClick={() => setActiveTab('monitor')}>LIVE MONITOR</button>
            </div>

            {activeTab === 'manager' ? (
                !selectedWorkshop ? (
                    <div className="workshop-manager-root" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 'min-content' }}>
                        <motion.section className="creation-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Generate Workshop</h2>
                            <form className="create-ws-form" onSubmit={handleCreateWorkshop} style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: 'min(20px, 4vw)',
                                borderRadius: '12px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <input placeholder="Workshop Name" value={wsName} onChange={e => setWsName(e.target.value)} required />
                                <input placeholder="Workshop ID" value={wsId} onChange={e => setWsId(e.target.value)} required />
                                <select value={wsCategory} onChange={e => setWsCategory(e.target.value)}>
                                    <option>Robotics</option>
                                    <option>AI</option>
                                    <option>Coding</option>
                                </select>
                                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontWeight: 700 }}>CREATE</button>
                            </form>
                        </motion.section>
                        <section className="ws-list-section" style={{ marginTop: '30px', paddingBottom: '100px' }}>
                            <div className="ws-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 1000 ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: window.innerWidth < 768 ? '10px' : '1.5rem'
                            }}>
                                {workshops.map((ws, i) => (
                                    <motion.div key={ws.id} className="ws-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                                        <div className="ws-icon" style={{ fontSize: window.innerWidth < 768 ? '1.2rem' : '1.5rem' }}>{ws.category === 'Robotics' ? '🤖' : '💻'}</div>
                                        <h3 style={{ fontSize: window.innerWidth < 768 ? '0.9rem' : '1.1rem', margin: '10px 0' }}>{ws.title}</h3>
                                        <code style={{ fontSize: '0.7rem', opacity: 0.6 }}>{ws.id}</code>
                                        <div className="ws-card-actions" style={{ marginTop: '15px', gap: '8px' }}>
                                            <button className="edit-btn" style={{ padding: '8px 12px', fontSize: '0.75rem' }} onClick={() => { setSelectedWorkshop(ws); setOriginalWsId(ws.id); setActivePageIndex(0); }}>EDIT</button>
                                            <button className="del-btn" style={{ padding: '8px 12px', fontSize: '0.75rem' }} onClick={() => handleDeleteWorkshop(ws.id)}>DELETE</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </div>
                ) : (
                    <div className="workshop-editor-view">
                        <div className="editor-sidebar" style={{ background: 'rgba(0,0,0,0.3)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ padding: '20px' }}>
                                <button
                                    className="back-to-list-btn"
                                    onClick={() => setSelectedWorkshop(null)}
                                    style={{
                                        background: 'rgba(255, 123, 0, 0.1)',
                                        color: '#ff7b00',
                                        border: '1px solid rgba(255, 123, 0, 0.2)',
                                        padding: '10px 15px',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        width: '100%',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '20px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span>←</span> ALL WORKSHOPS
                                </button>
                                <div className="ws-details-edit" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div className="detail-field">
                                        <label style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>Workshop Title</label>
                                        <input
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '0.8rem' }}
                                            value={selectedWorkshop.title}
                                            onChange={e => setSelectedWorkshop({ ...selectedWorkshop, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="detail-field">
                                        <label style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>Access ID</label>
                                        <input
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px', borderRadius: '6px', fontSize: '0.8rem' }}
                                            value={selectedWorkshop.id}
                                            onChange={e => setSelectedWorkshop({ ...selectedWorkshop, id: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pages-list" style={{ marginTop: '10px' }}>
                                {selectedWorkshop?.pages?.map((p, idx) => (
                                    <div
                                        key={p.id}
                                        className={`page-item ${activePageIndex === idx ? 'active' : ''}`}
                                        onClick={() => setActivePageIndex(idx)}
                                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <span style={{ fontSize: '0.85rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{idx + 1}. {p.title}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deletePage(idx); }}
                                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '0 5px' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button className="add-btn" onClick={addPage} style={{ width: '100%', marginTop: '10px', padding: '10px', borderRadius: '8px', background: 'white', color: 'black', fontWeight: 800, border: 'none' }}>+ PAGE</button>
                            </div>
                        </div>
                        <div className="editor-canvas" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="editor-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="toolbar-btn"
                                        disabled={activePageIndex <= 0}
                                        onClick={() => setActivePageIndex(activePageIndex - 1)}
                                        style={{ padding: '8px 15px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                        ← PREV
                                    </button>
                                    <button
                                        className="toolbar-btn"
                                        disabled={!selectedWorkshop?.pages || activePageIndex >= selectedWorkshop.pages.length - 1}
                                        onClick={() => setActivePageIndex(activePageIndex + 1)}
                                        style={{ padding: '8px 15px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                        NEXT →
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        className="preview-btn"
                                        onClick={handlePreview}
                                        style={{ padding: '8px 20px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                    >
                                        PREVIEW
                                    </button>
                                    <button className="final-save-btn" onClick={() => handleSaveWorkshop()}>SAVE WORKSHOP</button>
                                </div>
                            </div>
                            {activePage && (
                                <div className="editor-container" style={{ background: 'transparent', padding: '30px', flex: 1, overflowY: 'visible' }}>
                                    <div className="canvas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                        <input
                                            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.8rem', fontWeight: 900, outline: 'none', flex: 1 }}
                                            value={activePage.title}
                                            onChange={e => updateActivePage('title', e.target.value)}
                                            placeholder="Lesson Title"
                                        />
                                        <div className="type-picker" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
                                            {['notes', 'code', 'quiz'].map(t => (
                                                <button
                                                    key={t}
                                                    className={`type-tab ${activePage.type === t ? 'active' : ''}`}
                                                    onClick={() => updateActivePage('type', t)}
                                                    style={{
                                                        padding: '8px 15px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 900,
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        background: activePage.type === t ? 'white' : 'transparent',
                                                        color: activePage.type === t ? 'black' : 'rgba(255,255,255,0.4)',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {activePage.type === 'notes' && (
                                        <>
                                            <div className="formatting-bar" style={{ display: 'flex', gap: '10px', marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <select
                                                    onChange={(e) => applyFormat('fontSize', e.target.value)}
                                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '5px', borderRadius: '5px' }}
                                                >
                                                    <option value="4">Default</option><option value="5">Subheading</option><option value="6">Heading</option><option value="7">Title</option>
                                                </select>
                                                <button onClick={() => applyFormat('bold')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '5px' }}><b>B</b></button>
                                                <button onClick={() => applyFormat('italic')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '5px' }}><i>I</i></button>
                                            </div>
                                            <div className="notes-editor-surface" contentEditable onBlur={(e) => updateActivePage('content', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: activePage.content || '' }} style={{ minHeight: '400px', background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '12px', fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', outline: 'none' }} />
                                        </>
                                    )}
                                    {activePage.type === 'code' && (
                                        <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            <Editor height="100%" theme="vs-dark" language="javascript" value={activePage.content || ''} onChange={val => updateActivePage('content', val)} />
                                        </div>
                                    )}
                                    {activePage.type === 'quiz' && (
                                        <div className="quiz-editor-v2" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div className="q-box">
                                                <label style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Question Content</label>
                                                <input
                                                    className="q-input"
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '15px', borderRadius: '12px', fontSize: '1.1rem' }}
                                                    value={activePage.content}
                                                    onChange={e => updateActivePage('content', e.target.value)}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Options (Select correct one)</label>
                                                <div className="options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {activePage.options?.map((opt, oIdx) => (
                                                        <div key={oIdx} className="option-row" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <input type="radio" name="correct" checked={activePage.correctOption === oIdx} onChange={() => updateActivePage('correctOption', oIdx)} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} />
                                                            <input
                                                                className="opt-input"
                                                                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '0.95rem', outline: 'none' }}
                                                                value={opt || ''}
                                                                onChange={e => {
                                                                    const newOpts = [...(activePage.options || [])];
                                                                    newOpts[oIdx] = e.target.value;
                                                                    updateActivePage('options', newOpts);
                                                                }}
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newOpts = activePage.options.filter((_, i) => i !== oIdx);
                                                                    updateActivePage('options', newOpts);
                                                                }}
                                                                style={{ background: 'transparent', border: 'none', color: 'rgba(239, 68, 68, 0.4)', cursor: 'pointer' }}
                                                            >✕</button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => updateActivePage('options', [...(activePage.options || []), `Option ${activePage.options?.length + 1}`])}
                                                    style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800 }}
                                                >
                                                    + ADD OPTION
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            ) : (
                <div className="monitor-view">
                    {/* Simplified Monitor for Dashboard Integration */}
                    <div className="monitor-header">
                        <h2>Workshop Monitor: {monitorId}</h2>
                        <button className="back-btn" onClick={() => setActiveTab('manager')}>EXIT MONITOR</button>
                    </div>
                    {/* ... (rest of monitor logic or simplified version) */}
                    <p style={{ opacity: 0.5 }}>Monitor data will appear here...</p>
                </div>
            )}
        </div>
    );
};

export default GoDashboard;
