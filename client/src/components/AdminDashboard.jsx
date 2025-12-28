import React, { useState, useEffect } from 'react';
import LeftPanel from './LeftPanel';
import StudentsList from './StudentsList';
import EventsPanel from './EventsPanel';
import TicketsPanel from './TicketsPanel';
import ChatHistoryPanel from './ChatHistoryPanel';
import AttendancePanel from './AttendancePanel';
import SettingsPanel from './SettingsPanel';
import AboutPanel from './AboutPanel';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard({ activeTab, currentEvent, onEnterEvent, viewingSnapshot, setViewingSnapshot, theme, setTheme, primaryColor, setPrimaryColor, downloadPath, setDownloadPath, downloadFormat, setDownloadFormat }) {
    return (
        <div className="admin-dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Main Content Area - Full Width No Sidebar */}
            <div className="admin-main-content" style={{ width: '100%', flex: 1, overflowY: 'auto' }}>
                {activeTab === 'events' && <EventsPanel onEnterEvent={onEnterEvent} />}
                {activeTab === 'classroom' && currentEvent && (
                    <LeftPanel viewingSnapshot={viewingSnapshot} setViewingSnapshot={setViewingSnapshot} />
                )}
                {activeTab === 'students' && currentEvent && <StudentsList />}
                {activeTab === 'tickets' && currentEvent && <TicketsPanel eventId={currentEvent.id} />}
                {activeTab === 'chat-history' && currentEvent && <ChatHistoryPanel eventId={currentEvent.id} />}
                {activeTab === 'attendance' && currentEvent && <AttendancePanel eventId={currentEvent.id} />}
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
    );
}

export default AdminDashboard;
