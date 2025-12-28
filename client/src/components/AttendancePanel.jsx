import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { motion } from 'framer-motion';

function AttendancePanel({ eventId }) {
    const socket = useSocket();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [currentlyOnline, setCurrentlyOnline] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'online', 'offline'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!socket || !eventId) return;

        // Request attendance data
        socket.emit('get_attendance', { eventId });

        // Listen for attendance updates
        socket.on('attendance_update', (data) => {
            setAttendanceRecords(data.records || []);
            setCurrentlyOnline(data.online || []);
        });

        // Listen for roster updates (currently online users)
        socket.on('roster_update', (users) => {
            setCurrentlyOnline(users);
        });

        return () => {
            socket.off('attendance_update');
            socket.off('roster_update');
        };
    }, [socket, eventId]);

    const filteredRecords = attendanceRecords.filter(record => {
        // Filter by online/offline status
        const isOnline = currentlyOnline.some(u => u.username === record.username);
        if (filter === 'online' && !isOnline) return false;
        if (filter === 'offline' && isOnline) return false;

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                record.username.toLowerCase().includes(searchLower) ||
                record.ip?.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const exportAttendance = () => {
        const csv = [
            ['Username', 'Role', 'IP Address', 'Login Time', 'Logout Time', 'Duration (min)', 'Status'].join(','),
            ...filteredRecords.map(record => {
                const isOnline = currentlyOnline.some(u => u.username === record.username);
                const duration = record.logoutTime
                    ? Math.round((new Date(record.logoutTime) - new Date(record.loginTime)) / 60000)
                    : Math.round((new Date() - new Date(record.loginTime)) / 60000);

                return [
                    record.username,
                    record.role,
                    record.ip || 'N/A',
                    new Date(record.loginTime).toLocaleString(),
                    record.logoutTime ? new Date(record.logoutTime).toLocaleString() : 'Still Online',
                    duration,
                    isOnline ? 'Online' : 'Offline'
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const calculateDuration = (loginTime, logoutTime) => {
        const start = new Date(loginTime);
        const end = logoutTime ? new Date(logoutTime) : new Date();
        const diffMs = end - start;
        const diffMins = Math.round(diffMs / 60000);

        if (diffMins < 60) return `${diffMins}m`;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${hours}h ${mins}m`;
    };

    const totalStudents = attendanceRecords.filter(r => r.role === 'student').length;
    const onlineStudents = currentlyOnline.filter(u => u.role === 'student').length;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '1.5rem',
            overflow: 'hidden'
        }}>
            {/* Header Area */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Attendance & Activity</h2>
                    <button
                        onClick={exportAttendance}
                        className="btn btn-ghost"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    >
                        📥 Export CSV
                    </button>
                </div>

                {/* Stats Dashboard */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.25rem',
                    marginBottom: '2rem'
                }}>
                    {[
                        { label: 'Live Users', value: currentlyOnline.length, color: 'var(--primary)', bg: 'rgba(56, 189, 248, 0.05)' },
                        { label: 'Student Presence', value: `${onlineStudents}/${totalStudents}`, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.05)' },
                        { label: 'Total Sessions', value: attendanceRecords.length, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.05)' }
                    ].map((stat, i) => (
                        <div key={i} className="glass-panel" style={{
                            padding: '1.25rem',
                            background: stat.bg,
                            border: `1px solid ${stat.color}22`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: stat.color }}>
                                {stat.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="glass-panel" style={{
                    padding: '1rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.02)',
                    marginBottom: '1rem'
                }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Filter by name or IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', paddingLeft: '2.5rem' }}
                        />
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                    </div>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="input-field"
                        style={{ width: '180px' }}
                    >
                        <option value="all">All Records</option>
                        <option value="online">Online Now</option>
                        <option value="offline">Currently Offline</option>
                    </select>
                </div>
            </div>

            {/* Attendance Ledger */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                background: 'rgba(0,0,0,0.15)',
                borderRadius: 'var(--border-radius-lg)',
                border: '1px solid var(--glass-border)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#0d1117', zIndex: 10 }}>
                        <tr>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>Status</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>Identity</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>Network</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>Session Start</th>
                            <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)' }}>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', opacity: 0.4, fontStyle: 'italic' }}>
                                    No participation data found
                                </td>
                            </tr>
                        ) : (
                            filteredRecords.map((record, index) => {
                                const isOnline = currentlyOnline.some(u => u.username === record.username);
                                return (
                                    <motion.tr
                                        key={record.id || index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            background: isOnline ? 'rgba(16, 185, 129, 0.02)' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: isOnline ? 'var(--success)' : 'rgba(255,255,255,0.2)',
                                                boxShadow: isOnline ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                                            }} />
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{record.username}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{record.role}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', fontFamily: "'Fira Code', monospace", opacity: 0.6 }}>
                                            {record.ip || '—'}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                            {new Date(record.loginTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: isOnline ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 600 }}>
                                            {calculateDuration(record.loginTime, record.logoutTime)}
                                        </td>
                                    </motion.tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AttendancePanel;
