import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Package,
    Award,
    LogOut,
    LayoutDashboard,
    ExternalLink,
    X,
    Search,
    ChevronRight,
    Trash2,
    Plus,
    ShoppingCart,
    Check,
    CheckCircle,
    Clock,
    ShieldCheck,
    UserPlus,
    Settings,
    FileSpreadsheet,
    Crown,
    Upload,
    Edit3,
    Hash,
    Eye,
    Bell,
    Info,
    Activity,
    MessageSquare,
    ChevronLeft,
    Calendar
} from 'lucide-react';
import { io } from 'socket.io-client';

// ... external components
const ApprovalToggle = ({ status, onToggle }) => {
    const positions = { rejected: 0, pending: 1, approved: 2 };
    const colors = { rejected: '#ef4444', pending: '#64748b', approved: '#10b981' };

    return (
        <div className="approval-toggle-container">
            <div className="toggle-track">
                <motion.div
                    className="toggle-thumb"
                    animate={{ x: positions[status] * 30 }}
                    style={{ backgroundColor: colors[status] }}
                />
                <button onClick={() => onToggle('rejected')} className="toggle-btn-zone" />
                <button onClick={() => onToggle('pending')} className="toggle-btn-zone" />
                <button onClick={() => onToggle('approved')} className="toggle-btn-zone" />
            </div>
            <span className="status-label" style={{ color: colors[status] }}>{status}</span>
        </div>
    );
};

const CertificatePaper = ({ data, settings, scale = 1 }) => {
    if (!settings) return null;

    const { title, subtitle, description, signatureName, signatureRole, themeColor } = settings;
    // Default data if previewing without specific data
    const studentName = data?.studentName || 'Student Name';
    const workshopName = data?.workshopName || 'Workshop Title';
    const dateStr = data?.date ? new Date(data.date).toLocaleDateString() : new Date().toLocaleDateString();
    const certId = data?.certificateId || 'ADX-EV-001';

    return (
        <div className="certificate-paper-container" style={{
            width: '800px',
            height: '600px',
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'top left', // Scale from top-left for preview container
            marginBottom: scale < 1 ? `-${(1 - scale) * 600}px` : '0', // Negative margin to reduce whitespace when scaled down
            marginRight: scale < 1 ? `-${(1 - scale) * 800}px` : '0'
        }}>
            <div className="certificate-paper" style={{
                width: '100%',
                height: '100%',
                background: '#fff',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: `10px solid ${themeColor}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Corners (Optional, kept simple for now) */}

                {/* Header */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <h1 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '3.5rem',
                        color: themeColor,
                        margin: 0,
                        letterSpacing: '2px',
                        textTransform: 'uppercase'
                    }}>
                        {title}
                    </h1>
                    <p style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '1.2rem',
                        color: '#64748b',
                        marginTop: '10px',
                        letterSpacing: '1px'
                    }}>
                        {subtitle}
                    </p>
                </div>

                {/* Main Content */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <h2 style={{
                        fontFamily: "'Great Vibes', cursive",
                        fontSize: '4.5rem',
                        color: '#1e293b',
                        margin: '20px 0',
                        lineHeight: 1
                    }}>
                        {studentName}
                    </h2>
                    <p style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '1.1rem',
                        color: '#475569',
                        maxWidth: '80%',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        {description} <br />
                        <span style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: themeColor,
                            display: 'block',
                            marginTop: '10px'
                        }}>
                            {workshopName}
                        </span>
                    </p>
                </div>

                {/* Footer / Signatures */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0 40px',
                    marginTop: '20px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: '1rem',
                            borderBottom: '2px solid #cbd5e1',
                            paddingBottom: '5px',
                            minWidth: '200px',
                            marginBottom: '5px',
                            color: '#1e293b'
                        }}>
                            {dateStr}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Date Issued</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontFamily: "'Great Vibes', cursive",
                            fontSize: '2rem',
                            color: themeColor,
                            marginBottom: '-10px' // Pull signature closer to line
                        }}>
                            {signatureName}
                        </div>
                        <div style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: '1rem',
                            borderBottom: '2px solid #cbd5e1',
                            paddingBottom: '5px',
                            minWidth: '200px',
                            marginBottom: '5px'
                        }}>
                            {/* Line for signature */}
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>{signatureRole}</span>
                    </div>
                </div>

                {/* ID Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.7rem',
                    color: '#cbd5e1',
                    fontFamily: 'monospace'
                }}>
                    ID: {certId}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    console.log('AdminDashboard: Component Render Start');
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [completions, setCompletions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', count: '', category: '' });
    const [showCertificatePreview, setShowCertificatePreview] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const [certSettings, setCertSettings] = useState({
        title: 'Certificate of Achievement',
        subtitle: 'This is to certify that',
        description: 'has successfully completed the workshop on',
        signatureName: 'Aadil',
        signatureRole: 'Program Director',
        themeColor: '#059669'
    });
    const [showCertSettings, setShowCertSettings] = useState(false);
    const [workshops, setWorkshops] = useState([]);
    const [showAddCompletion, setShowAddCompletion] = useState(false);
    const [newCompletion, setNewCompletion] = useState({ studentName: '', username: '', workshopId: '' });

    // Superadmin features
    const adminRole = localStorage.getItem('adilitix_role') || 'admin';
    const adminUsername = localStorage.getItem('adilitix_username') || 'Admin';
    const isSuperAdmin = adminRole === 'superadmin';
    const [adminPerms, setAdminPerms] = useState(() => {
        try { return JSON.parse(localStorage.getItem('adilitix_permissions') || 'null'); } catch { return null; }
    });
    const hasPerm = (perm) => isSuperAdmin || !adminPerms || adminPerms[perm] !== false;
    const [adminList, setAdminList] = useState([]);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ username: '', password: '', role: 'admin' });
    const [editingPermsAdmin, setEditingPermsAdmin] = useState(null);
    const [pwChange, setPwChange] = useState({ current: '', newPw: '', confirm: '' });
    const [pwChangeMsg, setPwChangeMsg] = useState('');
    const [sheetImport, setSheetImport] = useState({ spreadsheetId: '', sheetName: '', eventId: '' });
    const [importResult, setImportResult] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const [serviceAccountEmail, setServiceAccountEmail] = useState('');
    const [copiedEmail, setCopiedEmail] = useState(false);
    const [notices, setNotices] = useState([]);
    const [showAddNotice, setShowAddNotice] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: '', content: '', priority: 'normal' });
    const [systemStatus, setSystemStatus] = useState(null);
    const [showSystemStatus, setShowSystemStatus] = useState(false);
    const [calendarDate, setCalendarDate] = useState(new Date());

    // Adilitix Events (Workshop Events with permanent IDs)
    const [adilitixEvents, setAdilitixEvents] = useState([]);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', workshopId: '', date: new Date().toISOString().split('T')[0] });
    const [editingEvent, setEditingEvent] = useState(null);
    const [regEventFilter, setRegEventFilter] = useState('all');
    const [selectedRegs, setSelectedRegs] = useState(new Set());
    const [copiedWsId, setCopiedWsId] = useState('');


    const rawBase = import.meta.env.VITE_SERVER_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://hyperclass.onrender.com');
    const BASE_URL = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

    const HYPERCLASS_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://hyperclass.vercel.app';

    useEffect(() => {
        console.log('AdminDashboard: Initializing...');
        const isAdmin = localStorage.getItem('adilitix_admin');
        if (!isAdmin) {
            console.log('AdminDashboard: Not logged in, redirecting...');
            navigate('/admin-login');
        } else {
            console.log('AdminDashboard: Logged in as', adminUsername);
            fetchData();

            /* Socket temporarily disabled for stability diagnostic
            const socket = io(BASE_URL);
            socket.on('adilitix_update', () => {
                console.log('🔄 Data update received via socket');
                fetchData(true);
            });
            return () => socket.disconnect();
            */
        }
    }, [navigate]);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const fetches = [
                fetch(`${BASE_URL}/api/adilitix/registrations`),
                fetch(`${BASE_URL}/api/adilitix/inventory`),
                fetch(`${BASE_URL}/api/adilitix/orders`),
                fetch(`${BASE_URL}/api/adilitix/completions`),
                fetch(`${BASE_URL}/api/adilitix/certificates/settings`),
                fetch(`${BASE_URL}/api/workshops`),
                fetch(`${BASE_URL}/api/adilitix/admins`),
                fetch(`${BASE_URL}/api/adilitix/events`),
                fetch(`${BASE_URL}/api/adilitix/notices`)
            ];
            const [regRes, invRes, ordRes, compRes, setRes, wsRes, admRes, evRes, noticeRes] = await Promise.all(fetches);

            setRegistrations(await regRes.json());
            setInventory(await invRes.json());
            setOrders(await ordRes.json());
            setCompletions(await compRes.json());

            const settings = await setRes.json();
            if (settings && settings.title) setCertSettings(settings);

            const wsData = await wsRes.json();
            if (Array.isArray(wsData)) setWorkshops(wsData);

            const admData = await admRes.json();
            if (Array.isArray(admData)) setAdminList(admData);

            const evData = await evRes.json();
            if (Array.isArray(evData)) setAdilitixEvents(evData);

            const noticeData = await noticeRes.json();
            if (Array.isArray(noticeData)) setNotices(noticeData);

            // Fetch system status if superadmin
            if (isSuperAdmin) {
                const statusRes = await fetch(`${BASE_URL}/api/system-status`);
                const statusData = await statusRes.json();
                setSystemStatus(statusData);
            }

            // Fetch service account email
            const saRes = await fetch(`${BASE_URL}/api/adilitix/service-account-email`);
            const saData = await saRes.json();
            if (saData.email) setServiceAccountEmail(saData.email);

        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adilitix_admin');
        localStorage.removeItem('adilitix_username');
        localStorage.removeItem('adilitix_role');
        navigate('/');
    };

    const deleteRegistration = async (id) => {
        if (!window.confirm('Are you sure you want to delete this registration?')) return;
        await fetch(`${BASE_URL}/api/adilitix/registrations/${id}`, { method: 'DELETE' });
        fetchData(true);
    };

    const bulkDeleteRegistrations = async () => {
        if (selectedRegs.size === 0) return;
        if (!window.confirm(`Delete ${selectedRegs.size} selected registration(s)?`)) return;
        await fetch(`${BASE_URL}/api/adilitix/registrations/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [...selectedRegs] })
        });
        setSelectedRegs(new Set());
        fetchData(true);
    };

    // Adilitix Event CRUD
    const createAdilitixEvent = async (e) => {
        e.preventDefault();
        const res = await fetch(`${BASE_URL}/api/adilitix/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newEvent)
        });
        const data = await res.json();
        if (data.success) {
            setShowCreateEvent(false);
            setNewEvent({ title: '', description: '', workshopId: '', date: new Date().toISOString().split('T')[0] });
            fetchData(true);
        } else {
            alert(data.message || 'Failed');
        }
    };

    const updateAdilitixEvent = async (e) => {
        e.preventDefault();
        if (!editingEvent) return;
        await fetch(`${BASE_URL}/api/adilitix/events/${editingEvent.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: editingEvent.title, description: editingEvent.description })
        });
        setEditingEvent(null);
        fetchData(true);
    };

    const deleteAdilitixEvent = async (id) => {
        if (!window.confirm('Delete this event? (Registrations will NOT be deleted)')) return;
        await fetch(`${BASE_URL}/api/adilitix/events/${id}`, { method: 'DELETE' });
        if (regEventFilter === id) setRegEventFilter('all');
        fetchData(true);
    };

    // --- PASSWORD CHANGE ---
    const changePassword = async (e) => {
        e.preventDefault();
        setPwChangeMsg('');
        if (pwChange.newPw !== pwChange.confirm) {
            setPwChangeMsg('Passwords do not match'); return;
        }
        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: adminUsername, currentPassword: pwChange.current, newPassword: pwChange.newPw })
            });
            const data = await res.json();
            setPwChangeMsg(data.message || (data.success ? 'Updated!' : 'Failed'));
            if (data.success) setPwChange({ current: '', newPw: '', confirm: '' });
        } catch (err) {
            setPwChangeMsg('Error: ' + err.message);
        }
    };

    // --- ATTENDANCE ---
    const markAttendance = async (regId, attendance) => {
        await fetch(`${BASE_URL}/api/adilitix/registrations/${regId}/attendance`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendance })
        });
        fetchData(true);
    };

    // --- EVENT STATUS ---
    const updateEventStatus = async (eventId, status) => {
        await fetch(`${BASE_URL}/api/adilitix/events/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData(true);
    };

    // --- CSV EXPORT ---
    const exportCSV = (eventId) => {
        const url = `${BASE_URL}/api/adilitix/registrations/export${eventId ? `?eventId=${eventId}` : ''}`;
        window.open(url, '_blank');
    };

    // --- ADMIN PERMISSIONS ---
    const updateAdminPermissions = async (username, permissions) => {
        await fetch(`${BASE_URL}/api/adilitix/admins/${encodeURIComponent(username)}/permissions`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions })
        });
        fetchData(true);
    };

    // --- QUICK CONTACT ---
    const openWhatsApp = (phone, name) => {
        const cleanPhone = (phone || '').replace(/[^0-9+]/g, '');
        if (!cleanPhone) { alert('No phone number available'); return; }
        window.open(`https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Hi ${name}, `)}`, '_blank');
    };
    const openEmail = (email, name) => {
        if (!email) { alert('No email available'); return; }
        window.open(`mailto:${email}?subject=Regarding your registration&body=Hi ${encodeURIComponent(name)},%0A%0A`, '_blank');
    };

    const updateRegStatus = async (id, status) => {
        await fetch(`${BASE_URL}/api/adilitix/registrations/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData(true);
    };

    const deleteInventoryItem = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        await fetch(`${BASE_URL}/api/adilitix/inventory/${id}`, { method: 'DELETE' });
        fetchData(true);
    };

    const addInventoryItem = async (e) => {
        e.preventDefault();
        if (!newItem.name) return;

        await fetch(`${BASE_URL}/api/adilitix/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newItem.name,
                count: parseInt(newItem.count, 10) || 0,
                category: newItem.category
            })
        });

        setNewItem({ name: '', count: '', category: '' });
        setShowAddProduct(false);
        fetchData(true);
    };

    const updateInventoryCount = async (id, currentCount, delta) => {
        const newCount = Math.max(0, currentCount + delta);
        await fetch(`${BASE_URL}/api/adilitix/inventory/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: newCount })
        });
        fetchData(true);
    };

    const updateOrderStatus = async (id, status) => {
        await fetch(`${BASE_URL}/api/adilitix/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        fetchData(true);
    };

    const deleteOrder = async (id) => {
        if (!window.confirm('Delete this order?')) return;
        await fetch(`${BASE_URL}/api/adilitix/orders/${id}`, { method: 'DELETE' });
        fetchData(true);
    };

    const issueCertificate = async (workshopId, username) => {
        await fetch(`${BASE_URL}/api/adilitix/certificates/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workshopId, username })
        });
        fetchData(true);
    };

    const viewCertificate = async (workshopId, username) => {
        const res = await fetch(`${BASE_URL}/api/adilitix/certificates/view/${workshopId}/${username}`);
        const data = await res.json();
        setCertificateData(data);
        setShowCertificatePreview(true);
    };

    const saveCertSettings = async (e) => {
        e.preventDefault();
        await fetch(`${BASE_URL}/api/adilitix/certificates/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(certSettings)
        });
        setShowCertSettings(false);
        fetchData(true);
    };

    const addCompletion = async (e) => {
        e.preventDefault();
        if (!newCompletion.username || !newCompletion.workshopId) return;
        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCompletion)
            });
            const data = await res.json();
            if (data.success) {
                setShowAddCompletion(false);
                setNewCompletion({ studentName: '', username: '', workshopId: '' });
                fetchData(true);
            } else {
                alert(data.message || 'Failed to add completion');
            }
        } catch (err) {
            alert('Error adding completion: ' + err.message);
        }
    };

    const deleteCompletion = async (workshopId, username) => {
        if (!window.confirm(`Remove completion for ${username}?`)) return;
        await fetch(`${BASE_URL}/api/adilitix/completions/${encodeURIComponent(workshopId)}/${encodeURIComponent(username)}`, { method: 'DELETE' });
        fetchData(true);
    };

    // Helper to resolve workshop name from ID
    const getWorkshopName = (workshopId) => {
        const ws = workshops.find(w => w.id === workshopId);
        return ws ? ws.title : workshopId;
    };

    // Admin management
    const addAdmin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/admins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAdmin)
            });
            const data = await res.json();
            if (data.success) {
                setShowAddAdmin(false);
                setNewAdmin({ username: '', password: '', role: 'admin' });
                fetchData(true);
            }
        } catch (err) { alert('Error adding admin'); }
    };

    // --- NOTICEBOARD ---
    const postNotice = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/notices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newNotice, author: adminUsername })
            });
            if (res.ok) {
                setShowAddNotice(false);
                setNewNotice({ title: '', content: '', priority: 'normal' });
                fetchData(true);
            }
        } catch (err) { alert('Error posting notice'); }
    };

    const deleteNotice = async (id) => {
        if (!window.confirm('Delete this notice?')) return;
        await fetch(`${BASE_URL}/api/adilitix/notices/${id}`, { method: 'DELETE' });
        fetchData(true);
    };

    // --- CALENDAR HELPERS ---
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handleDayClick = (dayStr) => {
        setNewEvent({ ...newEvent, date: dayStr });
        setShowCreateEvent(true);
    };

    const renderCalendarView = () => {
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(calendarDate);

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return (
            <div className="calendar-view">
                <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <h2 className="cine-text" style={{ margin: 0 }}>{monthName} {year}</h2>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="cta-icon" onClick={() => setCalendarDate(new Date(year, month - 1))}><ChevronLeft size={18} /></button>
                            <button className="cta-icon" onClick={() => setCalendarDate(new Date())}><Clock size={18} /></button>
                            <button className="cta-icon" onClick={() => setCalendarDate(new Date(year, month + 1))}><ChevronRight size={18} /></button>
                        </div>
                    </div>
                    <button className="cta-primary" onClick={() => setShowCreateEvent(true)}><Plus size={18} /> New Event</button>
                </div>

                <div className="calendar-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--ad-border)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--ad-border)' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} style={{ background: 'var(--ad-bg-alt)', padding: '12px', textAlign: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--ad-text-muted)' }}>{d}</div>
                    ))}
                    {days.map((day, idx) => {
                        const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                        const dayEvents = adilitixEvents.filter(ev => {
                            if (!dateStr) return false;
                            const evDate = ev.date || ev.createdAt;
                            return evDate && typeof evDate === 'string' && evDate.startsWith(dateStr);
                        });
                        const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString();

                        return (
                            <div key={idx} onClick={() => day && handleDayClick(dateStr)} style={{ background: 'var(--ad-card-bg)', minHeight: '120px', padding: '10px', position: 'relative', cursor: day ? 'pointer' : 'default' }}>
                                {day && (
                                    <>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isToday ? 'var(--ad-accent)' : 'inherit' }}>{day}</span>
                                        <div className="day-events" style={{ marginTop: '5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {dayEvents.map(ev => (
                                                <div key={ev.id} className="calendar-event-pill" style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', background: 'var(--ad-accent-light)', color: 'var(--ad-accent)', borderLeft: '3px solid var(--ad-accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {ev.title}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderNoticeboardView = () => (
        <div className="noticeboard-view">
            <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 className="cine-text" style={{ margin: 0, fontSize: '1.8rem' }}>Noticeboard</h2>
                    <p style={{ color: 'var(--ad-text-muted)' }}>Broadcast updates and announcements to the team</p>
                </div>
                <button className="cta-primary" onClick={() => setShowAddNotice(true)}><Bell size={18} /> Post New Notice</button>
            </div>

            <div className="notices-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                <AnimatePresence>
                    {notices.map(notice => (
                        <motion.div
                            key={notice.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="notice-card"
                            style={{
                                background: 'var(--ad-card-bg)',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid var(--ad-border)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <span style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    background: notice.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    color: notice.priority === 'high' ? '#ef4444' : '#10b981'
                                }}>
                                    {notice.priority}
                                </span>
                                {isSuperAdmin && (
                                    <button onClick={() => deleteNotice(notice.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{notice.title}</h3>
                            <p style={{ color: 'var(--ad-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1, whiteSpace: 'pre-wrap' }}>{notice.content}</p>
                            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--ad-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.6rem' }}>{notice.author.charAt(0)}</div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{notice.author}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--ad-text-muted)' }}>{new Date(notice.timestamp).toLocaleDateString()}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {notices.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '2px dashed var(--ad-border)' }}>
                        <Bell size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
                        <h3 style={{ opacity: 0.5 }}>No active notices</h3>
                        <p style={{ opacity: 0.3 }}>Post an update to get started</p>
                    </div>
                )}
            </div>

            {showAddNotice && (
                <div className="modal-overlay">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-card">
                        <div className="modal-header">
                            <h2>Post New Notice</h2>
                            <button onClick={() => setShowAddNotice(false)} className="close-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={postNotice}>
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" required value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="Enter notice headline" />
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea required value={newNotice.content} onChange={e => setNewNotice({ ...newNotice, content: e.target.value })} placeholder="What's the update?" style={{ minHeight: '120px' }} />
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select value={newNotice.priority} onChange={e => setNewNotice({ ...newNotice, priority: e.target.value })}>
                                    <option value="normal">Normal</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>
                            <button type="submit" className="cta-primary" style={{ width: '100%', marginTop: '10px' }}>Post Announcement</button>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );

    const renderSystemStatusModal = () => {
        if (!systemStatus) return null;
        const memUsed = ((systemStatus.totalMem - systemStatus.freeMem) / (1024 * 1024 * 1024)).toFixed(2);
        const memTotal = (systemStatus.totalMem / (1024 * 1024 * 1024)).toFixed(2);
        const uptimeH = (systemStatus.uptime / 3600).toFixed(1);

        return (
            <div className="modal-overlay" style={{ zIndex: 3000 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modal-card" style={{ maxWidth: '500px' }}>
                    <div className="modal-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Activity size={20} color="var(--ad-accent)" />
                            <h2>Server Diagnostics</h2>
                        </div>
                        <button onClick={() => setShowSystemStatus(false)} className="close-btn"><X size={20} /></button>
                    </div>
                    <div className="status-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
                        <div className="status-item" style={{ background: 'var(--ad-bg-alt)', padding: '15px', borderRadius: '12px' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--ad-text-muted)', textTransform: 'uppercase' }}>Uptime</label>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: '5px 0 0 0' }}>{uptimeH}h</p>
                        </div>
                        <div className="status-item" style={{ background: 'var(--ad-bg-alt)', padding: '15px', borderRadius: '12px' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--ad-text-muted)', textTransform: 'uppercase' }}>Memory</label>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: '5px 0 0 0' }}>{memUsed} / {memTotal} GB</p>
                        </div>
                        <div className="status-item" style={{ background: 'var(--ad-bg-alt)', padding: '15px', borderRadius: '12px' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--ad-text-muted)', textTransform: 'uppercase' }}>OS</label>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: '5px 0 0 0' }}>{systemStatus.platform} ({systemStatus.arch})</p>
                        </div>
                        <div className="status-item" style={{ background: 'var(--ad-bg-alt)', padding: '15px', borderRadius: '12px' }}>
                            <label style={{ fontSize: '0.7rem', color: 'var(--ad-text-muted)', textTransform: 'uppercase' }}>Active Clients</label>
                            <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: '5px 0 0 0' }}>{systemStatus.dbStats.activeSockets}</p>
                        </div>
                    </div>
                    <div style={{ marginTop: '20px', padding: '15px', background: 'var(--ad-accent-light)', borderRadius: '12px', border: '1px solid var(--ad-accent)' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: 'var(--ad-accent)', fontSize: '0.8rem' }}>Database Overview</h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>Registrations: <b>{systemStatus.dbStats.registrations}</b></span>
                            <span>Live Events: <b>{systemStatus.dbStats.events}</b></span>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--ad-text-muted)', marginTop: '20px' }}>Last Heartbeat: {new Date(systemStatus.timestamp).toLocaleTimeString()}</p>
                </motion.div>
            </div>
        );
    };

    // Helper to resolve workshop name from ID

    const removeAdmin = async (username) => {
        if (!window.confirm(`Remove admin "${username}"?`)) return;
        await fetch(`${BASE_URL}/api/adilitix/admins/${encodeURIComponent(username)}`, { method: 'DELETE' });
        fetchData(true);
    };

    // Google Sheets Import
    const importFromSheet = async (e) => {
        e.preventDefault();
        setImportLoading(true);
        setImportResult(null);
        try {
            const res = await fetch(`${BASE_URL}/api/adilitix/import-sheet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sheetImport)
            });
            const data = await res.json();
            setImportResult(data);
            if (data.success) fetchData(true);
        } catch (err) {
            setImportResult({ success: false, message: err.message });
        } finally {
            setImportLoading(false);
        }
    };

    const dashboardCards = [
        ...(hasPerm('viewRegistrations') ? [{
            id: 'registrations',
            title: 'Registrations',
            icon: <Users size={24} />,
            color: '#0066ff',
            count: `${registrations.length} Total • ${adilitixEvents.length} Events`,
            action: () => setActiveView('registrations')
        }] : []),
        {
            id: 'verification',
            title: 'Verification',
            icon: <ShieldCheck size={24} />,
            color: '#06b6d4',
            count: `${completions.length} Verified`,
            action: () => setActiveView('verification')
        },
        ...(hasPerm('viewOrders') ? [{
            id: 'orders',
            title: 'Store Orders',
            icon: <ShoppingCart size={24} />,
            color: '#10b981',
            count: `${orders.length} Pending`,
            action: () => setActiveView('orders')
        }] : []),
        ...(hasPerm('manageInventory') ? [{
            id: 'inventory',
            title: 'Inventory',
            icon: <Package size={24} />,
            color: '#f59e0b',
            count: `${inventory.length} SKUs`,
            action: () => setActiveView('inventory')
        }] : []),
        {
            id: 'noticeboard',
            title: 'Noticeboard',
            icon: <Bell size={24} />,
            color: '#8b5cf6',
            count: `${notices.length} Active`,
            action: () => setActiveView('noticeboard')
        },
        {
            id: 'calendar',
            title: 'Event Calendar',
            icon: <Calendar size={24} />,
            color: '#ec4899',
            count: `${adilitixEvents.length} Events`,
            action: () => setActiveView('calendar')
        },
        ...(hasPerm('issueCertificates') ? [{
            id: 'certificates',
            title: 'Manage Certificates',
            icon: <Award size={24} />,
            color: '#8b5cf6',
            count: `${completions.length} Completed`,
            action: () => setActiveView('certificates')
        }] : []),
        ...(isSuperAdmin ? [{
            id: 'admin-mgmt',
            title: 'Admin Management',
            icon: <Crown size={24} />,
            color: '#e11d48',
            count: `${adminList.length} Admins`,
            action: () => setActiveView('admin-mgmt')
        }] : []),
        ...(hasPerm('importSheets') ? [{
            id: 'import-sheet',
            title: 'Import from Sheets',
            icon: <FileSpreadsheet size={24} />,
            color: '#16a34a',
            count: 'Google Forms',
            action: () => setActiveView('import-sheet')
        }] : []),
        {
            id: 'settings',
            title: 'Settings',
            icon: <Settings size={24} />,
            color: '#6b7280',
            count: adminUsername,
            action: () => setActiveView('settings')
        }
    ];

    const renderRegistrationListView = () => {
        // Filter registrations by selected event
        const filteredRegs = registrations
            .filter(r => regEventFilter === 'all' || r.eventId === regEventFilter)
            .filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()));

        const allFilteredIds = filteredRegs.map(r => r.id);
        const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedRegs.has(id));

        const toggleSelectAll = () => {
            if (allSelected) {
                setSelectedRegs(new Set());
            } else {
                setSelectedRegs(new Set(allFilteredIds));
            }
        };

        const toggleSelect = (id) => {
            const next = new Set(selectedRegs);
            next.has(id) ? next.delete(id) : next.add(id);
            setSelectedRegs(next);
        };

        // Count per event
        const eventCounts = {};
        registrations.forEach(r => {
            const eid = r.eventId || 'uncategorized';
            eventCounts[eid] = (eventCounts[eid] || 0) + 1;
        });

        return (
            <motion.div key="registrations" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="view-container">
                <div className="view-header">
                    <h2>Registration Management</h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => fetchData(true)} className="cta-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} title="Refresh data">
                            🔄 Refresh
                        </button>
                        <button onClick={() => exportCSV(regEventFilter === 'all' ? '' : regEventFilter)} className="cta-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }} title="Download CSV">
                            📥 Export CSV
                        </button>
                        {hasPerm('createEditEvents') && (
                            <button onClick={() => setShowCreateEvent(true)} className="cta-primary-sm"><Plus size={16} /> New Event</button>
                        )}
                        <button onClick={() => setActiveView('dashboard')} className="close-view-btn"><X size={20} /></button>
                    </div>
                </div>

                {/* Event Tabs */}
                <div style={{
                    display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px',
                    padding: '4px', background: 'rgba(0,0,0,0.04)', borderRadius: '14px'
                }}>
                    <button
                        onClick={() => { setRegEventFilter('all'); setSelectedRegs(new Set()); }}
                        style={{
                            padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                            background: regEventFilter === 'all' ? 'var(--ad-primary)' : 'transparent',
                            color: regEventFilter === 'all' ? '#fff' : 'var(--ad-text-dim)',
                        }}
                    >
                        <Eye size={14} style={{ marginRight: '5px', verticalAlign: '-2px' }} />
                        View All ({registrations.length})
                    </button>
                    {adilitixEvents.map(ev => (
                        <button
                            key={ev.id}
                            onClick={() => { setRegEventFilter(ev.id); setSelectedRegs(new Set()); }}
                            style={{
                                padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
                                background: regEventFilter === ev.id ? 'var(--ad-primary)' : 'transparent',
                                color: regEventFilter === ev.id ? '#fff' : 'var(--ad-text-dim)',
                            }}
                        >
                            {ev.title} ({eventCounts[ev.id] || 0})
                        </button>
                    ))}
                </div>

                {/* Event Detail Card (when specific event selected) */}
                {regEventFilter !== 'all' && (() => {
                    const ev = adilitixEvents.find(e => e.id === regEventFilter);
                    if (!ev) return null;
                    const evRegs = registrations.filter(r => r.eventId === ev.id);
                    const attended = evRegs.filter(r => r.attendance === 'present').length;
                    const statusColors = { upcoming: '#3b82f6', active: '#10b981', completed: '#6b7280' };
                    const evStatus = ev.status || 'upcoming';
                    return (
                        <div style={{
                            background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.15)',
                            borderRadius: '16px', padding: '16px 20px', marginBottom: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{ev.title}</h3>
                                    <select
                                        value={evStatus}
                                        onChange={e => updateEventStatus(ev.id, e.target.value)}
                                        style={{
                                            background: statusColors[evStatus] || '#6b7280', color: '#fff',
                                            border: 'none', borderRadius: '20px', padding: '2px 12px',
                                            fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase'
                                        }}
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                {ev.description && <p style={{ fontSize: '0.85rem', color: 'var(--ad-text-dim)', margin: 0 }}>{ev.description}</p>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--ad-primary)', background: 'rgba(5,150,105,0.1)', padding: '3px 12px', borderRadius: '20px', fontFamily: 'monospace' }}>
                                        <Hash size={12} style={{ verticalAlign: '-1px' }} /> {ev.workshopId}
                                    </span>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(ev.workshopId); setCopiedWsId(ev.workshopId); setTimeout(() => setCopiedWsId(''), 2000); }}
                                        style={{ background: copiedWsId === ev.workshopId ? '#10b981' : 'rgba(0,0,0,0.08)', color: copiedWsId === ev.workshopId ? '#fff' : 'var(--ad-text-dim)', border: 'none', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}
                                    >
                                        {copiedWsId === ev.workshopId ? '✓' : 'Copy ID'}
                                    </button>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--ad-text-dim)', marginLeft: '8px' }}>
                                        📊 {attended}/{evRegs.length} attended
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setEditingEvent({ ...ev })} className="cta-secondary" style={{ padding: '8px 14px', fontSize: '0.8rem' }}><Edit3 size={14} /> Edit</button>
                                <button onClick={() => deleteAdilitixEvent(ev.id)} className="icon-btn-red" title="Delete Event"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    );
                })()}

                {/* Controls: search + bulk actions */}
                <div className="list-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="search-bar"><Search size={18} /><input type="text" placeholder="Filter student..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
                    {selectedRegs.size > 0 && (
                        <button onClick={bulkDeleteRegistrations} className="cta-secondary" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '8px 16px', fontSize: '0.82rem' }}>
                            <Trash2 size={16} /> Delete {selectedRegs.size} Selected
                        </button>
                    )}
                </div>

                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--ad-primary)' }} />
                                </th>
                                <th>Student</th><th>Course</th><th>Event</th><th>Status</th><th>Attendance</th><th>Contact</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRegs.map(reg => (
                                <tr key={reg.id} style={{ background: selectedRegs.has(reg.id) ? 'rgba(5,150,105,0.04)' : undefined }}>
                                    <td>
                                        <input type="checkbox" checked={selectedRegs.has(reg.id)} onChange={() => toggleSelect(reg.id)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--ad-primary)' }} />
                                    </td>
                                    <td><div className="user-cell"><div className="user-avatar-sm">{reg.name?.charAt(0)}</div>{reg.name}</div></td>
                                    <td>{reg.course}</td>
                                    <td><span className="event-badge">{reg.eventName || getWorkshopName(reg.eventId) || 'General'}</span></td>
                                    <td><ApprovalToggle status={reg.status || 'pending'} onToggle={(s) => updateRegStatus(reg.id, s)} /></td>
                                    <td>
                                        <select
                                            value={reg.attendance || ''}
                                            onChange={e => markAttendance(reg.id, e.target.value)}
                                            style={{
                                                padding: '4px 8px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, border: '1px solid var(--ad-border)', cursor: 'pointer',
                                                background: reg.attendance === 'present' ? '#dcfce7' : reg.attendance === 'absent' ? '#fee2e2' : reg.attendance === 'late' ? '#fef3c7' : 'transparent',
                                                color: reg.attendance === 'present' ? '#166534' : reg.attendance === 'absent' ? '#991b1b' : reg.attendance === 'late' ? '#92400e' : 'var(--ad-text-dim)'
                                            }}
                                        >
                                            <option value="">—</option>
                                            <option value="present">✅ Present</option>
                                            <option value="absent">❌ Absent</option>
                                            <option value="late">⏰ Late</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => openWhatsApp(reg.phone, reg.name)} title="WhatsApp" style={{ background: '#25d366', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 7px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>WA</button>
                                            <button onClick={() => openEmail(reg.email, reg.name)} title="Email" style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 7px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>✉️</button>
                                        </div>
                                    </td>
                                    <td><button onClick={() => deleteRegistration(reg.id)} className="icon-btn-red"><Trash2 size={18} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRegs.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>
                            No registrations found{regEventFilter !== 'all' ? ' for this event' : ''}.
                        </div>
                    )}
                </div>

                {/* Create Event Modal */}
                {showCreateEvent && (
                    <div className="overlay-glass" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--ad-card)', padding: '30px', borderRadius: '24px', width: '460px', border: '1px solid var(--ad-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                            <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Create New Event</h3>
                            <form onSubmit={createAdilitixEvent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Event / Workshop Title *</label>
                                    <input autoFocus type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required placeholder="e.g. Robotics Workshop Munnar" />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="e.g. 3-day robotics masterclass" />
                                </div>
                                <div className="form-group">
                                    <label>Event Date *</label>
                                    <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Workshop ID
                                        <span style={{ fontSize: '0.75rem', color: 'var(--ad-text-dim)', marginLeft: '8px' }}>
                                            Leave blank to auto-generate • Permanent once created
                                        </span>
                                    </label>
                                    <input type="text" value={newEvent.workshopId} onChange={e => setNewEvent({ ...newEvent, workshopId: e.target.value.toUpperCase() })} placeholder="Auto-generated (e.g. ADX-RO-001)" style={{ fontFamily: 'monospace' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowCreateEvent(false)} className="cta-secondary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
                                    <button type="submit" className="cta-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Create Event</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Edit Event Modal */}
                {editingEvent && (
                    <div className="overlay-glass" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--ad-card)', padding: '30px', borderRadius: '24px', width: '460px', border: '1px solid var(--ad-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                            <h3 style={{ marginBottom: '6px', fontSize: '1.3rem' }}>Edit Event</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--ad-text-dim)', marginBottom: '20px' }}>Workshop ID <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{editingEvent.workshopId}</code> is permanent and cannot be changed.</p>
                            <form onSubmit={updateAdilitixEvent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Event Title</label>
                                    <input autoFocus type="text" value={editingEvent.title} onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" value={editingEvent.description} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setEditingEvent(null)} className="cta-secondary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
                                    <button type="submit" className="cta-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        );
    };

    const renderInventoryView = () => (
        <motion.div key="inventory" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="view-container">
            <div className="view-header">
                <h2>Inventory Management</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => setShowAddProduct(true)} className="cta-primary-sm"><Plus size={18} /> Add Product</button>
                    <button onClick={() => setActiveView('dashboard')} className="close-view-btn"><X size={20} /></button>
                </div>
            </div>

            {showAddProduct && (
                <div className="overlay-glass" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-box" style={{
                        background: 'var(--ad-card)', padding: '30px', borderRadius: '24px', width: '400px',
                        border: '1px solid var(--ad-border)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Add New Product</h3>
                        <form onSubmit={addInventoryItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Item Name</label>
                                <input autoFocus type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required placeholder="e.g. Arduino Uno" />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" value={newItem.count} onChange={e => setNewItem({ ...newItem, count: e.target.value })} required placeholder="0" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input type="text" value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} placeholder="e.g. Microcontrollers" />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowAddProduct(false)} className="cta-secondary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="cta-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Add Product</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <div className="db-grid">
                {inventory.map(item => (
                    <div key={item.id} className="inventory-card">
                        <div className="inv-info">
                            <h3>{item.name}</h3>
                            <span className="inv-cat">{item.category}</span>
                        </div>
                        <div className="inv-mgmt">
                            <div className="qty-control-group">
                                <button onClick={() => updateInventoryCount(item.id, item.count, -1)} className="qty-btn-sm">-</button>
                                <span className="count-num-sm">{item.count}</span>
                                <button onClick={() => updateInventoryCount(item.id, item.count, 1)} className="qty-btn-sm">+</button>
                            </div>
                            <button onClick={() => deleteInventoryItem(item.id)} className="icon-btn-red"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const renderOrdersListView = () => (
        <motion.div key="orders" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="view-container">
            <div className="view-header">
                <h2>Product Requirements (Orders)</h2>
                <button onClick={() => setActiveView('dashboard')} className="close-view-btn"><X size={20} /></button>
            </div>
            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Customer</th><th>Requirements / Items</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} style={{ opacity: order.status === 'completed' ? 0.6 : 1 }}>
                                <td>
                                    <div className="user-cell">
                                        <b>{order.name}</b>
                                        <small style={{ color: 'var(--ad-text-dim)' }}>{order.phone}</small>
                                    </div>
                                </td>
                                <td>
                                    <div className="order-items-list">
                                        {order.items?.map(i => <span key={i.id} className="item-tag">{i.name} (x{i.quantity})</span>)}
                                        {order.requirements && <p className="req-text" style={{ marginTop: '8px', fontSize: '0.85rem' }}>"{order.requirements}"</p>}
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        color: order.status === 'completed' ? '#10b981' : '#f59e0b',
                                        fontWeight: '700', textTransform: 'uppercase', fontSize: '0.75rem'
                                    }}>
                                        {order.status || 'pending'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                                            <input
                                                type="checkbox"
                                                checked={order.status === 'completed'}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.checked ? 'completed' : 'pending')}
                                                style={{ width: '18px', height: '18px', accentColor: 'var(--ad-primary)', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: order.status === 'completed' ? 'var(--ad-primary)' : 'var(--ad-text)' }}>
                                                Delivered
                                            </span>
                                        </label>
                                        <button onClick={() => deleteOrder(order.id)} className="icon-btn-red" title="Delete Order"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );

    const renderVerificationView = () => (
        <motion.div key="verification" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="view-container">
            <div className="view-header">
                <h2>Student Verification</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowAddCompletion(true)} className="cta-primary-sm"><UserPlus size={18} /> Add Student</button>
                    <button onClick={() => setActiveView('dashboard')} className="close-view-btn"><X size={20} /></button>
                </div>
            </div>
            <div className="list-controls">
                <div className="search-bar"><Search size={18} /><input type="text" placeholder="Search students..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
            </div>

            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Student</th><th>Workshop</th><th>Completed</th><th>Certificate</th><th>Actions</th></tr></thead>
                    <tbody>
                        {completions
                            .filter(c => c.username?.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((comp, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar-sm">{comp.username?.charAt(0)?.toUpperCase()}</div>
                                            <b>{comp.username}</b>
                                        </div>
                                    </td>
                                    <td><span className="event-badge">{getWorkshopName(comp.workshopId)}</span></td>
                                    <td>{new Date(comp.completedAt).toLocaleDateString()}</td>
                                    <td>
                                        {comp.certificateIssued ? (
                                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                <CheckCircle size={14} /> Issued
                                            </span>
                                        ) : (
                                            <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                <Clock size={14} /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {!comp.certificateIssued && (
                                                <button className="cta-primary-sm" onClick={() => issueCertificate(comp.workshopId, comp.username)}>
                                                    <Award size={14} /> Issue
                                                </button>
                                            )}
                                            {comp.certificateIssued && (
                                                <button onClick={() => viewCertificate(comp.workshopId, comp.username)}
                                                    className="nav-btn-subtle"
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto', background: 'transparent' }}
                                                >View</button>
                                            )}
                                            <button onClick={() => deleteCompletion(comp.workshopId, comp.username)} className="icon-btn-red" title="Remove"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        {completions.filter(c => c.username?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--ad-text-dim)' }}>No verified students yet. Click "Add Student" to add one.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Completion Modal */}
            {showAddCompletion && (
                <div className="overlay-glass" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-box" style={{
                        background: 'var(--ad-card)', padding: '30px', borderRadius: '24px', width: '450px',
                        border: '1px solid var(--ad-border)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShieldCheck size={22} style={{ color: '#06b6d4' }} /> Verify Student Completion
                        </h3>
                        <form onSubmit={addCompletion} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Student Name</label>
                                <input autoFocus type="text" value={newCompletion.studentName} onChange={e => setNewCompletion({ ...newCompletion, studentName: e.target.value })} required placeholder="e.g. John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Student ID / Username</label>
                                <input type="text" value={newCompletion.username} onChange={e => setNewCompletion({ ...newCompletion, username: e.target.value })} required placeholder="e.g. john_doe" />
                            </div>
                            <div className="form-group">
                                <label>Workshop</label>
                                <select value={newCompletion.workshopId} onChange={e => setNewCompletion({ ...newCompletion, workshopId: e.target.value })} required>
                                    <option value="">Select a workshop</option>
                                    {workshops.map(ws => (
                                        <option key={ws.id} value={ws.id}>{ws.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowAddCompletion(false)} className="cta-secondary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="cta-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Add & Verify</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );

    const issueAllPending = async () => {
        if (!window.confirm('Issue certificates to ALL pending verified students?')) return;
        const res = await fetch(`${BASE_URL}/api/adilitix/certificates/issue-all`, { method: 'POST' });
        const data = await res.json();
        alert(`Issued ${data.count} new certificates.`);
        fetchData(true);
    };

    const renderCertificatesView = () => {
        const mockData = {
            studentName: 'John Doe',
            workshopName: 'Robotics Masterclass',
            date: new Date().toISOString(),
            certificateId: 'ADX-EV-001'
        };

        return (
            <motion.div key="certificates" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="view-container">
                <div className="view-header">
                    <h2>Certificate Management</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={issueAllPending} className="cta-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            <Award size={16} style={{ marginRight: '6px' }} /> Issue Pending
                        </button>
                        <button onClick={() => setShowCertSettings(true)} className="cta-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                            Certificate Template
                        </button>
                        <button onClick={() => setActiveView('dashboard')} className="close-view-btn"><X size={20} /></button>
                    </div>
                </div>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead><tr><th>Student</th><th>Workshop</th><th>Completion Date</th><th>Action</th></tr></thead>
                        <tbody>
                            {completions.map((comp, idx) => (
                                <tr key={idx}>
                                    <td><b>{comp.username}</b></td>
                                    <td><span className="event-badge">{getWorkshopName(comp.workshopId)}</span></td>
                                    <td>{new Date(comp.completedAt).toLocaleDateString()}</td>
                                    <td>
                                        {comp.certificateIssued ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                    <CheckCircle size={14} /> Issued
                                                </span>
                                                <button
                                                    onClick={() => viewCertificate(comp.workshopId, comp.username)}
                                                    className="nav-btn-subtle"
                                                    title="View & Print"
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto', background: 'transparent' }}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => issueCertificate(comp.workshopId, comp.username)}
                                                    className="nav-btn-subtle"
                                                    title="Reissue"
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto', background: 'transparent' }}
                                                >
                                                    Reissue
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="cta-primary-sm" onClick={() => issueCertificate(comp.workshopId, comp.username)}>
                                                <Award size={16} /> Issue Certificate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {completions.length === 0 && (
                                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--ad-text-dim)' }}>No completions to show. Add students via the Verification panel first.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Certificate Settings Modal */}
                {showCertSettings && (
                    <div className="overlay-glass" style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                    }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal-box" style={{
                            background: 'var(--ad-card)', padding: '30px', borderRadius: '24px', width: '900px',
                            border: '1px solid var(--ad-border)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                            display: 'flex', gap: '30px', justifyContent: 'space-between', maxHeight: '90vh', overflowY: 'auto'
                        }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Certificate Template</h3>
                                <form onSubmit={saveCertSettings} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input type="text" value={certSettings.title} onChange={e => setCertSettings({ ...certSettings, title: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Subtitle</label>
                                        <input type="text" value={certSettings.subtitle} onChange={e => setCertSettings({ ...certSettings, subtitle: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Description (before Workshop Name)</label>
                                        <input type="text" value={certSettings.description} onChange={e => setCertSettings({ ...certSettings, description: e.target.value })} required />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Signatory Name</label>
                                            <input type="text" value={certSettings.signatureName} onChange={e => setCertSettings({ ...certSettings, signatureName: e.target.value })} required />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label>Signatory Role</label>
                                            <input type="text" value={certSettings.signatureRole} onChange={e => setCertSettings({ ...certSettings, signatureRole: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Theme Color</label>
                                        <input type="color" value={certSettings.themeColor} onChange={e => setCertSettings({ ...certSettings, themeColor: e.target.value })} style={{ width: '100%', height: '40px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button type="button" onClick={() => setShowCertSettings(false)} className="cta-secondary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
                                        <button type="submit" className="cta-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Save Template</button>
                                    </div>
                                </form>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: '#f8fafc', borderRadius: '16px', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontWeight: 'bold', color: 'var(--ad-text-dim)', fontSize: '0.9rem' }}>LIVE PREVIEW</div>
                                <CertificatePaper data={mockData} settings={certSettings} scale={0.4} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        );
    };

    // ---- SUPERADMIN VIEWS ----
    const renderAdminManagementView = () => (
        <motion.div key="admin-mgmt" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="view-container">
            <div className="view-header">
                <h2>Admin Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowAddAdmin(true)} className="cta-primary-sm"><UserPlus size={18} /> Add Admin</button>
                    <button onClick={() => setActiveView('dashboard')} className="close-view-btn"><X size={20} /></button>
                </div>
            </div>
            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead><tr><th>Username</th><th>Role</th><th>Added</th><th>Permissions</th><th>Actions</th></tr></thead>
                    <tbody>
                        {adminList.map((adm, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar-sm" style={adm.role === 'superadmin' ? { background: 'linear-gradient(135deg, #e11d48, #f59e0b)' } : {}}>
                                            {adm.username?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <b>{adm.username}</b>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                        background: adm.role === 'superadmin' ? 'rgba(225,29,72,0.1)' : 'rgba(6,182,212,0.1)',
                                        color: adm.role === 'superadmin' ? '#e11d48' : '#06b6d4'
                                    }}>
                                        {adm.role === 'superadmin' ? '👑 Superadmin' : '🔑 Admin'}
                                    </span>
                                </td>
                                <td>{adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : '—'}</td>
                                <td>
                                    {adm.role !== 'superadmin' ? (
                                        <button onClick={() => setEditingPermsAdmin(adm)} className="cta-secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                                            <Settings size={14} /> Edit
                                        </button>
                                    ) : (
                                        <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.8rem' }}>Full Access</span>
                                    )}
                                </td>
                                <td>
                                    {adm.role !== 'superadmin' ? (
                                        <button onClick={() => removeAdmin(adm.username)} className="icon-btn-red" title="Remove"><Trash2 size={16} /></button>
                                    ) : (
                                        <span style={{ color: 'var(--ad-text-dim)', fontSize: '0.8rem' }}>Protected</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Permissions Editor Modal */}
            {editingPermsAdmin && (
                <div className="overlay-glass" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--ad-card)', padding: '30px', borderRadius: '24px', width: '480px', border: '1px solid var(--ad-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Permissions — {editingPermsAdmin.username}</h3>
                        {[
                            { key: 'viewRegistrations', label: 'View Registrations' },
                            { key: 'editRegistrationStatus', label: 'Edit Registration Status' },
                            { key: 'deleteRegistrations', label: 'Delete Registrations' },
                            { key: 'manageInventory', label: 'Manage Inventory' },
                            { key: 'viewOrders', label: 'View Orders' },
                            { key: 'issueCertificates', label: 'Issue Certificates' },
                            { key: 'createEditEvents', label: 'Create/Edit Events' },
                            { key: 'importSheets', label: 'Import from Sheets' }
                        ].map(perm => (
                            <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--ad-border)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={(editingPermsAdmin.permissions || {})[perm.key] !== false}
                                    onChange={e => {
                                        const updated = { ...editingPermsAdmin, permissions: { ...editingPermsAdmin.permissions, [perm.key]: e.target.checked } };
                                        setEditingPermsAdmin(updated);
                                    }}
                                    style={{ width: '18px', height: '18px', accentColor: 'var(--ad-primary)' }}
                                />
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{perm.label}</span>
                            </label>
                        ))}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => setEditingPermsAdmin(null)} className="cta-secondary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
                            <button onClick={() => {
                                updateAdminPermissions(editingPermsAdmin.username, editingPermsAdmin.permissions);
                                setEditingPermsAdmin(null);
                            }} className="cta-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Save</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Add Admin Modal */}
            {showAddAdmin && (
                <div className="overlay-glass" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
                }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
                        background: 'var(--ad-card)', padding: '30px', borderRadius: '24px', width: '420px',
                        border: '1px solid var(--ad-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Crown size={22} style={{ color: '#e11d48' }} /> Add New Admin
                        </h3>
                        <form onSubmit={addAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="form-group">
                                <label>Username</label>
                                <input autoFocus type="text" value={newAdmin.username} onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })} required placeholder="e.g. manager1" />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} required placeholder="Set a strong password" />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}>
                                    <option value="admin">Admin (Manager)</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowAddAdmin(false)} className="cta-secondary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="cta-primary" style={{ flex: 1, padding: '12px', justifyContent: 'center' }}>Add Admin</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );

    // --- SETTINGS VIEW ---
    const renderSettingsView = () => (
        <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="view-container">
            <div className="view-header">
                <h2>Settings</h2>
                <button onClick={() => setActiveView('dashboard')} className="close-view-btn"><X size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {/* Profile Card */}
                <div style={{ background: 'var(--ad-card)', borderRadius: '20px', border: '1px solid var(--ad-border)', padding: '28px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Users size={20} /> Account Info
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ad-primary), #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.5rem' }}>
                            {adminUsername.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{adminUsername}</div>
                            <span style={{
                                padding: '3px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                                textTransform: 'uppercase',
                                background: isSuperAdmin ? 'rgba(225,29,72,0.1)' : 'rgba(6,182,212,0.1)',
                                color: isSuperAdmin ? '#e11d48' : '#06b6d4'
                            }}>
                                {isSuperAdmin ? '👑 Superadmin' : '🔑 Admin'}
                            </span>
                        </div>
                    </div>
                    {adminPerms && !isSuperAdmin && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.04)', borderRadius: '12px', fontSize: '0.82rem' }}>
                            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--ad-text-dim)' }}>Your Permissions:</div>
                            {Object.entries(adminPerms).map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                                    <span>{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span style={{ color: v !== false ? '#10b981' : '#ef4444', fontWeight: 700 }}>{v !== false ? '✓' : '✗'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Password Change Card */}
                <div style={{ background: 'var(--ad-card)', borderRadius: '20px', border: '1px solid var(--ad-border)', padding: '28px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        🔒 Change Password
                    </h3>
                    <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input type="password" value={pwChange.current} onChange={e => setPwChange({ ...pwChange, current: e.target.value })} required placeholder="Enter current password" />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" value={pwChange.newPw} onChange={e => setPwChange({ ...pwChange, newPw: e.target.value })} required placeholder="Enter new password" />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" value={pwChange.confirm} onChange={e => setPwChange({ ...pwChange, confirm: e.target.value })} required placeholder="Confirm new password" />
                        </div>
                        {pwChangeMsg && (
                            <div style={{
                                padding: '10px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600,
                                background: pwChangeMsg.includes('success') || pwChangeMsg.includes('Updated') ? '#dcfce7' : '#fee2e2',
                                color: pwChangeMsg.includes('success') || pwChangeMsg.includes('Updated') ? '#166534' : '#991b1b'
                            }}>
                                {pwChangeMsg}
                            </div>
                        )}
                        <button type="submit" className="cta-primary" style={{ padding: '12px', justifyContent: 'center', marginTop: '4px' }}>
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );

    const renderImportSheetView = () => (
        <motion.div key="import-sheet" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="view-container">
            <div className="view-header">
                <h2>Import from Google Sheets</h2>
                <button onClick={() => setActiveView('dashboard')} className="close-view-btn"><X size={20} /></button>
            </div>

            <div style={{ maxWidth: '700px' }}>
                <div style={{
                    background: 'rgba(22, 163, 106, 0.08)', border: '1px solid rgba(22, 163, 106, 0.2)',
                    borderRadius: '16px', padding: '20px', marginBottom: '24px', lineHeight: '1.7'
                }}>
                    <h4 style={{ marginBottom: '10px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileSpreadsheet size={18} /> How to connect any Google Sheet
                    </h4>
                    <ol style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--ad-text-dim)' }}>
                        <li>Open your Google Sheet (any account) → click <b>Share</b></li>
                        <li>Add this service account email as <b>Viewer</b>:
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '4px',
                                background: 'rgba(0,0,0,0.12)', padding: '8px 14px', borderRadius: '10px', width: 'fit-content', maxWidth: '100%'
                            }}>
                                <code style={{ fontSize: '0.82rem', wordBreak: 'break-all', flex: 1 }}>
                                    {serviceAccountEmail || 'Loading...'}
                                </code>
                                {serviceAccountEmail && (
                                    <button
                                        type="button"
                                        onClick={() => { navigator.clipboard.writeText(serviceAccountEmail); setCopiedEmail(true); setTimeout(() => setCopiedEmail(false), 2000); }}
                                        style={{
                                            background: copiedEmail ? '#10b981' : 'var(--ad-primary)', color: '#fff',
                                            border: 'none', borderRadius: '8px', padding: '5px 14px', cursor: 'pointer',
                                            fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s'
                                        }}
                                    >
                                        {copiedEmail ? '✓ Copied!' : 'Copy'}
                                    </button>
                                )}
                            </div>
                        </li>
                        <li>Copy the <b>Spreadsheet ID</b> from the URL:<br />
                            <code style={{ background: 'rgba(0,0,0,0.15)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem' }}>
                                docs.google.com/spreadsheets/d/<b>THIS_IS_THE_ID</b>/edit
                            </code>
                        </li>
                        <li>Paste it below and import. Column headers are auto-detected!</li>
                    </ol>
                </div>

                <form onSubmit={importFromSheet} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-group">
                        <label>Spreadsheet ID or URL *</label>
                        <input
                            type="text" required
                            value={sheetImport.spreadsheetId}
                            onChange={e => setSheetImport({ ...sheetImport, spreadsheetId: e.target.value })}
                            placeholder="Paste full URL or just the spreadsheet ID"
                            style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sheet Name (optional, defaults to first sheet)</label>
                        <input
                            type="text"
                            value={sheetImport.sheetName}
                            onChange={e => setSheetImport({ ...sheetImport, sheetName: e.target.value })}
                            placeholder="e.g. Sheet1 or Form Responses 1"
                        />
                    </div>
                    <div className="form-group">
                        <label>Import to Event</label>
                        <select
                            value={sheetImport.eventId}
                            onChange={e => setSheetImport({ ...sheetImport, eventId: e.target.value })}
                            style={{ padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem' }}
                        >
                            <option value="">— No event (uncategorized) —</option>
                            {adilitixEvents.map(ev => (
                                <option key={ev.id} value={ev.id}>{ev.title} ({ev.workshopId})</option>
                            ))}
                        </select>
                        <span style={{ fontSize: '0.75rem', color: 'var(--ad-text-dim)', marginTop: '4px' }}>
                            Create events first in the Registrations panel, then import here.
                        </span>
                    </div>
                    <button type="submit" className="cta-primary" disabled={importLoading} style={{ alignSelf: 'flex-start', padding: '12px 28px' }}>
                        {importLoading ? (<><Clock size={18} /> Importing...</>) : (<><Upload size={18} /> Import Registrations</>)}
                    </button>
                </form>

                {importResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
                        marginTop: '24px', padding: '20px', borderRadius: '16px',
                        background: importResult.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        border: `1px solid ${importResult.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                        <h4 style={{ color: importResult.success ? '#10b981' : '#ef4444', marginBottom: '10px' }}>
                            {importResult.success ? '✅ Import Successful' : '❌ Import Failed'}
                        </h4>
                        <p style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>{importResult.message}</p>
                        {importResult.success && (
                            <div style={{ fontSize: '0.85rem', marginTop: '10px', color: 'var(--ad-text-dim)' }}>
                                <p>Sheet: <b>{importResult.sheetTitle}</b> → <b>{importResult.sheetName}</b></p>
                                <p>Detected Headers: <code>{importResult.headers?.join(', ')}</code></p>
                                <p>Total Rows: {importResult.totalRows} | Imported: <b>{importResult.imported}</b> | Skipped: {importResult.skipped}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="admin-dashboard-layout">
            <aside className="db-sidebar">
                <div className="logo">ADILITIX</div>
                <nav className="db-nav">
                    <button onClick={() => setActiveView('dashboard')} className={`db-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}><LayoutDashboard size={18} /> Dashboard</button>
                    {hasPerm('viewRegistrations') && <button onClick={() => setActiveView('registrations')} className={`db-nav-item ${activeView === 'registrations' ? 'active' : ''}`}><Users size={18} /> Registrations</button>}
                    {hasPerm('viewOrders') && <button onClick={() => setActiveView('orders')} className={`db-nav-item ${activeView === 'orders' ? 'active' : ''}`}><ShoppingCart size={18} /> View Orders</button>}
                    <button onClick={() => setActiveView('verification')} className={`db-nav-item ${activeView === 'verification' ? 'active' : ''}`}><ShieldCheck size={18} /> Verification</button>
                    {hasPerm('manageInventory') && <button onClick={() => setActiveView('inventory')} className={`db-nav-item ${activeView === 'inventory' ? 'active' : ''}`}><Package size={18} /> Inventory</button>}
                    {hasPerm('issueCertificates') && <button onClick={() => setActiveView('certificates')} className={`db-nav-item ${activeView === 'certificates' ? 'active' : ''}`}><Award size={18} /> Certificates</button>}
                    <div style={{ borderTop: '1px solid var(--ad-border)', margin: '8px 0', opacity: 0.3 }} />
                    <button onClick={() => setActiveView('noticeboard')} className={`db-nav-item ${activeView === 'noticeboard' ? 'active' : ''}`}><Bell size={18} /> Noticeboard</button>
                    <button onClick={() => setActiveView('calendar')} className={`db-nav-item ${activeView === 'calendar' ? 'active' : ''}`}><Calendar size={18} /> Calendar</button>
                    {isSuperAdmin && (
                        <>
                            <div style={{ borderTop: '1px solid var(--ad-border)', margin: '8px 0', opacity: 0.3 }} />
                            <button onClick={() => setActiveView('admin-mgmt')} className={`db-nav-item ${activeView === 'admin-mgmt' ? 'active' : ''}`}><Crown size={18} /> Admins</button>
                        </>
                    )}
                    {hasPerm('importSheets') && <button onClick={() => setActiveView('import-sheet')} className={`db-nav-item ${activeView === 'import-sheet' ? 'active' : ''}`}><FileSpreadsheet size={18} /> Sheet Import</button>}
                    <div style={{ borderTop: '1px solid var(--ad-border)', margin: '8px 0', opacity: 0.3 }} />
                    <button onClick={() => setActiveView('settings')} className={`db-nav-item ${activeView === 'settings' ? 'active' : ''}`}><Settings size={18} /> Settings</button>
                    <a href={HYPERCLASS_URL} target="_blank" rel="noopener noreferrer" className="db-nav-item">
                        <ExternalLink size={18} /> Hyperclass App
                    </a>
                </nav>
                <div style={{ flex: 1 }}></div>
                <button onClick={handleLogout} className="db-logout-btn"><LogOut size={18} /> Exit Admin</button>
            </aside>

            <main className="db-main">
                <header className="db-header">
                    <div className="header-breadcrumbs"><span>Adilitix Admin</span>{activeView !== 'dashboard' && <><ChevronRight size={14} /><span>{activeView}</span></>}</div>
                    <div className="admin-user-info" style={{ gap: '15px' }}>
                        {isSuperAdmin && (
                            <button className="status-trigger" onClick={() => setShowSystemStatus(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ad-border)', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <Activity size={18} color="var(--ad-primary)" />
                            </button>
                        )}
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{adminUsername}</div>
                            {isSuperAdmin && <div style={{ fontSize: '0.65rem', color: '#e11d48', fontWeight: 800 }}>SUPERADMIN</div>}
                        </div>
                        <div className="avatar">{adminUsername.charAt(0).toUpperCase()}</div>
                    </div>
                </header>

                <div className="db-content">
                    {!loading && (
                        <AnimatePresence mode="wait">
                            {activeView === 'dashboard' && (
                                <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="db-grid">
                                    {dashboardCards.map(card => (
                                        <div key={card.id} className="db-card" onClick={card.action}>
                                            <div className="card-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>{card.icon}</div>
                                            <div className="card-info"><h3>{card.title}</h3><p>{card.count}</p></div>
                                            <div className="card-action"><ChevronRight size={18} /></div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                            {activeView === 'registrations' && renderRegistrationListView()}
                            {activeView === 'inventory' && renderInventoryView()}
                            {activeView === 'orders' && renderOrdersListView()}
                            {activeView === 'verification' && renderVerificationView()}
                            {activeView === 'certificates' && renderCertificatesView()}
                            {activeView === 'noticeboard' && renderNoticeboardView()}
                            {activeView === 'calendar' && renderCalendarView()}
                            {isSuperAdmin && activeView === 'admin-mgmt' && renderAdminManagementView()}
                            {hasPerm('importSheets') && activeView === 'import-sheet' && renderImportSheetView()}
                            {activeView === 'settings' && renderSettingsView()}
                        </AnimatePresence>
                    )}
                    {loading && <div className="db-loader">Fetching latest data...</div>}
                </div>
            </main>

            {showSystemStatus && renderSystemStatusModal()}

            {/* Certificate Preview Overlay */}
            {showCertificatePreview && certificateData && (
                <div className="certificate-preview-overlay" style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="no-print" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                        <button className="cta-primary" onClick={() => window.print()}><ExternalLink size={18} /> Print / Save PDF</button>
                        <button className="cta-secondary" onClick={() => setShowCertificatePreview(false)}><X size={18} /> Close</button>
                    </div>

                    <CertificatePaper data={certificateData} settings={certificateData.settings} scale={1} />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
