import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE_URL } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import '../styles/go_student_workshop.css';

const GoStudentWorkshop = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();
    const [workshop, setWorkshop] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedQuizIndex, setSelectedQuizIndex] = useState(null);
    const [quizTimeLeft, setQuizTimeLeft] = useState(null);
    const [isCertificateRequested, setIsCertificateRequested] = useState(false);

    useEffect(() => {
        let currentUser = user;
        if (!currentUser) {
            const preview = localStorage.getItem('preview_user');
            if (preview) currentUser = JSON.parse(preview);
        }

        if (!currentUser || (!currentUser.workshopId && !currentUser.eventId)) {
            navigate('/go/login');
            return;
        }

        const id = currentUser.workshopId || currentUser.eventId;
        fetch(`${API_BASE_URL}/api/workshops/${id}`)
            .then(res => res.json())
            .then(data => {
                setWorkshop(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [user, navigate]);

    useEffect(() => {
        let currentUser = user;
        if (!currentUser) {
            const preview = localStorage.getItem('preview_user');
            if (preview) currentUser = JSON.parse(preview);
        }

        if (socket && currentUser) {
            socket.emit('join_workshop', {
                username: currentUser.username,
                workshopId: currentUser.workshopId || currentUser.eventId
            });

            socket.on('workshop_restore_progress', (data) => {
                if (data.step !== undefined) setCurrentIndex(data.step);
                if (data.completed) setCompleted(true);
                if (data.certificateReady) setIsCertificateRequested(true);
            });

            return () => {
                socket.off('workshop_restore_progress');
            };
        }
    }, [socket, user]);

    // Timer logic for quiz
    useEffect(() => {
        let timer;
        if (quizTimeLeft > 0) {
            timer = setInterval(() => setQuizTimeLeft(prev => prev - 1), 1000);
        } else if (quizTimeLeft === 0) {
            // Time up logic? Handled in UI (disable buttons)
        }
        return () => clearInterval(timer);
    }, [quizTimeLeft]);

    const activePage = workshop?.pages?.[currentIndex] || null;
    const totalPages = workshop?.pages?.length || 0;

    // Trigger timer if active page is quiz and has timer
    useEffect(() => {
        if (activePage?.type === 'quiz' && activePage.timer) {
            setQuizTimeLeft(activePage.timer);
        } else {
            setQuizTimeLeft(null);
        }
    }, [activePage, currentIndex]);

    const handleNext = () => {
        // Quiz check
        if (activePage.type === 'quiz') {
            if (selectedQuizIndex !== activePage.correctOption) {
                alert('Please answer the quiz correctly to proceed.');
                return;
            }
        }

        setSelectedQuizIndex(null);
        if (currentIndex < totalPages - 1) {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            socket.emit('update_workshop_progress', { step: nextIdx, completed: false });
        } else {
            setCompleted(true);
            socket.emit('update_workshop_progress', { step: currentIndex, completed: true });
        }
    };

    const handlePrev = () => {
        setSelectedQuizIndex(null);
        if (currentIndex > 0) {
            const nextIdx = currentIndex - 1;
            setCurrentIndex(nextIdx);
            socket.emit('update_workshop_progress', { step: nextIdx, completed: false });
        }
    };

    const handleRequestCertificate = () => {
        socket.emit('request_certificate');
        setIsCertificateRequested(true);
        alert('Certificate training complete! Request sent to instructor.');
    };

    if (loading) return <div className="go-workshop-loader">SYNCHRONIZING WORKSHOP...</div>;
    if (!workshop) return <div className="go-workshop-error">Workshop not found.</div>;

    const progress = Math.round(((currentIndex + 1) / totalPages) * 100);

    if (completed) {
        return (
            <div className="workshop-completed-screen">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="completion-card"
                >
                    <div className="medal-icon">🏆</div>
                    <h1>Workshop Completed!</h1>
                    <p>Congratulations, <b>{user.username}</b>! You have successfully completed the <b>{workshop.title}</b>.</p>

                    {isCertificateRequested ? (
                        <div className="cert-status">✅ Ready to Print at Admin Desk</div>
                    ) : (
                        <button onClick={handleRequestCertificate} className="cert-btn">GENERATE CERTIFICATE</button>
                    )}

                    <button onClick={() => navigate('/')} className="return-btn">RETURN TO PORTAL</button>
                    <div className="completion-decoration"></div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="go-student-workshop-container">
            <header className="workshop-view-header">
                <div className="ws-brand">
                    <div className="logo-box-sm">H</div>
                    <span className="ws-title-top">{workshop.title}</span>
                </div>
                <div className="student-profile">
                    <span>{user.username}</span>
                    <button onClick={() => navigate('/')} className="exit-ws">EXIT</button>
                </div>
            </header>

            <main className="workshop-viewer-main">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePage?.id || 'empty'}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="active-page-content"
                    >
                        {activePage ? (
                            <div className="page-layout">
                                <div className="step-badge">STEP {currentIndex + 1} OF {totalPages}</div>
                                <h2 className="p-title">{activePage.title}</h2>
                                <div className={`p-body ${activePage.type}`}>
                                    {activePage.type === 'notes' && (
                                        <div
                                            className="rich-text-content"
                                            dangerouslySetInnerHTML={{ __html: activePage.content }}
                                        />
                                    )}
                                    {activePage.type === 'code' && (
                                        <div className="code-block-container">
                                            <div className="code-header">
                                                <span>{activePage.language || 'javascript'}</span>
                                                <button className="copy-code-btn" onClick={() => {
                                                    navigator.clipboard.writeText(activePage.content);
                                                    alert('Code copied!');
                                                }}>COPY CODE</button>
                                            </div>
                                            <pre className="code-content-view">
                                                <code>{activePage.content}</code>
                                            </pre>
                                        </div>
                                    )}
                                    {activePage.type === 'quiz' && (
                                        <div className="quiz-poll-view">
                                            <div className="quiz-header-row">
                                                <p className="quiz-question">{activePage.content}</p>
                                                {quizTimeLeft !== null && (
                                                    <div className={`quiz-timer ${quizTimeLeft < 10 ? 'urgent' : ''}`}>
                                                        ⏳ {Math.floor(quizTimeLeft / 60)}:{(quizTimeLeft % 60).toString().padStart(2, '0')}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="poll-options">
                                                {activePage.options?.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        className={`poll-opt ${selectedQuizIndex === i ? 'selected' : ''}`}
                                                        onClick={() => quizTimeLeft !== 0 && setSelectedQuizIndex(i)}
                                                        disabled={quizTimeLeft === 0}
                                                    >
                                                        <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                                                        <span className="opt-text">{opt}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            {quizTimeLeft === 0 && selectedQuizIndex === null && (
                                                <div className="time-up-msg">TIME EXPIRED. Reset page to try again.</div>
                                            )}
                                            {selectedQuizIndex !== null && (
                                                <div className="quiz-feedback">
                                                    {selectedQuizIndex === activePage.correctOption ? (
                                                        <span className="fb-correct">✓ CORRECT ANSWER</span>
                                                    ) : (
                                                        <span className="fb-wrong">✗ INCORRECT. TRY AGAIN.</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="empty-ws">No content available in this workshop yet.</div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="workshop-nav-footer">
                <div className="progress-section">
                    <div className="progress-bar-container">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="progress-stats">{progress}% COMPLETE</div>
                </div>

                <div className="nav-controls">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="btn-prev"
                    >
                        BACK
                    </button>
                    <button
                        onClick={handleNext}
                        className="btn-next"
                    >
                        {currentIndex === totalPages - 1 ? 'FINISH WORKSHOP' : 'NEXT STEP →'}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default GoStudentWorkshop;
