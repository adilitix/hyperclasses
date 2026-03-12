const express = require('express');
const os = require('os');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const supabase = require('./supabase');
const googleSheets = require('./googleSheets');
const remoteSync = require('./remoteSync');

const app = express();
const server = http.createServer(app);

// Configure CORS + Socket.IO with stability tuning
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 30000,         // 30s before considering dead
    pingInterval: 15000,        // Ping every 15s
    maxHttpBufferSize: 1e6,     // 1MB max per message
    connectTimeout: 20000,      // 20s connection timeout
    transports: ['websocket', 'polling'] // Prefer websocket
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static('uploads'));

// --- STABILITY: Debounced event saving ---
// Prevents hammering disk/cloud when 20+ users are active simultaneously
const _saveTimers = {};
function debouncedSaveEvent(event, delay = 2000) {
    if (!event || !event.id) return;
    if (_saveTimers[event.id]) clearTimeout(_saveTimers[event.id]);
    _saveTimers[event.id] = setTimeout(() => {
        try {
            db.saveEvent(event);
            // Live Sync Push
            remoteSync.pushSync(`event_${event.id}`, event);
        } catch (e) {
            console.error(`Error saving event ${event.id}:`, e.message);
        }
        delete _saveTimers[event.id];
    }, delay);
}

// Immediate save (for critical operations)
function immediateSaveEvent(event) {
    if (!event || !event.id) return;
    if (_saveTimers[event.id]) clearTimeout(_saveTimers[event.id]);
    delete _saveTimers[event.id];
    try {
        db.saveEvent(event);
        // Live Sync Push
        remoteSync.pushSync(`event_${event.id}`, event);
    } catch (e) {
        console.error(`Error saving event ${event.id}:`, e.message);
    }
}

// --- GLOBAL ERROR HANDLERS --- (prevent crashes)
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION (server stays alive):', err.message);
    console.error(err.stack);
});
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION (server stays alive):', reason);
});

// Storage for uploaded files (Global for now, referenced per event)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

// --- DATA STRUCTURES ---

// Event Class to encapsulate room state
class EventRoom {
    constructor(id, name, createdBy, isWorkshop = false) {
        this.id = id;
        this.name = name;
        this.createdBy = createdBy; // admin username
        this.createdAt = new Date();
        this.isWorkshop = isWorkshop;

        // State specific to this event
        this.currentContent = {
            type: 'text',
            content: `<h1>Welcome to ${name}</h1><p>Waiting for instructor...</p>`,
            language: 'html',
            instructions: ''
        };
        this.files = []; // { filename, size }
        this.activePoll = null;
        this.timerEnd = null;
        this.history = []; // Snapshots
        this.chatDisabled = false;
        this.chatHistory = []; // Array of { id, username, text, timestamp, isSystem }
        this.tickets = []; // Array of { id, studentName, title, code, status, isPublic, messages, createdAt }
        this.attendance = []; // Array of { id, username, role, ip, loginTime, logoutTime }
    }
}

// Initialize database
db.initDatabase();

// Global State
const GLOBAL_STATE = {
    admins: db.loadAdmins(),
    events: db.loadEvents(), // Load from disk
    workshops: db.loadWorkshops(), // Load from disk
    settings: db.loadSettings(), // Global application settings
    blockedIPs: [], // Global blocklist
    workshop_progress: db.loadWorkshopProgress(), // { workshopId: { username: { step, completed, certificateReady } } },
    workshop_gates: {}, // { workshopId: maxStep } - 0 means unlimited
    adilitix_registrations: db.loadAdilitixRegistrations(),
    adilitix_inventory: db.loadAdilitixInventory(),
    adilitix_orders: db.loadAdilitixOrders(),
    adilitix_certificate_settings: db.loadAdilitixCertificateSettings(),
    adilitix_admins: db.loadAdilitixAdmins(),
    adilitix_events: db.loadAdilitixEvents(),
    adilitix_notices: db.loadAdilitixNotices()
};

// Initial Cloud Sync (Bidirectional)
(async () => {
    try {
        await db.restoreFromCloud(GLOBAL_STATE);
        await db.syncLocalToCloud(GLOBAL_STATE);
        console.log('✅ Cloud synchronization complete.');
    } catch (err) {
        console.error('❌ Cloud synchronization failed:', err);
    }
})();

remoteSync.setDependencies(io, GLOBAL_STATE, db);

const SUPERADMIN_CREDENTIALS = {
    username: 'superadmin',
    password: 'mammoosashi'
};

// --- MIDDLEWARE ---

app.use((req, res, next) => {
    let clientIp = req.ip || req.connection.remoteAddress;
    if (clientIp && clientIp.startsWith('::ffff:')) clientIp = clientIp.substr(7);
    if (clientIp === '::1') clientIp = '127.0.0.1';

    if (GLOBAL_STATE.blockedIPs.includes(clientIp)) {
        return res.status(403).json({ success: false, message: 'Access Denied: Your IP is blocked.' });
    }
    next();
});

// --- LIVE SYNC RECEIVER ---
app.post('/api/sync/receive', (req, res) => {
    const { key, data, secret } = req.body;
    const SYNC_SECRET = process.env.SYNC_SECRET || 'hyper-sync-123';

    if (secret !== SYNC_SECRET) {
        return res.status(401).json({ success: false, message: 'Invalid sync secret' });
    }

    try {
        if (key === 'admins') {
            GLOBAL_STATE.admins = data;
            db.saveAdmins(data);
        } else if (key.startsWith('event_')) {
            const eventId = key.replace('event_', '');
            GLOBAL_STATE.events.set(eventId, data);
            db.saveEvent(data);
            // Notify active participants if they are in this room
            io.to(eventId).emit('content_update', data.currentContent);
            io.to(eventId).emit('file_list_update', data.files);
            io.to(eventId).emit('chat_status', { disabled: data.chatDisabled });
            if (data.activePoll) io.to(eventId).emit('poll_update', data.activePoll);
            if (data.timerEnd) io.to(eventId).emit('timer_update', data.timerEnd);
            io.to(eventId).emit('history_update', data.history);
        } else if (key === 'workshops') {
            GLOBAL_STATE.workshops = data;
            db.saveWorkshops(data);
            io.emit('workshops_update', data);
        } else if (key === 'settings') {
            GLOBAL_STATE.settings = data;
            db.saveSettings(data);
            io.emit('settings_update', data);
        } else if (key === 'workshop_progress') {
            GLOBAL_STATE.workshop_progress = data;
            db.saveWorkshopProgress(data);
            io.emit('adilitix_update');
        } else if (key === 'adilitix_registrations') {
            GLOBAL_STATE.adilitix_registrations = data;
            db.saveAdilitixRegistrations(data);
            io.emit('adilitix_update');
        } else if (key === 'adilitix_inventory') {
            GLOBAL_STATE.adilitix_inventory = data;
            db.saveAdilitixInventory(data);
            io.emit('adilitix_update');
        } else if (key === 'adilitix_orders') {
            GLOBAL_STATE.adilitix_orders = data;
            db.saveAdilitixOrders(data);
            io.emit('adilitix_update');
        } else if (key === 'adilitix_certificate_settings') {
            GLOBAL_STATE.adilitix_certificate_settings = data;
            db.saveAdilitixCertificateSettings(data);
        } else if (key === 'adilitix_admins') {
            GLOBAL_STATE.adilitix_admins = data;
            db.saveAdilitixAdmins(data);
        } else if (key === 'adilitix_events') {
            GLOBAL_STATE.adilitix_events = data;
            db.saveAdilitixEvents(data);
        } else if (key === 'adilitix_notices') {
            GLOBAL_STATE.adilitix_notices = data;
            db.saveAdilitixNotices(data);
        } else if (key.startsWith('roster_')) {
            const eventId = key.replace('roster_', '');
            io.to(eventId).emit('remote_roster_update', data);
        }

        res.json({ success: true });
    } catch (err) {
        console.error(`Sync processing failed for ${key}:`, err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// --- API ROUTES ---

app.get('/api/sync/status', (req, res) => {
    res.json({
        enabled: remoteSync.isEnabled,
        targetUrl: remoteSync.targetUrl,
        connected: remoteSync.socket ? remoteSync.socket.connected : false
    });
});

app.post('/api/sync/toggle', (req, res) => {
    const { enabled } = req.body;
    const newState = remoteSync.toggleSync(enabled);
    GLOBAL_STATE.settings.sync_enabled = newState;
    db.saveSettings(GLOBAL_STATE.settings);
    res.json({ success: true, enabled: newState });
});

app.post('/api/sync/push-all', async (req, res) => {
    const success = await remoteSync.syncAll();
    res.json({ success });
});

// Sync status initialization from settings
if (GLOBAL_STATE.settings.sync_enabled) {
    remoteSync.toggleSync(true);
}

// Login
app.post('/api/login', (req, res) => {
    const { username, password, role, eventId } = req.body;

    if (role === 'admin' || role === 'superadmin') {
        // 1. Explicit Go Admin Check
        if (username === 'admin@hyperclass' && password === 'admin@123') {
            return res.json({ success: true, username: 'Go Admin', role: 'admin' });
        }

        // 2. Superadmin Check
        if (username === SUPERADMIN_CREDENTIALS.username && password === SUPERADMIN_CREDENTIALS.password) {
            return res.json({ success: true, username: 'Super Admin', role: 'superadmin' });
        }

        // 3. Database Admins Check
        const adminUser = GLOBAL_STATE.admins.find(a => a.username === username && a.password === password);
        if (adminUser) {
            return res.json({ success: true, username: adminUser.username, role: 'admin' });
        }

        // Honeypot/Fallback: admin | Aadil@123
        if (username === 'admin' && password === 'Aadil@123') {
            return res.json({ success: true, username: 'Admin', role: 'admin' });
        }

        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    } else {
        // Student login
        if (!username) return res.status(400).json({ success: false, message: 'Username required' });
        if (!eventId) return res.status(400).json({ success: false, message: 'ID required' });

        // First Check Live Events (HyperFlow / Live Go)
        const event = GLOBAL_STATE.events.get(eventId);
        if (event) {
            // If it's a Go session (isWorkshop), check if we have a matching static workshop curriculum
            let workshopId = null;
            let workshopName = null;
            if (event.isWorkshop) {
                const workshop = GLOBAL_STATE.workshops.find(w => w.id === eventId);
                if (workshop) {
                    workshopId = workshop.id;
                    workshopName = workshop.title;
                }
            }

            console.log(`Student ${username} logged into event ${eventId} (isWorkshop: ${event.isWorkshop})`);
            return res.json({
                success: true,
                username,
                role: 'student',
                eventId,
                workshopId,
                workshopName,
                eventName: event.name,
                trainerUsername: event.createdBy,
                isWorkshop: !!event.isWorkshop
            });
        }

        // Then Check Static Workshops (HyperGo)
        console.log(`Checking workshops for ID: ${eventId}`);
        const workshop = GLOBAL_STATE.workshops.find(w => w.id === eventId);
        if (workshop) {
            console.log(`Workshop found: ${workshop.title}`);
            return res.json({
                success: true,
                username,
                role: 'student',
                workshopId: workshop.id,
                eventId: workshop.id, // Ensure eventId is correctly set to workshop.id for consistency
                workshopName: workshop.title,
                isWorkshop: true
            });
        }
        console.log(`No workshop found for ID: ${eventId}`);
        return res.status(404).json({ success: false, message: 'Session or Workshop not found.' });
    }
});

// Update Profile (Admin/Superadmin)
app.post('/api/profile/update', (req, res) => {
    const { username, role, newPassword, about, displayName } = req.body;
    console.log(`Profile update attempt for user: ${username}, role: ${role}`);

    if (role === 'superadmin') {
        if (newPassword) {
            // Updated to allow password update for superadmin
            console.log('Superadmin password update requested (simulated)');
        }
        console.log('Superadmin profile updated (Simulated)');
        return res.json({ success: true, message: 'Superadmin profile updated (Simulated)' });
    }

    const adminIndex = GLOBAL_STATE.admins.findIndex(a => a.username === username);
    if (adminIndex !== -1) {
        if (newPassword) {
            GLOBAL_STATE.admins[adminIndex].password = newPassword;
            console.log(`Admin ${username} password updated.`);
        }
        if (about !== undefined) {
            GLOBAL_STATE.admins[adminIndex].about = about;
            console.log(`Admin ${username} about updated.`);
        }
        if (displayName) {
            GLOBAL_STATE.admins[adminIndex].displayName = displayName;
            console.log(`Admin ${username} displayName updated.`);
        }

        db.saveAdmins(GLOBAL_STATE.admins);
        console.log(`Admin ${username} profile saved to DB.`);
        return res.json({ success: true, message: 'Profile updated' });
    }

    console.log(`Profile update failed: User ${username} not found.`);
    res.status(404).json({ success: false, message: 'User not found' });
});

// App Settings (About Website)
app.get('/api/settings', (req, res) => {
    res.json(GLOBAL_STATE.settings);
});

app.post('/api/settings', (req, res) => {
    const { aboutWebsite, permanentNotification } = req.body;
    let updated = false;

    if (aboutWebsite) {
        GLOBAL_STATE.settings.aboutWebsite = aboutWebsite;
        updated = true;
    }

    if (permanentNotification) {
        GLOBAL_STATE.settings.permanentNotification = permanentNotification;
        updated = true;
    }

    if (updated) {
        db.saveSettings(GLOBAL_STATE.settings);
        io.emit('settings_update', GLOBAL_STATE.settings);
        return res.json({ success: true, settings: GLOBAL_STATE.settings });
    }

    res.status(400).json({ success: false, message: 'Invalid settings' });
});

// Get Trainer Info
app.get('/api/trainer/:username', (req, res) => {
    const { username } = req.params;
    const admin = GLOBAL_STATE.admins.find(a => a.username === username);
    if (admin) {
        return res.json({
            username: admin.username,
            displayName: admin.displayName || admin.username,
            about: admin.about || 'No bio available.'
        });
    }
    res.status(404).json({ success: false, message: 'Trainer not found' });
});


app.get('/api/check-event/:id', (req, res) => {
    const { id } = req.params;
    // Check Live Events
    const event = GLOBAL_STATE.events.get(id);
    if (event) {
        return res.json({ success: true, type: event.isWorkshop ? 'go' : 'flow' });
    }
    // Check Static Workshops
    const workshop = GLOBAL_STATE.workshops.find(w => w.id === id);
    if (workshop) {
        return res.json({ success: true, type: 'go' });
    }
    res.json({ success: false });
});

// Events Management (Admin Only - simplified check)
app.get('/api/events', (req, res) => {
    // Convert Map to Array
    const eventsList = Array.from(GLOBAL_STATE.events.values()).map(e => ({
        id: e.id,
        name: e.name,
        createdBy: e.createdBy,
        createdAt: e.createdAt,
        isWorkshop: e.isWorkshop,
        userCount: io.sockets.adapter.rooms.get(e.id)?.size || 0
    }));
    res.json(eventsList);
});

app.post('/api/events', (req, res) => {
    const { name, createdBy, customId, isWorkshop } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Event name required' });

    const id = customId || Date.now().toString(36);

    if (GLOBAL_STATE.events.has(id)) {
        return res.status(400).json({ success: false, message: 'Event ID already exists in HyperFlow sessions' });
    }

    if (GLOBAL_STATE.workshops.some(w => w.id === id)) {
        return res.status(400).json({ success: false, message: 'Event ID already exists in HyperGo workshops' });
    }

    const newEvent = new EventRoom(id, name, createdBy || 'System', isWorkshop === true || isWorkshop === 'true');
    console.log(`Creating event: ${name} (ID: ${id}, isWorkshop: ${newEvent.isWorkshop})`);
    GLOBAL_STATE.events.set(id, newEvent);
    db.saveEvent(newEvent);

    // Ensure relay joins this new room
    remoteSync.syncActiveRooms();

    res.json({ success: true, event: newEvent });
});

app.delete('/api/events/:id', (req, res) => {
    const { id } = req.params;
    if (GLOBAL_STATE.events.has(id)) {
        GLOBAL_STATE.events.delete(id);
        db.deleteEvent(id); // Delete from disk
        io.to(id).emit('force_disconnect', 'Event has been deleted');
        io.in(id).disconnectSockets(true);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Event not found' });
    }
});

// --- WORKSHOP MANAGEMENT ROUTES ---

app.get('/api/workshops/:id', (req, res) => {
    const { id } = req.params;
    const workshop = GLOBAL_STATE.workshops.find(w => w.id === id);
    if (workshop) res.json(workshop);
    else res.status(404).json({ success: false, message: 'Workshop not found' });
});

app.get('/api/workshops', (req, res) => {
    res.json(GLOBAL_STATE.workshops);
});

app.post('/api/workshops', (req, res) => {
    const workshop = req.body;
    if (!workshop.id) workshop.id = Date.now().toString(36);
    GLOBAL_STATE.workshops.push(workshop);
    db.saveWorkshops(GLOBAL_STATE.workshops);
    io.emit('workshops_update', GLOBAL_STATE.workshops);
    res.json({ success: true, workshop });
});

app.put('/api/workshops/:id', (req, res) => {
    const { id } = req.params;
    const updatedWorkshop = req.body;
    console.log(`Updating workshop: ${id} -> ${updatedWorkshop.id}`);
    const index = GLOBAL_STATE.workshops.findIndex(w => w.id === id);
    if (index !== -1) {
        GLOBAL_STATE.workshops[index] = { ...GLOBAL_STATE.workshops[index], ...updatedWorkshop };
        db.saveWorkshops(GLOBAL_STATE.workshops);
        io.emit('workshops_update', GLOBAL_STATE.workshops);
        res.json({ success: true, workshop: GLOBAL_STATE.workshops[index] });
    } else {
        console.log(`Workshop ${id} not found for update`);
        res.status(404).json({ success: false, message: 'Workshop not found' });
    }
});

app.delete('/api/workshops/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = GLOBAL_STATE.workshops.length;
    GLOBAL_STATE.workshops = GLOBAL_STATE.workshops.filter(w => w.id !== id);
    if (GLOBAL_STATE.workshops.length < initialLength) {
        db.saveWorkshops(GLOBAL_STATE.workshops);
        io.emit('workshops_update', GLOBAL_STATE.workshops);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Workshop not found' });
    }
});


// --- ADILITIX PORTAL ROUTES ---

// Return service account email for sheet sharing
app.get('/api/adilitix/service-account-email', (req, res) => {
    try {
        const credPath = require('path').join(__dirname, 'credentials.json');
        if (require('fs').existsSync(credPath)) {
            const creds = JSON.parse(require('fs').readFileSync(credPath, 'utf8'));
            return res.json({ email: creds.client_email || null });
        }
        if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
            return res.json({ email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL });
        }
    } catch (e) { }
    res.json({ email: null });
});


// Adilitix Admin Auth
app.post('/api/adilitix/auth/login', (req, res) => {
    const { username, password } = req.body;
    const admin = GLOBAL_STATE.adilitix_admins.find(
        a => a.username === username && a.password === password
    );
    if (admin) {
        res.json({
            success: true,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions || null
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Change own password
app.post('/api/adilitix/auth/change-password', (req, res) => {
    const { username, currentPassword, newPassword } = req.body;
    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'All fields required' });
    }
    const admin = GLOBAL_STATE.adilitix_admins.find(
        a => a.username === username && a.password === currentPassword
    );
    if (!admin) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    if (newPassword.length < 4) {
        return res.status(400).json({ success: false, message: 'New password too short (min 4 chars)' });
    }
    admin.password = newPassword;
    db.saveAdilitixAdmins(GLOBAL_STATE.adilitix_admins);
    res.json({ success: true, message: 'Password updated successfully' });
});

// Update admin permissions (superadmin only)
app.patch('/api/adilitix/admins/:username/permissions', (req, res) => {
    const { username } = req.params;
    const { permissions } = req.body;
    const admin = GLOBAL_STATE.adilitix_admins.find(a => a.username === username);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    if (admin.role === 'superadmin') return res.status(403).json({ success: false, message: 'Cannot modify superadmin permissions' });
    admin.permissions = { ...admin.permissions, ...permissions };
    db.saveAdilitixAdmins(GLOBAL_STATE.adilitix_admins);
    res.json({ success: true, permissions: admin.permissions });
});

// Mark attendance for Adilitix event registrations
app.patch('/api/adilitix/registrations/:id/attendance', (req, res) => {
    const { attendance } = req.body; // 'present', 'absent', 'late'
    const reg = GLOBAL_STATE.adilitix_registrations.find(r => r.id === req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    reg.attendance = attendance;
    db.saveAdilitixRegistrations(GLOBAL_STATE.adilitix_registrations);
    res.json({ success: true });
});

// Bulk update attendance
app.post('/api/adilitix/registrations/bulk-attendance', (req, res) => {
    const { ids, attendance } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ success: false });
    let updated = 0;
    ids.forEach(id => {
        const reg = GLOBAL_STATE.adilitix_registrations.find(r => r.id === id);
        if (reg) { reg.attendance = attendance; updated++; }
    });
    db.saveAdilitixRegistrations(GLOBAL_STATE.adilitix_registrations);
    res.json({ success: true, updated });
});

// Export registrations as CSV
app.get('/api/adilitix/registrations/export', (req, res) => {
    const { eventId } = req.query;
    let regs = GLOBAL_STATE.adilitix_registrations;
    if (eventId) regs = regs.filter(r => r.eventId === eventId);

    const headers = ['Name', 'Email', 'Phone', 'Course', 'Event', 'Status', 'Attendance', 'Registered'];
    const rows = regs.map(r => [
        r.name || '', r.email || '', r.phone || '', r.course || '',
        r.eventName || r.eventId || '', r.status || 'pending',
        r.attendance || 'N/A', r.timestamp || ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="registrations_${Date.now()}.csv"`);
    res.send(csv);
});

// Adilitix Admin Management (superadmin only)
app.get('/api/adilitix/admins', (req, res) => {
    // Return admins list without passwords
    const safe = GLOBAL_STATE.adilitix_admins.map(a => ({
        username: a.username,
        role: a.role,
        createdAt: a.createdAt
    }));
    res.json(safe);
});

app.post('/api/adilitix/admins', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    if (GLOBAL_STATE.adilitix_admins.find(a => a.username === username)) {
        return res.status(400).json({ success: false, message: 'Admin already exists' });
    }
    const newAdmin = {
        username,
        password,
        role: role || 'admin',
        createdAt: new Date().toISOString(),
        permissions: {
            viewRegistrations: true,
            editRegistrationStatus: true,
            deleteRegistrations: true,
            manageInventory: true,
            viewOrders: true,
            issueCertificates: true,
            createEditEvents: true,
            importSheets: true
        }
    };
    GLOBAL_STATE.adilitix_admins.push(newAdmin);
    db.saveAdilitixAdmins(GLOBAL_STATE.adilitix_admins);
    res.json({ success: true });
});

app.delete('/api/adilitix/admins/:username', (req, res) => {
    const { username } = req.params;
    // Cannot delete superadmin 'aadil'
    if (username === 'aadil') {
        return res.status(403).json({ success: false, message: 'Cannot remove the superadmin' });
    }
    const idx = GLOBAL_STATE.adilitix_admins.findIndex(a => a.username === username);
    if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    db.saveAdilitixAdmins(GLOBAL_STATE.adilitix_admins);
    res.json({ success: true });
});

// --- ADILITIX NOTICEBOARD ---
app.get('/api/adilitix/notices', (req, res) => {
    res.json(GLOBAL_STATE.adilitix_notices);
});

app.post('/api/adilitix/notices', (req, res) => {
    const { title, content, author, priority } = req.body;
    if (!title || !content) {
        return res.status(400).json({ success: false, message: 'Title and content required' });
    }
    const newNotice = {
        id: Date.now().toString(),
        title,
        content,
        author: author || 'Admin',
        priority: priority || 'normal',
        timestamp: new Date().toISOString()
    };
    GLOBAL_STATE.adilitix_notices.unshift(newNotice); // Newest first
    if (GLOBAL_STATE.adilitix_notices.length > 50) GLOBAL_STATE.adilitix_notices = GLOBAL_STATE.adilitix_notices.slice(0, 50);
    db.saveAdilitixNotices(GLOBAL_STATE.adilitix_notices);
    res.json({ success: true, notice: newNotice });
});

app.delete('/api/adilitix/notices/:id', (req, res) => {
    GLOBAL_STATE.adilitix_notices = GLOBAL_STATE.adilitix_notices.filter(n => n.id !== req.params.id);
    db.saveAdilitixNotices(GLOBAL_STATE.adilitix_notices);
    res.json({ success: true });
});

// --- SYSTEM STATUS ---
app.get('/api/system-status', (req, res) => {
    const status = {
        uptime: os.uptime(),
        platform: os.platform(),
        arch: os.arch(),
        cpuCount: os.cpus().length,
        freeMem: os.freemem(),
        totalMem: os.totalmem(),
        loadAvg: os.loadavg(),
        processMemory: process.memoryUsage(),
        dbStats: {
            events: GLOBAL_STATE.events.size,
            registrations: GLOBAL_STATE.adilitix_registrations.length,
            inventoryItems: GLOBAL_STATE.adilitix_inventory.length,
            activeSockets: io.sockets.sockets.size
        },
        timestamp: new Date().toISOString()
    };
    res.json(status);
});

// ---- ADILITIX EVENTS (Workshop Events with permanent IDs) ----

app.get('/api/adilitix/events', (req, res) => {
    res.json(GLOBAL_STATE.adilitix_events || []);
});

app.post('/api/adilitix/events', (req, res) => {
    const { title, description, workshopId, date } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });

    // Generate or use provided workshop ID (permanent, never changes)
    let finalWorkshopId = workshopId;
    if (!finalWorkshopId) {
        // Auto-generate: ADX-{2-letter-code}-{timestamp-based}
        const code = title.replace(/[^a-zA-Z]/g, '').substring(0, 2).toUpperCase() || 'WS';
        const seq = (GLOBAL_STATE.adilitix_events.length + 1).toString().padStart(3, '0');
        finalWorkshopId = `ADX-${code}-${seq}`;
    }

    // Ensure workshop ID is unique
    if (GLOBAL_STATE.adilitix_events.find(e => e.workshopId === finalWorkshopId)) {
        return res.status(400).json({ success: false, message: `Workshop ID "${finalWorkshopId}" already exists` });
    }

    const event = {
        id: Date.now().toString(),
        title,
        description: description || '',
        workshopId: finalWorkshopId,
        date: date || new Date().toISOString().split('T')[0], // Pickable event date
        createdAt: new Date().toISOString()
    };

    GLOBAL_STATE.adilitix_events.push(event);
    db.saveAdilitixEvents(GLOBAL_STATE.adilitix_events);
    io.emit('adilitix_update');
    res.json({ success: true, event });
});

app.put('/api/adilitix/events/:id', (req, res) => {
    const idx = GLOBAL_STATE.adilitix_events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Event not found' });

    const { title, description, status } = req.body;
    if (title) GLOBAL_STATE.adilitix_events[idx].title = title;
    if (description !== undefined) GLOBAL_STATE.adilitix_events[idx].description = description;
    if (status) GLOBAL_STATE.adilitix_events[idx].status = status; // 'upcoming', 'active', 'completed'
    // workshopId is NEVER changed — it's permanent

    db.saveAdilitixEvents(GLOBAL_STATE.adilitix_events);
    io.emit('adilitix_update');
    res.json({ success: true, event: GLOBAL_STATE.adilitix_events[idx] });
});

app.delete('/api/adilitix/events/:id', (req, res) => {
    const idx = GLOBAL_STATE.adilitix_events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Event not found' });

    // Only delete the event metadata, NOT the registrations
    GLOBAL_STATE.adilitix_events.splice(idx, 1);
    db.saveAdilitixEvents(GLOBAL_STATE.adilitix_events);
    io.emit('adilitix_update');
    res.json({ success: true });
});

// ---- BULK DELETE REGISTRATIONS ----

app.post('/api/adilitix/registrations/bulk-delete', (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'No IDs provided' });
    }

    const idsSet = new Set(ids);
    const before = GLOBAL_STATE.adilitix_registrations.length;
    GLOBAL_STATE.adilitix_registrations = GLOBAL_STATE.adilitix_registrations.filter(r => !idsSet.has(r.id));
    const deleted = before - GLOBAL_STATE.adilitix_registrations.length;

    db.saveAdilitixRegistrations(GLOBAL_STATE.adilitix_registrations);
    io.emit('adilitix_update');
    res.json({ success: true, deleted });
});

// Google Sheets Import — pull registrations from any Google Sheet
app.post('/api/adilitix/import-sheet', async (req, res) => {
    let { spreadsheetId, sheetName, eventId } = req.body;
    if (!spreadsheetId) {
        return res.status(400).json({ success: false, message: 'spreadsheetId is required' });
    }

    // Auto-extract ID from full URL if pasted
    const urlMatch = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (urlMatch) {
        spreadsheetId = urlMatch[1];
    }
    // Clean any trailing whitespace or slashes
    spreadsheetId = spreadsheetId.trim().replace(/\/.*$/, '');

    try {
        const { GoogleSpreadsheet } = require('google-spreadsheet');
        const { JWT } = require('google-auth-library');
        const fs = require('fs');
        const credPath = require('path').join(__dirname, 'credentials.json');

        let credentials;
        if (fs.existsSync(credPath)) {
            credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        } else if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
            credentials = {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            };
        } else {
            return res.status(500).json({ success: false, message: 'Google credentials not configured on server' });
        }

        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const doc = new GoogleSpreadsheet(spreadsheetId, auth);
        await doc.loadInfo();

        const sheet = sheetName ? doc.sheetsByTitle[sheetName] : doc.sheetsByIndex[0];
        if (!sheet) {
            return res.status(404).json({ success: false, message: `Sheet "${sheetName || 'first sheet'}" not found` });
        }

        const rows = await sheet.getRows();
        const headers = sheet.headerValues.map(h => h.toLowerCase().trim());

        // Auto-detect column mappings
        const findCol = (options) => headers.findIndex(h => options.some(o => h.includes(o)));
        const nameIdx = findCol(['name', 'full name', 'student name']);
        const emailIdx = findCol(['email', 'e-mail', 'mail']);
        const phoneIdx = findCol(['phone', 'ph no', 'mobile', 'contact', 'whatsapp']);
        const courseIdx = findCol(['course', 'department', 'branch', 'stream', 'degree']);
        const eventIdx = findCol(['event', 'workshop', 'session']);

        let imported = 0;
        let skipped = 0;
        const existingEmails = new Set(GLOBAL_STATE.adilitix_registrations.map(r => r.email?.toLowerCase()));

        for (const row of rows) {
            const vals = row._rawData;
            const email = emailIdx >= 0 ? (vals[emailIdx] || '').trim() : '';
            const name = nameIdx >= 0 ? (vals[nameIdx] || '').trim() : '';

            if (!name && !email) { skipped++; continue; }
            // Deduplicate by email
            if (email && existingEmails.has(email.toLowerCase())) { skipped++; continue; }

            // Resolve event name from eventId if provided
            const adxEvent = eventId ? GLOBAL_STATE.adilitix_events.find(e => e.id === eventId) : null;
            const sheetEventVal = eventIdx >= 0 ? (vals[eventIdx] || '').trim() : '';

            const reg = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
                name: name || 'Unknown',
                email: email || '',
                phone: phoneIdx >= 0 ? (vals[phoneIdx] || '').trim() : '',
                course: courseIdx >= 0 ? (vals[courseIdx] || '').trim() : '',
                eventId: eventId || sheetEventVal,
                eventName: adxEvent ? adxEvent.title : (sheetEventVal || 'Imported'),
                status: 'pending',
                timestamp: new Date().toISOString(),
                source: 'google-sheet-import'
            };
            GLOBAL_STATE.adilitix_registrations.push(reg);
            if (email) existingEmails.add(email.toLowerCase());
            imported++;
        }

        db.saveAdilitixRegistrations(GLOBAL_STATE.adilitix_registrations);
        io.emit('adilitix_update');

        res.json({
            success: true,
            sheetTitle: doc.title,
            sheetName: sheet.title,
            headers: sheet.headerValues,
            totalRows: rows.length,
            imported,
            skipped,
            message: `Imported ${imported} new registrations (${skipped} skipped/duplicates)`
        });
    } catch (err) {
        console.error('Sheet import error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/adilitix/register', (req, res) => {
    // events is a Map, use .get() not .find()
    const event = GLOBAL_STATE.events.get(req.body.eventId);
    // Also check workshops array for name resolution
    const workshop = GLOBAL_STATE.workshops.find(w => w.id === req.body.eventId);
    const eventName = event ? event.name : (workshop ? workshop.title : (req.body.eventId || 'General'));
    const registration = {
        id: Date.now().toString(),
        ...req.body,
        eventName,
        status: 'pending', // pending, approved, rejected
        timestamp: new Date().toISOString()
    };
    GLOBAL_STATE.adilitix_registrations.push(registration);
    db.saveAdilitixRegistrations(GLOBAL_STATE.adilitix_registrations);
    io.emit('adilitix_update');
    // Live Sync
    remoteSync.pushSync('adilitix_registrations', GLOBAL_STATE.adilitix_registrations);

    // Sync to Google Sheets
    googleSheets.appendRegistration(registration).catch(console.error);

    res.json({ success: true, registration });
});

app.patch('/api/adilitix/registrations/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const reg = GLOBAL_STATE.adilitix_registrations.find(r => r.id === id);
    if (reg) {
        reg.status = status;
        db.saveAdilitixRegistrations(GLOBAL_STATE.adilitix_registrations);
        io.emit('adilitix_update');
        // Live Sync
        remoteSync.pushSync('adilitix_registrations', GLOBAL_STATE.adilitix_registrations);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

app.delete('/api/adilitix/registrations/:id', (req, res) => {
    const { id } = req.params;
    GLOBAL_STATE.adilitix_registrations = GLOBAL_STATE.adilitix_registrations.filter(r => r.id !== id);
    db.saveAdilitixRegistrations(GLOBAL_STATE.adilitix_registrations);
    io.emit('adilitix_update');
    // Live Sync
    remoteSync.pushSync('adilitix_registrations', GLOBAL_STATE.adilitix_registrations);
    res.json({ success: true });
});

app.get('/api/adilitix/registrations', (req, res) => {
    res.json(GLOBAL_STATE.adilitix_registrations);
});

app.get('/api/adilitix/inventory', (req, res) => {
    res.json(GLOBAL_STATE.adilitix_inventory);
});

app.post('/api/adilitix/inventory', (req, res) => {
    const item = { id: Date.now().toString(), ...req.body };
    GLOBAL_STATE.adilitix_inventory.push(item);
    db.saveAdilitixInventory(GLOBAL_STATE.adilitix_inventory);
    io.emit('adilitix_update');
    res.json({ success: true, item });
});

app.patch('/api/adilitix/inventory/:id', (req, res) => {
    const { id } = req.params;
    const index = GLOBAL_STATE.adilitix_inventory.findIndex(i => i.id === id);
    if (index !== -1) {
        GLOBAL_STATE.adilitix_inventory[index] = { ...GLOBAL_STATE.adilitix_inventory[index], ...req.body };
        db.saveAdilitixInventory(GLOBAL_STATE.adilitix_inventory);
        io.emit('adilitix_update');
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

app.delete('/api/adilitix/inventory/:id', (req, res) => {
    const { id } = req.params;
    GLOBAL_STATE.adilitix_inventory = GLOBAL_STATE.adilitix_inventory.filter(i => i.id !== id);
    db.saveAdilitixInventory(GLOBAL_STATE.adilitix_inventory);
    io.emit('adilitix_update');
    res.json({ success: true });
});

app.get('/api/adilitix/orders', (req, res) => {
    res.json(GLOBAL_STATE.adilitix_orders);
});

app.post('/api/adilitix/orders', (req, res) => {
    const { items } = req.body;

    // 1. Validate Stock
    for (const orderItem of items) {
        const inventoryItem = GLOBAL_STATE.adilitix_inventory.find(inv => inv.id === orderItem.id);
        if (!inventoryItem || inventoryItem.count < orderItem.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock for ${orderItem.name}` });
        }
    }

    // 2. Validate Stock Only (Don't deduct yet)
    for (const orderItem of items) {
        const inventoryItem = GLOBAL_STATE.adilitix_inventory.find(inv => inv.id === orderItem.id);
        if (!inventoryItem || inventoryItem.count < orderItem.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock for ${orderItem.name}` });
        }
    }

    // 3. Create Order
    const order = {
        id: Date.now().toString(),
        ...req.body,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    GLOBAL_STATE.adilitix_orders.push(order);
    db.saveAdilitixOrders(GLOBAL_STATE.adilitix_orders);

    io.emit('adilitix_update');
    res.json({ success: true, order });
});

app.delete('/api/adilitix/orders/:id', (req, res) => {
    const { id } = req.params;
    GLOBAL_STATE.adilitix_orders = GLOBAL_STATE.adilitix_orders.filter(o => o.id !== id);
    db.saveAdilitixOrders(GLOBAL_STATE.adilitix_orders);
    io.emit('adilitix_update');
    res.json({ success: true });
});

app.patch('/api/adilitix/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const order = GLOBAL_STATE.adilitix_orders.find(o => o.id === id);

    if (order) {
        // If marking as completed, NOW deduct stock
        if (status === 'completed' && order.status !== 'completed') {
            // Check stock again
            for (const orderItem of order.items) {
                const inventoryItem = GLOBAL_STATE.adilitix_inventory.find(inv => inv.id === orderItem.id);
                if (!inventoryItem || inventoryItem.count < orderItem.quantity) {
                    return res.status(400).json({ success: false, message: `Insufficient stock for ${orderItem.name}` });
                }
            }

            // Deduct
            order.items.forEach(orderItem => {
                const inventoryItem = GLOBAL_STATE.adilitix_inventory.find(inv => inv.id === orderItem.id);
                if (inventoryItem) {
                    inventoryItem.count -= orderItem.quantity;
                }
            });
            db.saveAdilitixInventory(GLOBAL_STATE.adilitix_inventory);
        }

        order.status = status;
        db.saveAdilitixOrders(GLOBAL_STATE.adilitix_orders);
        io.emit('adilitix_update');
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

app.get('/api/adilitix/completions', (req, res) => {
    // Extract completions from workshop_progress
    const completions = [];
    Object.entries(GLOBAL_STATE.workshop_progress).forEach(([workshopId, students]) => {
        Object.entries(students).forEach(([username, data]) => {
            if (data.completed) {
                completions.push({
                    username,
                    workshopId,
                    certificateIssued: data.certificateIssued || false,
                    completedAt: data.completedAt || new Date().toISOString()
                });
            }
        });
    });
    res.json(completions);
});

// Manually add a completion (from admin panel)
app.post('/api/adilitix/completions', (req, res) => {
    const { workshopId, username, studentName } = req.body;
    if (!workshopId || !username) {
        return res.status(400).json({ success: false, message: 'workshopId and username are required' });
    }

    if (!GLOBAL_STATE.workshop_progress[workshopId]) {
        GLOBAL_STATE.workshop_progress[workshopId] = {};
    }

    // Don't overwrite if already exists
    if (GLOBAL_STATE.workshop_progress[workshopId][username]) {
        return res.status(400).json({ success: false, message: 'Completion already exists for this student/workshop' });
    }

    GLOBAL_STATE.workshop_progress[workshopId][username] = {
        step: 999,
        completed: true,
        completedAt: new Date().toISOString(),
        certificateIssued: false,
        studentName: studentName || username
    };

    db.saveWorkshopProgress(GLOBAL_STATE.workshop_progress);
    io.emit('adilitix_update');
    res.json({ success: true });
});

// Delete a completion
app.delete('/api/adilitix/completions/:workshopId/:username', (req, res) => {
    const { workshopId, username } = req.params;
    if (GLOBAL_STATE.workshop_progress[workshopId] && GLOBAL_STATE.workshop_progress[workshopId][username]) {
        delete GLOBAL_STATE.workshop_progress[workshopId][username];
        // Clean up empty workshop entries
        if (Object.keys(GLOBAL_STATE.workshop_progress[workshopId]).length === 0) {
            delete GLOBAL_STATE.workshop_progress[workshopId];
        }
        db.saveWorkshopProgress(GLOBAL_STATE.workshop_progress);
        io.emit('adilitix_update');
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Completion not found' });
    }
});

app.post('/api/adilitix/certificates/issue', (req, res) => {
    const { workshopId, username } = req.body;
    if (
        GLOBAL_STATE.workshop_progress[workshopId] &&
        GLOBAL_STATE.workshop_progress[workshopId][username]
    ) {
        GLOBAL_STATE.workshop_progress[workshopId][username].certificateIssued = true;
        db.saveWorkshopProgress(GLOBAL_STATE.workshop_progress);
        io.emit('adilitix_update');
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Completion not found' });
    }
});

app.post('/api/adilitix/certificates/issue-all', (req, res) => {
    let count = 0;
    Object.keys(GLOBAL_STATE.workshop_progress).forEach(wsId => {
        Object.keys(GLOBAL_STATE.workshop_progress[wsId]).forEach(uname => {
            const progress = GLOBAL_STATE.workshop_progress[wsId][uname];
            if ((progress.completed || progress.verified) && !progress.certificateIssued) {
                progress.certificateIssued = true;
                count++;
            }
        });
    });
    if (count > 0) {
        db.saveWorkshopProgress(GLOBAL_STATE.workshop_progress);
        io.emit('adilitix_update');
    }
    res.json({ success: true, count });
});

// Certificate Settings
app.get('/api/adilitix/certificates/settings', (req, res) => {
    res.json(GLOBAL_STATE.adilitix_certificate_settings);
});

app.post('/api/adilitix/certificates/settings', (req, res) => {
    GLOBAL_STATE.adilitix_certificate_settings = { ...GLOBAL_STATE.adilitix_certificate_settings, ...req.body };
    db.saveAdilitixCertificateSettings(GLOBAL_STATE.adilitix_certificate_settings);
    res.json({ success: true });
});

// View Certificate Data
app.get('/api/adilitix/certificates/view/:workshopId/:username', (req, res) => {
    const { workshopId, username } = req.params;

    // Verify completion exists
    if (!GLOBAL_STATE.workshop_progress[workshopId] || !GLOBAL_STATE.workshop_progress[workshopId][username]) {
        return res.status(404).json({ success: false, message: 'Completion not found' });
    }

    // Get registration for full name (if available) or use username
    const reg = GLOBAL_STATE.adilitix_registrations.find(r => r.name === username) || {};
    const studentName = reg.name || username;

    // Get completion date
    const completionData = GLOBAL_STATE.workshop_progress[workshopId][username];

    // Combine with current settings
    // Helper to generate deterministic ID based on completion order
    const generateCertificateId = (workshopId, username) => {
        // Mock event code mapping (can be expanded)
        // If workshopId is numeric, try to find a name or fallback to 'WS'
        // For now, let's use 'RO' for Robotics, 'IO' for IoT, or generic 'EV'
        let eventCode = 'EV';
        const workshopName = workshopId.toString().toUpperCase();
        if (workshopName.includes('ROBOT')) eventCode = 'RO';
        else if (workshopName.includes('IOT')) eventCode = 'IO';
        else if (workshopName.length >= 2 && isNaN(workshopName)) eventCode = workshopName.substring(0, 2).toUpperCase();

        // Find user's index in the completion list to generate a sequence number
        // This ensures ID is permanent as long as data order doesn't change wildly (which is fine for this scope)
        let sequence = 1;
        if (GLOBAL_STATE.workshop_progress[workshopId]) {
            const completedUsers = Object.keys(GLOBAL_STATE.workshop_progress[workshopId])
                .filter(u => GLOBAL_STATE.workshop_progress[workshopId][u].completed || GLOBAL_STATE.workshop_progress[workshopId][u].certificateIssued)
                .sort(); // Sort alphabetically to maintain deterministic order

            const index = completedUsers.indexOf(username);
            if (index !== -1) sequence = index + 1;
        }

        const seqString = sequence.toString().padStart(3, '0');
        // Final Format: ADX-{EVENT}-{SEQ} e.g., ADX-EV-001
        return `ADX-${eventCode}-${seqString}`;
    };

    // Get workshop name from global state
    const workshop = GLOBAL_STATE.workshops.find(w => w.id === workshopId) || {};
    const workshopName = workshop.title || workshopId;

    const certificateData = {
        studentName,
        workshopName,
        date: completionData.completedAt || new Date().toISOString(),
        settings: GLOBAL_STATE.adilitix_certificate_settings,
        certificateId: generateCertificateId(workshopId, username)
    };

    res.json(certificateData);
});

// Verify Certificate
app.post('/api/adilitix/certificates/verify', (req, res) => {
    const { certificateId } = req.body;
    if (!certificateId || !certificateId.startsWith('ADX-')) {
        return res.json({ valid: false, message: 'Invalid ID format' });
    }

    let matchFound = null;

    // Iterate all workshops
    Object.keys(GLOBAL_STATE.workshop_progress).forEach(wsId => {
        if (matchFound) return;

        const users = Object.keys(GLOBAL_STATE.workshop_progress[wsId]);
        const completedUsers = users
            .filter(u => GLOBAL_STATE.workshop_progress[wsId][u].completed || GLOBAL_STATE.workshop_progress[wsId][u].certificateIssued)
            .sort();

        completedUsers.forEach((user, idx) => {
            if (matchFound) return;

            let eventCode = 'EV';
            const workshopName = wsId.toString().toUpperCase();
            if (workshopName.includes('ROBOT')) eventCode = 'RO';
            else if (workshopName.includes('IOT')) eventCode = 'IO';
            else if (workshopName.length >= 2 && isNaN(workshopName)) eventCode = workshopName.substring(0, 2).toUpperCase();

            const seqString = (idx + 1).toString().padStart(3, '0');
            const generatedId = `ADX-${eventCode}-${seqString}`;

            if (generatedId === certificateId) {
                matchFound = {
                    workshopId: wsId,
                    username: user,
                    data: GLOBAL_STATE.workshop_progress[wsId][user]
                };
            }
        });
    });

    if (matchFound) {
        const reg = GLOBAL_STATE.adilitix_registrations.find(r => r.name === matchFound.username) || {};
        const workshop = GLOBAL_STATE.workshops.find(w => w.id === matchFound.workshopId) || {};
        const workshopName = workshop.title || matchFound.workshopId;

        return res.json({
            valid: true,
            data: {
                studentName: reg.name || matchFound.username,
                workshopName: workshopName,
                completedAt: matchFound.data.completedAt,
                certificateId: certificateId
            }
        });
    }

    res.json({ valid: false });
});

app.get('/api/storage-status', async (req, res) => {
    const isConnected = await supabase.healthCheck();
    res.json({ connected: isConnected });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    const { eventId } = req.body;
    if (!req.file) return res.status(400).send('No file uploaded');

    try {
        let fileInfo;
        const isConnected = await supabase.healthCheck();

        if (isConnected) {
            // Upload to Supabase
            // Use unique name to avoid bucket collisions
            const uniqueName = `${Date.now()}_${req.file.originalname}`;
            const cloudFile = await supabase.uploadFile(uniqueName, req.file.path, req.file.mimetype);
            fileInfo = {
                filename: req.file.originalname,
                size: req.file.size,
                url: cloudFile.url,
                cloud: true,
                timestamp: Date.now()
            };
            // Cleanup local temp file
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        } else {
            // Fallback to local storage
            console.warn('Supabase not connected. Falling back to local storage.');
            fileInfo = {
                filename: req.file.originalname,
                size: req.file.size,
                url: `/uploads/${req.file.originalname}`,
                cloud: false,
                timestamp: Date.now()
            };
            // Move file to uploads folder
            const targetPath = path.join(__dirname, 'uploads', req.file.originalname);
            if (!fs.existsSync(path.join(__dirname, 'uploads'))) fs.mkdirSync(path.join(__dirname, 'uploads'));
            if (req.file.path !== targetPath) {
                fs.copyFileSync(req.file.path, targetPath);
                fs.unlinkSync(req.file.path);
            }
        }

        // If eventId provided, add to that event's file list
        if (eventId && GLOBAL_STATE.events.has(eventId)) {
            const event = GLOBAL_STATE.events.get(eventId);
            if (!event.files.find(f => f.filename === fileInfo.filename)) {
                event.files.push(fileInfo);
                db.saveEvent(event);
                io.to(eventId).emit('file_list_update', event.files);
            }
        }

        res.json({ success: true, file: fileInfo, cloud: isConnected });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
});

app.delete('/api/files/:filename', (req, res) => {
    const { filename } = req.params;
    const { eventId } = req.query; // Pass eventId as query param

    const filePath = path.join(__dirname, 'uploads', filename);

    // Remove from disk
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    if (eventId && GLOBAL_STATE.events.has(eventId)) {
        const event = GLOBAL_STATE.events.get(eventId);
        event.files = event.files.filter(f => f.filename !== filename);
        io.to(eventId).emit('file_list_update', event.files);
    }

    res.json({ success: true });
});

// --- TICKET ENDPOINTS ---

// Get tickets for an event
app.get('/api/events/:eventId/tickets', (req, res) => {
    const { eventId } = req.params;
    const { studentName } = req.query; // Optional filter

    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
    }

    let tickets = event.tickets || [];

    // Filter by student if requested
    if (studentName) {
        tickets = tickets.filter(t => t.studentName === studentName);
    }

    res.json(tickets);
});

// Create a new ticket
app.post('/api/events/:eventId/tickets', (req, res) => {
    const { eventId } = req.params;
    const { studentName, title, code, priority } = req.body;

    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const newTicket = {
        id: Date.now().toString(),
        studentName,
        title,
        code,
        priority: priority || 'medium',
        status: 'open', // open, in-progress, resolved
        isPublic: false,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    event.tickets.push(newTicket);
    db.saveEvent(event); // Persist

    res.json({ success: true, ticket: newTicket });
});

// Update ticket (status, visibility, add message)
app.patch('/api/events/:eventId/tickets/:ticketId', (req, res) => {
    const { eventId, ticketId } = req.params;
    const { status, isPublic, message } = req.body;

    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const ticket = event.tickets.find(t => t.id === ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Update fields
    if (status !== undefined) ticket.status = status;
    if (isPublic !== undefined) ticket.isPublic = isPublic;
    if (message) {
        ticket.messages.push({
            id: Date.now().toString(),
            ...message,
            timestamp: new Date().toISOString()
        });
    }

    ticket.updatedAt = new Date().toISOString();
    db.saveEvent(event); // Persist

    res.json({ success: true, ticket });
});


// --- SOCKET.IO ---

const getNormalizedIp = (socket) => {
    let ip = socket.handshake.address;
    if (ip && ip.startsWith('::ffff:')) ip = ip.substr(7);
    if (ip === '::1') ip = '127.0.0.1';
    return ip;
};

io.on('connection', (socket) => {
    const clientIp = getNormalizedIp(socket);

    // Check IP Block
    if (GLOBAL_STATE.blockedIPs.includes(clientIp)) {
        socket.disconnect(true);
        return;
    }

    // Admins get global updates
    socket.emit('blocked_ips_update', GLOBAL_STATE.blockedIPs);
    socket.emit('settings_update', GLOBAL_STATE.settings);

    socket.on('join_event', ({ username, role, eventId }) => {
        try {
            if (!eventId) return;

            const event = GLOBAL_STATE.events.get(eventId);
            if (!event) {
                socket.emit('error', 'Event not found');
                return;
            }

            // Join the socket room
            socket.join(eventId);

            // Store session info on socket
            socket.data.eventId = eventId;
            socket.data.username = username;
            socket.data.role = role;
            socket.data.ip = clientIp;

            // Track attendance - record login
            const attendanceRecord = {
                id: Date.now().toString(),
                username,
                role,
                ip: clientIp,
                loginTime: new Date().toISOString(),
                logoutTime: null
            };
            event.attendance.push(attendanceRecord);
            socket.data.attendanceId = attendanceRecord.id;
            debouncedSaveEvent(event); // Debounced — many joins at once

            // Send Initial State for this Event
            socket.emit('content_update', event.currentContent);
            socket.emit('file_list_update', event.files);
            socket.emit('chat_status', { disabled: event.chatDisabled });
            if (event.activePoll) socket.emit('poll_update', event.activePoll);
            if (event.timerEnd) socket.emit('timer_update', event.timerEnd);
            socket.emit('history_update', event.history);

            // Send chat history to the user (cap to last 200 for performance)
            const recentChat = (event.chatHistory || []).slice(-200);
            socket.emit('chat_history_update', recentChat);

            // Notify others
            sendRosterUpdate(eventId);
            sendAttendanceUpdate(eventId);

            socket.on('get_roster', () => {
                sendRosterUpdate(eventId);
            });

            // System Message
            const systemMsg = {
                id: Date.now(),
                username: 'System',
                text: `${username} joined the session.`,
                timestamp: new Date().toISOString(),
                isSystem: true
            };
            event.chatHistory.push(systemMsg);
            // Cap chat history at 500 messages to prevent unbounded memory growth
            if (event.chatHistory.length > 500) event.chatHistory = event.chatHistory.slice(-500);
            debouncedSaveEvent(event);
            io.to(eventId).emit('chat_message', systemMsg);
        } catch (e) { console.error('join_event error:', e.message); }
    });

    socket.on('disconnect', () => {
        try {
            const eventId = socket.data.eventId;
            if (eventId) {
                const event = GLOBAL_STATE.events.get(eventId);

                // Track logout time in attendance
                if (event && socket.data.attendanceId) {
                    const record = event.attendance.find(r => r.id === socket.data.attendanceId);
                    if (record && !record.logoutTime) {
                        record.logoutTime = new Date().toISOString();
                        debouncedSaveEvent(event); // Debounced — many disconnects at once
                    }
                }

                sendRosterUpdate(eventId);
                sendAttendanceUpdate(eventId);

                if (socket.data.username && event) {
                    const systemMsg = {
                        id: Date.now(),
                        username: 'System',
                        text: `${socket.data.username} left the session.`,
                        timestamp: new Date().toISOString(),
                        isSystem: true
                    };
                    event.chatHistory.push(systemMsg);
                    if (event.chatHistory.length > 500) event.chatHistory = event.chatHistory.slice(-500);
                    debouncedSaveEvent(event);
                    io.to(eventId).emit('chat_message', systemMsg);
                }
            }
        } catch (e) { console.error('disconnect error:', e.message); }
    });

    // --- EVENT SPECIFIC HANDLERS ---

    const getEvent = () => {
        const eid = socket.data.eventId;
        if (!eid) return null;
        return GLOBAL_STATE.events.get(eid);
    }

    socket.on('broadcast_content', (content) => {
        try {
            const event = getEvent();
            if (!event) return;
            event.currentContent = content;
            debouncedSaveEvent(event, 3000);
            socket.to(event.id).emit('content_update', content, event.id);

            // Instant Live Sync for Broadcast
            remoteSync.pushSync(`event_${event.id}`, event);
        } catch (e) { console.error('broadcast_content error:', e.message); }
    });

    socket.on('get_current_content', () => {
        const event = getEvent();
        if (event) {
            socket.emit('current_content', event.currentContent);
        }
    });

    socket.on('save_snapshot', (data) => {
        try {
            const event = getEvent();
            if (!event) return;

            const snapshot = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                name: data?.name || 'Untitled Snapshot',
                ...event.currentContent
            };
            event.history.push(snapshot);
            immediateSaveEvent(event); // Snapshots are critical - save immediately
            io.to(event.id).emit('history_update', event.history);
        } catch (e) { console.error('save_snapshot error:', e.message); }
    });

    socket.on('get_history', () => {
        const event = getEvent();
        if (event) socket.emit('history_update', event.history);
    });

    socket.on('send_message', (msg) => {
        try {
            const event = getEvent();
            if (!event) return;

            if (event.chatDisabled && socket.data.role !== 'admin' && socket.data.role !== 'superadmin') return;

            const fullMsg = {
                id: Date.now(),
                ...msg,
                eventId: event.id,
                timestamp: new Date().toISOString()
            };
            event.chatHistory.push(fullMsg);
            // Cap chat history
            if (event.chatHistory.length > 500) event.chatHistory = event.chatHistory.slice(-500);
            debouncedSaveEvent(event); // Debounced — chat is high frequency

            io.to(event.id).emit('chat_message', fullMsg);

            // Relay to Remote Server
            remoteSync.relayMessage(fullMsg);
        } catch (e) { console.error('send_message error:', e.message); }
    });

    socket.on('toggle_chat', (disabled) => {
        const event = getEvent();
        if (event) {
            event.chatDisabled = disabled;
            io.to(event.id).emit('chat_status', { disabled });
        }
    });

    // Polls & Timer
    socket.on('start_timer', (minutes) => {
        const event = getEvent();
        if (event && minutes) {
            event.timerEnd = Date.now() + (minutes * 60 * 1000);
            io.to(event.id).emit('timer_update', event.timerEnd);
        }
    });

    socket.on('stop_timer', () => {
        const event = getEvent();
        if (event) {
            event.timerEnd = null;
            io.to(event.id).emit('timer_update', null);
        }
    });

    socket.on('start_poll', ({ question, options }) => {
        const event = getEvent();
        if (event) {
            event.activePoll = {
                question,
                options: options.map(opt => ({ text: opt, count: 0 })),
                voters: []
            };
            io.to(event.id).emit('poll_update', event.activePoll);
        }
    });

    socket.on('vote_poll', (optionIndex) => {
        const event = getEvent();
        if (event && event.activePoll) {
            if (event.activePoll.voters.includes(socket.id)) return;
            event.activePoll.voters.push(socket.id);
            if (event.activePoll.options[optionIndex]) {
                event.activePoll.options[optionIndex].count++;
                io.to(event.id).emit('poll_update', event.activePoll);
            }
        }
    });

    socket.on('stop_poll', () => {
        const event = getEvent();
        if (event) {
            event.activePoll = null;
            io.to(event.id).emit('poll_update', null);
        }
    });


    // --- HYPERGO WORKSHOP HANDLERS ---
    socket.on('join_workshop', ({ username, workshopId }) => {
        if (!workshopId) return;
        socket.join(`workshop_${workshopId}`);
        socket.data.workshopId = workshopId;
        socket.data.username = username;

        if (!GLOBAL_STATE.workshop_progress[workshopId]) {
            GLOBAL_STATE.workshop_progress[workshopId] = {};
        }

        const progress = GLOBAL_STATE.workshop_progress[workshopId][username] || { step: 0, completed: false, certificateReady: false };
        socket.emit('workshop_restore_progress', progress);

        sendWorkshopMonitorUpdate(workshopId);
        socket.emit('workshop_gate_update', GLOBAL_STATE.workshop_gates[workshopId] || 0);
    });

    socket.on('update_workshop_progress', ({ step, completed }) => {
        const { workshopId, username } = socket.data;
        if (!workshopId || !username) return;

        if (!GLOBAL_STATE.workshop_progress[workshopId]) GLOBAL_STATE.workshop_progress[workshopId] = {};
        GLOBAL_STATE.workshop_progress[workshopId][username] = {
            ...(GLOBAL_STATE.workshop_progress[workshopId][username] || {}),
            step,
            completed
        };
        db.saveWorkshopProgress(GLOBAL_STATE.workshop_progress);
        sendWorkshopMonitorUpdate(workshopId);
    });

    socket.on('reset_workshop_progress', () => {
        const { workshopId, username } = socket.data;
        if (!workshopId || !username) return;

        if (GLOBAL_STATE.workshop_progress[workshopId] && GLOBAL_STATE.workshop_progress[workshopId][username]) {
            GLOBAL_STATE.workshop_progress[workshopId][username] = {
                step: 0,
                completed: false,
                certificateReady: false
            };
            db.saveWorkshopProgress(GLOBAL_STATE.workshop_progress);
            sendWorkshopMonitorUpdate(workshopId);
        }
    });

    socket.on('request_certificate', () => {
        const { workshopId, username } = socket.data;
        if (!workshopId || !username) return;

        if (!GLOBAL_STATE.workshop_progress[workshopId]) GLOBAL_STATE.workshop_progress[workshopId] = {};
        if (!GLOBAL_STATE.workshop_progress[workshopId][username]) {
            GLOBAL_STATE.workshop_progress[workshopId][username] = { step: 0, completed: false };
        }
        GLOBAL_STATE.workshop_progress[workshopId][username].certificateReady = true;

        db.saveWorkshopProgress(GLOBAL_STATE.workshop_progress);
        sendWorkshopMonitorUpdate(workshopId);
    });

    socket.on('join_workshop_monitor', (workshopId) => {
        socket.join(`workshop_monitor_${workshopId}`);
        sendWorkshopMonitorUpdate(workshopId);
        // Also send current gate to monitor
        socket.emit('workshop_gate_update', GLOBAL_STATE.workshop_gates[workshopId] || 0);
    });

    socket.on('set_workshop_gate', ({ workshopId, maxStep }) => {
        GLOBAL_STATE.workshop_gates[workshopId] = maxStep;
        io.to(`workshop_${workshopId}`).emit('workshop_gate_update', maxStep);
        io.to(`workshop_monitor_${workshopId}`).emit('workshop_gate_update', maxStep);
    });

    socket.on('remove_student_progress', ({ workshopId, username }) => {
        if (GLOBAL_STATE.workshop_progress[workshopId] && GLOBAL_STATE.workshop_progress[workshopId][username]) {
            delete GLOBAL_STATE.workshop_progress[workshopId][username];
            db.saveWorkshopProgress(GLOBAL_STATE.workshop_progress);
            sendWorkshopMonitorUpdate(workshopId);
        }
    });


    // --- GLOBAL ADMIN HANDLERS (No event scope needed necessarily) ---

    socket.on('get_admins', () => {
        socket.emit('admins_list', GLOBAL_STATE.admins);
    });

    socket.on('create_admin', (data) => {
        // Simple check
        if (GLOBAL_STATE.admins.find(a => a.username === data.username)) return;
        GLOBAL_STATE.admins.push(data);
        db.saveAdmins(GLOBAL_STATE.admins); // Persist
        io.emit('admins_list', GLOBAL_STATE.admins);
    });

    socket.on('delete_admin', (username) => {
        GLOBAL_STATE.admins = GLOBAL_STATE.admins.filter(a => a.username !== username);
        db.saveAdmins(GLOBAL_STATE.admins); // Persist
        io.emit('admins_list', GLOBAL_STATE.admins);
    });

    socket.on('update_admin', (data) => {
        const idx = GLOBAL_STATE.admins.findIndex(a => a.username === data.username);
        if (idx !== -1) {
            GLOBAL_STATE.admins[idx].password = data.password;
            db.saveAdmins(GLOBAL_STATE.admins); // Persist
            io.emit('admins_list', GLOBAL_STATE.admins);
        }
    });

    // IP Blocking (Global Effect)
    socket.on('block_ip', (ipToBlock) => {
        if (!ipToBlock || GLOBAL_STATE.blockedIPs.includes(ipToBlock)) return;
        GLOBAL_STATE.blockedIPs.push(ipToBlock);

        // Disconnect all sockets with this IP globally
        io.sockets.sockets.forEach(s => {
            if (getNormalizedIp(s) === ipToBlock) s.disconnect(true);
        });

        io.emit('blocked_ips_update', GLOBAL_STATE.blockedIPs);
    });

    socket.on('unblock_ip', (ip) => {
        GLOBAL_STATE.blockedIPs = GLOBAL_STATE.blockedIPs.filter(i => i !== ip);
        io.emit('blocked_ips_update', GLOBAL_STATE.blockedIPs);
    });

    socket.on('kick_user', (userId) => {
        const target = io.sockets.sockets.get(userId);
        if (target) target.disconnect(true);
    });

    // --- TICKET HANDLERS ---

    socket.on('create_ticket', (ticketData) => {
        try {
            const event = getEvent();
            if (!event) return;

            const newTicket = {
                id: Date.now().toString(),
                studentName: socket.data.username,
                ...ticketData,
                status: 'open',
                isPublic: false,
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (!event.tickets) event.tickets = [];
            event.tickets.push(newTicket);
            immediateSaveEvent(event); // Tickets are critical — save immediately

            io.to(event.id).emit('ticket_created', newTicket);
        } catch (e) { console.error('create_ticket error:', e.message); }
    });

    socket.on('update_ticket', ({ ticketId, updates }) => {
        try {
            const event = getEvent();
            if (!event) return;

            const ticket = (event.tickets || []).find(t => t.id === ticketId);
            if (!ticket) return;

            if (updates.status) ticket.status = updates.status;
            if (updates.isPublic !== undefined) ticket.isPublic = updates.isPublic;
            if (updates.message) {
                if (!ticket.messages) ticket.messages = [];
                ticket.messages.push({
                    id: Date.now().toString(),
                    ...updates.message,
                    timestamp: new Date().toISOString()
                });
            }

            ticket.updatedAt = new Date().toISOString();
            immediateSaveEvent(event); // Tickets are critical

            io.to(event.id).emit('ticket_updated', ticket);
        } catch (e) { console.error('update_ticket error:', e.message); }
    });

    socket.on('get_tickets', () => {
        const event = getEvent();
        if (!event) return;

        let tickets = event.tickets || [];

        // Students see only their tickets + public ones
        if (socket.data.role === 'student') {
            tickets = tickets.filter(t =>
                t.studentName === socket.data.username || t.isPublic
            );
        }

        socket.emit('tickets_list', tickets);
    });

    // --- CHAT HISTORY HANDLERS ---

    socket.on('get_chat_history', ({ eventId }) => {
        const event = GLOBAL_STATE.events.get(eventId);
        if (event) {
            socket.emit('chat_history_update', event.chatHistory);
        }
    });

    socket.on('clear_chat_history', ({ eventId }) => {
        const event = GLOBAL_STATE.events.get(eventId);
        if (event) {
            event.chatHistory = [];
            db.saveEvent(event);
            io.to(eventId).emit('chat_history_update', []);
        }
    });

    // --- ATTENDANCE HANDLERS ---

    socket.on('get_attendance', ({ eventId }) => {
        const event = GLOBAL_STATE.events.get(eventId);
        if (event) {
            sendAttendanceUpdate(eventId);
        }
    });

    // --- DOWNLOAD TO PATH HANDLER ---

    socket.on('download_code_to_path', async ({ path }) => {
        const event = getEvent();
        if (!event || !event.currentContent) {
            socket.emit('download_error', 'No content available to download');
            return;
        }

        try {
            const content = event.currentContent;
            const filename = `lesson-${Date.now()}.${content.language || 'txt'}`;
            const fullPath = require('path').join(path, filename);

            // Write file to specified path
            require('fs').writeFileSync(fullPath, content.content, 'utf8');

            socket.emit('download_success', {
                message: `Code saved to ${fullPath}`,
                path: fullPath
            });
        } catch (error) {
            socket.emit('download_error', `Failed to save file: ${error.message}`);
        }
    });
});

async function sendRosterUpdate(eventId) {
    const sockets = await io.in(eventId).fetchSockets();
    const roster = sockets.map(s => ({
        id: s.id,
        username: s.data.username || 'Anonymous',
        role: s.data.role || 'uknown',
        ip: s.data.ip
    }));
    io.to(eventId).emit('roster_update', roster, eventId);

    // Update global event counts for admins
    const eventsList = Array.from(GLOBAL_STATE.events.values()).map(e => ({
        id: e.id,
        userCount: io.sockets.adapter.rooms.get(e.id)?.size || 0
    }));
    io.emit('event_counts_update', eventsList);

    // Push roster to Live Sync
    remoteSync.pushSync(`roster_${eventId}`, roster);
}

async function sendAttendanceUpdate(eventId) {
    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) return;

    const sockets = await io.in(eventId).fetchSockets();
    const onlineUsers = sockets.map(s => ({
        username: s.data.username || 'Anonymous',
        role: s.data.role || 'unknown'
    }));

    io.to(eventId).emit('attendance_update', {
        records: event.attendance || [],
        online: onlineUsers
    });
}

async function sendWorkshopMonitorUpdate(workshopId) {
    const participants = GLOBAL_STATE.workshop_progress[workshopId] || {};
    const onlineUsernames = [];
    const room = io.sockets.adapter.rooms.get(`workshop_${workshopId}`);
    if (room) {
        for (const socketId of room) {
            const s = io.sockets.sockets.get(socketId);
            if (s && s.data.username && s.data.workshopId === workshopId) {
                onlineUsernames.push(s.data.username);
            }
        }
    }

    const monitorData = Object.entries(participants).map(([uname, data]) => ({
        username: uname,
        ...data,
        isOnline: onlineUsernames.includes(uname)
    }));

    io.to(`workshop_monitor_${workshopId}`).emit('workshop_monitor_update', monitorData);
}

// Serve Adilitix Frontend
const adilitixDistPath = path.join(__dirname, '../adilitix/dist');
if (fs.existsSync(adilitixDistPath)) {
    app.use('/adilitix', express.static(adilitixDistPath));
    // Important: Handle SPA routing for Adilitix
    app.get('/adilitix/*', (req, res) => {
        res.sendFile(path.join(adilitixDistPath, 'index.html'));
    });
}

// Serve React Frontend if it exists (HyperClass)
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // If running as API only (e.g. on Render)
    app.get('/', (req, res) => {
        res.json({ status: 'HyperClass API is running', cloud: 'Supabase Active' });
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);

    // --- SELF PING MECHANISM ---
    // This keeps the Render server awake on the free tier
    const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
    if (RENDER_URL) {
        console.log(`Self-ping enabled for ${RENDER_URL}`);
        setInterval(() => {
            const http = require('https');
            http.get(`${RENDER_URL}/api/ping`, (res) => {
                console.log(`Self-ping (Keep-Alive) Status: ${res.statusCode}`);
            }).on('error', (err) => {
                console.error(`Self-ping failed: ${err.message}`);
            });
        }, 14 * 60 * 1000); // Ping every 14 minutes (Render sleeps at 15)
    }
});

// Ping Endpoint
app.get('/api/ping', (req, res) => {
    res.json({ status: 'alive', timestamp: Date.now() });
});

// ==========================================================
// M5StickC PLUS 2 — SUPERADMIN REMOTE API  /api/m5/*
// All routes require superadmin credentials in the JSON body:
//   { username, password, eventId, ...payload }
// ==========================================================

const m5AuthCheck = (req, res) => {
    const { username, password } = req.body;
    if (username !== SUPERADMIN_CREDENTIALS.username ||
        password !== SUPERADMIN_CREDENTIALS.password) {
        res.status(403).json({ success: false, message: 'Superadmin auth required' });
        return false;
    }
    return true;
};

// GET /api/m5/session/:eventId — session snapshot for the device
app.get('/api/m5/session/:eventId', (req, res) => {
    const event = GLOBAL_STATE.events.get(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({
        id: event.id,
        name: event.name,
        chatDisabled: !!event.chatDisabled,
        timerActive: !!event.timerEnd && event.timerEnd > Date.now(),
        timerEnd: event.timerEnd || null,
        activePoll: !!event.activePoll,
        userCount: io.sockets.adapter.rooms.get(event.id)?.size || 0,
        workshopGate: GLOBAL_STATE.workshop_gates[event.id] || 0,
        ticketCount: (event.tickets || []).filter(t => t.status === 'open').length
    });
});

// POST /api/m5/timer/start — start a countdown timer in a session
app.post('/api/m5/timer/start', (req, res) => {
    if (!m5AuthCheck(req, res)) return;
    const { eventId, minutes } = req.body;
    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const mins = parseInt(minutes) || 5;
    event.timerEnd = Date.now() + mins * 60 * 1000;
    io.to(eventId).emit('timer_update', event.timerEnd);
    debouncedSaveEvent(event);
    console.log(`[M5] Timer started: ${mins} min on ${eventId}`);
    res.json({ success: true, timerEnd: event.timerEnd });
});

// POST /api/m5/timer/stop — stop the timer
app.post('/api/m5/timer/stop', (req, res) => {
    if (!m5AuthCheck(req, res)) return;
    const { eventId } = req.body;
    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.timerEnd = null;
    io.to(eventId).emit('timer_update', null);
    debouncedSaveEvent(event);
    console.log(`[M5] Timer stopped on ${eventId}`);
    res.json({ success: true });
});

// POST /api/m5/broadcast — inject a system-style chat message from teacher
app.post('/api/m5/broadcast', (req, res) => {
    if (!m5AuthCheck(req, res)) return;
    const { eventId, message } = req.body;
    if (!message || !eventId) return res.status(400).json({ success: false });
    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const msg = {
        id: Date.now(),
        username: '📢 Teacher',
        text: message,
        timestamp: new Date().toISOString(),
        isSystem: true,
        fromDevice: 'm5stick'
    };
    event.chatHistory.push(msg);
    if (event.chatHistory.length > 500) event.chatHistory = event.chatHistory.slice(-500);
    debouncedSaveEvent(event);
    io.to(eventId).emit('chat_message', msg);
    console.log(`[M5] Broadcast on ${eventId}: ${message}`);
    res.json({ success: true });
});

// POST /api/m5/chat/toggle — enable or disable chat for a session
app.post('/api/m5/chat/toggle', (req, res) => {
    if (!m5AuthCheck(req, res)) return;
    const { eventId, disabled } = req.body;
    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.chatDisabled = !!disabled;
    io.to(eventId).emit('chat_status', { disabled: event.chatDisabled });
    debouncedSaveEvent(event);
    console.log(`[M5] Chat ${event.chatDisabled ? 'disabled' : 'enabled'} on ${eventId}`);
    res.json({ success: true, chatDisabled: event.chatDisabled });
});

// POST /api/m5/poll/start — launch a quick poll
app.post('/api/m5/poll/start', (req, res) => {
    if (!m5AuthCheck(req, res)) return;
    const { eventId, question, options } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ success: false, message: 'question and options[] required' });
    }
    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.activePoll = {
        question,
        options: options.map(opt => ({ text: opt, count: 0 })),
        voters: [],
        startedAt: new Date().toISOString(),
        fromDevice: 'm5stick'
    };
    io.to(eventId).emit('poll_update', event.activePoll);
    debouncedSaveEvent(event);
    console.log(`[M5] Poll started on ${eventId}: "${question}" options=${options.join('/')}`);
    res.json({ success: true });
});

// POST /api/m5/poll/stop — end the active poll
app.post('/api/m5/poll/stop', (req, res) => {
    if (!m5AuthCheck(req, res)) return;
    const { eventId } = req.body;
    const event = GLOBAL_STATE.events.get(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.activePoll = null;
    io.to(eventId).emit('poll_update', null);
    debouncedSaveEvent(event);
    console.log(`[M5] Poll stopped on ${eventId}`);
    res.json({ success: true });
});

// POST /api/m5/workshop/gate — set the step gate for workshop participants
app.post('/api/m5/workshop/gate', (req, res) => {
    if (!m5AuthCheck(req, res)) return;
    const { eventId, maxStep } = req.body;
    if (maxStep === undefined) return res.status(400).json({ success: false });
    // eventId here is the workshopId (can be the session id or workshop id)
    const step = parseInt(maxStep);
    GLOBAL_STATE.workshop_gates[eventId] = step;
    io.to(`workshop_${eventId}`).emit('workshop_gate_update', step);
    io.to(`workshop_monitor_${eventId}`).emit('workshop_gate_update', step);
    console.log(`[M5] Workshop gate set to step ${step} for ${eventId}`);
    res.json({ success: true, maxStep: step });
});

// GET /api/m5/overview — lightweight dashboard snapshot (home screen data)
app.get('/api/m5/overview', (req, res) => {
    const liveSessions = [];
    GLOBAL_STATE.events.forEach((ev) => {
        liveSessions.push({
            id: ev.id,
            name: ev.name,
            userCount: io.sockets.adapter.rooms.get(ev.id)?.size || 0
        });
    });
    res.json({
        liveSessions,
        registrations: GLOBAL_STATE.adilitix_registrations.length,
        workshops: GLOBAL_STATE.workshops.length,
        completions: (() => {
            let c = 0;
            Object.values(GLOBAL_STATE.workshop_progress).forEach(ws => {
                Object.values(ws).forEach(u => { if (u.completed) c++; });
            });
            return c;
        })()
    });
});

