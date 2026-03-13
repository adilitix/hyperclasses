import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Editor from "@monaco-editor/react";
import CopyButton from './CopyButton';
import CreateTicketModal from './CreateTicketModal';

function StudentTicketManager({ isOpen, onClose }) {
    const socket = useSocket();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (!socket || !isOpen) return;

        // Request tickets when opened
        socket.emit('get_tickets');

        socket.on('tickets_list', (ticketsList) => {
            setTickets(ticketsList);
        });

        socket.on('ticket_created', (ticket) => {
            if (ticket.studentName === user.username) {
                setTickets(prev => [ticket, ...prev]);
            }
        });

        socket.on('ticket_updated', (updatedTicket) => {
            if (updatedTicket.studentName === user.username || updatedTicket.isPublic) {
                setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
                if (selectedTicket?.id === updatedTicket.id) {
                    setSelectedTicket(updatedTicket);
                }
            }
        });

        return () => {
            socket.off('tickets_list');
            socket.off('ticket_created');
            socket.off('ticket_updated');
        };
    }, [socket, isOpen, user.username, selectedTicket?.id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'var(--danger)';
            case 'in-progress': return 'var(--warning)';
            case 'resolved': return 'var(--success)';
            default: return 'var(--text-color)';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'var(--danger)';
            case 'medium': return 'var(--warning)';
            case 'low': return 'var(--success)';
            default: return 'var(--text-color)';
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem'
            }}>
                <div className="glass-panel" style={{
                    width: '100%',
                    maxWidth: '1200px',
                    height: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.3)'
                    }}>
                        <h2 style={{ margin: 0 }}>🎫 My Tickets</h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="btn btn-primary"
                            >
                                + New Ticket
                            </button>
                            <button onClick={onClose} className="btn" style={{ background: 'var(--danger)' }}>
                                ✕ Close
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        {/* Tickets List */}
                        <div style={{
                            width: '350px',
                            borderRight: '1px solid var(--glass-border)',
                            overflowY: 'auto',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                        }}>
                            {tickets.length === 0 ? (
                                <div style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    opacity: 0.5,
                                    fontStyle: 'italic'
                                }}>
                                    No tickets yet.<br />
                                    Click "New Ticket" to raise one!
                                </div>
                            ) : (
                                tickets.map(ticket => (
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
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'start',
                                            marginBottom: '0.5rem'
                                        }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem', flex: 1 }}>
                                                {ticket.title}
                                            </div>
                                            <div style={{
                                                fontSize: '0.7rem',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: getPriorityColor(ticket.priority),
                                                color: '#000',
                                                fontWeight: 'bold',
                                                marginLeft: '0.5rem'
                                            }}>
                                                {ticket.priority.toUpperCase()}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '0.75rem'
                                        }}>
                                            <div style={{
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '4px',
                                                background: getStatusColor(ticket.status),
                                                color: '#000',
                                                fontWeight: 'bold'
                                            }}>
                                                {ticket.status.toUpperCase()}
                                            </div>
                                            {ticket.isPublic && (
                                                <div style={{ opacity: 0.7 }}>🌐 Public</div>
                                            )}
                                            {ticket.messages && ticket.messages.length > 0 && (
                                                <div style={{
                                                    background: 'var(--success)',
                                                    color: '#000',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {ticket.messages.length} Reply
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Ticket Detail */}
                        {selectedTicket ? (
                            <div style={{
                                flex: 1,
                                padding: '2rem',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem'
                            }}>
                                {/* Header */}
                                <div style={{
                                    borderBottom: '1px solid var(--glass-border)',
                                    paddingBottom: '1rem'
                                }}>
                                    <h2 style={{ margin: '0 0 0.5rem 0' }}>{selectedTicket.title}</h2>
                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        fontSize: '0.9rem',
                                        opacity: 0.7
                                    }}>
                                        <span>📅 {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '4px',
                                            background: getStatusColor(selectedTicket.status),
                                            color: '#000',
                                            fontWeight: 'bold',
                                            opacity: 1
                                        }}>
                                            {selectedTicket.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Your Code */}
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <h4 style={{ margin: 0 }}>Your Code:</h4>
                                        <CopyButton text={selectedTicket.code} />
                                    </div>
                                    <div style={{
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        overflow: 'hidden'
                                    }}>
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

                                {/* Solutions/Responses */}
                                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                                    <div>
                                        <h4>Solutions & Responses:</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {selectedTicket.messages.map(msg => (
                                                <div
                                                    key={msg.id}
                                                    className="glass-panel"
                                                    style={{
                                                        padding: '1rem',
                                                        background: 'rgba(0,240,255,0.05)',
                                                        border: '1px solid var(--primary)'
                                                    }}
                                                >
                                                    <div style={{
                                                        fontSize: '0.8rem',
                                                        opacity: 0.7,
                                                        marginBottom: '0.5rem'
                                                    }}>
                                                        <strong>👨‍🏫 {msg.sender}</strong> ({msg.role}) - {new Date(msg.timestamp).toLocaleString()}
                                                    </div>
                                                    {msg.text && (
                                                        <div style={{
                                                            marginBottom: '0.5rem',
                                                            padding: '0.5rem',
                                                            background: 'rgba(255,255,255,0.05)',
                                                            borderRadius: '4px'
                                                        }}>
                                                            {msg.text}
                                                        </div>
                                                    )}
                                                    {msg.code && (
                                                        <div>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '0.5rem'
                                                            }}>
                                                                <span style={{
                                                                    fontSize: '0.9rem',
                                                                    fontWeight: 'bold',
                                                                    color: 'var(--success)'
                                                                }}>
                                                                    ✅ Fixed Code:
                                                                </span>
                                                                <CopyButton
                                                                    text={msg.code}
                                                                    style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem' }}
                                                                />
                                                            </div>
                                                            <div style={{
                                                                border: '1px solid var(--success)',
                                                                borderRadius: '4px',
                                                                overflow: 'hidden'
                                                            }}>
                                                                <Editor
                                                                    height="200px"
                                                                    defaultLanguage="javascript"
                                                                    theme="vs-dark"
                                                                    value={msg.code}
                                                                    options={{
                                                                        readOnly: true,
                                                                        minimap: { enabled: false },
                                                                        fontSize: 14
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{
                                        padding: '2rem',
                                        textAlign: 'center',
                                        opacity: 0.5,
                                        fontStyle: 'italic',
                                        border: '1px dashed var(--glass-border)',
                                        borderRadius: '8px'
                                    }}>
                                        ⏳ Waiting for admin response...
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0.5,
                                fontStyle: 'italic'
                            }}>
                                Select a ticket to view details
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Ticket Modal */}
            <CreateTicketModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
        </>
    );
}

export default StudentTicketManager;
