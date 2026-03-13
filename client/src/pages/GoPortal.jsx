import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import '../styles/go_portal.css';

const GoPortal = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const socket = useSocket();

    const [workshops, setWorkshops] = useState([]);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [activePageIndex, setActivePageIndex] = useState(-1);
    const [originalWsId, setOriginalWsId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('manager'); // manager, monitor
    const [workshopGate, setWorkshopGate] = useState(0); // 0 means unlimited

    // Monitoring state
    const [monitorId, setMonitorId] = useState('');
    const [monitorResults, setMonitorResults] = useState([]);
    const [monitorActiveTab, setMonitorActiveTab] = useState('live'); // live, history

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
        if (!user) { navigate('/go/login'); return; }
        fetchWorkshops();
    }, [user, navigate]);

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

            socket.on('workshop_monitor_update', data => {
                setMonitorResults(data);
            });

            socket.on('workshop_gate_update', gate => {
                setWorkshopGate(gate);
            });

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
            const res = await fetch(`${API_BASE_URL}/api/workshops/${idToUse}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedWorkshop)
            });
            if (res.ok && selectedWorkshop.id !== idToUse) {
                setOriginalWsId(selectedWorkshop.id);
            }
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
        else if (activePageIndex > idx) setActivePageIndex(activePageIndex - 1);
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
        }, 3000); // 3 second debounce
        return () => clearTimeout(timer);
    }, [selectedWorkshop]);

    const handleAutosave = async () => {
        if (!selectedWorkshop || !originalWsId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/workshops/${originalWsId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedWorkshop)
            });
            if (res.ok && selectedWorkshop.id !== originalWsId) {
                setOriginalWsId(selectedWorkshop.id);
            }
            console.log('Autosaved workshop:', selectedWorkshop.title);
        } catch (err) { console.error('Autosave failed:', err); }
    };

    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
    };

    const handlePreview = () => {
        // We'll store a mock user and open the workshop
        const previewUser = { username: 'Admin (Preview)', role: 'student', workshopId: selectedWorkshop.id };
        localStorage.setItem('preview_user', JSON.stringify(previewUser));
        window.open(`/go/student/classroom`, '_blank');
    };

    return (
        <div className="go-portal-container">
            <header className="go-portal-header">
                <div className="go-logo" onClick={() => navigate('/')}>
                    <div className="logo-box">H</div>
                    <span className="logo-text">Hyper<span>Go</span> Admin</span>
                </div>

                <div className="portal-tabs">
                    <button className={`p-tab ${activeTab === 'manager' ? 'active' : ''}`} onClick={() => setActiveTab('manager')}>CONTENT MANAGER</button>
                    <button className={`p-tab ${activeTab === 'monitor' ? 'active' : ''}`} onClick={() => setActiveTab('monitor')}>LIVE MONITOR</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9 }}>{user?.username}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Trainer Access</span>
                    </div>
                    <button onClick={() => { logout(); navigate('/go/login'); }} className="exit-btn">LOGOUT</button>
                </div>
            </header>

            <main className="go-portal-content">
                {activeTab === 'manager' ? (
                    !selectedWorkshop ? (
                        <div className="workshop-manager-root">
                            <motion.section className="creation-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <h1>Generate Workshop</h1>
                                <form className="create-ws-form" onSubmit={handleCreateWorkshop}>
                                    <input placeholder="Workshop Name (e.g. Intro to Robotics)" value={wsName} onChange={e => setWsName(e.target.value)} required />
                                    <input placeholder="Workshop ID (e.g. robotics-101)" value={wsId} onChange={e => setWsId(e.target.value)} required />
                                    <select value={wsCategory} onChange={e => setWsCategory(e.target.value)}>
                                        <option>Robotics</option>
                                        <option>AI</option>
                                        <option>Coding</option>
                                    </select>
                                    <button type="submit" disabled={loading}>CREATE</button>
                                </form>
                            </motion.section>
                            <section className="ws-list-section">
                                <div className="ws-grid">
                                    {workshops.map((ws, i) => (
                                        <motion.div key={ws.id} className="ws-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                                            <div className="ws-icon">{ws.category === 'Robotics' ? '🤖' : ws.category === 'AI' ? '👁️' : '💻'}</div>
                                            <h3>{ws.title}</h3>
                                            <code>ID: {ws.id}</code>
                                            <div className="ws-card-actions">
                                                <button className="edit-btn" onClick={() => { setSelectedWorkshop(ws); setOriginalWsId(ws.id); setActivePageIndex(0); }}>EDIT</button>
                                                <button className="mon-btn" onClick={() => handleJoinMonitor(ws.id)}>MONITOR</button>
                                                <button className="del-btn" onClick={() => handleDeleteWorkshop(ws.id)}>DELETE</button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    ) : (
                        <motion.div className="workshop-editor-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="editor-sidebar">
                                <div className="sidebar-header">
                                    <span className="back-to-list" onClick={() => { setSelectedWorkshop(null); setOriginalWsId(null); }}>← ALL WORKSHOPS</span>
                                    <div className="ws-details-edit" style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div className="detail-field">
                                            <label>Workshop Title</label>
                                            <input value={selectedWorkshop.title} onChange={e => setSelectedWorkshop({ ...selectedWorkshop, title: e.target.value })} />
                                        </div>
                                        <div className="detail-field">
                                            <label>Access Key (ID)</label>
                                            <input value={selectedWorkshop.id} onChange={e => setSelectedWorkshop({ ...selectedWorkshop, id: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="pages-list">
                                    {selectedWorkshop?.pages?.map((p, idx) => (
                                        <div key={p.id} className={`page-item ${activePageIndex === idx ? 'active' : ''}`} onClick={() => setActivePageIndex(idx)}>
                                            <span><span style={{ opacity: 0.5 }}>{idx + 1}</span> {p.title}</span>
                                            <button onClick={(e) => { e.stopPropagation(); deletePage(idx); }} className="p-del">✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="editor-canvas">
                                <div className="editor-toolbar">
                                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                        <button className="toolbar-btn" disabled={activePageIndex <= 0} onClick={() => setActivePageIndex(activePageIndex - 1)}>← PREV</button>
                                        <button className="toolbar-btn" disabled={!selectedWorkshop?.pages || activePageIndex >= selectedWorkshop.pages.length - 1} onClick={() => setActivePageIndex(activePageIndex + 1)}>NEXT →</button>
                                        <button className="toolbar-btn add-btn" onClick={addPage}>+ ADD PAGE</button>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="preview-btn" onClick={handlePreview}>PREVIEW</button>
                                        <button className="final-save-btn" onClick={handleSaveWorkshop}>SAVE WORKSHOP</button>
                                    </div>
                                </div>

                                {activePage ? (
                                    <div className="editor-container">
                                        <div className="canvas-header">
                                            <input value={activePage.title} onChange={e => updateActivePage('title', e.target.value)} placeholder="Lesson Title" />
                                            <div className="type-picker">
                                                {['notes', 'code', 'quiz'].map(t => (
                                                    <button key={t} className={`type-tab ${activePage.type === t ? 'active' : ''}`} onClick={() => updateActivePage('type', t)}>{t.toUpperCase()}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {activePage.type === 'notes' && (
                                            <>
                                                <div className="formatting-bar">
                                                    <select onChange={(e) => applyFormat('fontSize', e.target.value)}>
                                                        <option value="4">Default</option><option value="5">Subheading</option><option value="6">Heading</option><option value="7">Title</option>
                                                    </select>
                                                    <button onClick={() => applyFormat('bold')}><b>B</b></button>
                                                    <button onClick={() => applyFormat('italic')}><i>I</i></button>
                                                </div>
                                                <div className="notes-editor-surface" contentEditable onBlur={(e) => updateActivePage('content', e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: activePage.content || '' }} />
                                            </>
                                        )}

                                        {activePage.type === 'code' && (
                                            <div style={{ flex: 1, minHeight: '500px' }}>
                                                <Editor height="100%" theme="vs-light" language="javascript" value={activePage.content || ''} onChange={val => updateActivePage('content', val)} />
                                            </div>
                                        )}

                                        {activePage.type === 'quiz' && (
                                            <div className="quiz-editor-v2">
                                                <div className="q-box">
                                                    <label>Question Content</label>
                                                    <input className="q-input" value={activePage.content} onChange={e => updateActivePage('content', e.target.value)} />
                                                </div>
                                                <div className="q-box">
                                                    <label>Timer (seconds, 0 for off)</label>
                                                    <input type="number" className="q-input" value={activePage.timer || 0} onChange={e => updateActivePage('timer', parseInt(e.target.value))} />
                                                </div>
                                                <label>Options (Select correct answer)</label>
                                                <div className="options-grid">
                                                    {activePage.options?.map((opt, oIdx) => (
                                                        <div key={oIdx} className="option-row">
                                                            <input type="radio" name="correct" checked={activePage.correctOption === oIdx} onChange={() => updateActivePage('correctOption', oIdx)} />
                                                            <input className="opt-input" value={opt || ''} onChange={e => {
                                                                const newOpts = [...(activePage.options || [])];
                                                                newOpts[oIdx] = e.target.value;
                                                                updateActivePage('options', newOpts);
                                                            }} />
                                                        </div>
                                                    ))}
                                                </div>
                                                <button onClick={() => updateActivePage('options', [...activePage.options, 'New Option'])}>+ ADD OPTION</button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="empty-canvas">Select a lesson to begin.</div>
                                )}
                            </div>
                        </motion.div>
                    )
                ) : (
                    <div className="monitor-view">
                        <section className="monitor-header">
                            <div>
                                <h1>Live Monitor: {monitorId}</h1>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 700 }}>Active Workshop Session</p>
                            </div>

                            <div className="gate-control-panel">
                                <div className="gate-info">
                                    <span className="gate-label">STEP APPROVAL GATE</span>
                                    <span className="gate-status">{workshopGate === 0 ? 'FREE FLOW' : `LOCKED AT STEP ${workshopGate}`}</span>
                                </div>
                                <div className="gate-actions">
                                    <select
                                        className="gate-select"
                                        value={workshopGate}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            socket.emit('set_workshop_gate', { workshopId: monitorId, maxStep: val });
                                        }}
                                    >
                                        <option value={0}>Free Flow (No Limit)</option>
                                        {workshops.find(w => w.id === monitorId)?.pages?.map((p, i) => (
                                            <option key={i} value={i + 1}>Stop at Step {i + 1}: {p.title}</option>
                                        ))}
                                    </select>
                                    <button
                                        className="gate-release-btn"
                                        onClick={() => socket.emit('set_workshop_gate', { workshopId: monitorId, maxStep: 0 })}
                                    >
                                        RELEASE ALL
                                    </button>
                                </div>
                            </div>

                            <div className="monitor-sub-tabs">
                                <button className={`sub-tab ${monitorActiveTab === 'live' ? 'active' : ''}`} onClick={() => setMonitorActiveTab('live')}>Active Students</button>
                                <button className={`sub-tab ${monitorActiveTab === 'history' ? 'active' : ''}`} onClick={() => setMonitorActiveTab('history')}>Completion History</button>
                            </div>

                            <button className="back-btn" onClick={() => setActiveTab('manager')}>BACK TO CONTENT</button>
                        </section>
                        <div className="monitor-grid">
                            {(monitorActiveTab === 'live'
                                ? monitorResults.filter(r => !r.completed)
                                : monitorResults.filter(r => r.completed)).length === 0 ? (
                                <p className="no-students">No {monitorActiveTab === 'live' ? 'active' : 'completed'} students records found.</p>
                            ) : (
                                (monitorActiveTab === 'live'
                                    ? monitorResults.filter(r => !r.completed)
                                    : monitorResults.filter(r => r.completed)
                                ).map(res => {
                                    const totalSteps = workshops.find(w => w.id === monitorId)?.pages?.length || 1;
                                    const perc = Math.round(((res.step + 1) / totalSteps) * 100);
                                    return (
                                        <div key={res.username} className="monitor-card">
                                            <div className="mon-header">
                                                <div className="mon-user-info">
                                                    <span className="mon-username">{res.username}</span>
                                                    <span className={`mon-dot ${res.isOnline ? 'online' : 'offline'}`}></span>
                                                </div>
                                                <button className="mon-remove-btn" onClick={() => {
                                                    if (confirm(`Remove ${res.username} from workshop?`)) {
                                                        socket.emit('remove_student_progress', { workshopId: monitorId, username: res.username });
                                                    }
                                                }}>REMOVE</button>
                                            </div>
                                            <div className="mon-body" onClick={() => alert(`${res.username} is at ${perc}% completion.`)}>
                                                <div className="mon-progress-labels">
                                                    <span>Step {res.step + 1} of {totalSteps}</span>
                                                    <span>{perc}%</span>
                                                </div>
                                                <div className="mon-progress-bar">
                                                    <div className="mon-fill" style={{ width: `${perc}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="mon-footer">
                                                {res.completed ? <span className="mon-tag completed">COMPLETED</span> : <span className="mon-tag active">IN PROGRESS</span>}
                                                {res.certificateReady && <span className="mon-tag cert">📜 CERT READY</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default GoPortal;
