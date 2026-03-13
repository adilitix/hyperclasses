import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

function PollOverlay({ activePoll }) {
    const socket = useSocket();
    const { user } = useAuth();
    const [voted, setVoted] = useState(false);

    // Reset local voted state when poll changes
    useEffect(() => {
        setVoted(false);
    }, [activePoll?.question]); // Simple dependency check

    if (!activePoll) return null;

    const totalVotes = activePoll.options.reduce((acc, curr) => acc + curr.count, 0);

    const handleVote = (index) => {
        if (voted) return;
        socket.emit('vote_poll', index);
        setVoted(true);
    };

    const handleEndPoll = () => {
        socket.emit('stop_poll');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                style={{
                    position: 'fixed',
                    bottom: '80px', // Above footer
                    right: '20px',
                    width: '350px',
                    background: 'rgba(5, 5, 16, 0.95)',
                    border: '1px solid var(--primary)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    zIndex: 1000,
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--primary)' }}>📊 Live Poll</h3>
                    {(user.role === 'admin' || user.role === 'superadmin') && (
                        <button onClick={handleEndPoll} className="btn" style={{ background: 'var(--danger)', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>End Poll</button>
                    )}
                </div>

                <h4 style={{ marginBottom: '1rem', fontWeight: '500' }}>{activePoll.question}</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {activePoll.options.map((opt, i) => {
                        const percent = totalVotes === 0 ? 0 : Math.round((opt.count / totalVotes) * 100);
                        const isAdmin = user.role === 'admin' || user.role === 'superadmin';
                        const isStudent = !isAdmin;
                        const showResults = !isStudent || voted || isAdmin;

                        return (
                            <div key={i} style={{ position: 'relative' }}>
                                {/* Result Bar Background */}
                                {showResults && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        style={{
                                            position: 'absolute',
                                            top: 0, left: 0, bottom: 0,
                                            background: 'rgba(0, 240, 255, 0.2)',
                                            borderRadius: '4px',
                                            zIndex: 0
                                        }}
                                    />
                                )}

                                <button
                                    onClick={() => isStudent && handleVote(i)}
                                    disabled={showResults && isStudent}
                                    style={{
                                        width: '100%',
                                        padding: '0.8rem',
                                        background: 'transparent',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '4px',
                                        color: 'white',
                                        textAlign: 'left',
                                        cursor: (showResults && isStudent) ? 'default' : 'pointer',
                                        position: 'relative',
                                        zIndex: 1,
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}
                                    className={!showResults ? 'poll-option-hover' : ''}
                                >
                                    <span>{opt.text}</span>
                                    {showResults && (
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{percent}% ({opt.count})</span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <style>{`
                    .poll-option-hover:hover {
                        background: rgba(255, 255, 255, 0.05) !important;
                        border-color: var(--primary) !important;
                    }
                `}</style>

                {voted && user.role !== 'admin' && user.role !== 'superadmin' && (
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', textAlign: 'center', opacity: 0.7 }}>
                        ✅ Vote Submitted
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

export default PollOverlay;
