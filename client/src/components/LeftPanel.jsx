import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';

function LeftPanel() {
    const socket = useSocket();
    const { user } = useAuth();

    const [content, setContent] = useState({ type: 'text', content: '', language: 'html' });
    const [files, setFiles] = useState([]);

    // Admin State
    const [editorContent, setEditorContent] = useState('');
    const [editorType, setEditorType] = useState('text'); // text, code
    const [uploading, setUploading] = useState(false);

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

        return () => {
            socket.off('content_update');
            socket.off('file_list_update');
        };
    }, [socket]);

    // Admin Actions
    const handleBroadcast = () => {
        const payload = {
            type: editorType,
            content: editorContent,
            language: 'html' // simplified for now
        };
        socket.emit('broadcast_content', payload);
        setContent(payload);
    };

    const handleClear = () => {
        setEditorContent('');
        socket.emit('broadcast_content', { type: 'text', content: '', language: 'html' });
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
            await navigator.clipboard.writeText(content.content);
            const btn = e.target;
            const originalText = btn.innerText;
            btn.innerText = 'Copied!';
            setTimeout(() => btn.innerText = originalText, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers or insecure contexts
            const textArea = document.createElement("textarea");
            textArea.value = content.content;
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

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Admin Toolbar */}
            {user.role === 'admin' && (
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--glass-border)',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0' }}>Admin Console</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button
                            className={`btn ${editorType === 'text' ? 'btn-primary' : ''}`}
                            style={{ background: editorType === 'text' ? '' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => setEditorType('text')}
                        >
                            HTML / Text
                        </button>
                        <button
                            className={`btn ${editorType === 'code' ? 'btn-primary' : ''}`}
                            style={{ background: editorType === 'code' ? '' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => setEditorType('code')}
                        >
                            Code Snippet
                        </button>
                    </div>

                    <textarea
                        className="input-field"
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                        style={{ width: '100%', height: '100px', resize: 'vertical', fontFamily: 'monospace' }}
                        placeholder={editorType === 'text' ? "<h1>Hello</h1>" : "console.log('Hello')"}
                    />

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                        <button onClick={handleBroadcast} className="btn btn-primary">Broadcast Updates</button>
                        <button onClick={() => {
                            setEditorContent(content.content);
                            setEditorType(content.type);
                        }} className="btn" style={{ background: 'var(--primary-hover)' }}>Edit Current</button>
                        <button onClick={handleClear} className="btn" style={{ background: 'var(--danger)' }}>Clear Screen</button>

                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <label className="btn" style={{ background: 'var(--accent)', cursor: 'pointer' }}>
                                {uploading ? 'Uploading...' : 'Upload File'}
                                <input type="file" hidden onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>
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

                <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Live Lesson</h4>
                {content.type === 'text' ? (
                    // Dangerously set HTML for rich text from admin
                    <div dangerouslySetInnerHTML={{ __html: content.content }} style={{ lineHeight: '1.6' }} />
                ) : (
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            zIndex: 10
                        }}>
                            <button onClick={copyCode} className="btn" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>Copy</button>
                        </div>
                        <pre className="code-block">
                            <code>{content.content}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeftPanel;
