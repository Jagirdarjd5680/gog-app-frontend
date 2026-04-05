import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const ENDPOINT = API_BASE_URL.replace('/api', '');
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
