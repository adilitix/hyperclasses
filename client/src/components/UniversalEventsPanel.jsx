import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';

function UniversalEventsPanel({ onEnterEvent }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [customId, setCustomId] = useState('');
    const [type, setType] = useState('flow'); // 'flow' (HyperFlow) or 'go' (HyperGo)
    const [showInfo, setShowInfo] = useState(false);

    const socket = useSocket();
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/events`);
            const data = await res.json();
            setEvents(data.reverse());
        } catch (err) {
            console.error('Failed to fetch data', err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll less frequently now that we have sockets

        if (socket) {
            socket.on('event_counts_update', (counts) => {
                setEvents(prev => prev.map(evt => {
                    const match = counts.find(c => c.id === evt.id);
                    return match ? { ...evt, userCount: match.userCount } : evt;
                }));
            });
            socket.on('adilitix_update', fetchData);
            socket.on('roster_update', fetchData); // Refresh on join/leave
        }

        return () => {
            clearInterval(interval);
            if (socket) {
                socket.off('event_counts_update');
                socket.off('adilitix_update');
                socket.off('roster_update');
            }
        };
    }, [socket]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name) return;
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    createdBy: user.username,
                    customId,
                    isWorkshop: type === 'go'
                })
            });

            const data = await res.json();
            if (data.success) {
                setName('');
                setCustomId('');
                fetchData();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will delete all session data.')) return;
        try {
            await fetch(`${API_BASE_URL}/api/events/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEnter = (evt) => {
        onEnterEvent(evt.id, evt.name, evt.isWorkshop);
    };

    return (
        <div style={{ padding: window.innerWidth < 768 ? '1rem' : '2rem', minHeight: '100%', background: '#0a0a0b', color: '#fff' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>COMMON EVENTS PANEL</h1>
                    <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '10px' }}>Manage all HyperFlow and HyperGo sessions in one place.</p>
                </header>

                {/* Unified Creation Form */}
                <div style={{
                    background: '#141417',
                    padding: window.innerWidth < 768 ? '1.25rem' : '2rem',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: window.innerWidth < 768 ? '1.5rem' : '3rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                    <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '2px', fontWeight: 800 }}>CREATE NEW SESSION</h4>
                    <form onSubmit={handleCreate} style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth < 1000 ? '1fr' : '1fr 1fr 1fr auto',
                        gap: '1.5rem',
                        alignItems: 'flex-end'
                    }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>SESSION NAME</label>
                            <input
                                style={{
                                    width: '100%',
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                placeholder="Session Title"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>CUSTOM EVENT ID (OPTIONAL)</label>
                            <input
                                style={{
                                    width: '100%',
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                placeholder="e.g. batch-a-2024"
                                value={customId}
                                onChange={(e) => setCustomId(e.target.value)}
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '1px' }}>PROCESS TYPE</label>
                                <button
                                    type="button"
                                    onClick={() => setShowInfo(!showInfo)}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '15px', height: '15px', fontSize: '9px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    i
                                </button>
                            </div>
                            <select
                                style={{
                                    width: '100%',
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    appearance: 'none'
                                }}
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="flow">HyperFlow (Live Broadcast)</option>
                                <option value="go">HyperGo (Self-Paced Workshop)</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                height: '52px',
                                width: window.innerWidth < 1000 ? '100%' : 'auto',
                                padding: '0 2.5rem',
                                background: '#00f0ff',
                                color: '#000',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginTop: window.innerWidth < 1000 ? '10px' : '0'
                            }}>
                            {loading ? 'Creating...' : 'Generate Session'}
                        </button>
                    </form>

                    <AnimatePresence>
                        {showInfo && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                style={{ overflow: 'hidden', marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                                    <div>
                                        <strong style={{ color: '#00f0ff', display: 'block', marginBottom: '8px' }}>⚡ HyperFlow:</strong>
                                        <p style={{ opacity: 0.6, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                            Primary classroom engine. Use this for live lectures where you want to broadcast code, manage chat, and run interactive polls.
                                        </p>
                                    </div>
                                    <div>
                                        <strong style={{ color: '#ff7b00', display: 'block', marginBottom: '8px' }}>🚀 HyperGo:</strong>
                                        <p style={{ opacity: 0.6, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                            Self-paced education manager. Best for workshops where students follow a curriculum, complete quizzes, and earn certificates.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Combined List Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: window.innerWidth < 1000 ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: window.innerWidth < 768 ? '10px' : '1.5rem',
                    paddingBottom: '100px'
                }}>
                    {events.map(evt => (
                        <div key={evt.id} className="event-card" style={{
                            background: '#141417',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '20px',
                            padding: window.innerWidth < 768 ? '1rem' : '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: window.innerWidth < 768 ? '8px' : '12px',
                            position: 'relative',
                            transition: 'all 0.3s'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    fontSize: '0.5rem',
                                    borderRadius: '6px',
                                    background: evt.isWorkshop ? 'rgba(255,123,0,0.1)' : 'rgba(0,240,255,0.1)',
                                    color: evt.isWorkshop ? '#ff7b00' : '#00f0ff',
                                    border: `1px solid ${evt.isWorkshop ? 'rgba(255,123,0,0.2)' : 'rgba(0,240,255,0.2)'}`,
                                    fontWeight: 900,
                                    letterSpacing: '1px'
                                }}>
                                    {evt.isWorkshop ? 'GO' : 'FLOW'}
                                </span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(evt.id); }}
                                    style={{ background: 'none', border: 'none', color: '#ffffff40', cursor: 'pointer', fontSize: '0.8rem' }}
                                >✕</button>
                            </div>

                            <h3 style={{ margin: '5px 0 2px 0', fontSize: window.innerWidth < 768 ? '0.9rem' : '1.25rem', fontWeight: 800 }}>{evt.name}</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ fontSize: window.innerWidth < 768 ? '0.65rem' : '0.8rem', color: '#64748b' }}>
                                    ID: <span style={{ fontFamily: 'Fira Code, monospace', color: evt.isWorkshop ? '#ff7b00' : '#00f0ff' }}>{evt.id}</span>
                                </div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    background: evt.userCount > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    color: evt.userCount > 0 ? '#22c55e' : '#64748b',
                                    fontWeight: 700
                                }}>
                                    ● {evt.userCount || 0} online
                                </div>
                            </div>

                            <div style={{ marginTop: window.innerWidth < 768 ? '10px' : '20px' }}>
                                <button
                                    onClick={() => handleEnter(evt)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: '#fff',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: window.innerWidth < 768 ? '0.75rem' : '0.85rem'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
                                    onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    OPEN →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UniversalEventsPanel;
