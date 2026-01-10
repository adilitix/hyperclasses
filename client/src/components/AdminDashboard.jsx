import React, { useState, useEffect } from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import StudentsList from './StudentsList';
import UniversalEventsPanel from './UniversalEventsPanel';
import TicketsPanel from './TicketsPanel';
import ChatHistoryPanel from './ChatHistoryPanel';
import AttendancePanel from './AttendancePanel';
import SettingsPanel from './SettingsPanel';
import AboutPanel from './AboutPanel';
import WorkshopsPanel from './WorkshopsPanel';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard({ activeTab, onClose, currentEvent, onEnterEvent, viewingSnapshot, setViewingSnapshot, theme, setTheme, primaryColor, setPrimaryColor, downloadPath, setDownloadPath, downloadFormat, setDownloadFormat, messages, setMessages }) {
    return (
        <div className="admin-dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', position: 'relative' }}>
            {/* Header for sub-views like Settings/About */}
            {(activeTab === 'settings' || activeTab === 'about') && (
                <div style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost"
                        style={{ border: 'none', color: 'var(--primary)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.8rem' }}
                    >
                        <span>←</span> BACK TO DASHBOARD
                    </button>
                </div>
            )}

            {/* Main Content Area - Full Width No Sidebar */}
            <div className="admin-main-content" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    flex: 1,
                    overflowY: activeTab === 'chat' ? 'hidden' : 'visible',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 'min-content'
                }}>
                    {activeTab === 'events' && <UniversalEventsPanel onEnterEvent={onEnterEvent} />}
                    {activeTab === 'classroom' && currentEvent && (
                        <LeftPanel viewingSnapshot={viewingSnapshot} setViewingSnapshot={setViewingSnapshot} />
                    )}
                    {activeTab === 'students' && currentEvent && <StudentsList />}
                    {activeTab === 'tickets' && currentEvent && <TicketsPanel eventId={currentEvent.id} />}
                    {activeTab === 'chat-history' && currentEvent && <ChatHistoryPanel eventId={currentEvent.id} />}
                    {activeTab === 'attendance' && currentEvent && <AttendancePanel eventId={currentEvent.id} />}
                    {activeTab === 'chat' && currentEvent && (
                        <div className="glass-panel chat-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <RightPanel messages={messages} onMessagesUpdate={setMessages} />
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <SettingsPanel
                            theme={theme} setTheme={setTheme}
                            primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
                            downloadPath={downloadPath} setDownloadPath={setDownloadPath}
                            downloadFormat={downloadFormat} setDownloadFormat={setDownloadFormat}
                        />
                    )}
                    {activeTab === 'about' && <AboutPanel />}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
