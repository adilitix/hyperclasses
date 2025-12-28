import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

function RightPanel({ messages, onMessagesUpdate, onClose }) {
    const socket = useSocket();
    const { user } = useAuth();
    const [inputText, setInputText] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);
    const messagesEndRef = useRef(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleChatMessage = (msg) => {
            onMessagesUpdate(prev => [...prev, msg]);
        };

        const handleChatHistory = (history) => {
            onMessagesUpdate(() => history);
        };

        socket.on('chat_message', handleChatMessage);
        socket.on('chat_history', handleChatHistory);

        socket.on('chat_status', ({ disabled }) => {
            setIsDisabled(disabled);
        });

        return () => {
            socket.off('chat_message', handleChatMessage);
            socket.off('chat_history', handleChatHistory);
            socket.off('chat_status');
        };
    }, [socket, onMessagesUpdate]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
            if (isNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        socket.emit('send_message', {
            username: user.username,
            text: inputText
        });
        setInputText('');
    };

    const toggleChat = () => {
        if (user.role !== 'admin' && user.role !== 'superadmin') return;
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>Live Chat</h3>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                        <button
                            onClick={toggleChat}
                            className="btn"
                            style={{
                                fontSize: '0.65rem',
                                background: isDisabled ? 'var(--success)' : 'var(--danger)',
                                padding: '0.1rem 0.4rem',
                                opacity: 0.8
                            }}
                        >
                            {isDisabled ? 'Off' : 'On'}
                        </button>
                    )}
                </div>
                {onClose && (
                    <button onClick={onClose} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.2rem 0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        ✕
                    </button>
                )}
            </div>

            <div
                ref={scrollContainerRef}
                className="chat-messages-container"
                style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
            >
                {messages.map((msg) => (
                    <div key={msg.id} style={{
                        alignSelf: msg.username === user.username ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        fontSize: '0.9rem'
                    }}>
                        {!msg.isSystem && msg.username !== user.username && (
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>
                                {msg.username} <span style={{ opacity: 0.5, fontSize: '0.6rem', marginLeft: '0.5rem' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        )}
                        {!msg.isSystem && msg.username === user.username && (
                            <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '2px', textAlign: 'right', opacity: 0.5 }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
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
                    placeholder={isDisabled && user.role !== 'admin' && user.role !== 'superadmin' ? "Chat is disabled" : "Type a message..."}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    disabled={isDisabled && user.role !== 'admin' && user.role !== 'superadmin'}
                />
            </form>
        </>
    );
}

export default RightPanel;
