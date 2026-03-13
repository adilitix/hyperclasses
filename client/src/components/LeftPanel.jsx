import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import Editor from "@monaco-editor/react";
import CopyButton from './CopyButton';
import { motion } from 'framer-motion'; // Assuming framer-motion is installed for the animation

function LeftPanel({ viewingSnapshot, setViewingSnapshot }) {
    const socket = useSocket();
    const { user } = useAuth();

    const [content, setContent] = useState({ type: 'text', content: '', language: 'html' });
    const [files, setFiles] = useState([]);

    // Admin State
    const [editorContent, setEditorContent] = useState('');
    const [editorInstructions, setEditorInstructions] = useState('');
    const [editorType, setEditorType] = useState('text'); // text (html preview), code (editor)
    const liveTimeoutRef = React.useRef(null);
    const [editorLanguage, setEditorLanguage] = useState('javascript');
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(''); // New state for status feedback

    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState('Yes, No');
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [isLiveMode, setIsLiveMode] = useState(false);

    // Tools State (Timer, Snippets, Roster)
    const [activeTool, setActiveTool] = useState(null); // 'snippets', 'timer', 'roster'
    const [timerMinutes, setTimerMinutes] = useState(5);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Ticket State (Student)
    const [showTicketModal, setShowTicketModal] = useState(false);

    // Snippet State
    const [snippets, setSnippets] = useState(() => {
        const saved = localStorage.getItem('codeSnippets');
        return saved ? JSON.parse(saved) : [];
    });
    const [snippetName, setSnippetName] = useState('');

    // Notification State
    const [notificationSettings, setNotificationSettings] = useState(null);

    // Fetch Notification Settings
    useEffect(() => {
        const fetchSettings = () => {
            fetch(`${API_BASE_URL}/api/settings`)
                .then(res => res.json())
                .then(data => {
                    if (data.permanentNotification) {
                        setNotificationSettings(data.permanentNotification);
                    }
                })
                .catch(console.error);
        };
        fetchSettings();

        // Listen for updates
        if (socket) {
            socket.on('settings_update', (newSettings) => {
                if (newSettings.permanentNotification) {
                    setNotificationSettings(newSettings.permanentNotification);
                }
            });
            return () => socket.off('settings_update');
        }
    }, [socket]);

    const fileInputRef = React.useRef(null); // Ref for the hidden file input

    useEffect(() => {
        if (!socket) return;

        socket.on('content_update', (newContent) => {
            setContent(newContent);
        });

        socket.on('file_list_update', (fileList) => {
            setFiles(fileList);
        });

        socket.on('roster_update', (users) => {
            setOnlineUsers(users);
        });

        // Handle Forced Disconnection (e.g. event deleted)
        socket.on('force_disconnect', (reason) => {
            alert(reason || 'Session ended');
            window.location.href = '/';
            localStorage.removeItem('user'); // Manual Force Logout
        });

        // Let backend know who we are for roster
        if (user) {
            if (user.role === 'student' && user.eventId) {
                socket.emit('join_event', {
                    username: user.username,
                    role: user.role,
                    eventId: user.eventId
                });
            }
        }

        return () => {
            socket.off('content_update');
            socket.off('file_list_update');
            socket.off('roster_update');
            socket.off('force_disconnect');
        };
    }, [socket, user]);

    // Admin Actions
    const handleBroadcast = (customContent = null) => {
        // If customContent is an event object (from onClick), ignore it and use editorContent
        const isEvent = customContent && customContent.nativeEvent;
        const finalContent = (customContent !== null && !isEvent) ? customContent : editorContent;

        const payload = {
            type: editorType,
            content: finalContent,
            instructions: editorInstructions,
            language: editorLanguage
        };
        socket.emit('broadcast_content', payload);
        setContent(payload);
    };

    const handleEditorChange = (value) => {
        const newVal = value || '';
        setEditorContent(newVal);
        if (isLiveMode) {
            // Use a small timeout to debounce live updates
            if (liveTimeoutRef.current) clearTimeout(liveTimeoutRef.current);
            liveTimeoutRef.current = setTimeout(() => {
                handleBroadcast(newVal);
            }, 100);
        }
    };

    const handleSaveSnapshot = () => {
        const name = prompt('Enter a name for this snapshot:', 'Lesson Checkpoint');
        if (name) {
            socket.emit('save_snapshot', { name });
            alert('History snapshot saved!');
        }
    };

    const handleClear = () => {
        setEditorContent('');
        setEditorInstructions('');
        socket.emit('broadcast_content', { type: 'text', content: '', instructions: '', language: 'html' });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Use eventId from user (student) or props (admin)
        const eventId = user.role === 'student' ? user.eventId : (socket?.data?.eventId || window.currentEventId);

        setUploading(true);
        setUploadStatus('Uploading to Cloud...');
        const formData = new FormData();
        formData.append('file', file);
        if (eventId) formData.append('eventId', eventId);

        try {
            const res = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setUploadStatus('File Shared! ✅');
                setTimeout(() => setUploadStatus(''), 3000);
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error(err);
            setUploadStatus('Upload Error ❌');
            alert(err.message || 'Upload failed');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const triggerFileDownload = async (fileUrl, filename) => {
        try {
            // If it's a relative URL, prepend the API_BASE_URL
            const url = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;

            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open in new tab
            const url = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;
            window.open(url, '_blank');
        }
    };

    // Derived content to show (Live vs Snapshot)
    const displayedContent = viewingSnapshot || content;

    // Simplified admin check
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
            {/* Admin Toolbar (Only show if LIVE view) */}
            {isAdmin && !viewingSnapshot && (
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--glass-border)',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <h3 className="admin-console-header mobile-hide" style={{ margin: '0 0 1rem 0' }}>Admin Console</h3>
                    <div className="segmented-control" style={{ display: 'flex', gap: '2px', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                        <button
                            className={`tab-btn ${editorType === 'text' ? 'active' : ''}`}
                            onClick={() => setEditorType('text')}
                            style={{ flex: 1, padding: '0.6rem', border: 'none', background: editorType === 'text' ? 'var(--primary)' : 'transparent', color: editorType === 'text' ? '#000' : 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                            <span>📝</span> <span className="btn-text">Rich Text</span>
                        </button>
                        <button
                            className={`tab-btn ${editorType === 'code' ? 'active' : ''}`}
                            onClick={() => setEditorType('code')}
                            style={{ flex: 1, padding: '0.6rem', border: 'none', background: editorType === 'code' ? 'var(--primary)' : 'transparent', color: editorType === 'code' ? '#000' : 'var(--text-secondary)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                            <span>💻</span> <span className="btn-text">Code Editor</span>
                        </button>
                    </div>

                    {editorType === 'code' ? (
                        <div style={{ border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden' }}>
                            <Editor
                                height="300px"
                                defaultLanguage="javascript"
                                language={editorLanguage}
                                value={editorContent}
                                theme="vs-dark"
                                onChange={handleEditorChange}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true
                                }}
                            />
                        </div>
                    ) : (
                        <textarea
                            className="input-field"
                            value={editorContent}
                            onChange={(e) => {
                                const val = e.target.value;
                                setEditorContent(val);
                                if (isLiveMode) {
                                    if (liveTimeoutRef.current) clearTimeout(liveTimeoutRef.current);
                                    liveTimeoutRef.current = setTimeout(() => {
                                        handleBroadcast(val);
                                    }, 100);
                                }
                            }}
                            style={{ width: '100%', height: '300px', resize: 'vertical', fontFamily: 'monospace' }}
                            placeholder="<h1>Enter HTML Content...</h1>"
                        />
                    )}

                    {editorType === 'code' && (
                        <div className="code-options-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', gap: '0.75rem' }}>
                            <button
                                onClick={() => {
                                    const next = !isLiveMode;
                                    setIsLiveMode(next);
                                    if (next) handleBroadcast(editorContent);
                                }}
                                className="btn live-btn"
                                style={{
                                    background: isLiveMode ? 'var(--danger)' : 'rgba(255,255,255,0.1)',
                                    border: isLiveMode ? 'none' : '1px solid var(--glass-border)',
                                    gap: '0.6rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 800,
                                    padding: '0.6rem 1rem',
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '10px'
                                }}
                            >
                                {isLiveMode ? '🔴 STOP LIVE' : '📡 GO LIVE'}
                            </button>

                            <select
                                value={editorLanguage}
                                onChange={(e) => setEditorLanguage(e.target.value)}
                                className="input-field language-select"
                                style={{
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    width: '120px',
                                    padding: '0.5rem',
                                    height: '42px',
                                    fontSize: '0.8rem',
                                    borderRadius: '10px'
                                }}
                            >
                                <option value="javascript">JS</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="python">PY</option>
                                <option value="json">JSON</option>
                            </select>
                        </div>
                    )}

                    {editorType === 'code' && (
                        <input
                            type="text"
                            className="input-field"
                            value={editorInstructions}
                            onChange={(e) => setEditorInstructions(e.target.value)}
                            placeholder="Optional Instructions (e.g. 'Run this in terminal')"
                            style={{ width: '100%', marginTop: '0.5rem', boxSizing: 'border-box' }}
                        />
                    )}

                    <div className="toolbar-group" style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={handleBroadcast} className="btn btn-primary" style={{ padding: '0.5rem 0.8rem' }} title="Broadcast Updates">
                            <span className="btn-icon">📡</span>
                            <span className="btn-text">Broadcast</span>
                        </button>
                        <button onClick={handleSaveSnapshot} className="btn" style={{ background: 'var(--success)', color: 'white', padding: '0.5rem 0.8rem' }} title="Save Snapshot">
                            <span className="btn-icon">💾</span>
                            <span className="btn-text">Snapshot</span>
                        </button>
                        <button
                            onClick={() => {
                                setEditorContent(content.content);
                                setEditorInstructions(content.instructions || '');
                                setEditorType(content.type);
                            }}
                            className="btn"
                            style={{ background: 'rgba(112, 0, 255, 0.5)', border: '1px solid var(--accent)', padding: '0.5rem 0.8rem' }}
                            title="Edit Current"
                        >
                            <span className="btn-icon">✏️</span>
                            <span className="btn-text">Edit</span>
                        </button>
                        <button onClick={handleClear} className="btn" style={{ background: 'var(--danger)', padding: '0.5rem 0.8rem' }} title="Clear Screen">
                            <span className="btn-icon">🗑️</span>
                            <span className="btn-text">Clear</span>
                        </button>

                        {/* Tools Dropdown / Toggle */}
                        <div style={{ display: 'flex', gap: '0.4rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '0.4rem' }}>
                            <button onClick={() => setActiveTool(activeTool === 'snippets' ? null : 'snippets')} className={`btn ${activeTool === 'snippets' ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 0.6rem' }} title="Snippet Library">📚</button>
                            <button onClick={() => setActiveTool(activeTool === 'timer' ? null : 'timer')} className={`btn ${activeTool === 'timer' ? 'btn-primary' : ''}`} style={{ padding: '0.5rem 0.6rem' }} title="Workshop Timer">⏱️</button>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="btn btn-ghost"
                                    disabled={uploading}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        padding: '0.5rem 0.8rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--glass-border)'
                                    }}
                                >
                                    <span style={{ fontSize: '1.1rem' }}>{uploading ? '⏳' : '📁'}</span>
                                    <span className="btn-text">{uploading ? '...' : 'Upload'}</span>
                                </button>
                                <input type="file" hidden onChange={handleFileUpload} disabled={uploading} ref={fileInputRef} />
                                {uploadStatus && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{ fontSize: '0.85rem', color: uploadStatus.includes('❌') ? '#ff4d4d' : 'var(--primary)', fontWeight: 500 }}
                                    >
                                        {uploadStatus}
                                    </motion.span>
                                )}
                            </div>

                            <button
                                onClick={() => setShowPollCreator(!showPollCreator)}
                                className="btn"
                                style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.5rem 0.8rem' }}
                                title="Create Poll"
                            >
                                <span className="btn-icon">📊</span>
                                <span className="btn-text">Poll</span>
                            </button>
                        </div>
                    </div>

                    {/* Tool Panels */}
                    {activeTool === 'snippets' && (
                        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <h4 style={{ marginTop: 0 }}>Snippet Library</h4>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <input
                                    className="input-field"
                                    placeholder="Snippet Name"
                                    value={snippetName}
                                    onChange={(e) => setSnippetName(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary" onClick={() => {
                                    if (!snippetName) return;
                                    const newSnip = { name: snippetName, content: editorContent, type: editorType, instructions: editorInstructions, language: editorLanguage };
                                    const updated = [...snippets, newSnip];
                                    setSnippets(updated);
                                    localStorage.setItem('codeSnippets', JSON.stringify(updated));
                                    setSnippetName('');
                                }}>Save Current</button>
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {snippets.length === 0 && <div style={{ opacity: 0.5, fontStyle: 'italic' }}>No saved snippets</div>}
                                {snippets.map((snip, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                                        <span>{snip.name} <small style={{ opacity: 0.5 }}>({snip.type})</small></span>
                                        <div>
                                            <button className="btn" style={{ marginRight: '0.5rem', fontSize: '0.8rem' }} onClick={() => {
                                                setEditorContent(snip.content);
                                                setEditorType(snip.type);
                                                setEditorInstructions(snip.instructions);
                                                setEditorLanguage(snip.language || 'javascript');
                                                setActiveTool(null);
                                            }}>Load</button>
                                            <button className="btn" style={{ background: 'var(--danger)', fontSize: '0.8rem' }} onClick={() => {
                                                const updated = snippets.filter((_, idx) => idx !== i);
                                                setSnippets(updated);
                                                localStorage.setItem('codeSnippets', JSON.stringify(updated));
                                            }}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTool === 'timer' && (
                        <div className="animate-slide-up" style={{ marginTop: '1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Workshop Timer</h4>
                                <button onClick={() => setActiveTool(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={timerMinutes}
                                    onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                                    style={{ width: '80px', padding: '0.4rem' }}
                                    min="1"
                                />
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>minutes</span>
                                <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} onClick={() => {
                                    socket.emit('start_timer', timerMinutes);
                                    setActiveTool(null);
                                }}>Start Countdown</button>
                                <button className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', color: 'var(--danger)' }} onClick={() => socket.emit('stop_timer')}>Stop</button>
                            </div>
                        </div>
                    )}

                    {showPollCreator && (
                        <div className="animate-slide-up" style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary)' }}>Create Live Poll</h4>
                                <button onClick={() => setShowPollCreator(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <input
                                    className="input-field"
                                    placeholder="Question (e.g. Do you follow along?)"
                                    value={pollQuestion}
                                    onChange={(e) => setPollQuestion(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                                />
                                <input
                                    className="input-field"
                                    placeholder="Options (comma separated, e.g. Yes, No, Need Help)"
                                    value={pollOptions}
                                    onChange={(e) => setPollOptions(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        if (pollQuestion && pollOptions) {
                                            socket.emit('start_poll', {
                                                question: pollQuestion,
                                                options: pollOptions.split(',').map(s => s.trim()).filter(s => s)
                                            });
                                            setShowPollCreator(false);
                                            setPollQuestion('');
                                            setPollOptions('Yes, No');
                                        }
                                    }}
                                >
                                    🚀 Launch Live Poll
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content View Area */}
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>

                {/* Permanent Notification Banner */}
                {notificationSettings?.enabled && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '1rem',
                            background: 'rgba(var(--primary-rgb, 0, 240, 255), 0.1)',
                            border: '1px solid var(--primary)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📢</span>
                            <div>
                                <strong style={{ color: 'var(--primary)', display: 'block' }}>Announcement</strong>
                                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Important update available</span>
                            </div>
                        </div>
                        <a
                            href={notificationSettings.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ textDecoration: 'none', fontWeight: 800 }}
                        >
                            {notificationSettings.buttonName} →
                        </a>
                    </motion.div>
                )}

                {files.length > 0 && (
                    <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shared Resources</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {files.map((file, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.05)', padding: '0.6rem 0.8rem', borderRadius: '12px', border: '1px solid var(--glass-border)', transition: 'all 0.2s' }}>
                                    <div
                                        onClick={() => triggerFileDownload(file.url || `/uploads/${file.filename}`, file.filename)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}
                                        title="Click to Download"
                                    >
                                        <span style={{ fontSize: '1.2rem' }}>📄</span>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ textDecoration: 'none', borderBottom: '1px dashed transparent' }}>{file.filename}</span>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto', borderLeft: '1px solid var(--glass-border)', paddingLeft: '0.6rem' }}>
                                        <button
                                            onClick={() => triggerFileDownload(file.url || `/uploads/${file.filename}`, file.filename)}
                                            className="btn btn-ghost"
                                            style={{
                                                padding: '0.4rem',
                                                fontSize: '1rem',
                                                background: 'rgba(var(--primary-rgb), 0.1)',
                                                border: '1px solid rgba(var(--primary-rgb), 0.2)',
                                                borderRadius: '8px'
                                            }}
                                            title="Download File"
                                        >
                                            📥
                                        </button>

                                        {isAdmin && (
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Delete this file?')) {
                                                        await fetch(`${API_BASE_URL}/api/files/${file.filename}`, { method: 'DELETE' });
                                                    }
                                                }}
                                                className="btn"
                                                style={{
                                                    background: 'rgba(255, 77, 77, 0.1)',
                                                    border: '1px solid rgba(255, 77, 77, 0.2)',
                                                    color: '#ff4d4d',
                                                    padding: '0.4rem',
                                                    fontSize: '0.8rem',
                                                    borderRadius: '8px'
                                                }}
                                                title="Delete File"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {viewingSnapshot && (
                    <div style={{
                        background: 'var(--warning)',
                        color: '#1a1a1a',
                        padding: '0.5rem',
                        marginBottom: '1rem',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        ⚠️ You are viewing a past snapshot ({new Date(viewingSnapshot.timestamp).toLocaleTimeString()})
                        <button
                            onClick={() => setViewingSnapshot(null)}
                            style={{
                                marginLeft: '1rem',
                                padding: '0.2rem 0.5rem',
                                background: 'rgba(0,0,0,0.2)',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Return to Live
                        </button>
                    </div>
                )}

                <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                    {viewingSnapshot ? `History: ${new Date(viewingSnapshot.timestamp).toLocaleTimeString()}` : 'Live Lesson'}
                </h4>
                {displayedContent.type === 'text' ? (
                    // Dangerously set HTML for rich text from admin
                    <div dangerouslySetInnerHTML={{ __html: displayedContent.content }} style={{ lineHeight: '1.6' }} />
                ) : (
                    <div style={{ position: 'relative' }}>
                        {displayedContent.instructions && (
                            <div style={{
                                background: 'rgba(0, 240, 255, 0.1)',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                marginBottom: '0.5rem',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                ℹ️ {displayedContent.instructions}
                            </div>
                        )}
                        <div style={{
                            position: 'relative',
                            height: '500px',
                            minHeight: '300px',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginTop: '1rem'
                        }}>
                            {/* Copy Button */}
                            <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', zIndex: 10 }}>
                                <CopyButton text={displayedContent.content} />
                            </div>
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                language={displayedContent.language || 'javascript'}
                                value={displayedContent.content}
                                theme="vs-dark"
                                options={{
                                    readOnly: true,
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    domReadOnly: true
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeftPanel;
