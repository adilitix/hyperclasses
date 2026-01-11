import React from 'react';
import { useLandingTheme } from '../contexts/LandingThemeContext';
import { motion } from 'framer-motion';

const LandingThemeToggle = () => {
    const { theme, setTheme } = useLandingTheme();

    const themes = [
        { id: 'black', label: '⬛', title: 'Black Out' },
        { id: 'dark', label: '🌙', title: 'Dark Mode' },
        { id: 'light', label: '☀️', title: 'Light Mode' }
    ];

    return (
        <div className="theme-toggle-v2" style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            padding: '4px',
            borderRadius: '30px',
            border: '1px solid rgba(255,255,255,0.1)',
            gap: '4px',
            backdropFilter: 'blur(10px)'
        }}>
            {themes.map((t) => (
                <motion.button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    title={t.title}
                    style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: theme === t.id ? (t.id === 'light' ? '#fff' : t.id === 'black' ? '#111' : '#333') : 'transparent',
                        color: theme === t.id ? (t.id === 'light' ? '#000' : '#fff') : '#888',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {theme === t.id && (
                        <motion.div
                            layoutId="active-theme-bg"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: t.id === 'light' ? 'rgba(255,255,255,1)' : t.id === 'black' ? 'rgba(0,0,0,1)' : 'rgba(56, 189, 248, 0.2)',
                                borderRadius: '20px',
                                zIndex: -1,
                                boxShadow: t.id === 'light' ? '0 0 15px rgba(255,255,255,0.3)' : 'none'
                            }}
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span style={{ position: 'relative', zIndex: 2 }}>{t.label}</span>
                </motion.button>
            ))}
        </div>
    );
};

export default LandingThemeToggle;
