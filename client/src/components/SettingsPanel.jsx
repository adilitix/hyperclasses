import React, { useState } from 'react';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

function SettingsPanel({ theme, setTheme, primaryColor, setPrimaryColor, downloadPath, setDownloadPath, downloadFormat, setDownloadFormat }) {
    const { user, updateUser } = useAuth();
    const [activeSection, setActiveSection] = useState('appearance');

    // Profile Edit State
    const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [about, setAbout] = useState(user?.about || '');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const colors = [
        { name: 'Cyan', value: '#00f0ff' },
        { name: 'Green', value: '#00ff9d' },
        { name: 'Pink', value: '#ff0055' },
        { name: 'Amber', value: '#ffbe0b' },
        { name: 'Purple', value: '#bf00ff' },
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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        setUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${API_BASE_URL}/api/profile/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: user.username,
                    role: user.role,
                    newPassword,
                    about,
                    displayName
                })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setNewPassword('');
                setConfirmPassword('');
                updateUser({ about, displayName });
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setUpdating(false);
        }
    };

    const handleBrowseFolder = async () => {
        try {
            if ('showDirectoryPicker' in window) {
                const dirHandle = await window.showDirectoryPicker();
                setDownloadPath(dirHandle.name);
                localStorage.setItem('downloadDirHandle', JSON.stringify({ name: dirHandle.name }));
                window.downloadDirHandle = dirHandle;
            } else {
                const path = prompt('Enter folder name:', downloadPath || 'Downloads');
                if (path) setDownloadPath(path);
            }
        } catch (err) {
            if (err.name !== 'AbortError') alert('Failed to select folder');
        }
    };

    const renderNavButton = (id, icon, label) => (
        <button
            onClick={() => setActiveSection(id)}
            className={`btn ${activeSection === id ? 'btn-primary' : 'btn-ghost'}`}
            style={{
                justifyContent: 'flex-start',
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                border: activeSection === id ? 'none' : '1px solid transparent'
            }}
        >
            <span style={{ marginRight: '0.75rem' }}>{icon}</span> {label}
        </button>
    );

    return (
        <div style={{ padding: 'clamp(1rem, 5vw, 2.5rem)', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="cine-text" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Control Center</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Customize your experience and manage your profile</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 250px) 1fr', gap: '2rem' }} className="mobile-wrap">
                {/* Side Navigation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {renderNavButton('appearance', '🎨', 'Appearance')}
                    {user?.role !== 'student' && renderNavButton('profile', '🛡️', 'Profile Editor')}
                    {user?.role === 'student' && renderNavButton('downloads', '💾', 'Downloads')}
                </div>

                {/* Content Area */}
                <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--cine-border)' }}>
                    {activeSection === 'appearance' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 className="cine-text" style={{ fontSize: '1rem', marginBottom: '2rem', color: 'var(--primary)' }}>System Appearance</h3>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>THEME MODE</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['dark', 'light'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setTheme(m)}
                                            className={`btn ${theme === m ? 'btn-primary' : 'btn-ghost'}`}
                                            style={{ flex: 1, textTransform: 'capitalize' }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ACCENT COLOR</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    {colors.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setPrimaryColor(c.value)}
                                            style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                background: c.value, border: `3px solid ${primaryColor === c.value ? '#fff' : 'transparent'}`,
                                                boxShadow: primaryColor === c.value ? `0 0 15px ${c.value}` : 'none',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'profile' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 className="cine-text" style={{ fontSize: '1rem', marginBottom: '2rem', color: 'var(--primary)' }}>Profile Editor</h3>

                            {message.text && (
                                <div style={{
                                    padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
                                    background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                                    border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}44`
                                }}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Display Name</label>
                                    <input
                                        type="text" className="input-field" value={displayName}
                                        onChange={e => setDisplayName(e.target.value)} style={{ width: '100%' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mobile-wrap">
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>New Password</label>
                                        <input
                                            type="password" className="input-field" value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)} style={{ width: '100%' }}
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Confirm Password</label>
                                        <input
                                            type="password" className="input-field" value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>About Me</label>
                                    <textarea
                                        className="input-field" value={about}
                                        onChange={e => setAbout(e.target.value)}
                                        style={{ width: '100%', minHeight: '100px', resize: 'vertical', paddingTop: '0.75rem' }}
                                        placeholder="Brief production bio..."
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={updating} style={{ width: 'fit-content', padding: '0.75rem 2rem' }}>
                                    {updating ? 'Updating...' : 'Save Changes'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {activeSection === 'downloads' && (
                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                            <h3 className="cine-text" style={{ fontSize: '1rem', marginBottom: '2rem', color: 'var(--primary)' }}>Download Preferences</h3>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>TARGET FOLDER</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input type="text" className="input-field" value={downloadPath} readOnly style={{ flex: 1 }} />
                                    <button onClick={handleBrowseFolder} className="btn btn-primary">Browse</button>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>DEFAULT FILE FORMAT</label>
                                <select
                                    className="input-field" value={downloadFormat}
                                    onChange={e => setDownloadFormat(e.target.value)}
                                    style={{ width: '100%', cursor: 'pointer' }}
                                >
                                    {fileFormats.map(f => <option key={f.ext} value={f.ext}>{f.name} (.{f.ext})</option>)}
                                </select>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SettingsPanel;
