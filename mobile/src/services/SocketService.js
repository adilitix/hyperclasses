import io from 'socket.io-client';

let socket = null;

export const SocketService = {
    connect(url, user) {
        if (socket) {
            socket.disconnect();
        }

        socket = io(url, {
            transports: ['websocket'],
            reconnection: true,
        });

        socket.on('connect', () => {
            console.log('Mobile connected to socket:', socket.id);
            socket.emit('join', {
                username: user.username,
                role: user.role
            });
        });

        socket.on('disconnect', () => {
            console.log('Mobile disconnected from socket');
        });

        return socket;
    },

    getSocket() {
        return socket;
    },

    disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }
};
