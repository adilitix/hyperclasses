import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import Editor from "@monaco-editor/react";

function LeftPanel() {
    const socket = useSocket();
    const { user } = useAuth();

    const [content, setContent] = useState({ type: 'text', content: '', language: 'html' });
    const [files, setFiles] = useState([]);

    // Admin State
    const [editorContent, setEditorContent] = useState('');
    const [editorInstructions, setEditorInstructions] = useState('');
    const [editorType, setEditorType] = useState('text'); // text (html preview), code (editor)
    const [editorLanguage, setEditorLanguage] = useState('javascript');
    const [uploading, setUploading] = useState(false);

    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState('Yes, No');
    const [showPollCreator, setShowPollCreator] = useState(false);

    // Tools State (Timer, Snippets, Roster)
    const [activeTool, setActiveTool] = useState(null); // 'snippets', 'timer', 'roster'
    const [timerMinutes, setTimerMinutes] = useState(5);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Snippet State
    const [snippets, setSnippets] = useState(() => {
        const saved = localStorage.getItem('codeSnippets');
        return saved ? JSON.parse(saved) : [];
    });
    const [snippetName, setSnippetName] = useState('');

    // History State
    const [history, setHistory] = useState([]);
    const [viewingSnapshot, setViewingSnapshot] = useState(null); // null = live, object = snapshot
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on('content_update', (newContent) => {
            setContent(newContent);
            // If admin, maybe don't overwrite editor unless empty? 
            // Actually let's keep them separate. Editor is for INPUT.
        });

        socket.on('file_list_update', (fileList) => {
            setFiles(fileList);
        });

        socket.on('history_update', (hist) => {
            setHistory(hist);
        });

        socket.on('roster_update', (users) => {
            setOnlineUsers(users);
        });

        // Request initial history
        socket.emit('get_history');
        // Let backend know who we are for roster
        if (user) socket.emit('login', { username: user.username, role: user.role });

        return () => {
            socket.off('content_update');
            socket.off('file_list_update');
            socket.off('history_update');
            socket.off('roster_update');
        };
    }, [socket, user]); // Added user dependency to emit login on auth change

    // Admin Actions
    const handleBroadcast = () => {
        const payload = {
            type: editorType,
            content: editorContent,
            instructions: editorInstructions,
            language: editorLanguage
        };
        socket.emit('broadcast_content', payload);
        setContent(payload);
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

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            // socket event will update list automatically
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const copyCode = async (e) => {
        try {
            await navigator.clipboard.writeText(displayedContent.content);
            const btn = e.target;
            const originalText = btn.innerText;
            btn.innerText = 'Copied!';
            setTimeout(() => btn.innerText = originalText, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers or insecure contexts
            const textArea = document.createElement("textarea");
            textArea.value = displayedContent.content;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                const btn = e.target;
                const originalText = btn.innerText;
                btn.innerText = 'Copied!';
                setTimeout(() => btn.innerText = originalText, 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
                alert('Could not copy text manually');
            }
            document.body.removeChild(textArea);
        }
    };

    // Derived content to show (Live vs Snapshot)
    const displayedContent = viewingSnapshot || content;

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {/* History Sidebar / Drawer */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '300px', // Slightly wider for names
                background: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 100,
                transform: showHistory ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderLeft: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Timeline</h3>
                    <button onClick={() => setShowHistory(false)} className="btn" style={{ padding: '0.2rem 0.5rem' }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                    <div
                        onClick={() => setViewingSnapshot(null)}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: !viewingSnapshot ? 'var(--primary)' : 'transparent',
                            marginBottom: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <strong style={{ display: 'block' }}>🔴 Live Now</strong>
                    </div>
                    {history.map((snap, i) => (
                        <div
                            key={snap.id}
                            onClick={() => setViewingSnapshot(snap)}
                            style={{
                                padding: '0.8rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                background: viewingSnapshot?.id === snap.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                marginBottom: '0.5rem',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <strong style={{ display: 'block', fontSize: '0.9rem' }}>{snap.name}</strong>
                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                {new Date(snap.timestamp).toLocaleTimeString()}
                            </span>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Type: {snap.type}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* View History Toggle Button (if closed) */}
            {!showHistory && (
                <button
                    onClick={() => setShowHistory(true)}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        right: '0',
                        transform: 'translateY(-50%)',
                        zIndex: 90,
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid var(--glass-border)',
                        borderRight: 'none',
                        borderRadius: '4px 0 0 4px',
                        padding: '1rem 0.2rem',
                        cursor: 'pointer',
                        color: 'white'
                    }}
                >
                    ‹
                </button>
            )}

            {/* Admin Toolbar (Only show if LIVE view) */}
            {user.role === 'admin' && !viewingSnapshot && (
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--glass-border)',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Admin Console</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
                                onChange={(value) => setEditorContent(value || '')}
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
                            onChange={(e) => setEditorContent(e.target.value)}
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

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                        <button onClick={handleBroadcast} className="btn btn-primary">Broadcast Updates</button>
                        <button onClick={handleSaveSnapshot} className="btn" style={{ background: 'var(--success)' }}>Save Snapshot</button>
                        <button onClick={() => {
                            setEditorContent(content.content);
                            setEditorInstructions(content.instructions || '');
                            setEditorType(content.type);
                        }} className="btn" style={{ background: 'rgba(112, 0, 255, 0.5)', border: '1px solid var(--accent)' }}>Edit Current</button>
                        <button onClick={handleClear} className="btn" style={{ background: 'var(--danger)' }}>Clear Screen</button>

                        {/* Tools Dropdown / Toggle */}
                        <div style={{ display: 'flex', gap: '0.5rem', borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem' }}>
                            <button onClick={() => setActiveTool(activeTool === 'snippets' ? null : 'snippets')} className={`btn ${activeTool === 'snippets' ? 'btn-primary' : ''}`} title="Snippet Library">📚</button>
                            <button onClick={() => setActiveTool(activeTool === 'timer' ? null : 'timer')} className={`btn ${activeTool === 'timer' ? 'btn-primary' : ''}`} title="Workshop Timer">⏱️</button>
                            <button onClick={() => setActiveTool(activeTool === 'roster' ? null : 'roster')} className={`btn ${activeTool === 'roster' ? 'btn-primary' : ''}`} title="Live Roster">👥 {onlineUsers.length}</button>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label className="btn" style={{ background: 'var(--accent)', cursor: 'pointer' }}>
                                {uploading ? 'Uploading...' : 'Upload File'}
                                <input type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                            </label>

                            <button
                                onClick={() => setShowPollCreator(!showPollCreator)}
                                className="btn"
                                style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                            >
                                📊 Poll
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
                            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
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
                        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <h4 style={{ marginTop: 0 }}>Workshop Timer</h4>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={timerMinutes}
                                    onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                                    style={{ width: '80px' }}
                                    min="1"
                                />
                                <span>minutes</span>
                                <button className="btn btn-primary" onClick={() => {
                                    socket.emit('start_timer', timerMinutes);
                                    setActiveTool(null);
                                }}>Start Countdown</button>
                                <button className="btn" style={{ background: 'var(--danger)' }} onClick={() => socket.emit('stop_timer')}>Reset</button>
                            </div>
                        </div>
                    )}

                    {activeTool === 'roster' && (
                        <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                            <h4 style={{ marginTop: 0 }}>Live Roster ({onlineUsers.length})</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                                {onlineUsers.map((u, i) => (
                                    <div key={i} style={{
                                        padding: '0.5rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center', // Fix for 'gap' if not using flex
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: u.role === 'admin' ? 'var(--accent)' : 'var(--success)' }}></div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{u.username}</div>
                                            <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>{u.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Poll Creator */}
                    {showPollCreator && (
                        <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                            <h4 style={{ marginTop: 0 }}>Create Live Poll</h4>
                            <input
                                className="input-field"
                                placeholder="Question (e.g. Understanding?)"
                                value={pollQuestion}
                                onChange={(e) => setPollQuestion(e.target.value)}
                                style={{ width: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }}
                            />
                            <input
                                className="input-field"
                                placeholder="Options (comma separated)"
                                value={pollOptions}
                                onChange={(e) => setPollOptions(e.target.value)}
                                style={{ width: '100%', marginBottom: '0.5rem', boxSizing: 'border-box' }}
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
                                Launch Poll
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Content View Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {files.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Shared Resources</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {files.map((file, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <a
                                        href={`/uploads/${file.filename}`}
                                        download
                                        className="glass-panel"
                                        style={{
                                            textDecoration: 'none',
                                            color: 'white',
                                            padding: '0.8rem 1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.9rem',
                                            transition: 'transform 0.2s',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        📁 {file.filename} <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>({Math.round(file.size / 1024)}KB)</span>
                                    </a>
                                    {user.role === 'admin' && (
                                        <button
                                            onClick={async () => {
                                                if (confirm('Delete this file?')) {
                                                    await fetch(`/api/files/${file.filename}`, { method: 'DELETE' });
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
                            height: '600px', // Fixed height for viewer or use flex
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginTop: '1rem'
                        }}>
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
        </div >
    );
}

export default LeftPanel;
