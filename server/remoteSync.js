const axios = require('axios');
const io = require('socket.io-client');

class RemoteSyncService {
    constructor() {
        this.targetUrl = process.env.SYNC_TARGET_URL || null;
        this.syncSecret = process.env.SYNC_SECRET || 'hyper-sync-123';
        this.isEnabled = !!this.targetUrl;
        this.socket = null;
        this.localIo = null;
        this.globalState = null;
        this.db = null;
        this.lastSentMessageIds = new Set();

        if (this.isEnabled) {
            console.log(`📡 Remote Live Sync initialized targeting: ${this.targetUrl}`);
            this.initSocket();
        }
    }

    setDependencies(localIo, globalState, db) {
        this.localIo = localIo;
        this.globalState = globalState;
        this.db = db;
    }

    initSocket() {
        if (!this.targetUrl || this.socket) return;

        this.socket = io(this.targetUrl, {
            transports: ['websocket'],
            reconnection: true,
            auth: { secret: this.syncSecret }
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to Remote Server Socket');
            this.syncActiveRooms();
        });

        this.socket.on('chat_message', (msg) => {
            if (this.lastSentMessageIds.has(msg.id)) {
                this.lastSentMessageIds.delete(msg.id);
                return;
            }

            if (this.localIo && msg.username !== 'System') {
                const eventId = msg.eventId;
                if (eventId) {
                    this.localIo.to(eventId).emit('chat_message', msg);
                    const event = this.globalState.events.get(eventId);
                    if (event && !event.chatHistory.some(m => m.id === msg.id)) {
                        event.chatHistory.push(msg);
                        if (event.chatHistory.length > 500) event.chatHistory = event.chatHistory.slice(-500);
                    }
                }
            }
        });

        this.socket.on('roster_update', (roster, eventId) => {
            if (this.localIo && eventId) {
                this.localIo.to(eventId).emit('remote_roster_update', roster);
            }
        });

        this.socket.on('content_update', (content, eventId) => {
            if (this.localIo && eventId) {
                const event = this.globalState.events.get(eventId);
                if (event) {
                    event.currentContent = content;
                    this.localIo.to(eventId).emit('content_update', content);
                }
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from Remote Server Socket');
        });
    }

    syncActiveRooms() {
        if (!this.socket || !this.globalState) return;
        this.globalState.events.forEach((event, id) => {
            this.socket.emit('join_event', {
                username: 'SyncRelay_Local',
                role: 'admin',
                eventId: id
            });
        });
    }

    toggleSync(enabled) {
        this.isEnabled = enabled;
        if (enabled && !this.socket) {
            this.initSocket();
        } else if (!enabled && this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        return this.isEnabled;
    }

    relayMessage(msg) {
        if (this.socket && this.isEnabled) {
            this.lastSentMessageIds.add(msg.id);
            this.socket.emit('send_message', msg);

            if (this.lastSentMessageIds.size > 100) {
                const arr = Array.from(this.lastSentMessageIds);
                this.lastSentMessageIds = new Set(arr.slice(-50));
            }
        }
    }

    async pushSync(key, data) {
        if (!this.isEnabled || !this.targetUrl) return;

        try {
            await axios.post(`${this.targetUrl}/api/sync/receive`, {
                key,
                data,
                secret: this.syncSecret
            }, {
                timeout: 5000
            });
        } catch (error) { }
    }

    async syncAll() {
        if (!this.isEnabled || !this.globalState || !this.targetUrl) return;

        console.log('🔄 Performing Full Manual Sync to Live...');

        try {
            // Core Data
            await this.pushSync('admins', this.globalState.admins);
            await this.pushSync('workshops', this.globalState.workshops);
            await this.pushSync('settings', this.globalState.settings);

            // Events Data
            for (const [id, event] of this.globalState.events) {
                await this.pushSync(`event_${id}`, event);
            }

            // Adilitix Data
            await this.pushSync('adilitix_registrations', this.globalState.adilitix_registrations);
            await this.pushSync('adilitix_inventory', this.globalState.adilitix_inventory);
            await this.pushSync('adilitix_orders', this.globalState.adilitix_orders);
            await this.pushSync('adilitix_certificate_settings', this.globalState.adilitix_certificate_settings);
            await this.pushSync('adilitix_admins', this.globalState.adilitix_admins);
            await this.pushSync('adilitix_events', this.globalState.adilitix_events);
            await this.pushSync('adilitix_notices', this.globalState.adilitix_notices);

            console.log('✅ Full Manual Sync Complete.');
            return true;
        } catch (error) {
            console.error('❌ Full Manual Sync Failed:', error.message);
            return false;
        }
    }
}

module.exports = new RemoteSyncService();
