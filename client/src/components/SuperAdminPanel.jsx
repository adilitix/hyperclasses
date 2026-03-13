import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { API_BASE_URL } from '../contexts/AuthContext';

function SuperAdminPanel() {
    const socket = useSocket();
    const [createUsername, setCreateUsername] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [connectedUsers, setConnectedUsers] = useState([]); // from users_update or roster_update?
    // roster_update seems to be the one used for the list of online users in the original file?
    // Actually, checking the original file, it listened to 'users_update' on line 13.
    // In server/index.js, 'users_update' is emitted on 'join'/'disconnect' for state.users.
    // 'roster_update' is for onlineUsers (socket connected users).
    // I should probably use 'roster_update' or 'users_update'.
    // The server emits both. 'users_update' tracks persisted users in session state?
    // Let's stick to 'users_update' as before, but note that server emits IP in it now.

    const [blockedIPs, setBlockedIPs] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [settings, setSettings] = useState(null);
    const [editSettings, setEditSettings] = useState(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('users_update', (users) => {
            setConnectedUsers(users);
        });

        socket.on('blocked_ips_update', (ips) => {
            setBlockedIPs(ips);
        });

        socket.on('admins_list', (list) => {
            setAdmins(list);
        });

        socket.on('settings_update', (newSettings) => {
            setSettings(newSettings);
            if (!editSettings) setEditSettings(newSettings);
        });

        // Also listen to roster_update if users_update isn't enough, but let's stick to previous pattern
        // actually, users_update is fine.

        socket.emit('get_admins');

        // Fetch Settings via API for initial state
        fetch(`${API_BASE_URL}/api/settings`)
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setEditSettings(JSON.parse(JSON.stringify(data)));
            });

        return () => {
            socket.off('users_update');
            socket.off('blocked_ips_update');
            socket.off('admins_list');
            socket.off('settings_update');
        };
    }, [socket]);

    const handleCreateAdmin = (e) => {
        e.preventDefault();
        if (!createUsername || !createPassword) return;

        socket.emit('create_admin', {
            username: createUsername,
            password: createPassword
        });

        alert(`Admin ${createUsername} created!`);
        setCreateUsername('');
        setCreatePassword('');
    };

    const handleDeleteAdmin = (username) => {
        if (confirm(`Are you sure you want to DELETE admin "${username}"?`)) {
            socket.emit('delete_admin', username);
        }
    };

    const handleEditAdmin = (username) => {
        const newPassword = prompt(`Enter new password for admin "${username}":`);
        if (newPassword) {
            socket.emit('update_admin', { username, password: newPassword });
        }
    };

    const handleKick = (userId) => {
        if (confirm('Are you sure you want to disconnect this user?')) {
            socket.emit('kick_user', userId);
        }
    };

    const handleBlockIP = (ip) => {
        if (confirm(`Are you sure you want to BLOCK IP: ${ip}? They will be disconnected.`)) {
            socket.emit('block_ip', ip);
        }
    };

    const handleUnblockIP = (ip) => {
        socket.emit('unblock_ip', ip);
    };

    const handleSaveSettings = async () => {
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editSettings)
            });
            if (res.ok) {
                alert('Website settings updated successfully!');
            }
        } catch (err) {
            alert('Failed to update settings');
        }
    };

    const handleAddFeature = () => {
        const feature = prompt('Enter new feature:');
        if (feature) {
            setEditSettings({
                ...editSettings,
                aboutWebsite: {
                    ...editSettings.aboutWebsite,
                    features: [...editSettings.aboutWebsite.features, feature]
                }
            });
        }
    };

    const handleRemoveFeature = (index) => {
        const features = [...editSettings.aboutWebsite.features];
        features.splice(index, 1);
        setEditSettings({
            ...editSettings,
            aboutWebsite: { ...editSettings.aboutWebsite, features }
        });
    };

    const handleAddSpeciality = () => {
        const spec = prompt('Enter new speciality:');
        if (spec) {
            setEditSettings({
                ...editSettings,
                aboutWebsite: {
                    ...editSettings.aboutWebsite,
                    specialities: [...editSettings.aboutWebsite.specialities, spec]
                }
            });
        }
    };

    const handleRemoveSpeciality = (index) => {
        const specialities = [...editSettings.aboutWebsite.specialities];
        specialities.splice(index, 1);
        setEditSettings({
            ...editSettings,
            aboutWebsite: { ...editSettings.aboutWebsite, specialities }
        });
    };

    return (
        <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>System Configuration</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    SuperAdmin Control Center
                </div>
            </div>

            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Admin Management */}
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🛡️ Admin Infrastructure
                    </h3>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Create Management Account</h4>
                        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="Admin Username"
                                className="input-field"
                                style={{ flex: 1, minWidth: '200px' }}
                                value={createUsername}
                                onChange={e => setCreateUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Secure Password"
                                className="input-field"
                                style={{ flex: 1, minWidth: '200px' }}
                                value={createPassword}
                                onChange={e => setCreatePassword(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>Authorize Admin</button>
                        </form>
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Administrators</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {admins.map(admin => (
                                <div key={admin.username} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1.25rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--border-radius-md)',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{admin.username}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: "'Fira Code', monospace", marginTop: '0.25rem' }}>
                                            Secret Key: {admin.password}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleEditAdmin(admin.username)}
                                            className="btn btn-ghost"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAdmin(admin.username)}
                                            className="btn btn-ghost"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                        >
                                            Purge
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {admins.length === 0 && <p style={{ opacity: 0.4, fontStyle: 'italic', gridColumn: '1/-1' }}>No secondary administrators registered.</p>}
                        </div>
                    </div>
                </div>

                {/* Website Content Management */}
                {editSettings && (
                    <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🌐 Website Content Management
                            </h3>
                            <button onClick={handleSaveSettings} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Save Website Info</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Product Name</label>
                                    <input
                                        type="text" className="input-field" style={{ width: '100%' }}
                                        value={editSettings.aboutWebsite.productName}
                                        onChange={e => setEditSettings({ ...editSettings, aboutWebsite: { ...editSettings.aboutWebsite, productName: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Company Name</label>
                                    <input
                                        type="text" className="input-field" style={{ width: '100%' }}
                                        value={editSettings.aboutWebsite.companyName}
                                        onChange={e => setEditSettings({ ...editSettings, aboutWebsite: { ...editSettings.aboutWebsite, companyName: e.target.value } })}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.4rem' }}>Product Summary</label>
                                    <textarea
                                        className="input-field" style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                                        value={editSettings.aboutWebsite.summary}
                                        onChange={e => setEditSettings({ ...editSettings, aboutWebsite: { ...editSettings.aboutWebsite, summary: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Features</label>
                                        <button onClick={handleAddFeature} className="btn btn-ghost" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>+ Add</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {editSettings.aboutWebsite.features.map((feat, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                                                <input
                                                    type="text" className="input-field" style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                                    value={feat}
                                                    onChange={e => {
                                                        const features = [...editSettings.aboutWebsite.features];
                                                        features[i] = e.target.value;
                                                        setEditSettings({ ...editSettings, aboutWebsite: { ...editSettings.aboutWebsite, features } });
                                                    }}
                                                />
                                                <button onClick={() => handleRemoveFeature(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ fontSize: '0.8rem', opacity: 0.6 }}>Specialities</label>
                                        <button onClick={handleAddSpeciality} className="btn btn-ghost" style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem' }}>+ Add</button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {editSettings.aboutWebsite.specialities.map((spec, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                                                <input
                                                    type="text" className="input-field" style={{ flex: 1, padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                                    value={spec}
                                                    onChange={e => {
                                                        const specialities = [...editSettings.aboutWebsite.specialities];
                                                        specialities[i] = e.target.value;
                                                        setEditSettings({ ...editSettings, aboutWebsite: { ...editSettings.aboutWebsite, specialities } });
                                                    }}
                                                />
                                                <button onClick={() => handleRemoveSpeciality(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Management */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                    {/* Blocked IPs */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🚫 Perimeter Security ({blockedIPs.length})
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {blockedIPs.map(ip => (
                                <div key={ip} style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    fontSize: '0.85rem'
                                }}>
                                    <span style={{ fontFamily: "'Fira Code', monospace" }}>{ip}</span>
                                    <button
                                        onClick={() => handleUnblockIP(ip)}
                                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}
                                        title="Revoke Block"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                            {blockedIPs.length === 0 && <p style={{ opacity: 0.4, fontStyle: 'italic' }}>No active IP restrictions.</p>}
                        </div>
                    </div>

                    {/* Active Connections */}
                    <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🟢 Node Connections ({connectedUsers.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {connectedUsers.map(u => (
                                <div key={u.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--border-radius-md)',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <strong style={{ color: '#fff' }}>{u.username}</strong>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '0.1rem 0.4rem',
                                                borderRadius: '4px',
                                                background: u.role === 'student' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(129, 140, 248, 0.1)',
                                                color: u.role === 'student' ? 'var(--primary)' : 'var(--accent)',
                                                fontWeight: 700,
                                                textTransform: 'uppercase'
                                            }}>
                                                {u.role}
                                            </span>
                                        </div>
                                        {u.ip && (
                                            <div style={{
                                                opacity: 0.5,
                                                fontSize: '0.75rem',
                                                fontFamily: "'Fira Code', monospace",
                                                marginTop: '0.25rem'
                                            }}>
                                                Ident: {u.ip}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {u.ip && u.role !== 'superadmin' && (
                                            <button
                                                onClick={() => handleBlockIP(u.ip)}
                                                className="btn btn-ghost"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                            >
                                                Block
                                            </button>
                                        )}
                                        {u.role !== 'superadmin' && (
                                            <button
                                                onClick={() => handleKick(u.id)}
                                                className="btn btn-ghost"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                            >
                                                Kick
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SuperAdminPanel;
