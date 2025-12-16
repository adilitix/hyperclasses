import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

function RightPanel() {
    const socket = useSocket();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('chat_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on('chat_status', ({ disabled }) => {
            setIsDisabled(disabled);
            if (disabled) {
                // Optional: Add system message locally?
            }
        });

        return () => {
            socket.off('chat_message');
            socket.off('chat_status');
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        // Check if image (simple url check or just text)
        // Basic text for now
        socket.emit('send_message', {
            username: user.username,
            text: inputText
        });
        setInputText('');
    };

    const toggleChat = () => {
        if (user.role !== 'admin') return;
        socket.emit('toggle_chat', !isDisabled);
    };

    return (
        <>
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.2)'
            }}>
                <h3 style={{ margin: 0 }}>Live Chat</h3>
                {user.role === 'admin' && (
                    <button
                        onClick={toggleChat}
                        className="btn"
                        style={{
                            fontSize: '0.7rem',
                            background: isDisabled ? 'var(--success)' : 'var(--danger)',
                            padding: '0.2rem 0.6rem'
                        }}
                    >
                        {isDisabled ? 'Enable Chat' : 'Disable Chat'}
                    </button>
                )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        alignSelf: msg.username === user.username ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        fontSize: '0.9rem'
                    }}>
                        {!msg.isSystem && msg.username !== user.username && (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>{msg.username}</div>
                        )}
                        <div style={{
                            background: msg.isSystem
                                ? 'rgba(255,255,255,0.1)'
                                : msg.username === user.username ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            color: msg.isSystem ? '#94a3b8' : 'white',
                            padding: '0.5rem 0.8rem',
                            borderRadius: '0.8rem',
                            borderTopRightRadius: msg.username === user.username ? '0' : '0.8rem',
                            borderTopLeftRadius: msg.username !== user.username ? '0' : '0.8rem',
                            fontStyle: msg.isSystem ? 'italic' : 'normal',
                            textAlign: msg.isSystem ? 'center' : 'left',
                            alignSelf: msg.isSystem ? 'center' : 'auto',
                            width: msg.isSystem ? '100%' : 'auto'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                <input
                    type="text"
                    className="input-field"
                    placeholder={isDisabled && user.role !== 'admin' ? "Chat is disabled" : "Type a message..."}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    disabled={isDisabled && user.role !== 'admin'}
                />
            </form>
        </>
    );
}

export default RightPanel;
