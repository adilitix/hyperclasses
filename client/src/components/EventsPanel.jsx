import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';

function EventsPanel({ onEnterEvent }) {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [newEventName, setNewEventName] = useState('');
    const [customEventId, setCustomEventId] = useState(''); // New state
    const [loading, setLoading] = useState(false);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/events`);
            const data = await res.json();
            // Sorting by newest first?
            setEvents(data.reverse());
        } catch (err) {
            console.error('Failed to fetch events', err);
        }
    };

    useEffect(() => {
        fetchEvents();
        // Polling for updates every 5 seconds (simulating real-time)
        const interval = setInterval(fetchEvents, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!newEventName) return;
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newEventName,
                    createdBy: user.username,
                    customId: customEventId
                })
            });
            const data = await res.json();
            if (data.success) {
                setNewEventName('');
                setCustomEventId(''); // Reset
                fetchEvents();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!confirm('Are you sure? This will kick everyone out and delete all data for this event.')) return;
        try {
            await fetch(`${API_BASE_URL}/api/events/${id}`, { method: 'DELETE' });
            fetchEvents();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: 'clamp(0.5rem, 3vw, 1.5rem)' }}>
            <div className="glass-panel" style={{ padding: 'clamp(1rem, 5vw, 2rem)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--glass-border)',
                    paddingBottom: '1rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h2 className="cine-text" style={{ margin: 0, fontSize: 'clamp(1rem, 4vw, 1.3rem)', fontWeight: 700 }}>Management Dashboard</h2>
                    <div style={{
                        fontSize: '0.9rem',
                        color: 'white',
                        background: 'rgba(56, 189, 248, 0.2)',
                        padding: '8px 20px',
                        borderRadius: '30px',
                        fontWeight: 700,
                        border: '1px solid var(--primary)'
                    }}>
                        ACTIVE EVENTS: <span style={{ color: 'var(--primary)', marginLeft: '10px' }}>{events.length}</span>
                    </div>
                </div>

                {/* Create Event Form */}
                <div style={{
                    background: 'rgba(56, 189, 248, 0.03)',
                    padding: '1.5rem',
                    borderRadius: 'var(--border-radius-lg)',
                    border: '1px solid rgba(56, 189, 248, 0.1)',
                    marginBottom: '2.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}>
                    <h4 className="cine-text" style={{ margin: '0 0 1.25rem 0', fontSize: '0.75rem', color: 'var(--primary)' }}>Create New Session</h4>
                    <form onSubmit={handleCreateEvent} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <div style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Event Name</div>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Master Robotics Session"
                                value={newEventName}
                                onChange={(e) => setNewEventName(e.target.value)}
                                style={{ width: '100%' }}
                                disabled={loading}
                            />
                        </div>
                        <div style={{ flex: '1 1 220px' }}>
                            <div style={{ fontSize: '0.8rem', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Event ID</div>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. robo-001"
                                value={customEventId}
                                onChange={(e) => setCustomEventId(e.target.value)}
                                style={{ width: '100%', fontFamily: "'Fira Code', monospace" }}
                                disabled={loading}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '46px', padding: '0 1.5rem', flex: '1 1 200px', justifyContent: 'center' }}>
                            {loading ? 'Processing...' : 'Generate Workshop'}
                        </button>
                    </form>
                </div>

                {/* Active Sessions Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary)' }}>🟢 Active Sessions</h3>
                    </div>

                    <div className="session-grid">
                        {events.map(evt => (
                            <div key={evt.id} className="animate-slide-up" style={{
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--border-radius-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                transition: 'transform 0.2s, background 0.2s',
                                cursor: 'pointer',
                                position: 'relative'
                            }} onClick={() => onEnterEvent(evt.id, evt.name)}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff', fontWeight: 600, flex: 1 }}>{evt.name}</h4>
                                    {(user.role === 'admin' || user.role === 'superadmin') && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(evt.id); }}
                                            className="delete-event-btn"
                                            title="Delete Workshop"
                                        >
                                            <span className="close-icon">✕</span>
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        ID: <span style={{ fontFamily: "'Fira Code', monospace", color: 'var(--primary)', fontWeight: 600 }}>{evt.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            📅 {new Date(evt.createdAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            👥 {evt.userCount || 0} Online
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontSize: '0.9rem' }}
                                    onClick={(e) => { e.stopPropagation(); onEnterEvent(evt.id, evt.name); }}
                                >
                                    Enter Classroom →
                                </button>
                            </div>
                        ))}

                        {events.length === 0 && (
                            <div style={{
                                gridColumn: '1/-1',
                                textAlign: 'center',
                                padding: '3rem 1rem',
                                opacity: 0.5,
                                border: '1px dashed var(--glass-border)',
                                borderRadius: 'var(--border-radius-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <div style={{ fontSize: '2rem' }}>📭</div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No workshops scheduled</div>
                                <div style={{ fontSize: '0.8rem' }}>Use the form above to start your first live session.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventsPanel;
