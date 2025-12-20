import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

function TimerOverlay() {
    const socket = useSocket();
    const [endTime, setEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        if (!socket) return;
        socket.on('timer_update', (time) => {
            setEndTime(time);
        });
        return () => socket.off('timer_update');
    }, [socket]);

    useEffect(() => {
        if (!endTime) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft('00:00');
                setIsUrgent(true);
                // Optionally play sound or auto-close after some time
                if (diff < -5000) setEndTime(null); // Auto hide after 5s overtime
            } else {
                const mins = Math.floor(diff / 60000);
                const secs = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
                setIsUrgent(diff < 60000); // Red if < 1 min
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    if (!endTime) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isUrgent ? 'rgba(255, 0, 85, 0.8)' : 'rgba(5, 5, 20, 0.8)',
                    border: `1px solid ${isUrgent ? 'var(--danger)' : 'var(--primary)'}`,
                    padding: '0.5rem 1.5rem',
                    borderRadius: '50px',
                    zIndex: 2000,
                    backdropFilter: 'blur(10px)',
                    boxShadow: isUrgent ? '0 0 30px rgba(255, 0, 85, 0.4)' : '0 0 20px rgba(0, 240, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                <span style={{ fontSize: '1.5rem' }}>⏱️</span>
                <span style={{
                    fontSize: '2rem',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: '#fff',
                    textShadow: '0 0 10px rgba(255,255,255,0.5)'
                }}>
                    {timeLeft}
                </span>
            </motion.div>
        </AnimatePresence>
    );
}

export default TimerOverlay;
