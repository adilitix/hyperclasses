import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AboutPanel from './AboutPanel';

function SettingsModal({ isOpen, onClose, theme, setTheme, primaryColor, setPrimaryColor, logout, user, downloadPath, setDownloadPath, downloadFormat, setDownloadFormat, trainerUsername }) {
    if (!isOpen) return null;

    const colors = [
        { name: 'Cyan', value: '#00f0ff' },
        { name: 'Green', value: '#00ff9d' },
        { name: 'Pink', value: '#ff0055' },
        { name: 'Amber', value: '#ffbe0b' },
        { name: 'Purple', value: '#bf00ff' }, // Custom Purple
        { name: 'Blue', value: '#0070f3' },
    ];

    const fileFormats = [
        { name: 'Python', ext: 'py' },
        { name: 'JavaScript', ext: 'js' },
        { name: 'HTML', ext: 'html' },
        { name: 'CSS', ext: 'css' },
        { name: 'Java', ext: 'java' },
        { name: 'C++', ext: 'cpp' },
        { name: 'Text', ext: 'txt' },
    ];

    const handleBrowseFolder = async () => {
        try {
            // Check if File System Access API is supported
            if ('showDirectoryPicker' in window) {
                const dirHandle = await window.showDirectoryPicker();
                setDownloadPath(dirHandle.name); // Store directory handle name
                // Store the handle for later use
                localStorage.setItem('downloadDirHandle', JSON.stringify({
                    name: dirHandle.name,
                    // We'll store the handle in a global variable since we can't serialize it
                }));
                window.downloadDirHandle = dirHandle;
            } else {
                // Fallback for browsers that don't support the API
                const path = prompt('Enter the folder name where you want to download code files:', downloadPath || 'Downloads');
                if (path !== null) {
                    setDownloadPath(path);
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting folder:', err);
                alert('Failed to select folder. You can type the folder name manually.');
            }
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="modal-backdrop"
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
                    className="glass-panel"
                    style={{
                        width: '100%',
                        maxWidth: '400px',
                        padding: '2rem',
                        position: 'relative',
                        background: 'var(--glass-bg)', // Ensure it uses theme bg
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-color)',
                            fontSize: '1.2rem',
                            cursor: 'pointer'
                        }}
                    >
                        ✕
                    </button>

                    <h2 style={{ marginTop: 0, marginBottom: '2rem', textAlign: 'center' }}>Settings</h2>

                    {/* Section: Appearance */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Appearance</h4>

                        {/* Dark/Light Mode */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <span>Theme Mode</span>
                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', padding: '4px' }}>
                                <button
                                    onClick={() => setTheme('dark')}
                                    style={{
                                        background: theme === 'dark' ? 'var(--primary)' : 'transparent',
                                        color: theme === 'dark' ? '#000' : 'var(--text-color)',
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: '0.4rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: theme === 'dark' ? 'bold' : 'normal',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Dark
                                </button>
                                <button
                                    onClick={() => setTheme('light')}
                                    style={{
                                        background: theme === 'light' ? 'var(--primary)' : 'transparent',
                                        color: theme === 'light' ? '#fff' : 'var(--text-color)', // Text usually dark in light mode, but button bg makes it tricky. 
                                        // If primary is dark blue in light mode, text should be white.
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: '0.4rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: theme === 'light' ? 'bold' : 'normal',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Light
                                </button>
                            </div>
                        </div>

                        {/* Accent Color */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ marginBottom: '0.8rem' }}>Accent Color</div>
                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                {colors.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => setPrimaryColor(color.value)}
                                        title={color.name}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: color.value,
                                            border: `2px solid ${primaryColor === color.value ? 'var(--text-color)' : 'transparent'}`,
                                            cursor: 'pointer',
                                            boxShadow: primaryColor === color.value ? `0 0 10px ${color.value}` : 'none',
                                            transition: 'all 0.2s'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section: Download Settings (For Students) */}
                    {user?.role === 'student' && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Download Settings</h4>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Download Folder</div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={downloadPath || ''}
                                        onChange={(e) => setDownloadPath(e.target.value)}
                                        placeholder="Click 'Browse' to select folder"
                                        readOnly
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '4px',
                                            color: 'var(--text-color)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={handleBrowseFolder}
                                    />
                                    <button
                                        onClick={handleBrowseFolder}
                                        className="btn"
                                        style={{
                                            background: 'var(--primary)',
                                            color: '#000',
                                            padding: '0.5rem 1rem'
                                        }}
                                    >
                                        📁 Browse
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.3rem' }}>
                                    Click 'Browse' to select a folder using your system's folder picker
                                </div>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>File Format</div>
                                <select
                                    value={downloadFormat || 'py'}
                                    onChange={(e) => setDownloadFormat(e.target.value)}
                                    className="btn"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '4px',
                                        color: 'var(--text-color)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {fileFormats.map(format => (
                                        <option key={format.ext} value={format.ext}>
                                            {format.name} (.{format.ext})
                                        </option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.3rem' }}>
                                    Files will be saved as: eventname_001.{downloadFormat || 'py'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section: Account (Read Only) */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Account</h4>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>{user?.username}</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{user?.role}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: About System */}
                    <div>
                        <h4 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>About System</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', padding: '0.5rem' }}>
                            <AboutPanel trainerUsername={trainerUsername} />
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default SettingsModal;
