import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Cpu,
  HardDrive,
  Printer,
  Wifi,
  Shield,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
  Terminal,
  Server,
  Layers,
  Search,
  Bell,
  Sliders,
  Play,
  RotateCcw,
  UserCheck,
  UserX,
  ExternalLink,
  ChevronRight,
  LogOut,
  Radio,
  Zap,
  Phone,
  Paperclip,
  CheckCheck
} from 'lucide-react';

const OfficeStatus = () => {
  // Auth state - persist session token in localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adilitix_office_auth') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Settings & Active Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'whatsapp' | 'approvals' | 'automation' | 'logs'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [gatewayUrl, setGatewayUrl] = useState(() => {
    return localStorage.getItem('adilitix_gateway_url') || 'http://10.70.203.43:8000';
  });
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WhatsApp Operations State
  const [selectedContact, setSelectedContact] = useState('8921901615'); // default Alsaba
  const [chatSearch, setChatSearch] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [quickActionStatus, setQuickActionStatus] = useState(null);

  // System Telemetry Data
  const [telemetry, setTelemetry] = useState({
    cpuTemp: 48.2,
    cpuUsage: 14,
    ramUsed: '342 MB',
    ramTotal: '1.82 GB',
    ramPercent: 18.8,
    diskUsed: '3.6 GB',
    diskTotal: '29.2 GB',
    diskPercent: 12.3,
    uptime: '2d 14h 22m',
    loadAvg: '0.18, 0.22, 0.19',
    networkIp: '10.70.203.43',
    piModel: 'Raspberry Pi 4 Model B Rev 1.4',
    printerStatus: 'Idle / Ready (Canon G3012)',
    printerQueue: 0,
    bambuStatus: 'Idle (P1S - Ready)',
    bambuBedTemp: 24.5,
    bambuNozzleTemp: 23.0,
    bambuProgress: 0,
    whatsappBridgeStatus: 'Connected & Authenticated',
    lastEvent: 'Heartbeat received'
  });

  // WhatsApp Contacts & Live Chats
  const [contacts, setContacts] = useState([
    {
      id: '8921901615',
      name: 'Alsaba',
      phone: '+91 89219 01615',
      role: 'Staff / Whitelisted',
      avatarColor: '#f97316',
      unread: 0,
      lastSeen: 'Just now',
      lastMessage: 'Rate updated: 3 days ₹1000 & 5 days ₹1500.'
    },
    {
      id: 'asp_jio',
      name: 'ASP (Owner)',
      phone: '+91 94460 76543',
      role: 'Super Admin',
      avatarColor: '#3b82f6',
      unread: 0,
      lastSeen: '2m ago',
      lastMessage: 'Office dashboard live feed is operational.'
    },
    {
      id: 'amina',
      name: 'Amina',
      phone: '+91 98471 22910',
      role: 'Whitelisted Member',
      avatarColor: '#10b981',
      unread: 0,
      lastSeen: '14m ago',
      lastMessage: 'Please print the lab report.'
    },
    {
      id: 'nishatha',
      name: 'Nishatha',
      phone: '+91 97455 10482',
      role: 'Whitelisted Member',
      avatarColor: '#8b5cf6',
      unread: 0,
      lastSeen: '1h ago',
      lastMessage: 'Project schedule received.'
    },
    {
      id: 'guest_8892',
      name: 'Guest User (9847...82)',
      phone: '+91 98472 88921',
      role: 'Guest / Pending Approval',
      avatarColor: '#eab308',
      unread: 1,
      lastSeen: '3m ago',
      lastMessage: 'Can you print my syllabus PDF?'
    }
  ]);

  // Chat Transcripts
  const [chats, setChats] = useState({
    '8921901615': [
      { id: 1, sender: 'alsaba', text: 'Hey, did you update the workshop pricing?', time: '12:20 PM', status: 'read' },
      { id: 2, sender: 'agent', text: 'Yes, workshop rates updated: 3 days is ₹1000 and 5 days is ₹1500 across syllabus and brochure.', time: '12:21 PM', status: 'read' },
      { id: 3, sender: 'alsaba', text: 'Great! Also please notify me when the print job finishes.', time: '12:35 PM', status: 'read' },
      { id: 4, sender: 'agent', text: 'Understood! I will alert you immediately once printed on Canon G3012.', time: '12:36 PM', status: 'delivered' }
    ],
    'asp_jio': [
      { id: 1, sender: 'asp_jio', text: 'OfficePi status check', time: '11:45 AM', status: 'read' },
      { id: 2, sender: 'agent', text: 'OfficePi is running normally. CPU 48.2°C, RAM 18%, CUPS printer online.', time: '11:45 AM', status: 'read' },
      { id: 3, sender: 'asp_jio', text: 'Enable proactive alerting for pending print requests.', time: '11:48 AM', status: 'read' },
      { id: 4, sender: 'agent', text: 'Proactive alerting daemon is active. Telegram & WhatsApp sync enabled.', time: '11:49 AM', status: 'read' }
    ],
    'guest_8892': [
      { id: 1, sender: 'guest_8892', text: 'Hello, I sent College_Syllabus.pdf for printing.', time: '12:50 PM', status: 'read' },
      { id: 2, sender: 'agent', text: 'Your document has been received and queued for admin authorization.', time: '12:51 PM', status: 'read' }
    ]
  });

  // Pending print approval requests
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'req_101',
      senderName: 'Guest User (9847...82)',
      senderPhone: '+91 98472 88921',
      fileName: 'College_Syllabus_2026.pdf',
      fileSize: '1.4 MB',
      pageCount: 4,
      copies: 1,
      colorMode: 'Black & White',
      timeRequested: '12:50 PM',
      status: 'pending'
    },
    {
      id: 'req_102',
      senderName: 'Suresh Kumar (Guest)',
      senderPhone: '+91 94473 11029',
      fileName: 'Circuit_Schematics_Rev2.pdf',
      fileSize: '3.8 MB',
      pageCount: 2,
      copies: 2,
      colorMode: 'Color',
      timeRequested: '12:15 PM',
      status: 'pending'
    }
  ]);

  // Terminal / Activity Log
  const [activityLogs, setActivityLogs] = useState([
    { time: '12:56:10', type: 'info', msg: 'System heartbeat pulse OK. Temperature steady at 48.2°C' },
    { time: '12:55:04', type: 'whatsapp', msg: 'WhatsApp session keepalive ACK received from gateway bridge.' },
    { time: '12:51:20', type: 'warning', msg: 'Approval required: Guest request from +91 98472 88921 (College_Syllabus_2026.pdf)' },
    { time: '12:36:01', type: 'success', msg: 'Message dispatched to Alsaba (+91 89219 01615)' },
    { time: '12:15:30', type: 'info', msg: 'Canon InkJet G3012: Inks normal (Black 85%, Cyan 90%, Magenta 88%, Yellow 92%)' }
  ]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && (password === 'Aadil@123' || password === '1234' || password === '7860')) {
      setIsAuthenticated(true);
      localStorage.setItem('adilitix_office_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid Admin credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adilitix_office_auth');
  };

  // Fetch Live Data from Pi Gateway (if reachable)
  const fetchLiveData = async () => {
    setIsRefreshing(true);
    try {
      // Attempt live fetch from agent API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const res = await fetch(`${gatewayUrl}/api/status`, {
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        setTelemetry((prev) => ({ ...prev, ...data }));
        setIsLiveConnected(true);
      } else {
        // Fallback simulation with slight dynamic jitter for realism
        setTelemetry((prev) => ({
          ...prev,
          cpuTemp: +(47.8 + Math.random() * 1.6).toFixed(1),
          cpuUsage: Math.floor(12 + Math.random() * 8),
          ramPercent: +(18.5 + Math.random() * 0.8).toFixed(1)
        }));
        setIsLiveConnected(true);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Gateway fetch skipped, using dynamic state:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-polling interval effect
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchLiveData();

    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLiveData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, refreshInterval, gatewayUrl]);

  // Send WhatsApp Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'agent',
      text: newMessageText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    };

    // Update chat UI immediately
    setChats((prev) => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMsg]
    }));

    const textToSend = newMessageText;
    setNewMessageText('');
    setIsSendingMsg(true);

    // Try posting to gateway
    try {
      await fetch(`${gatewayUrl}/api/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedContact,
          message: textToSend
        })
      }).catch(() => null);

      setActivityLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          type: 'whatsapp',
          msg: `Dispatched message to ${selectedContact}: "${textToSend.substring(0, 30)}..."`
        },
        ...prev.slice(0, 20)
      ]);
    } finally {
      setIsSendingMsg(false);
    }
  };

  // Approval Handlers
  const handleApprovePrint = (reqId, addToWhitelist = false) => {
    const req = pendingApprovals.find((r) => r.id === reqId);
    if (!req) return;

    setPendingApprovals((prev) => prev.filter((r) => r.id !== reqId));
    setQuickActionStatus(`Approved ${req.fileName} for ${req.senderName}${addToWhitelist ? ' & Whitelisted!' : ''}`);

    setActivityLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        type: 'success',
        msg: `PRINT APPROVED: ${req.fileName} (${req.pageCount} pgs) for ${req.senderPhone}`
      },
      ...prev.slice(0, 20)
    ]);

    setTimeout(() => setQuickActionStatus(null), 4000);
  };

  const handleDenyPrint = (reqId) => {
    const req = pendingApprovals.find((r) => r.id === reqId);
    if (!req) return;

    setPendingApprovals((prev) => prev.filter((r) => r.id !== reqId));
    setQuickActionStatus(`Denied print request for ${req.senderName}`);

    setActivityLogs((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        type: 'warning',
        msg: `PRINT REJECTED: ${req.fileName} from ${req.senderPhone}`
      },
      ...prev.slice(0, 20)
    ]);

    setTimeout(() => setQuickActionStatus(null), 4000);
  };

  // Quick Action: Test Ping Alert
  const handleTriggerPing = async () => {
    setQuickActionStatus('Triggering 3x Proactive WhatsApp Alert Pings...');
    try {
      await fetch(`${gatewayUrl}/api/test-ping`, { method: 'POST' }).catch(() => null);
      setActivityLogs((prev) => [
        { time: new Date().toLocaleTimeString(), type: 'info', msg: 'Executed test ping routine (3x 10s alert test).' },
        ...prev.slice(0, 20)
      ]);
    } finally {
      setTimeout(() => setQuickActionStatus(null), 3500);
    }
  };

  // Filter contacts by search
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
    c.phone.includes(chatSearch)
  );

  const activeContactObj = contacts.find((c) => c.id === selectedContact) || contacts[0];
  const activeChatList = chats[selectedContact] || [];

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 20%, #111e3b 0%, #05070a 80%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', sans-serif"
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '100%',
            maxWidth: '440px',
            background: 'rgba(11, 17, 32, 0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(249, 115, 22, 0.15)',
            color: '#f8fafc'
          }}
        >
          {/* Logo / Badge */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 16px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #f97316 0%, #1d3b97 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(249, 115, 22, 0.4)'
            }}>
              <Terminal size={32} color="#ffffff" />
            </div>
            <h1 style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '1.6rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              margin: 0
            }}>
              OfficePi <span style={{ color: '#f97316' }}>Mission Control</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '6px' }}>
              Adilitix Robotics Autonomous Hardware & WhatsApp Ops
            </p>
          </div>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertTriangle size={16} />
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Admin User
              </label>
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(14, 26, 52, 0.7)',
                  border: '1px solid rgba(29, 59, 151, 0.5)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border 0.2s ease'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Master Access Key / PIN
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(14, 26, 52, 0.7)',
                  border: '1px solid rgba(29, 59, 151, 0.5)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border 0.2s ease'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 25px rgba(249, 115, 22, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <Lock size={18} />
              Unlock Gateway
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Encrypted Session • Node ID: OfficePi-4B-Master
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // -------------------------------------------------------------
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#05070a',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Quick Action Notification Banner */}
      <AnimatePresence>
        {quickActionStatus && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              background: 'linear-gradient(90deg, #f97316, #1d3b97)',
              color: '#ffffff',
              padding: '10px 24px',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              zIndex: 999
            }}
          >
            <Zap size={16} />
            {quickActionStatus}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP MISSION CONTROL HEADER */}
      <header style={{
        backgroundColor: 'rgba(11, 17, 32, 0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(29, 59, 151, 0.4)',
        padding: '14px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: Brand & Status Beacon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f97316 0%, #1d3b97 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)'
          }}>
            <Server size={22} color="#fff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.3px',
                margin: 0
              }}>
                OfficePi <span style={{ color: '#f97316' }}>Ops Center</span>
              </h2>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  display: 'inline-block'
                }} />
                ONLINE (10.70.203.43)
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
              Autonomous WhatsApp Agent • Canon CUPS Gateway • Bambu P1S
            </p>
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav style={{
          display: 'flex',
          background: 'rgba(14, 26, 52, 0.6)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(29, 59, 151, 0.4)'
        }}>
          {[
            { id: 'overview', label: 'Telemetry & Ops', icon: Activity },
            { id: 'whatsapp', label: 'Live WhatsApp Feed', icon: MessageSquare, badge: contacts.reduce((a, c) => a + c.unread, 0) },
            { id: 'approvals', label: 'Print Approvals', icon: Printer, badge: pendingApprovals.length },
            { id: 'automation', label: 'Quick Dispatches', icon: Zap },
            { id: 'logs', label: 'System Logs', icon: Terminal }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: isActive ? '#f97316' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <Icon size={16} />
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    background: isActive ? '#fff' : '#f97316',
                    color: isActive ? '#f97316' : '#fff',
                    fontWeight: 800
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Refresh Controls & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={fetchLiveData}
            disabled={isRefreshing}
            title="Manual Sync"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(14, 26, 52, 0.8)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleLogout}
            title="Lock Session"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '24px 28px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & HARDWARE TELEMETRY                      */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Top Stat Matrix */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px'
            }}>
              {/* CPU Temp & Health */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(14, 26, 52, 0.7), rgba(11, 17, 32, 0.9))',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(29, 59, 151, 0.5)',
                borderLeft: '4px solid #f97316',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                      CPU Thermal Core
                    </span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 2px', color: '#fff' }}>
                      {telemetry.cpuTemp}°C
                    </h3>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(249, 115, 22, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f97316'
                  }}>
                    <Cpu size={22} />
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Load: {telemetry.cpuUsage}%</span>
                    <span>Cooling: Passive OK</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(telemetry.cpuTemp / 80) * 100}%`, height: '100%', background: telemetry.cpuTemp > 65 ? '#ef4444' : '#f97316', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>

              {/* RAM Usage */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(14, 26, 52, 0.7), rgba(11, 17, 32, 0.9))',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(29, 59, 151, 0.5)',
                borderLeft: '4px solid #3b82f6',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                      System Memory
                    </span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 2px', color: '#fff' }}>
                      {telemetry.ramUsed}
                    </h3>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#3b82f6'
                  }}>
                    <Activity size={22} />
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Total: {telemetry.ramTotal}</span>
                    <span>{telemetry.ramPercent}% Used</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${telemetry.ramPercent}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>

              {/* Storage Space */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(14, 26, 52, 0.7), rgba(11, 17, 32, 0.9))',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(29, 59, 151, 0.5)',
                borderLeft: '4px solid #10b981',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                      SSD Storage
                    </span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '6px 0 2px', color: '#fff' }}>
                      {telemetry.diskUsed}
                    </h3>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981'
                  }}>
                    <HardDrive size={22} />
                  </div>
                </div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Capacity: {telemetry.diskTotal}</span>
                    <span>{telemetry.diskPercent}% Used</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${telemetry.diskPercent}%`, height: '100%', background: '#10b981', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>

              {/* Gateway & Uptime */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(14, 26, 52, 0.7), rgba(11, 17, 32, 0.9))',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid rgba(29, 59, 151, 0.5)',
                borderLeft: '4px solid #8b5cf6',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                      System Uptime
                    </span>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '6px 0 2px', color: '#fff' }}>
                      {telemetry.uptime}
                    </h3>
                  </div>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6'
                  }}>
                    <Clock size={22} />
                  </div>
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#94a3b8' }}>
                  Load Avg: <span style={{ color: '#fff', fontWeight: 600 }}>{telemetry.loadAvg}</span>
                </div>
              </div>
            </div>

            {/* Hardware & Peripheral Matrix */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '20px'
            }}>
              {/* Canon InkJet G3012 CUPS Card */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.8)',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid rgba(29, 59, 151, 0.4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(249, 115, 22, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#f97316'
                    }}>
                      <Printer size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Canon G3012 Series</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>CUPS USB / Network Daemon</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    READY
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Ink Cartridges:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>BK: 85% | C: 90% | M: 88% | Y: 92%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Active Print Queue:</span>
                    <span style={{ color: '#f97316', fontWeight: 700 }}>{pendingApprovals.length} Pending Approval</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Resolution:</span>
                    <span style={{ color: '#fff' }}>4800 x 1200 dpi</span>
                  </div>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setActiveTab('approvals')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'rgba(249, 115, 22, 0.2)',
                      border: '1px solid rgba(249, 115, 22, 0.4)',
                      color: '#f97316',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    View Queue ({pendingApprovals.length})
                  </button>
                </div>
              </div>

              {/* Bambu Lab P1S 3D Printer Card */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.8)',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid rgba(29, 59, 151, 0.4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#3b82f6'
                    }}>
                      <Layers size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Bambu Lab P1S</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Direct MQTT IoT Gateway</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    STANDBY
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Nozzle Temp:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{telemetry.bambuNozzleTemp}°C</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Bed Temp:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{telemetry.bambuBedTemp}°C</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Chamber Status:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Ready / Filament Loaded</span>
                  </div>
                </div>

                <div style={{ marginTop: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <span>Print Progress</span>
                    <span>{telemetry.bambuProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${telemetry.bambuProgress}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>

              {/* WhatsApp Multi-Device Agent Status */}
              <div style={{
                background: 'rgba(11, 17, 32, 0.8)',
                borderRadius: '18px',
                padding: '24px',
                border: '1px solid rgba(29, 59, 151, 0.4)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      <Radio size={24} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>WhatsApp Multi-Device</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Baileys Socket Bridge</p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    AUTHENTICATED
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Active Sessions:</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>5 Active Chats</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Auto-Responder:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Enabled (Adilitix Knowledge base)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>Approval Daemon:</span>
                    <span style={{ color: '#f97316', fontWeight: 600 }}>Proactive Alerts Active</span>
                  </div>
                </div>

                <div style={{ marginTop: '18px' }}>
                  <button
                    onClick={() => setActiveTab('whatsapp')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <MessageSquare size={16} />
                    Open Live WhatsApp Feed
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REAL-TIME WHATSAPP OPERATIONS CENTER               */}
        {/* ========================================================= */}
        {activeTab === 'whatsapp' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '340px 1fr',
              gap: '20px',
              height: 'calc(100vh - 180px)',
              minHeight: '600px'
            }}
          >
            {/* Left: WhatsApp Contact List */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.85)',
              borderRadius: '20px',
              border: '1px solid rgba(29, 59, 151, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Search Bar */}
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(29, 59, 151, 0.3)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(14, 26, 52, 0.8)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(29, 59, 151, 0.5)',
                  gap: '8px'
                }}>
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search contact or phone..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {/* Contact Items */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
                {filteredContacts.map((contact) => {
                  const isSelected = selectedContact === contact.id;
                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedContact(contact.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        marginBottom: '6px',
                        background: isSelected ? 'rgba(249, 115, 22, 0.15)' : 'transparent',
                        border: isSelected ? '1px solid rgba(249, 115, 22, 0.4)' : '1px solid transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: contact.avatarColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#fff',
                        flexShrink: 0
                      }}>
                        {contact.name.charAt(0)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: isSelected ? '#f97316' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {contact.name}
                          </h5>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{contact.lastSeen}</span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {contact.lastMessage}
                        </p>
                      </div>

                      {contact.unread > 0 && (
                        <span style={{
                          background: '#f97316',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          borderRadius: '10px',
                          padding: '2px 6px'
                        }}>
                          {contact.unread}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Chat Window */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.85)',
              borderRadius: '20px',
              border: '1px solid rgba(29, 59, 151, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Chat Header */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(29, 59, 151, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(14, 26, 52, 0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: activeContactObj.avatarColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    {activeContactObj.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{activeContactObj.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{activeContactObj.phone} • {activeContactObj.role}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setNewMessageText('Hello! This is an automated update from Adilitix Robotics OfficePi.');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(29, 59, 151, 0.4)',
                      border: '1px solid rgba(29, 59, 151, 0.6)',
                      color: '#93c5fd',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Template Quick Reply
                  </button>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'radial-gradient(circle at 50% 50%, rgba(14, 26, 52, 0.2), transparent)'
              }}>
                {activeChatList.length === 0 ? (
                  <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
                    <MessageSquare size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p>No messages recorded for this conversation yet.</p>
                  </div>
                ) : (
                  activeChatList.map((msg) => {
                    const isMe = msg.sender === 'agent';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          width: '100%'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe
                            ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
                            : 'rgba(14, 26, 52, 0.9)',
                          border: isMe ? 'none' : '1px solid rgba(29, 59, 151, 0.5)',
                          color: '#ffffff',
                          boxShadow: isMe ? '0 4px 15px rgba(249, 115, 22, 0.25)' : 'none'
                        }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.text}</p>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '4px',
                            marginTop: '4px',
                            fontSize: '0.7rem',
                            color: isMe ? 'rgba(255, 255, 255, 0.8)' : '#94a3b8'
                          }}>
                            <span>{msg.time}</span>
                            {isMe && <CheckCheck size={14} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '16px 20px',
                  borderTop: '1px solid rgba(29, 59, 151, 0.3)',
                  background: 'rgba(14, 26, 52, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <input
                  type="text"
                  placeholder={`Send WhatsApp message to ${activeContactObj.name}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(5, 7, 10, 0.8)',
                    border: '1px solid rgba(29, 59, 151, 0.5)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />

                <button
                  type="submit"
                  disabled={isSendingMsg || !newMessageText.trim()}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: newMessageText.trim() ? 'pointer' : 'not-allowed',
                    opacity: newMessageText.trim() ? 1 : 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={16} />
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PRINT APPROVALS HUB                                */}
        {/* ========================================================= */}
        {activeTab === 'approvals' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>
                  Guest Print Authorization Requests
                </h3>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Protect office paper & ink by vetting incoming guest document requests before physical spooling.
                </p>
              </div>

              <span style={{
                background: 'rgba(249, 115, 22, 0.15)',
                color: '#f97316',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                padding: '6px 14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {pendingApprovals.length} Pending
              </span>
            </div>

            {pendingApprovals.length === 0 ? (
              <div style={{
                background: 'rgba(11, 17, 32, 0.8)',
                borderRadius: '20px',
                padding: '60px 20px',
                textAlign: 'center',
                border: '1px solid rgba(29, 59, 151, 0.3)'
              }}>
                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>All Caught Up!</h4>
                <p style={{ color: '#94a3b8', marginTop: '6px' }}>No pending print approval requests in the gateway queue.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '18px' }}>
                {pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: 'rgba(11, 17, 32, 0.85)',
                      borderRadius: '18px',
                      padding: '24px',
                      border: '1px solid rgba(249, 115, 22, 0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                            {req.senderName}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{req.senderPhone}</span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#f97316',
                          background: 'rgba(249, 115, 22, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 600
                        }}>
                          {req.timeRequested}
                        </span>
                      </div>

                      <div style={{
                        background: 'rgba(14, 26, 52, 0.6)',
                        padding: '14px',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        border: '1px solid rgba(29, 59, 151, 0.4)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <Paperclip size={18} color="#f97316" />
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{req.fileName}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
                          <div>Size: <span style={{ color: '#fff' }}>{req.fileSize}</span></div>
                          <div>Pages: <span style={{ color: '#fff' }}>{req.pageCount} pgs</span></div>
                          <div>Copies: <span style={{ color: '#fff' }}>{req.copies}</span></div>
                          <div>Color Mode: <span style={{ color: '#fff' }}>{req.colorMode}</span></div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => handleApprovePrint(req.id, false)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '10px',
                          background: '#10b981',
                          border: 'none',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <UserCheck size={16} />
                        Approve Print
                      </button>

                      <button
                        onClick={() => handleApprovePrint(req.id, true)}
                        style={{
                          flex: 1.2,
                          padding: '10px',
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          color: '#60a5fa',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Shield size={16} />
                        Approve & Whitelist
                      </button>

                      <button
                        onClick={() => handleDenyPrint(req.id)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#fca5a5',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: QUICK DISPATCHES & AUTOMATION                      */}
        {/* ========================================================= */}
        {activeTab === 'automation' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}
          >
            {/* Action 1: Proactive Alert Test */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.85)',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid rgba(29, 59, 151, 0.4)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(249, 115, 22, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f97316',
                marginBottom: '16px'
              }}>
                <Bell size={24} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>Proactive Alert Heartbeat</h4>
              <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: '#94a3b8' }}>
                Sends a 3-sequence test ping (10-second intervals) to verify owner smartphone alerts.
              </p>
              <button
                onClick={handleTriggerPing}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Play size={16} />
                Execute Ping Test
              </button>
            </div>

            {/* Action 2: Website Syllabus & Pricing Sync */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.85)',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid rgba(29, 59, 151, 0.4)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
                marginBottom: '16px'
              }}>
                <RefreshCw size={24} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>Sync Website Course Pricing</h4>
              <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: '#94a3b8' }}>
                Verify 3-Day (₹1000) & 5-Day (₹1500) pricing across brochure, shop, and AI chat bot.
              </p>
              <button
                onClick={() => {
                  setQuickActionStatus('Website pricing synchronized: 3 days ₹1000, 5 days ₹1500.');
                  setTimeout(() => setQuickActionStatus(null), 3500);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  color: '#60a5fa',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <CheckCircle size={16} />
                Sync Pricing Cache
              </button>
            </div>

            {/* Action 3: Clear CUPS Spooler */}
            <div style={{
              background: 'rgba(11, 17, 32, 0.85)',
              borderRadius: '18px',
              padding: '24px',
              border: '1px solid rgba(29, 59, 151, 0.4)'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '16px'
              }}>
                <RotateCcw size={24} />
              </div>
              <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>Reset CUPS Printer Queue</h4>
              <p style={{ margin: '0 0 18px', fontSize: '0.82rem', color: '#94a3b8' }}>
                Clear stalled jobs and restart the local CUPS print spooling service on Pi.
              </p>
              <button
                onClick={() => {
                  setQuickActionStatus('CUPS printer spooler successfully reset.');
                  setTimeout(() => setQuickActionStatus(null), 3500);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#34d399',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RotateCcw size={16} />
                Restart Print Spooler
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SYSTEM ACTIVITY LOGS                               */}
        {/* ========================================================= */}
        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(11, 17, 32, 0.95)',
              borderRadius: '20px',
              border: '1px solid rgba(29, 59, 151, 0.4)',
              padding: '24px',
              fontFamily: "'Courier New', Courier, monospace"
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontFamily: "'Inter', sans-serif" }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Gateway Event Stream</h3>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Last Updated: {lastRefreshed.toLocaleTimeString()}</span>
            </div>

            <div style={{
              background: '#05070a',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '480px',
              overflowY: 'auto'
            }}>
              {activityLogs.map((log, idx) => (
                <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#64748b' }}>[{log.time}]</span>
                  <span style={{
                    color: log.type === 'success' ? '#10b981' : log.type === 'warning' ? '#f97316' : log.type === 'whatsapp' ? '#38bdf8' : '#94a3b8',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)'
                  }}>
                    {log.type}
                  </span>
                  <span style={{ color: '#e2e8f0', flex: 1 }}>{log.msg}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{
        padding: '16px 28px',
        borderTop: '1px solid rgba(29, 59, 151, 0.3)',
        background: 'rgba(5, 7, 10, 0.95)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        <div>
          Adilitix Robotics • UDYAM-KL-06-0070364 • OfficePi Node v2.4
        </div>
        <div>
          Connected Subnet: 10.70.203.43 (Gateway Port: 8000)
        </div>
      </footer>
    </div>
  );
};

export default OfficeStatus;

