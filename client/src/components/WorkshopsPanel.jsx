import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';

function WorkshopsPanel() {
    const { user } = useAuth();
    const [workshops, setWorkshops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingWorkshop, setEditingWorkshop] = useState(null);

    // Initial form state
    const initialFormState = {
        title: '',
        category: 'Robotics',
        duration: '',
        level: 'Beginner',
        desc: '',
        image: '🤖',
        live: true,
        priceTiers: [
            { days: 1, price: 99, label: 'Introductory - 1 Day' },
            { days: 3, price: 299, label: 'Deep Dive - 3 Days' },
            { days: 5, price: 499, label: 'Mastery - 5 Days' }
        ]
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchWorkshops = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/workshops`);
            const data = await res.json();
            setWorkshops(data);
        } catch (err) {
            console.error('Failed to fetch workshops', err);
        }
    };

    useEffect(() => {
        fetchWorkshops();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = editingWorkshop
                ? `${API_BASE_URL}/api/workshops/${editingWorkshop.id}`
                : `${API_BASE_URL}/api/workshops`;

            const method = editingWorkshop ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                setFormData(initialFormState);
                setEditingWorkshop(null);
                fetchWorkshops();
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
        if (!confirm('Are you sure you want to delete this workshop?')) return;
        try {
            await fetch(`${API_BASE_URL}/api/workshops/${id}`, { method: 'DELETE' });
            fetchWorkshops();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (w) => {
        setEditingWorkshop(w);
        setFormData(w);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 className="cine-text" style={{ marginBottom: '1.5rem' }}>
                    {editingWorkshop ? 'Edit Workshop' : 'Create New Workshop'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>Workshop Title</label>
                        <input
                            className="input-field"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Master ESP32"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>Category</label>
                        <select
                            className="input-field"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="Robotics">Robotics</option>
                            <option value="Coding">Coding</option>
                            <option value="AI">AI</option>
                            <option value="Embedded">Embedded</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>Duration (e.g. 2 Hours)</label>
                        <input
                            className="input-field"
                            type="text"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>Level</label>
                        <select
                            className="input-field"
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>Description</label>
                        <textarea
                            className="input-field"
                            style={{ height: '80px', resize: 'none' }}
                            value={formData.desc}
                            onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                            required
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : editingWorkshop ? 'Update Workshop' : 'Create Workshop'}
                        </button>
                        {editingWorkshop && (
                            <button type="button" className="btn btn-ghost" onClick={() => { setEditingWorkshop(null); setFormData(initialFormState); }}>
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                <div style={{ marginTop: '3rem' }}>
                    <h3 className="cine-text" style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Catalog Management</h3>
                    <div className="workshop-manage-grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {workshops.map(w => (
                            <div key={w.id} style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                position: 'relative'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{w.image}</div>
                                <h4 style={{ margin: '0 0 0.5rem 0' }}>{w.title}</h4>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '1rem' }}>{w.category} • {w.level}</div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleEdit(w)}>Edit</button>
                                    <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ff4444' }} onClick={() => handleDelete(w.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WorkshopsPanel;
