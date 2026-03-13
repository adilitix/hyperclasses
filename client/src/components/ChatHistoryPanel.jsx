import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { motion } from 'framer-motion';

function ChatHistoryPanel({ eventId }) {
    const socket = useSocket();
    const [chatHistory, setChatHistory] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'students', 'system'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!socket || !eventId) return;

        // Request chat history from server
        socket.emit('get_chat_history', { eventId });

        // Listen for chat history updates
        socket.on('chat_history_update', (history) => {
            setChatHistory(history);
        });

        // Listen for new messages to update history in real-time
        socket.on('chat_message', (msg) => {
            setChatHistory(prev => [...prev, msg]);
        });

        return () => {
            socket.off('chat_history_update');
            socket.off('chat_message');
        };
    }, [socket, eventId]);

    const filteredMessages = chatHistory.filter(msg => {
        // Filter by type
        if (filter === 'students' && msg.isSystem) return false;
        if (filter === 'system' && !msg.isSystem) return false;

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                msg.username.toLowerCase().includes(searchLower) ||
                msg.text.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const exportChatHistory = () => {
        const text = filteredMessages.map(msg => {
            const time = new Date(msg.timestamp).toLocaleString();
            return `[${time}] ${msg.username}: ${msg.text}`;
        }).join('\n');

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearChatHistory = () => {
        if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
            socket.emit('clear_chat_history', { eventId });
            setChatHistory([]);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem'
        }}>
            {/* Header Area */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Chat History</h2>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={exportChatHistory}
                            className="btn btn-ghost"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                            📥 Export Logs
                        </button>
                        <button
                            onClick={clearChatHistory}
                            className="btn btn-ghost"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        >
                            🗑️ Reset
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
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
                            placeholder="Find statements or users..."
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
                        style={{ width: '180px', padding: '0.5rem' }}
                    >
                        <option value="all">Every Message</option>
                        <option value="students">Student Only</option>
                        <option value="system">System Only</option>
                    </select>
                </div>

                {/* Metadata Summary */}
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    padding: '0 0.5rem',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)'
                }}>
                    <span>Volume: <strong style={{ color: 'var(--text-color)' }}>{chatHistory.length}</strong></span>
                    <span>Found: <strong style={{ color: 'var(--primary)' }}>{filteredMessages.length}</strong></span>
                    <span>Student Activity: <strong style={{ color: 'var(--success)' }}>{chatHistory.filter(m => !m.isSystem).length}</strong></span>
                </div>
            </div>

            {/* Message Stream */}
            <div style={{
                flex: 1,
                background: 'rgba(0,0,0,0.15)',
                borderRadius: 'var(--border-radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                {filteredMessages.length === 0 ? (
                    <div style={{
                        margin: 'auto',
                        textAlign: 'center',
                        opacity: 0.4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{ fontSize: '2.5rem' }}>🕵️</div>
                        <div style={{ fontStyle: 'italic' }}>No matching records found</div>
                    </div>
                ) : (
                    filteredMessages.map((msg, index) => (
                        <motion.div
                            key={msg.id || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                padding: '1rem',
                                background: msg.isSystem ? 'rgba(56, 189, 248, 0.05)' : 'rgba(255,255,255,0.03)',
                                borderRadius: 'var(--border-radius-md)',
                                borderLeft: msg.isSystem ? '3px solid var(--primary)' : '3px solid rgba(255,255,255,0.1)',
                                position: 'relative'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.4rem'
                            }}>
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    color: msg.isSystem ? 'var(--primary)' : '#fff'
                                }}>
                                    {msg.username}
                                    {msg.role && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', opacity: 0.5, fontWeight: 400 }}>({msg.role})</span>}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div style={{
                                fontSize: '0.9rem',
                                lineHeight: '1.5',
                                color: msg.isSystem ? 'rgba(255,255,255,0.8)' : 'var(--text-color)'
                            }}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))
                )}
                <div style={{ minHeight: '1px' }} />
            </div>
        </div>
    );
}

export default ChatHistoryPanel;
