import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

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

        // Also listen to roster_update if users_update isn't enough, but let's stick to previous pattern
        // actually, users_update is fine.

        socket.emit('get_admins');

        return () => {
            socket.off('users_update');
            socket.off('blocked_ips_update');
            socket.off('admins_list');
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

    return (
        <div style={{ padding: '1rem', height: '100%', overflowY: 'auto' }}>
            <h2>Super Admin Dashboard</h2>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3>Manage Admins</h3>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4>Create New Admin</h4>
                    <form onSubmit={handleCreateAdmin} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                            type="text"
                            placeholder="Username"
                            className="input-field"
                            value={createUsername}
                            onChange={e => setCreateUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            value={createPassword}
                            onChange={e => setCreatePassword(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Create Admin</button>
                    </form>
                </div>

                <div>
                    <h4>Existing Admins</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {admins.map(admin => (
                            <div key={admin.username} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.5rem',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '4px'
                            }}>
                                <div>
                                    <strong>{admin.username}</strong>
                                    <span style={{ opacity: 0.5, marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                                        (Pass: {admin.password})
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleEditAdmin(admin.username)}
                                        className="btn"
                                        style={{ background: 'var(--accent)', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAdmin(admin.username)}
                                        className="btn"
                                        style={{ background: 'var(--danger)', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        {admins.length === 0 && <p style={{ opacity: 0.5 }}>No other admins.</p>}
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <h3>Blocked IPs ({blockedIPs.length})</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {blockedIPs.map(ip => (
                        <div key={ip} style={{
                            background: 'rgba(255, 0, 0, 0.2)',
                            border: '1px solid var(--danger)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>{ip}</span>
                            <button
                                onClick={() => handleUnblockIP(ip)}
                                style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {blockedIPs.length === 0 && <p style={{ opacity: 0.5 }}>No blocked IPs.</p>}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3>Connected Users ({connectedUsers.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {connectedUsers.map(u => (
                        <div key={u.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px'
                        }}>
                            <div>
                                <strong>{u.username}</strong>
                                <span style={{ opacity: 0.6, fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                    ({u.role})
                                </span>
                                {u.ip && (
                                    <span style={{
                                        opacity: 0.8,
                                        fontSize: '0.8rem',
                                        marginLeft: '1rem',
                                        fontFamily: 'monospace',
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        {u.ip}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {u.ip && u.role !== 'superadmin' && (
                                    <button
                                        onClick={() => handleBlockIP(u.ip)}
                                        className="btn"
                                        style={{ background: 'var(--danger)', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                                    >
                                        Block IP
                                    </button>
                                )}
                                {u.role !== 'superadmin' && ( // Don't kick yourself
                                    <button
                                        onClick={() => handleKick(u.id)}
                                        className="btn"
                                        style={{ background: 'rgba(255, 100, 100, 0.2)', padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
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
    );
}

export default SuperAdminPanel;
