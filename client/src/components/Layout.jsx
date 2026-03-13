import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import GoDashboard from './GoDashboard';
import GoStudentWorkshop from '../pages/GoStudentWorkshop';
import '../styles/mobile.css';
import '../styles/landing_v2.css'; // For some shared styles

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
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showSuperAdmin, setShowSuperAdmin] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showTicketManager, setShowTicketManager] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Mobile Navigation State
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeMobileTab, setActiveMobileTab] = useState(
        (user.role === 'admin' || user.role === 'superadmin') ? 'events' : 'classroom'
    );
    const [showMobileModules, setShowMobileModules] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Theme State
    const [theme, setTheme] = useState('dark');
    const [primaryColor, setPrimaryColor] = useState('#00f0ff');

    // Unified Platform State
    const [activeApp, setActiveApp] = useState(user.isWorkshop ? 'go' : 'flow'); // 'flow' or 'go'
    const [adminActiveTab, setAdminActiveTab] = useState('events');
    const [currentEvent, setCurrentEvent] = useState(null);

    useEffect(() => {
        if (user && user.role === 'student' && user.isWorkshop !== undefined) {
            setActiveApp(user.isWorkshop ? 'go' : 'flow');
        }
    }, [user]);

    const handleEnterEvent = (id, name, isGo = false) => {
        setCurrentEvent({ id, name, isWorkshop: isGo });
        window.currentEventId = id; // For quick access
        if (isGo) {
            setActiveApp('go');
            setAdminActiveTab('go-engine');
        } else {
            setActiveApp('flow');
            setAdminActiveTab('classroom');
        }
        if (isMobile) setActiveMobileTab(isGo ? 'go' : 'classroom');
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
        if (isMobile) setActiveMobileTab('events');
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

    // Dynamic Theming based on activeApp
    useEffect(() => {
        const root = document.documentElement;
        if (activeApp === 'go') {
            root.style.setProperty('--primary', '#ff7b00');
            root.style.setProperty('--primary-blue', '#ff7b00'); // Override for shared components
        } else {
            root.style.setProperty('--primary', primaryColor);
            root.style.setProperty('--primary-blue', '#0066ff');
        }
    }, [activeApp, primaryColor]);

    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null); // { username, text }
    const audioRef = useRef(new Audio(NOTIFICATION_SOUND));

    // Chat messages state - lifted to Layout so it persists when chat closes
    const [messages, setMessages] = useState([]);

    // Poll State
    const [activePoll, setActivePoll] = useState(null);

    // Timeline / History State
    const [history, setHistory] = useState([]);
    const [workshops, setWorkshops] = useState([]);
    const [viewingSnapshot, setViewingSnapshot] = useState(null);
    const [showTimeline, setShowTimeline] = useState(false);
    const [storageActive, setStorageActive] = useState(false);
    const [syncEnabled, setSyncEnabled] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const checkCloud = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_SERVER_URL || ''}/api/storage-status`);
                const data = await res.json();
                setStorageActive(data.connected);

                // Also check live sync status
                const syncRes = await fetch(`${import.meta.env.VITE_SERVER_URL || ''}/api/sync/status`);
                const syncData = await syncRes.json();
                setSyncEnabled(syncData.enabled);
            } catch (e) { }
        };
        checkCloud();
    }, []);

    const toggleLiveSync = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL || ''}/api/sync/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !syncEnabled })
            });
            const data = await res.json();
            if (data.success) {
                setSyncEnabled(data.enabled);
            }
        } catch (e) {
            alert('Failed to toggle live sync');
        }
    };

    const forceSyncAll = async () => {
        if (!confirm('This will push ALL local workshops, events, settings, and registrations to the Live Website. Continue?')) return;

        setIsSyncing(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_SERVER_URL || ''}/api/sync/push-all`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                alert('🚀 Full data recovery sync complete!');
            } else {
                alert('❌ Sync failed. Check if server is running and SYNC_TARGET_URL is correct.');
            }
        } catch (e) {
            alert('❌ Network error during sync.');
        } finally {
            setIsSyncing(false);
        }
    };

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

        socket.on('workshops_update', (data) => {
            setWorkshops(data);
        });

        // Initial fetch for workshops
        fetch(`${import.meta.env.VITE_SERVER_URL || ''}/api/workshops`)
            .then(res => res.json())
            .then(data => setWorkshops(data))
            .catch(console.error);

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

            {/* Left Sidebar (Admin Only) */}
            {(user.role === 'admin' || user.role === 'superadmin') && (
                <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                    <div style={{ padding: '0 0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            <Logo size={28} />
                            <h2 className="app-title cine-text" style={{ fontSize: '1rem', margin: 0, letterSpacing: '2px' }}>
                                HYPER <span>{activeApp === 'flow' ? 'FLOW' : 'GO'}</span>
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
                                <>
                                    {/* Student Navigation - Common tools for both FLOW and GO */}
                                    {user.role === 'student' && (
                                        <>
                                            <div style={{ padding: '0 0.75rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                                                {activeApp === 'flow' ? 'Live Classroom' : 'Workshop Hub'}
                                            </div>
                                            <button
                                                onClick={() => setShowTicketManager(true)}
                                                className="btn btn-ghost"
                                                style={{
                                                    justifyContent: 'flex-start',
                                                    border: 'none',
                                                    background: activeApp === 'go' ? 'rgba(255, 123, 0, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                                    color: activeApp === 'go' ? '#ff7b00' : '#f59e0b',
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
                                                    background: showTimeline ? (activeApp === 'go' ? 'rgba(255, 123, 0, 0.1)' : 'rgba(56, 189, 248, 0.1)') : 'transparent',
                                                    width: '100%',
                                                    marginBottom: '0.5rem'
                                                }}
                                            >
                                                <span style={{ minWidth: '24px' }}>🕒</span> {activeApp === 'flow' ? 'Session History' : 'Workshop Logs'}
                                            </button>
                                        </>
                                    )}

                                    {/* Admin Navigation - Case Specific */}
                                    {(user.role === 'admin' || user.role === 'superadmin') && (
                                        <>
                                            {activeApp === 'flow' ? (
                                                <>
                                                    <div style={{ padding: '0 0.75rem 0.5rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '10px' }}>
                                                        MANAGEMENT
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
                                            ) : (
                                                <>
                                                    <div style={{ padding: '0 0.75rem 0.5rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '10px' }}>
                                                        WORKSHOP MGMT
                                                    </div>
                                                    <button
                                                        onClick={() => setAdminActiveTab('go-engine')}
                                                        className="btn btn-ghost"
                                                        style={{
                                                            justifyContent: 'flex-start',
                                                            border: 'none',
                                                            color: adminActiveTab === 'go-engine' ? 'var(--primary-orange, #ff7b00)' : 'var(--text-secondary)',
                                                            background: adminActiveTab === 'go-engine' ? 'rgba(255, 123, 0, 0.1)' : 'transparent',
                                                            width: '100%',
                                                            marginBottom: '0.25rem'
                                                        }}
                                                    >
                                                        <span style={{ minWidth: '24px' }}>🚀</span> Workshop Engine
                                                    </button>
                                                    <p style={{ padding: '0 0.75rem', fontSize: '0.74rem', opacity: 0.5, lineHeight: 1.4, marginTop: '10px' }}>
                                                        Switch to HYPERFLOW to manage live sessions.
                                                    </p>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
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
                        {(user.role === 'admin' || user.role === 'superadmin') && (
                            <>
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(56, 189, 248, 0.05)',
                                    borderRadius: '12px',
                                    marginBottom: '0.5rem',
                                    border: '1px solid rgba(56, 189, 248, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>LIVE CLOUD SYNC</div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>Broadcasting to Web</div>
                                    </div>
                                    <div
                                        onClick={toggleLiveSync}
                                        style={{
                                            width: '40px',
                                            height: '20px',
                                            background: syncEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            background: '#fff',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '2px',
                                            left: syncEnabled ? '22px' : '2px',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }} />
                                    </div>
                                </div>

                                {syncEnabled && (
                                    <button
                                        onClick={forceSyncAll}
                                        disabled={isSyncing}
                                        className="btn btn-ghost"
                                        style={{
                                            width: '100%',
                                            marginBottom: '1rem',
                                            fontSize: '0.7rem',
                                            background: 'rgba(56, 189, 248, 0.1)',
                                            color: 'var(--primary)',
                                            border: '1px solid rgba(56, 189, 248, 0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <span>{isSyncing ? '⌛' : '🚀'}</span> {isSyncing ? 'Recovering Web...' : 'Recover Web Data'}
                                    </button>
                                )}
                            </>
                        )}

                        <div className="user-badge" style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', border: 'none', padding: '0.75rem' }}>
                            <span>{user.role === 'admin' ? '🛡️' : user.role === 'superadmin' ? '⚡' : '👤'}</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.displayName || user.username}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                                    <div style={{
                                        width: '7px',
                                        height: '7px',
                                        borderRadius: '50%',
                                        background: storageActive ? '#00e676' : '#ff5252',
                                        boxShadow: storageActive ? '0 0 10px #00e676' : 'none'
                                    }} />
                                    <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {storageActive ? 'Cloud Live' : 'Local Only'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-ghost logout-btn"
                            style={{
                                justifyContent: 'flex-start',
                                border: 'none',
                                color: '#ff5252',
                                width: '100%',
                                background: 'rgba(255, 82, 82, 0.05)',
                                padding: '12px 15px',
                                borderRadius: '12px',
                                fontWeight: 700
                            }}
                        >
                            <span style={{ minWidth: '24px', marginRight: '0.5rem' }}>🚪</span> Logout
                        </button>
                    </div>
                </aside>
            )}

            <div className="app-main">
                {/* Header */}
                <header className="app-header" style={{ padding: '0.75rem 1.25rem' }}>
                    {/* Student Logo (shown when sidebar is hidden) */}
                    {user.role === 'student' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
                            <Logo size={24} />
                            <h2 className="app-title cine-text" style={{ fontSize: '0.9rem', margin: 0, letterSpacing: '1px' }}>
                                HYPER <span>{activeApp === 'flow' ? 'FLOW' : 'GO'}</span>
                            </h2>
                        </div>
                    )}
                    {/* Hamburger removed for mobile as we have bottom nav */}
                    {/* Unified Toggle Bar */}
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                        <div className="unified-toggle-bar" style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '3px',
                            borderRadius: '30px',
                            display: 'flex',
                            gap: '3px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginLeft: isMobile ? '5px' : '20px'
                        }}>
                            <button
                                onClick={() => {
                                    setActiveApp('flow');
                                    setAdminActiveTab('events');
                                }}
                                style={{
                                    padding: isMobile ? '6px 12px' : '6px 20px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    background: 'transparent',
                                    color: activeApp === 'flow' ? 'white' : 'rgba(255,255,255,0.4)',
                                    position: 'relative',
                                    zIndex: 2,
                                    minWidth: isMobile ? '80px' : 'auto'
                                }}
                            >
                                {activeApp === 'flow' && (
                                    <motion.div
                                        layoutId="toggle-bg"
                                        className="toggle-bg-pill"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'var(--primary-blue, #0066ff)',
                                            borderRadius: '25px',
                                            zIndex: -1,
                                            boxShadow: '0 4px 15px rgba(0,102,255,0.3)'
                                        }}
                                    />
                                )}
                                HYPERFLOW
                            </button>
                            <button
                                onClick={() => {
                                    setActiveApp('go');
                                    setAdminActiveTab('go-engine');
                                }}
                                style={{
                                    padding: isMobile ? '6px 12px' : '6px 20px',
                                    borderRadius: '25px',
                                    border: 'none',
                                    fontSize: isMobile ? '0.65rem' : '0.75rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    background: 'transparent',
                                    color: activeApp === 'go' ? 'white' : 'rgba(255,255,255,0.4)',
                                    position: 'relative',
                                    zIndex: 2,
                                    minWidth: isMobile ? '80px' : 'auto'
                                }}
                            >
                                {activeApp === 'go' && (
                                    <motion.div
                                        layoutId="toggle-bg"
                                        className="toggle-bg-pill"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'var(--primary-orange, #ff7b00)',
                                            borderRadius: '25px',
                                            zIndex: -1,
                                            boxShadow: '0 4px 15px rgba(255,123,0,0.3)'
                                        }}
                                    />
                                )}
                                HYPERGO
                            </button>
                        </div>
                    )}

                    {/* Active Event Indicator */}
                    <div style={{ marginLeft: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        {(currentEvent || user.eventName) && (
                            <div className="event-name-display" style={{
                                background: 'rgba(56, 189, 248, 0.05)',
                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                padding: isMobile ? '0.3rem 0.6rem' : '0.4rem 1rem',
                                borderRadius: '30px',
                                fontSize: isMobile ? '0.6rem' : '0.75rem',
                                color: 'var(--primary)',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                boxShadow: 'inset 0 0 5px rgba(56, 189, 248, 0.1)',
                                textTransform: 'uppercase',
                                letterSpacing: isMobile ? '1px' : '2px',
                                borderLeft: `3px solid ${activeApp === 'flow' ? 'var(--primary-blue, #0066ff)' : 'var(--primary-orange, #ff7b00)'}`,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: isMobile ? '120px' : 'auto'
                            }}>
                                {!isMobile && <span style={{ opacity: 0.6 }}>{activeApp === 'flow' ? 'FLOW' : 'GO'} SESSION:</span>}
                                <span>{activeApp === 'flow' ? (currentEvent?.name || user.eventName) : (currentEvent?.name || user.workshopName || user.eventName || 'WORKSHOP')}</span>
                            </div>
                        )}
                        {showSuperAdmin && (
                            <div style={{ color: 'var(--danger)', fontSize: '0.8rem', fontWeight: 800 }}>⚡ SYSTEM CONFIG</div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {user.role === 'student' && (
                            <button
                                onClick={logout}
                                className="btn btn-ghost"
                                style={{ color: '#ff5252', fontSize: '0.85rem', fontWeight: 700, padding: '0.4rem 0.8rem' }}
                            >
                                Logout
                            </button>
                        )}

                        {user.role === 'superadmin' && (
                            <button
                                onClick={() => {
                                    setShowSuperAdmin(!showSuperAdmin);
                                    if (isMobile) setActiveMobileTab('classroom');
                                }}
                                className={`btn ${showSuperAdmin ? 'btn-primary' : 'btn-ghost'}`}
                                style={{
                                    padding: isMobile ? '0.3rem 0.6rem' : '0.4rem 0.8rem',
                                    fontSize: isMobile ? '0.65rem' : '0.85rem'
                                }}
                            >
                                {showSuperAdmin ? 'Exit' : 'Admin'}
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
                <div className="app-content" ref={scrollContainerRef}>
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
                            style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                        >
                            {adminActiveTab === 'settings' || adminActiveTab === 'about' ? (
                                <AdminDashboard
                                    activeTab={adminActiveTab}
                                    onClose={() => setAdminActiveTab(activeApp === 'flow' ? 'events' : 'go-engine')}
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
                                    messages={messages}
                                    setMessages={setMessages}
                                />
                            ) : activeApp === 'flow' ? (
                                ((isMobile && activeMobileTab === 'events' && !currentEvent) || !isMobile || (isMobile && activeMobileTab !== 'classroom')) ? (
                                    <AdminDashboard
                                        activeTab={isMobile ? activeMobileTab : adminActiveTab}
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
                                        messages={messages}
                                        setMessages={setMessages}
                                    />
                                ) : null
                            ) : (
                                <GoDashboard />
                            )}

                            {activeApp === 'flow' && isMobile && activeMobileTab === 'classroom' && currentEvent && (
                                <LeftPanel viewingSnapshot={viewingSnapshot} setViewingSnapshot={setViewingSnapshot} />
                            )}
                        </motion.div>
                    ) : (
                        // Student View: Split Layout with Lesson + Chat
                        <div className={`main-layout student-layout ${isMobile ? 'mobile-mode' : ''}`}>
                            {/* Left: Lesson Content */}
                            {(!isMobile || activeMobileTab === 'classroom') && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="glass-panel lesson-panel"
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                                >
                                    {activeApp === 'go' ? (
                                        <GoStudentWorkshop isEmbedded={true} />
                                    ) : (
                                        <LeftPanel viewingSnapshot={viewingSnapshot} setViewingSnapshot={setViewingSnapshot} />
                                    )}
                                </motion.div>
                            )}

                            {/* Right: Chat Panel */}
                            {(!isMobile || activeMobileTab === 'chat') && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className={`glass-panel chat-panel ${isMobile ? 'active' : ''}`}
                                    style={{ display: 'flex', flexDirection: 'column' }}
                                >
                                    <RightPanel messages={messages} onMessagesUpdate={setMessages} />
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Navigation Bar */}
                {isMobile && (
                    <div className="mobile-nav-bar">
                        <button
                            className={`mobile-nav-item ${activeMobileTab === 'classroom' ? 'active' : ''}`}
                            onClick={() => setActiveMobileTab('classroom')}
                        >
                            <span className="icon">🖥️</span>
                            <span>Class</span>
                        </button>

                        {(user.role === 'admin' || user.role === 'superadmin') && (
                            <button
                                className={`mobile-nav-item ${activeMobileTab === 'events' || adminActiveTab === 'go-engine' ? 'active' : ''}`}
                                onClick={() => {
                                    if (activeApp === 'flow') {
                                        setActiveMobileTab('events');
                                        setAdminActiveTab('events');
                                    } else {
                                        setAdminActiveTab('go-engine');
                                    }
                                }}
                            >
                                <span className="icon">{activeApp === 'flow' ? '📅' : '🚀'}</span>
                                <span>{activeApp === 'flow' ? 'Events' : 'Engine'}</span>
                            </button>
                        )}

                        <button
                            className={`mobile-nav-item ${activeMobileTab === 'chat' ? 'active' : ''}`}
                            onClick={() => setActiveMobileTab('chat')}
                        >
                            <div style={{ position: 'relative' }}>
                                <span className="icon">💬</span>
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: -5, right: -10,
                                        background: 'var(--danger)', color: 'white',
                                        borderRadius: '50%', width: 16, height: 16,
                                        fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <span>Chat</span>
                        </button>

                        {(user.role === 'admin' || user.role === 'superadmin') && currentEvent && (
                            <button
                                className={`mobile-nav-item ${['students', 'tickets', 'chat-history', 'attendance'].includes(activeMobileTab) ? 'active' : ''}`}
                                onClick={() => setShowMobileModules(true)}
                            >
                                <span className="icon">📂</span>
                                <span>Modules</span>
                            </button>
                        )}

                        <button
                            className={`mobile-nav-item ${activeMobileTab === 'settings' ? 'active' : ''}`}
                            onClick={() => {
                                if (user.role === 'student') {
                                    setShowSettings(true);
                                } else {
                                    setActiveMobileTab('settings');
                                }
                                setIsSidebarOpen(false);
                            }}
                        >
                            <span className="icon">⚙️</span>
                            <span>Setup</span>
                        </button>

                        <button
                            className="mobile-nav-item"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to logout?')) {
                                    logout();
                                    navigate(activeApp === 'flow' ? '/login' : '/go/login');
                                }
                            }}
                            style={{ color: '#ff4d4d' }}
                        >
                            <span className="icon">🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                )}

                {/* Mobile Admin Module Selector Overlay */}
                <AnimatePresence>
                    {isMobile && showMobileModules && (
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 100 }}
                            className="mobile-module-overlay"
                            style={{
                                position: 'fixed', bottom: 0, left: 0, right: 0, top: 0,
                                background: 'rgba(12, 17, 29, 0.98)', zIndex: 3000,
                                padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Session Modules</h2>
                                <button className="btn btn-ghost" onClick={() => setShowMobileModules(false)}>✕</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    { id: 'students', icon: '👥', label: 'Students' },
                                    { id: 'tickets', icon: '🎫', label: 'Tickets' },
                                    { id: 'chat-history', icon: '💬', label: 'History' },
                                    { id: 'attendance', icon: '📊', label: 'Attendance' },
                                    { id: 'about', icon: 'ℹ️', label: 'About' }
                                ].map(mod => (
                                    <button
                                        key={mod.id}
                                        onClick={() => {
                                            setActiveMobileTab(mod.id);
                                            setShowMobileModules(false);
                                        }}
                                        className="btn btn-ghost"
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            flexDirection: 'column', height: '100px',
                                            border: activeMobileTab === mod.id ? '1px solid var(--primary)' : '1px solid transparent'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{mod.icon}</span>
                                        <span style={{ fontSize: '0.8rem' }}>{mod.label}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        handleExitEvent();
                                        setShowMobileModules(false);
                                    }}
                                    className="btn btn-ghost"
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', height: '100px', gridColumn: 'span 2' }}
                                >
                                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🚪</span> Leave Session
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                {/* Floating Chat Button (Admin Only - Students have persistent panel) - Hidden on Mobile */}
                {(user.role === 'admin' || user.role === 'superadmin') && !isMobile && (
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

                {/* Chat Overlay / Popup (Admin Only) - Hidden on mobile in favor of bottom nav */}
                {(user.role === 'admin' || user.role === 'superadmin') && !isMobile && (
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
                `}</style>
            </div>
        </div >
    );
}

export default Layout;

