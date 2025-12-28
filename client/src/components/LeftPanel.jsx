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
                    <h3 style={{ margin: '0 0 1rem 0' }}>Admin Console</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                            className={`btn ${editorType === 'text' ? 'btn-primary' : ''}`}
                            style={{ background: editorType === 'text' ? '' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => setEditorType('text')}
                        >
                            Rich Text / HTML
                        </button>
                        <button
                            className={`btn ${editorType === 'code' ? 'btn-primary' : ''}`}
                            style={{ background: editorType === 'code' ? '' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => setEditorType('code')}
                        >
                            Code Editor
                        </button>

                        {editorType === 'code' && (
                            <>
                                <select
                                    value={editorLanguage}
                                    onChange={(e) => setEditorLanguage(e.target.value)}
                                    className="btn"
                                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', color: 'white' }}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                    <option value="python">Python</option>
                                    <option value="json">JSON</option>
                                </select>

                                <button
                                    onClick={() => {
                                        const next = !isLiveMode;
                                        setIsLiveMode(next);
                                        if (next) handleBroadcast(editorContent);
                                    }}
                                    className="btn"
                                    style={{
                                        background: isLiveMode ? 'var(--danger)' : 'rgba(255,255,255,0.1)',
                                        border: isLiveMode ? 'none' : '1px solid var(--glass-border)',
                                        gap: '0.4rem',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {isLiveMode ? '🔴 STOP LIVE' : '📡 GO LIVE'}
                                </button>
                            </>
                        )}
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
                        <input
                            type="text"
                            className="input-field"
                            value={editorInstructions}
                            onChange={(e) => setEditorInstructions(e.target.value)}
                            placeholder="Optional Instructions (e.g. 'Run this in terminal')"
                            style={{ width: '100%', marginTop: '0.5rem', boxSizing: 'border-box' }}
                        />
                    )}

                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                                    className="btn btn-secondary"
                                    disabled={uploading}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}
                                >
                                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>{uploading ? 'sync' : 'upload'}</span>
                                    {uploading ? 'Uploading...' : 'Upload'}
                                    {uploading && (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            style={{ marginLeft: '4px', display: 'inline-block' }}
                                        >
                                            ⏳
                                        </motion.div>
                                    )}
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
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {files.length > 0 && (
                    <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shared Resources</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {files.map((file, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--glass-border)' }}>
                                    <a
                                        href={file.url || `/uploads/${file.filename}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download={!file.url}
                                        style={{ textDecoration: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 500 }}
                                    >
                                        📄 {file.filename}
                                    </a>
                                    {isAdmin && (
                                        <button
                                            onClick={async () => {
                                                if (confirm('Delete this file?')) {
                                                    await fetch(`${API_BASE_URL}/api/files/${file.filename}`, { method: 'DELETE' });
                                                }
                                            }}
                                            className="btn"
                                            style={{
                                                background: 'var(--danger)',
                                                padding: '0.4rem 0.6rem',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
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
