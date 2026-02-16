const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const supabase = require('./supabase');
const googleSheets = require('./googleSheets');

const app = express();
const server = http.createServer(app);

// Configure CORS
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for workshop environment
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded files at /uploads path

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
    adilitix_certificate_settings: db.loadAdilitixCertificateSettings()
};

// Initial Cloud Sync (Bidirectional)
(async () => {
    try {
        // First restore missing local data from cloud
        await db.restoreFromCloud(GLOBAL_STATE);

        // Then push any local data to cloud (helps if localhost has more data than cloud)
        // This is safe because saveEvent etc. use upsert
        await db.syncLocalToCloud(GLOBAL_STATE);

        console.log('✅ Cloud synchronization complete.');
    } catch (err) {
        console.error('❌ Cloud synchronization failed:', err);
    }
})();

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

// --- API ROUTES ---

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
        if (!eventId) return; // Admins might not join event immediately

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
        socket.data.attendanceId = attendanceRecord.id; // Store for logout tracking
        db.saveEvent(event); // Persist

        // Send Initial State for this Event
        socket.emit('content_update', event.currentContent);
        socket.emit('file_list_update', event.files);
        socket.emit('chat_status', { disabled: event.chatDisabled });
        if (event.activePoll) socket.emit('poll_update', event.activePoll);
        if (event.timerEnd) socket.emit('timer_update', event.timerEnd);
        socket.emit('history_update', event.history);

        // Send chat history to the user
        socket.emit('chat_history_update', event.chatHistory);

        // Notify others
        // Roster Update: We need to get all sockets in this room
        sendRosterUpdate(eventId);

        // Send attendance update
        sendAttendanceUpdate(eventId);

        // System Message
        const systemMsg = {
            id: Date.now(),
            username: 'System',
            text: `${username} joined the session.`,
            timestamp: new Date().toISOString(),
            isSystem: true
        };
        event.chatHistory.push(systemMsg);
        db.saveEvent(event);
        io.to(eventId).emit('chat_message', systemMsg);
    });

    socket.on('disconnect', () => {
        const eventId = socket.data.eventId;
        if (eventId) {
            const event = GLOBAL_STATE.events.get(eventId);

            // Track logout time in attendance
            if (event && socket.data.attendanceId) {
                const record = event.attendance.find(r => r.id === socket.data.attendanceId);
                if (record && !record.logoutTime) {
                    record.logoutTime = new Date().toISOString();
                    db.saveEvent(event);
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
                db.saveEvent(event);
                io.to(eventId).emit('chat_message', systemMsg);
            }
        }
    });

    // --- EVENT SPECIFIC HANDLERS ---

    const getEvent = () => {
        const eid = socket.data.eventId;
        if (!eid) return null;
        return GLOBAL_STATE.events.get(eid);
    }

    socket.on('broadcast_content', (content) => {
        const event = getEvent();
        if (!event) return;
        event.currentContent = content;
        db.saveEvent(event); // Persist
        socket.to(event.id).emit('content_update', content); // To others
    });

    socket.on('get_current_content', () => {
        const event = getEvent();
        if (event) {
            socket.emit('current_content', event.currentContent);
        }
    });

    socket.on('save_snapshot', (data) => {
        const event = getEvent();
        if (!event) return;

        const snapshot = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: data?.name || 'Untitled Snapshot',
            ...event.currentContent
        };
        event.history.push(snapshot);
        db.saveEvent(event); // Persist
        io.to(event.id).emit('history_update', event.history);
    });

    socket.on('get_history', () => {
        const event = getEvent();
        if (event) socket.emit('history_update', event.history);
    });

    socket.on('send_message', (msg) => {
        const event = getEvent();
        if (!event) return;

        if (event.chatDisabled && socket.data.role !== 'admin' && socket.data.role !== 'superadmin') return;

        const fullMsg = {
            id: Date.now(),
            ...msg,
            timestamp: new Date().toISOString()
        };
        event.chatHistory.push(fullMsg);
        db.saveEvent(event); // Persist

        io.to(event.id).emit('chat_message', fullMsg);
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

        event.tickets.push(newTicket);
        db.saveEvent(event); // Persist

        // Notify all admins in this event
        io.to(event.id).emit('ticket_created', newTicket);
    });

    socket.on('update_ticket', ({ ticketId, updates }) => {
        const event = getEvent();
        if (!event) return;

        const ticket = event.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Apply updates
        if (updates.status) ticket.status = updates.status;
        if (updates.isPublic !== undefined) ticket.isPublic = updates.isPublic;
        if (updates.message) {
            ticket.messages.push({
                id: Date.now().toString(),
                ...updates.message,
                timestamp: new Date().toISOString()
            });
        }

        ticket.updatedAt = new Date().toISOString();
        db.saveEvent(event); // Persist

        // Broadcast update
        io.to(event.id).emit('ticket_updated', ticket);
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
    io.to(eventId).emit('roster_update', roster);
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
