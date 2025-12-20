const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });
// Database (In-Memory)
const state = {
    currentContent: {
        type: 'text', // 'text', 'code'
        content: '<h1>Welcome to the Workshop</h1><p>Waiting for admin...</p>',
        language: 'html'
    },
    users: [], // { id, username, role, ip }
    files: [], // { filename, size }
    admins: [
        { username: 'admin', password: 'Aadil@123' },
        { username: 'admin2', password: 'mammoosashi' }
    ],
    history: [], // { id, timestamp, type, content, language }
    chatDisabled: false,
    blockedIPs: [] // Array of blocked IP strings
};

const SUPERADMIN_CREDENTIALS = {
    username: 'superadmin',
    password: 'mammoosashi'
};

// Middleware to check blocked IPs for API routes
app.use((req, res, next) => {
    let clientIp = req.ip || req.connection.remoteAddress;
    // Normalize IP
    if (clientIp && clientIp.startsWith('::ffff:')) clientIp = clientIp.substr(7);
    if (clientIp === '::1') clientIp = '127.0.0.1';

    if (state.blockedIPs.includes(clientIp)) {
        return res.status(403).json({ success: false, message: 'Access Denied: Your IP is blocked.' });
    }
    next();
});

// API Routes
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;

    if (role === 'admin') {
        // Superadmin Check
        if (username === SUPERADMIN_CREDENTIALS.username && password === SUPERADMIN_CREDENTIALS.password) {
            return res.json({ success: true, username: 'Super Admin', role: 'superadmin' });
        }

        // Check against state.admins
        const adminUser = state.admins.find(a => a.username === username && a.password === password);
        if (adminUser) {
            return res.json({ success: true, username: adminUser.username, role: 'admin' });
        }

        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    } else {
        // Student login (no password)
        if (!username) return res.status(400).json({ success: false, message: 'Username required' });
        return res.json({ success: true, username, role: 'student' });
    }
});
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');

    const fileInfo = {
        filename: req.file.originalname,
        size: req.file.size
    };

    // Add if not exists
    if (!state.files.find(f => f.filename === fileInfo.filename)) {
        state.files.push(fileInfo);
    }

    io.emit('file_list_update', state.files);
    res.json({ success: true, file: fileInfo });
});

app.delete('/api/files/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Remove from state
    state.files = state.files.filter(f => f.filename !== filename);

    // Remove from disk
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    io.emit('file_list_update', state.files);
    res.json({ success: true });
});

app.get('/api/files', (req, res) => {
    res.json(state.files);
});

// Socket.io
// Poll State
let activePoll = null;
// Timer State
let timerEnd = null;
// Roster State
let onlineUsers = {}; // socketId -> { username, role, ip }

const getNormalizedIp = (socket) => {
    let ip = socket.handshake.address;
    if (ip && ip.startsWith('::ffff:')) ip = ip.substr(7);
    if (ip === '::1') ip = '127.0.0.1';
    return ip;
};

io.on('connection', (socket) => {
    const clientIp = getNormalizedIp(socket);

    // Check if IP is blocked
    if (state.blockedIPs.includes(clientIp)) {
        socket.disconnect(true);
        return;
    }

    if (activePoll) socket.emit('poll_update', activePoll);
    if (timerEnd) socket.emit('timer_update', timerEnd);
    socket.emit('roster_update', Object.values(onlineUsers));
    // Send blocked IPs to admins (or everyone, keeping it simple for now)
    socket.emit('blocked_ips_update', state.blockedIPs);

    socket.on('login', (data) => {
        // Track user
        if (data && data.username) {
            onlineUsers[socket.id] = { username: data.username, role: data.role, ip: clientIp };
            io.emit('roster_update', Object.values(onlineUsers));
        }
    });

    socket.on('disconnect', () => {
        if (onlineUsers[socket.id]) {
            delete onlineUsers[socket.id];
            io.emit('roster_update', Object.values(onlineUsers));
        }
    });

    // ... existing poll handlers ...

    // Timer Handlers
    socket.on('start_timer', (minutes) => {
        if (!minutes) return;
        timerEnd = Date.now() + (minutes * 60 * 1000);
        io.emit('timer_update', timerEnd);
    });

    socket.on('stop_timer', () => {
        timerEnd = null;
        io.emit('timer_update', null);
    });

    // ... existing handlers ...

    socket.on('start_poll', ({ question, options }) => {
        activePoll = {
            question,
            options: options.map(opt => ({ text: opt, count: 0 })),
            voters: [] // Track socket IDs or usernames to prevent double voting
        };
        io.emit('poll_update', activePoll);
    });

    socket.on('vote_poll', (optionIndex) => {
        if (!activePoll) return;
        // Simple double-vote prevention (per session)
        if (activePoll.voters.includes(socket.id)) return;

        activePoll.voters.push(socket.id);
        activePoll.options[optionIndex].count++;
        io.emit('poll_update', activePoll);
    });

    socket.on('stop_poll', () => {
        activePoll = null;
        io.emit('poll_update', null);
    });

    // ... existing handlers ...


    // Send initial state
    socket.emit('content_update', state.currentContent);
    socket.emit('file_list_update', state.files);
    socket.emit('chat_status', { disabled: state.chatDisabled });

    socket.on('join', ({ username, role }) => {
        const user = { id: socket.id, username, role, ip: clientIp };
        state.users.push(user);
        io.emit('users_update', state.users);

        // System message
        io.emit('chat_message', {
            id: Date.now(),
            username: 'System',
            text: `${username} joined the session.`,
            isSystem: true
        });
    });

    socket.on('disconnect', () => {
        const user = state.users.find(u => u.id === socket.id);
        state.users = state.users.filter(u => u.id !== socket.id);
        io.emit('users_update', state.users);

        if (user) {
            io.emit('chat_message', {
                id: Date.now(),
                username: 'System',
                text: `${user.username} left the session.`,
                isSystem: true
            });
        }
    });

    // Admin Commands
    socket.on('broadcast_content', (content) => {
        // content: { type, content, language }
        state.currentContent = content;
        socket.broadcast.emit('content_update', content);
    });

    socket.on('save_snapshot', (data) => {
        const snapshot = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            name: data?.name || 'Untitled Snapshot',
            ...state.currentContent
        };
        state.history.push(snapshot);
        io.emit('history_update', state.history);
    });

    socket.on('get_history', () => {
        socket.emit('history_update', state.history);
    });

    socket.on('get_admins', () => {
        socket.emit('admins_list', state.admins);
    });

    socket.on('create_admin', (data) => {
        // Only allowing if sent by superadmin (client-side check + trust for now in simple app)
        if (state.admins.find(a => a.username === data.username)) return;
        state.admins.push(data);
        io.emit('admins_list', state.admins);
    });

    socket.on('delete_admin', (username) => {
        state.admins = state.admins.filter(a => a.username !== username);
        io.emit('admins_list', state.admins);
    });

    socket.on('update_admin', (data) => {
        // data: { username, password } (username identifies the admin to update)
        const adminIndex = state.admins.findIndex(a => a.username === data.username);
        if (adminIndex !== -1) {
            state.admins[adminIndex].password = data.password;
            io.emit('admins_list', state.admins);
        }
    });

    socket.on('kick_user', (userId) => {
        const targetSocket = io.sockets.sockets.get(userId);
        if (targetSocket) {
            targetSocket.disconnect(true);
        }
    });

    // IP Handling Commands
    socket.on('block_ip', (ipToBlock) => {
        if (!ipToBlock) return;
        if (!state.blockedIPs.includes(ipToBlock)) {
            state.blockedIPs.push(ipToBlock);
        }

        // Disconnect all users with this IP
        const sockets = io.sockets.sockets;
        // sockets is a Map in Socket.io v4
        sockets.forEach(s => {
            const sIp = getNormalizedIp(s);
            if (sIp === ipToBlock) {
                s.disconnect(true);
            }
        });

        io.emit('blocked_ips_update', state.blockedIPs);
    });

    socket.on('unblock_ip', (ipToUnblock) => {
        state.blockedIPs = state.blockedIPs.filter(ip => ip !== ipToUnblock);
        io.emit('blocked_ips_update', state.blockedIPs);
    });

    socket.on('toggle_chat', (disabled) => {
        state.chatDisabled = disabled;
        io.emit('chat_status', { disabled });
    });

    socket.on('clear_files', () => {
        state.files = [];
        // Optional: delete from disk
        io.emit('file_list_update', state.files);
    });

    // Chat
    socket.on('send_message', (msg) => {
        // msg: { username, text, image? }
        if (state.chatDisabled && msg.username !== 'admin' && msg.username !== 'Super Admin') return;

        io.emit('chat_message', {
            id: Date.now(),
            ...msg,
            timestamp: new Date().toISOString()
        });
    });
});

// Serve React Frontend (Product Build)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle React Routing (return index.html for unknown routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local Access: http://localhost:${PORT}`);
});
