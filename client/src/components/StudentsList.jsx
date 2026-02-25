import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

function StudentsList() {
    const socket = useSocket();
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [remoteOnlineUsers, setRemoteOnlineUsers] = useState([]);

    useEffect(() => {
        if (!socket) return;

        socket.on('roster_update', (users) => {
            setOnlineUsers(users);
        });

        socket.on('remote_roster_update', (users) => {
            setRemoteOnlineUsers(users);
        });

        // Request initial roster
        socket.emit('get_roster');

        return () => {
            socket.off('roster_update');
            socket.off('remote_roster_update');
        };
    }, [socket]);

    // Merge rosters, evitando duplicados por nombre de usuario
    const students = [
        ...onlineUsers,
        ...remoteOnlineUsers.filter(ru => !onlineUsers.some(ou => ou.username === ru.username))
    ];

    return (
        <div style={{ padding: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--glass-border)',
                    paddingBottom: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Connected Users</h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{students.filter(u => u.role === 'student').length}</span> Students Online
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1rem'
                }}>
                    {students.map((u, i) => (
                        <div key={i} className="animate-slide-up" style={{
                            padding: '1.25rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 'var(--border-radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            border: '1px solid var(--glass-border)',
                            transition: 'transform 0.2s, background 0.2s',
                        }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: u.role === 'admin' || u.role === 'superadmin' ? 'var(--accent)' : 'var(--success)',
                                boxShadow: `0 0 12px ${u.role === 'admin' || u.role === 'superadmin' ? 'rgba(129, 140, 248, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                            }} />

                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>{u.username}</div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: u.role === 'student' ? 'var(--primary)' : 'var(--accent)',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginTop: '0.1rem'
                                }}>
                                    {u.role === 'superadmin' ? '⚡ System Owner' : u.role === 'admin' ? '🛡️ Instructor' : '🎓 Student'}
                                </div>
                                {u.ip && (user.role === 'superadmin' || user.role === 'admin') && (
                                    <div style={{ fontSize: '0.7rem', opacity: 0.4, fontFamily: "'Fira Code', monospace", marginTop: '0.4rem' }}>
                                        {u.ip}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {students.length === 0 && (
                        <div style={{
                            gridColumn: '1/-1',
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            opacity: 0.5,
                            border: '2px dashed var(--glass-border)',
                            borderRadius: 'var(--border-radius-lg)'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📡</div>
                            <div style={{ fontStyle: 'italic' }}>Waiting for users to connect...</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StudentsList;
