
import React, { useEffect, useState, useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Logo from './Logo';

// Simple notification sound (Beep)
const NOTIFICATION_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Truncated for brevity, will use a real one or browser API

function Layout() {
    const { user, logout } = useAuth();
    const socket = useSocket();

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null); // { username, text }
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (msg) => {
            // If chat is closed OR user is not the sender
            if (!isChatOpen && msg.username !== user.username) {
                // 1. Increment Badge
                setUnreadCount(prev => prev + 1);

                // 2. Play Sound
                // Ensure audio is loaded and ready
                const audio = audioRef.current;
                audio.volume = 0.5;
                audio.currentTime = 0;
                audio.play().catch(e => {
                    // Interaction policy often blocks this until user clicks.
                    // We can't force it, but this is the best attempt.
                    console.log("Audio play blocked by browser policy", e);
                });

                // 3. Show Toast
                setToast({ username: msg.username, text: msg.text });

                // Hide toast after 3s
                setTimeout(() => setToast(null), 3000);
            }
        };

        socket.on('chat_message', handleMessage);

        return () => {
            socket.off('chat_message', handleMessage);
        };
    }, [socket, isChatOpen, user.username]);

    // Reset unread count when opening chat
    useEffect(() => {
        if (isChatOpen) {
            setUnreadCount(0);
            setToast(null);
        }
    }, [isChatOpen]);

    return (
        <div className="app-container">
            {/* Header */}
            {/* Header */}
            <header className="app-header">
                <div className="header-left">
                    <Logo size={28} />
                    <h2 className="app-title">
                        HyperClass
                    </h2>
                </div>

                <div className="header-right">
                    <span className="glass-panel user-badge">
                        {user.role === 'admin' ? '👑 Admin' : `👤 ${user.username}`}
                    </span>
                    <button onClick={logout} className="btn" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Logout</button>
                </div>
            </header>

            {/* Main Content (Full Screen Lesson) */}
            <div className="app-content">
                <div className="glass-panel animate-fade-in" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <LeftPanel />
                </div>
            </div>

            {/* Floating Chat Button */}
            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 10px 25px rgba(59, 130, 246, 0.5)',
                    cursor: 'pointer',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    transition: 'transform 0.2s',
                    // removed duplicate position fixed
                }}
                className="hover-scale"
            >
                {isChatOpen ? '✕' : '💬'}

                {/* Notification Badge */}
                {unreadCount > 0 && (
                    <span className="animate-pop" style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: 'var(--danger)',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #0f172a'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Toast Notification */}
            {toast && !isChatOpen && (
                <div
                    className="glass-panel animate-fade-in"
                    style={{
                        position: 'fixed',
                        bottom: '90px',
                        right: '2rem',
                        padding: '1rem',
                        zIndex: 90,
                        maxWidth: '300px',
                        borderLeft: '4px solid var(--primary)',
                        background: 'rgba(15, 23, 42, 0.95)'
                    }}
                >
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem', color: 'var(--primary)' }}>
                        {toast.username} says:
                    </div>
                    <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {toast.text}
                    </div>
                </div>
            )}

            {/* Chat Overlay / Popup */}
            <div className={`chat-overlay ${isChatOpen ? 'open' : ''}`}>
                <RightPanel />
            </div>
        </div>
    );
}

export default Layout;

