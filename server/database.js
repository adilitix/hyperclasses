const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, '../database');
const EVENTS_DIR = path.join(DB_DIR, 'events');
const ADMINS_FILE = path.join(DB_DIR, 'admins.json');
const SETTINGS_FILE = path.join(DB_DIR, 'settings.json');

// Ensure database directories exist
function initDatabase() {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(EVENTS_DIR)) {
        fs.mkdirSync(EVENTS_DIR, { recursive: true });
    }
}

// Load admins from file
function loadAdmins() {
    try {
        if (fs.existsSync(ADMINS_FILE)) {
            const data = fs.readFileSync(ADMINS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading admins:', err);
    }
    // Default admins if file doesn't exist
    return [
        { username: 'admin', password: 'Aadil@123' },
        { username: 'admin2', password: 'mammoosashi' }
    ];
}

// Save admins to file
function saveAdmins(admins) {
    try {
        fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2));
    } catch (err) {
        console.error('Error saving admins:', err);
    }
}

// Load all events from disk
function loadEvents() {
    const events = new Map();
    try {
        if (fs.existsSync(EVENTS_DIR)) {
            const eventDirs = fs.readdirSync(EVENTS_DIR);
            for (const eventId of eventDirs) {
                const eventFile = path.join(EVENTS_DIR, eventId, 'event.json');
                if (fs.existsSync(eventFile)) {
                    const data = fs.readFileSync(eventFile, 'utf8');
                    const eventData = JSON.parse(data);

                    // Reconstruct event object with all properties
                    const event = {
                        id: eventData.id,
                        name: eventData.name,
                        createdBy: eventData.createdBy,
                        createdAt: eventData.createdAt,
                        currentContent: eventData.currentContent || { type: 'text', content: '', language: 'html', instructions: '' },
                        files: eventData.files || [],
                        activePoll: null,
                        timerEnd: null,
                        history: [],
                        chatDisabled: eventData.chatDisabled || false,
                        chatHistory: [],
                        tickets: [],
                        attendance: eventData.attendance || []
                    };

                    // Load chat history
                    const chatFile = path.join(EVENTS_DIR, eventId, 'chat_history.json');
                    if (fs.existsSync(chatFile)) {
                        event.chatHistory = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
                    }

                    // Load snapshots
                    const snapshotsFile = path.join(EVENTS_DIR, eventId, 'snapshots.json');
                    if (fs.existsSync(snapshotsFile)) {
                        event.history = JSON.parse(fs.readFileSync(snapshotsFile, 'utf8'));
                    }

                    // Load tickets
                    const ticketsFile = path.join(EVENTS_DIR, eventId, 'tickets.json');
                    if (fs.existsSync(ticketsFile)) {
                        event.tickets = JSON.parse(fs.readFileSync(ticketsFile, 'utf8'));
                    }

                    // Load attendance
                    const attendanceFile = path.join(EVENTS_DIR, eventId, 'attendance.json');
                    if (fs.existsSync(attendanceFile)) {
                        event.attendance = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
                    }

                    events.set(eventId, event);
                }
            }
        }
    } catch (err) {
        console.error('Error loading events:', err);
    }
    return events;
}

// Save event to disk
function saveEvent(event) {
    try {
        const eventDir = path.join(EVENTS_DIR, event.id);
        if (!fs.existsSync(eventDir)) {
            fs.mkdirSync(eventDir, { recursive: true });
        }

        // Save event metadata
        const eventData = {
            id: event.id,
            name: event.name,
            createdBy: event.createdBy,
            createdAt: event.createdAt,
            currentContent: event.currentContent,
            files: event.files,
            chatDisabled: event.chatDisabled
        };
        fs.writeFileSync(path.join(eventDir, 'event.json'), JSON.stringify(eventData, null, 2));

        // Save chat history
        if (event.chatHistory) {
            fs.writeFileSync(path.join(eventDir, 'chat_history.json'), JSON.stringify(event.chatHistory, null, 2));
        }

        // Save snapshots
        if (event.history) {
            fs.writeFileSync(path.join(eventDir, 'snapshots.json'), JSON.stringify(event.history, null, 2));
        }

        // Save tickets
        if (event.tickets) {
            fs.writeFileSync(path.join(eventDir, 'tickets.json'), JSON.stringify(event.tickets, null, 2));
        }

        // Save attendance
        if (event.attendance) {
            fs.writeFileSync(path.join(eventDir, 'attendance.json'), JSON.stringify(event.attendance, null, 2));
        }
    } catch (err) {
        console.error('Error saving event:', err);
    }
}

// Delete event from disk
function deleteEvent(eventId) {
    try {
        const eventDir = path.join(EVENTS_DIR, eventId);
        if (fs.existsSync(eventDir)) {
            fs.rmSync(eventDir, { recursive: true, force: true });
        }
    } catch (err) {
        console.error('Error deleting event:', err);
    }
}

module.exports = {
    initDatabase,
    loadAdmins,
    saveAdmins,
    loadEvents,
    saveEvent,
    deleteEvent,
    loadSettings,
    saveSettings
};

function loadSettings() {
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading settings:', err);
    }
    return {
        aboutWebsite: {
            productName: 'HyperClass',
            companyName: 'Adilitix Robotics',
            summary: 'A real-time interactive workshop management system.',
            features: [
                'Live Code Broadcasting',
                'Real-time Chat with File Sharing',
                'Interactive Polls & Assessments',
                'Ticketing & Support System',
                'Attendance & History Tracking'
            ],
            specialities: [
                'Low-latency interaction',
                'Modern Glassmorphic UI',
                'Comprehensive Admin Controls'
            ]
        }
    };
}

function saveSettings(settings) {
    try {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    } catch (err) {
        console.error('Error saving settings:', err);
    }
}
