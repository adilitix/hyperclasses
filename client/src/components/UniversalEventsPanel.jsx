import React, { useState, useEffect } from 'react';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

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
        if (evt.isWorkshop) {
            navigate(`/go/portal`);
        } else {
            onEnterEvent(evt.id, evt.name);
        }
    };

    return (
        <div style={{ padding: window.innerWidth < 768 ? '1rem' : '2rem', minHeight: '100%', background: '#0a0a0b', color: '#fff' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>HYPERFLOW MANAGEMENT</h1>
                    <p style={{ opacity: 0.5, fontSize: '0.9rem', marginTop: '10px' }}>Manage all active HyperFlow sessions and live broadcasts.</p>
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
                        gridTemplateColumns: window.innerWidth < 1000 ? '1fr' : '1.5fr 1.5fr auto',
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
                        {/* Process Type Hidden - Defaulted to Flow */}
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

                    {/* Info Section Hidden */}
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
                                {/* Type Badge Hidden */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(evt.id); }}
                                    style={{ background: 'none', border: 'none', color: '#ffffff40', cursor: 'pointer', fontSize: '0.8rem' }}
                                >✕</button>
                            </div>

                            <h3 style={{ margin: '5px 0 2px 0', fontSize: window.innerWidth < 768 ? '0.9rem' : '1.25rem', fontWeight: 800 }}>{evt.name}</h3>
                            <div style={{ fontSize: window.innerWidth < 768 ? '0.65rem' : '0.8rem', color: '#64748b' }}>
                                ID: <span style={{ fontFamily: 'Fira Code, monospace', color: evt.isWorkshop ? '#ff7b00' : '#00f0ff' }}>{evt.id}</span>
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
