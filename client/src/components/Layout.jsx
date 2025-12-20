import React, { useEffect, useState, useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import SuperAdminPanel from './SuperAdminPanel';
import PollOverlay from './PollOverlay';
import TimerOverlay from './TimerOverlay';
import SettingsModal from './SettingsModal';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

// Simple notification sound (Beep)
const NOTIFICATION_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Truncated for brevity

// Helper for dynamic theme
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 240, 255';
};

function Layout() {
    const { user, logout } = useAuth();
    const socket = useSocket();

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showSuperAdmin, setShowSuperAdmin] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Theme State
    const [theme, setTheme] = useState('dark');
    const [primaryColor, setPrimaryColor] = useState('#00f0ff');

    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null); // { username, text }
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

    // Poll State
    const [activePoll, setActivePoll] = useState(null);

    useEffect(() => {
        if (!socket) return;
        socket.on('poll_update', (poll) => {
            setActivePoll(poll);
        });
        return () => socket.off('poll_update');
    }, [socket]);

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

    // Calculate dynamic styles
    const dynamicStyles = {
        '--primary': primaryColor,
        '--primary-glow': `rgba(${hexToRgb(primaryColor)}, 0.5)`,
        '--primary-hover': primaryColor // simplified, usually safer to stay same or slightly lighter
    };

    return (
        <div className="app-container" data-theme={theme} style={dynamicStyles}>
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
                        {user.role === 'admin' ? '👑 Admin' : user.role === 'superadmin' ? '⚡ Super Admin' : `👤 ${user.username}`}
                    </span>

                    {user.role === 'superadmin' && (
                        <button
                            onClick={() => setShowSuperAdmin(!showSuperAdmin)}
                            className="btn"
                            style={{
                                background: showSuperAdmin ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                color: showSuperAdmin ? '#000' : 'var(--text-color)',
                                fontSize: '0.8rem',
                                padding: '0.4rem 0.8rem',
                                marginRight: '0.5rem'
                            }}
                        >
                            {showSuperAdmin ? 'View Lesson' : 'Dashboard'}
                        </button>
                    )}

                    <button
                        onClick={() => setShowSettings(true)}
                        className="btn"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid var(--glass-border)',
                            padding: '0.4rem',
                            fontSize: '1.2rem',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Settings"
                    >
                        ⚙️
                    </button>
                </div>
            </header>

            {/* Main Content (Full Screen Lesson) */}
            <div className="app-content">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel"
                    style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                    {showSuperAdmin ? <SuperAdminPanel /> : <LeftPanel />}
                </motion.div>
            </div>

            {/* Footer */}
            <footer style={{
                textAlign: 'center',
                padding: '0.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-color)',
                opacity: 0.6,
                borderTop: '1px solid var(--glass-border)',
                background: 'rgba(0, 0, 0, 0.2)',
                zIndex: 50
            }}>
                HyperClass Workshop Management | Created by Aadil S P | Hyperclass2.0 © 2025 All rights reserved
            </footer>

            {/* Poll Overlay */}
            <PollOverlay activePoll={activePoll} />
            <TimerOverlay />

            {/* Floating Chat Button (Draggable) */}
            <motion.button
                onClick={() => setIsChatOpen(!isChatOpen)}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} // Keep basically in place but allow fun wiggle
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#000',
                    border: 'none',
                    boxShadow: '0 0 20px var(--primary-glow)',
                    cursor: 'pointer',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                }}
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
            </motion.button>

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
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="chat-overlay open" // Use 'open' class for base styles, Let motion handle anim
                        style={{ display: 'flex' }} // Override specific legacy css if needed
                    >
                        <RightPanel />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                theme={theme}
                setTheme={setTheme}
                primaryColor={primaryColor}
                setPrimaryColor={setPrimaryColor}
                logout={logout}
                user={user}
            />
        </div>
    );
}

export default Layout;

