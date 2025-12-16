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
    users: [], // { id, username, role }
    files: [], // { filename, size }
    chatDisabled: false
};

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'Aadil@123'
};

// API Routes
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;

    if (role === 'admin') {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            return res.json({ success: true, username: 'admin', role: 'admin' });
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
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Send initial state
    socket.emit('content_update', state.currentContent);
    socket.emit('file_list_update', state.files);
    socket.emit('chat_status', { disabled: state.chatDisabled });

    socket.on('join', ({ username, role }) => {
        const user = { id: socket.id, username, role };
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
        if (state.chatDisabled && msg.username !== 'admin') return;

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
