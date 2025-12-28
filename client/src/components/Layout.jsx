import React, { useEffect, useState, useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import SuperAdminPanel from './SuperAdminPanel';
import AdminDashboard from './AdminDashboard';
import PollOverlay from './PollOverlay';
import TimerOverlay from './TimerOverlay';
import SettingsModal from './SettingsModal';
import StudentTicketManager from './StudentTicketManager';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import AboutPanel from './AboutPanel';
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
    const scrollContainerRef = useRef(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showSuperAdmin, setShowSuperAdmin] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showTicketManager, setShowTicketManager] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Theme State
    const [theme, setTheme] = useState('dark');
    const [primaryColor, setPrimaryColor] = useState('#00f0ff');

    // Admin State (Lifted for sidebar consistency)
    const [adminActiveTab, setAdminActiveTab] = useState('events');
    const [currentEvent, setCurrentEvent] = useState(null);

    const handleEnterEvent = (id, name) => {
        setCurrentEvent({ id, name });
        setAdminActiveTab('classroom');
        if (socket) {
            socket.emit('join_event', {
                username: user.username,
                role: user.role,
                eventId: id
            });
        }
    };

    const handleExitEvent = () => {
        setCurrentEvent(null);
        setAdminActiveTab('events');
    };

    // Download Path State (persisted in localStorage)
    const [downloadPath, setDownloadPath] = useState(() => {
        return localStorage.getItem('downloadPath') || '';
    });

    // Download Format State (persisted in localStorage)
    const [downloadFormat, setDownloadFormat] = useState(() => {
        return localStorage.getItem('downloadFormat') || 'py';
    });

    // Persist download path to localStorage
    useEffect(() => {
        localStorage.setItem('downloadPath', downloadPath);
    }, [downloadPath]);

    // Persist download format to localStorage
    useEffect(() => {
        localStorage.setItem('downloadFormat', downloadFormat);
    }, [downloadFormat]);

    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null); // { username, text }
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

    // Chat messages state - lifted to Layout so it persists when chat closes
    const [messages, setMessages] = useState([]);

    // Poll State
    const [activePoll, setActivePoll] = useState(null);

    // Timeline / History State
    const [history, setHistory] = useState([]);
    const [viewingSnapshot, setViewingSnapshot] = useState(null);
    const [showTimeline, setShowTimeline] = useState(false);

    useEffect(() => {
        if (!socket) return;
        socket.on('poll_update', (poll) => {
            setActivePoll(poll);
        });

        socket.on('history_update', (hist) => {
            setHistory(hist);
        });

        // Listen for download feedback
        socket.on('download_success', ({ message, path }) => {
            alert(`✅ ${message}`);
        });

        socket.on('download_error', (error) => {
            alert(`❌ Download failed: ${error}`);
        });

        // Request initial history
        socket.emit('get_history');

        return () => {
            socket.off('poll_update');
            socket.off('history_update');
            socket.off('download_success');
            socket.off('download_error');
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (msg) => {
            // If chat is closed OR user is not the sender
            if (!isChatOpen && msg.username !== user.username) {
                // 1. Increment Badge
                setUnreadCount(prev => prev + 1);

                // 2. Play Sound
                const audio = audioRef.current;
                audio.volume = 0.5;
                audio.currentTime = 0;
                audio.play().catch(e => {
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

    // Scroll to top on navigation/page change/login
    useEffect(() => {
        window.scrollTo(0, 0);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo(0, 0);
        }
    }, [adminActiveTab, currentEvent, showTimeline, showSuperAdmin, user]);

    // Calculate dynamic styles
    const dynamicStyles = {
        '--primary': primaryColor,
        '--primary-glow': `rgba(${hexToRgb(primaryColor)}, 0.5)`,
        '--primary-hover': primaryColor // simplified, usually safer to stay same or slightly lighter
    };

    return (
        <div className="app-container" data-theme={theme} style={dynamicStyles}>
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && <div className="app-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Left Sidebar */}
            <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '0 0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Logo size={28} />
                        <h2 className="app-title cine-text" style={{ fontSize: '1rem', margin: 0 }}>
                            Hyper<span className="mobile-hide">Class</span>
                        </h2>
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        className="btn btn-ghost mobile-only-flex"
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ padding: '0.4rem', border: 'none', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}
                    >
                        ✕
                    </button>
                </div>

                <div className="sidebar-nav">
                    {showTimeline ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
                                <button
                                    onClick={() => setShowTimeline(false)}
                                    className="btn btn-ghost"
                                    style={{ padding: '0.4rem', minWidth: '0', background: 'transparent' }}
                                >
                                    ←
                                </button>
                                <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.6 }}>Timeline</span>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem' }}>
                                <div
                                    onClick={() => setViewingSnapshot(null)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--border-radius-sm)',
                                        cursor: 'pointer',
                                        background: !viewingSnapshot ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                        color: !viewingSnapshot ? '#000' : 'var(--text-color)',
                                        marginBottom: '0.5rem',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>🔴 Live Now</strong>
                                </div>
                                {history.map((snap) => (
                                    <div
                                        key={snap.id}
                                        onClick={() => setViewingSnapshot(snap)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            background: viewingSnapshot?.id === snap.id ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                                            color: viewingSnapshot?.id === snap.id ? '#000' : 'var(--text-color)',
                                            marginBottom: '0.5rem',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <strong style={{ display: 'block', fontSize: '0.85rem' }}>{snap.name}</strong>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                            {new Date(snap.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Admin Navigation */}
                            {(user.role === 'admin' || user.role === 'superadmin') && !showSuperAdmin && (
                                <>
                                    <div style={{ padding: '0 0.75rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                                        Management
                                    </div>
                                    <button
                                        onClick={() => setAdminActiveTab('events')}
                                        className="btn btn-ghost"
                                        style={{
                                            justifyContent: 'flex-start',
                                            border: 'none',
                                            color: adminActiveTab === 'events' ? 'var(--primary)' : 'var(--text-secondary)',
                                            background: adminActiveTab === 'events' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                            width: '100%',
                                            marginBottom: '0.25rem'
                                        }}
                                    >
                                        <span style={{ minWidth: '24px' }}>📅</span> Events
                                    </button>

                                    {currentEvent && (
                                        <>
                                            <div style={{ margin: '1rem 0.75rem 0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                                                Active Session
                                            </div>
                                            {[
                                                { id: 'classroom', icon: '🖥️', label: 'Classroom' },
                                                { id: 'students', icon: '👥', label: 'Students' },
                                                { id: 'tickets', icon: '🎫', label: 'Tickets' },
                                                { id: 'chat-history', icon: '💬', label: 'Chat History' },
                                                { id: 'attendance', icon: '📊', label: 'Attendance' }
                                            ].map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setAdminActiveTab(tab.id)}
                                                    className="btn btn-ghost"
                                                    style={{
                                                        justifyContent: 'flex-start',
                                                        border: 'none',
                                                        color: adminActiveTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                                                        background: adminActiveTab === tab.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                                        width: '100%',
                                                        marginBottom: '0.25rem'
                                                    }}
                                                >
                                                    <span style={{ minWidth: '24px' }}>{tab.icon}</span> {tab.label}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setAdminActiveTab('about')}
                                                className="btn btn-ghost"
                                                style={{
                                                    justifyContent: 'flex-start',
                                                    border: 'none',
                                                    color: adminActiveTab === 'about' ? 'var(--primary)' : 'var(--text-secondary)',
                                                    background: adminActiveTab === 'about' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                                    width: '100%',
                                                    marginBottom: '0.25rem'
                                                }}
                                            >
                                                <span style={{ minWidth: '24px' }}>ℹ️</span> About Website
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAdminActiveTab('classroom');
                                                    setShowTimeline(true);
                                                }}
                                                className="btn btn-ghost"
                                                style={{
                                                    justifyContent: 'flex-start',
                                                    border: 'none',
                                                    color: 'var(--text-secondary)',
                                                    width: '100%',
                                                    marginBottom: '0.25rem'
                                                }}
                                            >
                                                <span style={{ minWidth: '24px' }}>🕒</span> Timeline
                                            </button>
                                            <button
                                                onClick={handleExitEvent}
                                                className="btn btn-ghost"
                                                style={{
                                                    justifyContent: 'flex-start',
                                                    border: 'none',
                                                    color: 'var(--danger)',
                                                    width: '100%',
                                                    marginTop: '0.5rem'
                                                }}
                                            >
                                                <span style={{ minWidth: '24px' }}>🚪</span> Leave Session
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Student Navigation */}
                            {user.role === 'student' && (
                                <>
                                    <div style={{ padding: '0 0.75rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                                        Workshop
                                    </div>
                                    <button
                                        onClick={() => setShowTicketManager(true)}
                                        className="btn btn-ghost"
                                        style={{
                                            justifyContent: 'flex-start',
                                            border: 'none',
                                            background: 'rgba(245, 158, 11, 0.05)',
                                            color: '#f59e0b',
                                            width: '100%',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <span style={{ minWidth: '24px' }}>🎫</span> Raise Ticket
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowTimeline(true);
                                            setShowAbout(false);
                                            setIsSidebarOpen(false);
                                        }}
                                        className="btn btn-ghost"
                                        style={{
                                            justifyContent: 'flex-start',
                                            border: 'none',
                                            color: showTimeline ? 'var(--primary)' : 'var(--text-secondary)',
                                            background: showTimeline ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                            width: '100%',
                                            marginBottom: '0.5rem'
                                        }}
                                    >
                                        <span style={{ minWidth: '24px' }}>🕒</span> History
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    <div style={{ flex: 1 }}></div>

                    <button
                        onClick={() => {
                            if (user.role === 'admin' || user.role === 'superadmin') {
                                setAdminActiveTab('settings');
                            } else {
                                setShowSettings(true); // Keep modal for students for now or switch them too?
                                setShowAbout(false);
                            }
                            setShowTimeline(false);
                            setIsSidebarOpen(false);
                        }}
                        className="btn btn-ghost"
                        style={{
                            justifyContent: 'flex-start',
                            border: 'none',
                            color: adminActiveTab === 'settings' ? 'var(--primary)' : 'var(--text-secondary)',
                            background: adminActiveTab === 'settings' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                            width: '100%'
                        }}
                    >
                        <span style={{ minWidth: '24px' }}>⚙️</span> Settings
                    </button>
                </div>

                <div className="sidebar-footer">
                    <div className="user-badge" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', border: 'none', padding: '0.75rem' }}>
                        <span>{user.role === 'admin' ? '🛡️' : user.role === 'superadmin' ? '⚡' : '👤'}</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.displayName || user.username}</span>
                            <span style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'capitalize' }}>{user.role}</span>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="btn btn-ghost"
                        style={{
                            justifyContent: 'flex-start',
                            border: 'none',
                            color: 'var(--danger)',
                            width: '100%',
                            background: 'rgba(239, 68, 68, 0.05)'
                        }}
                    >
                        <span style={{ minWidth: '24px', marginRight: '0.5rem' }}>🚪</span> Logout
                    </button>
                </div>
            </aside>

            <div className="app-main" ref={scrollContainerRef}>
                {/* Header */}
                <header className="app-header" style={{ padding: '0.75rem 1.25rem' }}>
                    <button
                        className="btn btn-ghost hamburger-btn"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ display: 'none', padding: '0.5rem', minWidth: '40px' }}
                    >
                        {isSidebarOpen ? '✕' : '☰'}
                    </button>

                    {/* Active Event Indicator */}
                    <div style={{ marginLeft: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        {(currentEvent || user.eventName) && (
                            <div style={{
                                background: 'rgba(56, 189, 248, 0.1)',
                                border: '1px solid var(--primary)',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                color: 'var(--primary)',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}>
                                <span className="mobile-hide cine-text" style={{ fontSize: '0.7rem' }}>WORKSHOP:</span>
                                <span style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{currentEvent?.name || user.eventName}</span>
                            </div>
                        )}
                        {showSuperAdmin && (
                            <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 800 }}>⚡ SYSTEM CONFIG</div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {user.role === 'superadmin' && (
                            <button
                                onClick={() => setShowSuperAdmin(!showSuperAdmin)}
                                className={`btn ${showSuperAdmin ? 'btn-primary' : 'btn-ghost'}`}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            >
                                {showSuperAdmin ? 'Exit Config' : 'Admin Panel'}
                            </button>
                        )}

                        {user.role === 'student' && (
                            <button
                                onClick={async () => {
                                    try {
                                        if (!window.downloadDirHandle) {
                                            alert('Please select a download folder in Settings first!');
                                            setShowSettings(true);
                                            return;
                                        }
                                        socket.emit('get_current_content');
                                        socket.once('current_content', async (content) => {
                                            try {
                                                const eventName = user.eventId || 'lesson';
                                                let fileNumber = 1;
                                                try {
                                                    for await (const entry of window.downloadDirHandle.values()) {
                                                        if (entry.kind === 'file' && entry.name.startsWith(eventName)) {
                                                            const match = entry.name.match(/_(\d+)\./);
                                                            if (match) {
                                                                const num = parseInt(match[1]);
                                                                if (num >= fileNumber) fileNumber = num + 1;
                                                            }
                                                        }
                                                    }
                                                } catch (err) { }
                                                const paddedNumber = String(fileNumber).padStart(3, '0');
                                                const filename = `${eventName}_${paddedNumber}.${downloadFormat}`;
                                                const fileHandle = await window.downloadDirHandle.getFileHandle(filename, { create: true });
                                                const writable = await fileHandle.createWritable();
                                                await writable.write(content.content || '');
                                                await writable.close();
                                                alert(`✅ Saved: ${filename}`);
                                            } catch (err) {
                                                alert(`❌ Save failed: ${err.message}`);
                                            }
                                        });
                                    } catch (err) {
                                        alert(`❌ Download error: ${err.message}`);
                                    }
                                }}
                                className="btn"
                                style={{
                                    background: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    padding: '0.4rem 1.25rem',
                                    fontWeight: 700
                                }}
                            >
                                💾 Save Code
                            </button>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <div className="app-content">
                    {showSuperAdmin ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="glass-panel"
                            style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                        >
                            <SuperAdminPanel />
                        </motion.div>
                    ) : (user.role === 'admin' || user.role === 'superadmin') ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="glass-panel"
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            <AdminDashboard
                                activeTab={adminActiveTab}
                                currentEvent={currentEvent}
                                onEnterEvent={handleEnterEvent}
                                viewingSnapshot={viewingSnapshot}
                                setViewingSnapshot={setViewingSnapshot}
                                theme={theme}
                                setTheme={setTheme}
                                primaryColor={primaryColor}
                                setPrimaryColor={setPrimaryColor}
                                downloadPath={downloadPath}
                                setDownloadPath={setDownloadPath}
                                downloadFormat={downloadFormat}
                                setDownloadFormat={setDownloadFormat}
                            />
                        </motion.div>
                    ) : (
                        // Student View: Split Layout with Lesson + Chat
                        <div className="main-layout student-layout">
                            {/* Left: Lesson Content */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="glass-panel lesson-panel"
                                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                            >
                                <LeftPanel viewingSnapshot={viewingSnapshot} setViewingSnapshot={setViewingSnapshot} />
                            </motion.div>

                            {/* Right: Chat Panel */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="glass-panel chat-panel"
                                style={{ display: 'flex', flexDirection: 'column' }}
                            >
                                <RightPanel messages={messages} onMessagesUpdate={setMessages} />
                            </motion.div>
                        </div>
                    )}
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

                {/* Floating Chat Button (Admin Only - Students have persistent panel) */}
                {(user.role === 'admin' || user.role === 'superadmin') && (
                    <motion.button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
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
                )}

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

                {/* Chat Overlay / Popup (Admin Only) */}
                {(user.role === 'admin' || user.role === 'superadmin') && (
                    <AnimatePresence>
                        {isChatOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="chat-overlay open"
                                style={{ display: 'flex', maxHeight: '90vh' }}
                            >
                                <RightPanel messages={messages} onMessagesUpdate={setMessages} onClose={() => setIsChatOpen(false)} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

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
                    downloadPath={downloadPath}
                    setDownloadPath={setDownloadPath}
                    downloadFormat={downloadFormat}
                    setDownloadFormat={setDownloadFormat}
                    trainerUsername={user.role === 'student' ? (user.trainerUsername || currentEvent?.createdBy) : null}
                />

                {/* Student Ticket Manager */}
                {user.role === 'student' && (
                    <StudentTicketManager
                        isOpen={showTicketManager}
                        onClose={() => setShowTicketManager(false)}
                    />
                )}
                {/* Style for Hamburger Visibility */}
                <style>{`
                    .mobile-only-flex { display: none; }
                    @media (max-width: 768px) {
                        .hamburger-btn {
                            display: flex !important;
                            margin-right: 0.5rem;
                        }
                        .mobile-only-flex {
                            display: flex !important;
                        }
                    }
                    @media (max-width: 400px) {
                        .app-header .btn-text {
                            display: none;
                        }
                    }
                `}</style>
            </div>
        </div >
    );
}

export default Layout;

