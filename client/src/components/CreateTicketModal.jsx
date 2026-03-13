import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Editor from "@monaco-editor/react";

function CreateTicketModal({ isOpen, onClose }) {
    const socket = useSocket();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [code, setCode] = useState('');
    const [priority, setPriority] = useState('medium');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !code.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setSubmitting(true);

        socket.emit('create_ticket', {
            title,
            code,
            priority
        });

        // Reset form
        setTitle('');
        setCode('');
        setPriority('medium');
        setSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
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
                maxWidth: '700px',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>🎫 Raise a Ticket</h2>
                    <button onClick={onClose} className="btn" style={{ background: 'var(--danger)' }}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Title */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                            Title / Subject
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., Syntax Error in Line 23"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%' }}
                            required
                        />
                    </div>

                    {/* Priority */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                            Priority
                        </label>
                        <select
                            className="input-field"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {/* Code/Error */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                            Code / Error Description
                        </label>
                        <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden' }}>
                            <Editor
                                height="200px"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateTicketModal;
