import { io } from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_API_URL || 'https://backend.godofgraphics.in';
const socket = io(ENDPOINT, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
});

// Re-join user room after reconnection
socket.on('reconnect', () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?._id) {
        socket.emit('setup', user._id);
    }
});

export default socket;
