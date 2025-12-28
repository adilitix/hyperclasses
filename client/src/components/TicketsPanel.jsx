import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Editor from "@monaco-editor/react";
import CopyButton from './CopyButton';

function TicketsPanel({ eventId }) {
    const socket = useSocket();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [responseCode, setResponseCode] = useState('');
    const [responseText, setResponseText] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!socket || !eventId) return;

        socket.emit('get_tickets');

        socket.on('tickets_list', (ticketsList) => {
            setTickets(ticketsList);
        });

        socket.on('ticket_created', (ticket) => {
            setTickets(prev => [ticket, ...prev]);
        });

        socket.on('ticket_updated', (updatedTicket) => {
            setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
            if (selectedTicket?.id === updatedTicket.id) {
                setSelectedTicket(updatedTicket);
            }
        });

        return () => {
            socket.off('tickets_list');
            socket.off('ticket_created');
            socket.off('ticket_updated');
        };
    }, [socket, eventId, selectedTicket?.id]);

    const handleSendResponse = () => {
        if (!selectedTicket || (!responseCode.trim() && !responseText.trim())) return;

        socket.emit('update_ticket', {
            ticketId: selectedTicket.id,
            updates: {
                message: {
                    sender: user.username,
                    role: user.role,
                    text: responseText,
                    code: responseCode
                }
            }
        });

        setResponseCode('');
        setResponseText('');
    };

    const handleStatusChange = (ticketId, newStatus) => {
        socket.emit('update_ticket', {
            ticketId,
            updates: { status: newStatus }
        });
    };

    const handleTogglePublic = (ticketId, isPublic) => {
        socket.emit('update_ticket', {
            ticketId,
            updates: { isPublic: !isPublic }
        });
    };

    const filteredTickets = tickets.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'var(--danger)';
            case 'medium': return 'var(--warning)';
            case 'low': return 'var(--success)';
            default: return 'var(--text-color)';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'var(--danger)';
            case 'in-progress': return 'var(--warning)';
            case 'resolved': return 'var(--success)';
            default: return 'var(--text-color)';
        }
    };

    return (
        <div style={{ padding: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Tickets List */}
            <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Tickets ({filteredTickets.length})</h3>

                    <select
                        className="input-field"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={{ width: '100%', marginBottom: '1rem' }}
                    >
                        <option value="all">All Tickets</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            className="glass-panel"
                            onClick={() => setSelectedTicket(ticket)}
                            style={{
                                padding: '1rem',
                                cursor: 'pointer',
                                border: selectedTicket?.id === ticket.id ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                background: selectedTicket?.id === ticket.id ? 'rgba(0,240,255,0.1)' : 'rgba(255,255,255,0.03)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{ticket.title}</div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    background: getPriorityColor(ticket.priority),
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    {ticket.priority.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                                👤 {ticket.studentName}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{
                                    fontSize: '0.7rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    background: getStatusColor(ticket.status),
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    {ticket.status.toUpperCase()}
                                </div>
                                {ticket.isPublic && (
                                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>🌐 Public</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5, fontStyle: 'italic' }}>
                            No tickets found
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Detail */}
            {selectedTicket ? (
                <div className="glass-panel" style={{ flex: 1, minWidth: '350px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0' }}>{selectedTicket.title}</h2>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem', opacity: 0.7 }}>
                            <span>👤 {selectedTicket.studentName}</span>
                            <span>📅 {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <select
                            className="input-field"
                            value={selectedTicket.status}
                            onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                            style={{ flex: 1, minWidth: '150px' }}
                        >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <button
                            className="btn"
                            onClick={() => handleTogglePublic(selectedTicket.id, selectedTicket.isPublic)}
                            style={{
                                background: selectedTicket.isPublic ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                                flex: 1,
                                minWidth: '150px'
                            }}
                        >
                            {selectedTicket.isPublic ? '🌐 Public' : '🔒 Private'}
                        </button>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0 }}>Student Code:</h4>
                            <CopyButton text={selectedTicket.code} />
                        </div>
                        <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                            <Editor
                                height="200px"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={selectedTicket.code}
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 14
                                }}
                            />
                        </div>
                    </div>

                    {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4>Conversation:</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {selectedTicket.messages.map(msg => (
                                    <div key={msg.id} className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem' }}>
                                            <strong>{msg.sender}</strong> ({msg.role}) - {new Date(msg.timestamp).toLocaleString()}
                                        </div>
                                        {msg.text && <div style={{ marginBottom: '0.5rem' }}>{msg.text}</div>}
                                        {msg.code && (
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Code:</span>
                                                    <CopyButton text={msg.code} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} />
                                                </div>
                                                <div style={{ border: '1px solid var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <Editor
                                                        height="150px"
                                                        defaultLanguage="javascript"
                                                        theme="vs-dark"
                                                        value={msg.code}
                                                        options={{
                                                            readOnly: true,
                                                            minimap: { enabled: false },
                                                            fontSize: 12
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                        <h4>Send Response:</h4>
                        <textarea
                            className="input-field"
                            placeholder="Optional message..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            style={{ width: '100%', minHeight: '60px', marginBottom: '1rem', resize: 'vertical' }}
                        />
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Fixed Code (Optional):</div>
                            <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                                <Editor
                                    height="150px"
                                    defaultLanguage="javascript"
                                    theme="vs-dark"
                                    value={responseCode}
                                    onChange={(value) => setResponseCode(value || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 14
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleSendResponse}
                            style={{ width: '100%' }}
                            disabled={!responseCode.trim() && !responseText.trim()}
                        >
                            Send Response
                        </button>
                    </div>
                </div>
            ) : (
                <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, fontStyle: 'italic' }}>
                    Select a ticket to view details
                </div>
            )}
        </div>
    );
}

export default TicketsPanel;
