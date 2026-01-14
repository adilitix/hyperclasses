const fs = require('fs');
const path = require('path');
const supabase = require('./supabase');

const DB_DIR = path.join(__dirname, '../database');
const EVENTS_DIR = path.join(DB_DIR, 'events');
const ADMINS_FILE = path.join(DB_DIR, 'admins.json');
const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');
const WORKSHOP_PROGRESS_FILE = path.join(__dirname, '../data/workshop_progress.json');

// --- DATABASE HELPERS ---
const WORKSHOPS_FILE = path.join(DB_DIR, 'workshops.json');
const ADILITIX_REGISTRATIONS_FILE = path.join(DB_DIR, 'adilitix_registrations.json');
const ADILITIX_INVENTORY_FILE = path.join(DB_DIR, 'adilitix_inventory.json');
const ADILITIX_ORDERS_FILE = path.join(DB_DIR, 'adilitix_orders.json');
const ADILITIX_CERT_SETTINGS_FILE = path.join(DB_DIR, 'adilitix_certificate_settings.json');

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
        { username: 'admin2', password: 'mammoosashi' },
        { username: 'admin@hyperclass', password: 'admin@123' }
    ];
}

// Save admins to file
function saveAdmins(admins) {
    try {
        fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2));
    } catch (err) {
        console.error('Error saving admins:', err);
    }
    // Sync to Cloud
    supabase.syncToCloud('admins', admins).catch(console.error);
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
                        attendance: eventData.attendance || [],
                        isWorkshop: eventData.isWorkshop || false
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
            chatDisabled: event.chatDisabled,
            isWorkshop: event.isWorkshop
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

        // Sync to Cloud
        supabase.syncToCloud(`event_${event.id}`, event).catch(console.error);
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
        // Sync to Cloud: Delete the record
        supabase.removeFromCloud(`event_${eventId}`).catch(console.error);
    } catch (err) {
        console.error('Error deleting event:', err);
    }
}

// Restore data from Cloud if local is empty/outdated
async function restoreFromCloud(globalState) {
    try {
        console.log('Restoring data from Supabase Cloud...');

        // Restore Admins
        const cloudAdmins = await supabase.getFromCloud('admins');
        if (cloudAdmins && Array.isArray(cloudAdmins)) {
            globalState.admins = cloudAdmins;
            saveAdmins(cloudAdmins); // Sync to local
            console.log('Admins restored from cloud.');
        }

        // Restore Settings
        const cloudSettings = await supabase.getFromCloud('settings');
        if (cloudSettings) {
            globalState.settings = cloudSettings;
            saveSettings(cloudSettings); // Sync to local
            console.log('Settings restored from cloud.');
        }

        // Restore Events
        const cloudEventsList = await supabase.listData('event_');
        if (cloudEventsList && cloudEventsList.length > 0) {
            for (const item of cloudEventsList) {
                const eventId = item.name.replace('event_', '').replace('.json', '');
                if (!globalState.events.has(eventId)) {
                    const eventData = await supabase.getFromCloud(`event_${eventId}`);
                    if (eventData) {
                        globalState.events.set(eventId, eventData);
                        saveEvent(eventData); // Sync to local
                        console.log(`Event ${eventId} restored from cloud.`);
                    }
                }
            }
        }

        // Restore Workshops
        const cloudWorkshops = await supabase.getFromCloud('workshops');
        if (cloudWorkshops && Array.isArray(cloudWorkshops)) {
            globalState.workshops = cloudWorkshops;
            saveWorkshops(cloudWorkshops);
            console.log('Workshops restored from cloud.');
        }
    } catch (err) {
        console.error('Failed to restore from cloud:', err);
    }
}

// Workshop Management
function loadWorkshops() {
    try {
        if (fs.existsSync(WORKSHOPS_FILE)) {
            const data = fs.readFileSync(WORKSHOPS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading workshops:', err);
    }
    // Default workshops if file doesn't exist
    return [
        {
            id: '1',
            title: "Robotics Masterclass",
            category: "Robotics",
            image: "🤖",
            desc: "Master the art of building autonomous robots.",
            pages: [
                { id: 'intro', type: 'notes', title: 'Introduction', content: '<h1>Welcome to Robotics</h1><p>In this workshop, you will learn the <b>basics</b> of hardware and microcontroller programming.</p>' },
                { id: 'code1', type: 'code', title: 'Blinky Script', content: 'void setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  delay(1000);\n  digitalWrite(LED_BUILTIN, LOW);\n  delay(1000);\n}', language: 'cpp' },
                { id: 'quiz1', type: 'quiz', title: 'Hardware Quiz', content: 'What does LED stand for?', options: ['Light Emitting Diode', 'Low Energy Device', 'Liquid Electric Display', 'Laser Engine Driver'], correctOption: 0 }
            ]
        },
        {
            id: '2',
            title: "OpenCV Workshop",
            category: "AI",
            image: "👁️",
            desc: "Computer Vision with Python and OpenCV.",
            pages: [
                { id: 'intro', type: 'notes', title: 'Vision Basics', content: '<h1>Computer Vision</h1><p>OpenCV is the industry standard for <b>AI-powered</b> vision systems.</p>' }
            ]
        }
    ];
}

function saveWorkshops(workshops) {
    try {
        fs.writeFileSync(WORKSHOPS_FILE, JSON.stringify(workshops, null, 2));
    } catch (err) {
        console.error('Error saving workshops:', err);
    }
    // Sync to Cloud
    supabase.syncToCloud('workshops', workshops).catch(console.error);
}

module.exports = {
    initDatabase,
    loadAdmins,
    saveAdmins,
    loadEvents,
    saveEvent,
    deleteEvent,
    loadSettings,
    saveSettings,
    loadWorkshops,
    saveWorkshops,
    loadAdilitixRegistrations,
    saveAdilitixRegistrations,
    loadAdilitixInventory,
    saveAdilitixInventory,
    loadAdilitixOrders,
    saveAdilitixOrders,
    loadWorkshopProgress,
    saveWorkshopProgress,
    restoreFromCloud,
    syncLocalToCloud
};

// Push all local data to cloud (Primary sync)
async function syncLocalToCloud(globalState) {
    try {
        console.log('Pushing local data to Supabase Cloud...');
        // Sync Admins
        saveAdmins(globalState.admins);
        // Sync Settings
        saveSettings(globalState.settings);
        // Sync Workshops
        saveWorkshops(globalState.workshops);
        // Sync Workshop Progress
        saveWorkshopProgress(globalState.workshop_progress);
        // Sync Events
        for (const [id, event] of globalState.events) {
            saveEvent(event);
            console.log(`Event ${id} synced to cloud.`);
        }
        console.log('All local data synced to cloud.');
    } catch (err) {
        console.error('Failed to sync local data to cloud:', err);
    }
}

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
    // Sync to Cloud
    supabase.syncToCloud('settings', settings).catch(console.error);
}

function loadWorkshopProgress() {
    try {
        if (fs.existsSync(WORKSHOP_PROGRESS_FILE)) {
            return JSON.parse(fs.readFileSync(WORKSHOP_PROGRESS_FILE, 'utf8'));
        }
    } catch (err) { console.error(err); }
    return {};
}

function saveWorkshopProgress(progress) {
    try {
        if (!fs.existsSync(path.dirname(WORKSHOP_PROGRESS_FILE))) {
            fs.mkdirSync(path.dirname(WORKSHOP_PROGRESS_FILE), { recursive: true });
        }
        fs.writeFileSync(WORKSHOP_PROGRESS_FILE, JSON.stringify(progress, null, 2));
    } catch (err) { console.error(err); }
    supabase.syncToCloud('workshop_progress', progress).catch(console.error);
}

function loadAdilitixRegistrations() {
    try {
        if (fs.existsSync(ADILITIX_REGISTRATIONS_FILE)) {
            return JSON.parse(fs.readFileSync(ADILITIX_REGISTRATIONS_FILE, 'utf8'));
        }
    } catch (err) { console.error('Error loading Adilitix registrations:', err); }
    return [];
}

function saveAdilitixRegistrations(registrations) {
    try {
        fs.writeFileSync(ADILITIX_REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
    } catch (err) { console.error('Error saving Adilitix registrations:', err); }
    supabase.syncToCloud('adilitix_registrations', registrations).catch(console.error);
}

function loadAdilitixInventory() {
    try {
        if (fs.existsSync(ADILITIX_INVENTORY_FILE)) {
            return JSON.parse(fs.readFileSync(ADILITIX_INVENTORY_FILE, 'utf8'));
        }
    } catch (err) { console.error('Error loading Adilitix inventory:', err); }
    return [
        { id: '1', name: 'Arduino Nano', count: 45, category: 'Microcontrollers' },
        { id: '2', name: 'SG90 Servo', count: 120, category: 'Actuators' },
        { id: '3', name: 'HC-SR04 Sensor', count: 80, category: 'Sensors' }
    ];
}

function saveAdilitixInventory(inventory) {
    try {
        fs.writeFileSync(ADILITIX_INVENTORY_FILE, JSON.stringify(inventory, null, 2));
    } catch (err) { console.error('Error saving Adilitix inventory:', err); }
    supabase.syncToCloud('adilitix_inventory', inventory).catch(console.error);
}

function loadAdilitixOrders() {
    try {
        if (fs.existsSync(ADILITIX_ORDERS_FILE)) {
            return JSON.parse(fs.readFileSync(ADILITIX_ORDERS_FILE, 'utf8'));
        }
    } catch (err) { console.error('Error loading Adilitix orders:', err); }
    return [];
}

function saveAdilitixOrders(orders) {
    try {
        fs.writeFileSync(ADILITIX_ORDERS_FILE, JSON.stringify(orders, null, 2));
    } catch (err) { console.error('Error saving Adilitix orders:', err); }
    supabase.syncToCloud('adilitix_orders', orders).catch(console.error);
}

function loadAdilitixCertificateSettings() {
    try {
        if (fs.existsSync(ADILITIX_CERT_SETTINGS_FILE)) {
            return JSON.parse(fs.readFileSync(ADILITIX_CERT_SETTINGS_FILE, 'utf8'));
        }
    } catch (err) { console.error('Error loading cert settings:', err); }
    return {};
}

function saveAdilitixCertificateSettings(settings) {
    try {
        fs.writeFileSync(ADILITIX_CERT_SETTINGS_FILE, JSON.stringify(settings, null, 2));
    } catch (err) { console.error('Error saving cert settings:', err); }
    supabase.syncToCloud('adilitix_certificate_settings', settings).catch(console.error);
}

module.exports = {
    initDatabase,
    loadAdmins, saveAdmins,
    loadEvents, saveEvent, deleteEvent,
    loadWorkshops, saveWorkshops,
    loadSettings, saveSettings,
    loadWorkshopProgress, saveWorkshopProgress,
    loadAdilitixRegistrations, saveAdilitixRegistrations,
    loadAdilitixInventory, saveAdilitixInventory,
    loadAdilitixOrders, saveAdilitixOrders,
    loadAdilitixCertificateSettings, saveAdilitixCertificateSettings,
    restoreFromCloud,
    syncLocalToCloud
};
