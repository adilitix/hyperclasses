const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database');

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
    constructor(id, name, createdBy) {
        this.id = id;
        this.name = name;
        this.createdBy = createdBy; // admin username
        this.createdAt = new Date();

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
    settings: db.loadSettings(), // Global application settings
    blockedIPs: [] // Global blocklist
};

const SUPERADMIN_CREDENTIALS = {
    username: 'superadmin',
    password: 'Aadil@123'
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

    if (role === 'admin' || role === 'superadmin') { // Allow login as admin/superadmin without eventId initially
        if (role === 'superadmin') {
            // Superadmin Check
            if (username === SUPERADMIN_CREDENTIALS.username && password === SUPERADMIN_CREDENTIALS.password) {
                return res.json({ success: true, username: 'Super Admin', role: 'superadmin' });
            }
            return res.status(401).json({ success: false, message: 'Invalid superadmin credentials' });
        }

        // Admin Check
        const adminUser = GLOBAL_STATE.admins.find(a => a.username === username && a.password === password);
        if (adminUser) {
            return res.json({ success: true, username: adminUser.username, role: 'admin' });
        }

        // Fallback: Check if they are actually the superadmin even if role was 'admin'
        if (username === SUPERADMIN_CREDENTIALS.username && password === SUPERADMIN_CREDENTIALS.password) {
            return res.json({ success: true, username: 'Super Admin', role: 'superadmin' });
        }

        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });

    } else {
        // Student login
        if (!username) return res.status(400).json({ success: false, message: 'Username required' });

        // EVENT CHECK FOR STUDENTS
        if (!eventId) return res.status(400).json({ success: false, message: 'Event ID required' });

        const event = GLOBAL_STATE.events.get(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found. Checks your ID.' });
        }

        return res.json({
            success: true,
            username,
            role: 'student',
            eventId,
            eventName: event.name,
            trainerUsername: event.createdBy
        });
    }
});

// Update Profile (Admin/Superadmin)
app.post('/api/profile/update', (req, res) => {
    const { username, role, newPassword, about, displayName } = req.body;

    if (role === 'superadmin') {
        if (newPassword) {
            // Updated to allow password update for superadmin
        }
        return res.json({ success: true, message: 'Superadmin profile updated (Simulated)' });
    }

    const adminIndex = GLOBAL_STATE.admins.findIndex(a => a.username === username);
    if (adminIndex !== -1) {
        if (newPassword) GLOBAL_STATE.admins[adminIndex].password = newPassword;
        if (about !== undefined) GLOBAL_STATE.admins[adminIndex].about = about;
        if (displayName) GLOBAL_STATE.admins[adminIndex].displayName = displayName;

        db.saveAdmins(GLOBAL_STATE.admins);
        return res.json({ success: true, message: 'Profile updated' });
    }

    res.status(404).json({ success: false, message: 'User not found' });
});

// App Settings (About Website)
app.get('/api/settings', (req, res) => {
    res.json(GLOBAL_STATE.settings);
});

app.post('/api/settings', (req, res) => {
    const { aboutWebsite } = req.body;
    if (aboutWebsite) {
        GLOBAL_STATE.settings.aboutWebsite = aboutWebsite;
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


// Events Management (Admin Only - simplified check)
app.get('/api/events', (req, res) => {
    // Convert Map to Array
    const eventsList = Array.from(GLOBAL_STATE.events.values()).map(e => ({
        id: e.id,
        name: e.name,
        createdBy: e.createdBy,
        createdAt: e.createdAt,
        userCount: io.sockets.adapter.rooms.get(e.id)?.size || 0
    }));
    res.json(eventsList);
});

app.post('/api/events', (req, res) => {
    const { name, createdBy, customId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Event name required' });

    const id = customId || Date.now().toString(36); // Simple ID generation

    if (GLOBAL_STATE.events.has(id)) {
        return res.status(400).json({ success: false, message: 'Event ID already exists' });
    }

    const newEvent = new EventRoom(id, name, createdBy || 'System');
    GLOBAL_STATE.events.set(id, newEvent);
    db.saveEvent(newEvent); // Persist to disk

    // Broadcast event list update to all admins (who might be in a 'dashboard' room?)
    // For now, we'll rely on polling or refresher, or maybe a global 'admin_room'
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


app.post('/api/upload', upload.single('file'), (req, res) => {
    // Requires eventId in body to know where to put it in state
    const { eventId } = req.body;

    if (!req.file) return res.status(400).send('No file uploaded');

    const fileInfo = {
        filename: req.file.originalname,
        size: req.file.size
    };

    // If eventId provided, add to that event's file list
    if (eventId && GLOBAL_STATE.events.has(eventId)) {
        const event = GLOBAL_STATE.events.get(eventId);
        // Add if not exists
        if (!event.files.find(f => f.filename === fileInfo.filename)) {
            event.files.push(fileInfo);
            io.to(eventId).emit('file_list_update', event.files);
        }
    } else {
        // If no event ID (maybe uploaded from dashboard?), just store on disk 
        // effectively orphaned from UI until manually linked, but we'll ignore for now
    }

    res.json({ success: true, file: fileInfo });
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

// Serve React Frontend (Product Build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React Routing (return index.html for unknown routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
