import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api';
const ENDPOINT = API_BASE_URL.replace('/api', '');

let socket = null;

/**
 * Dedicated admin-only namespace (backend_nestjs/src/users/users-recycle-bin.gateway.ts) —
 * separate from utils/socket.js's unauthenticated chat connection. Requires a valid admin JWT
 * on connect; the backend disconnects anyone else immediately.
 */
export function connectRecycleBinSocket(onChange) {
    const token = localStorage.getItem('token');
    if (!token) return () => {};

    socket = io(`${ENDPOINT}/admin/recycle-bin`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
    });

    socket.on('recycle-bin-change', onChange);

    return () => {
        socket?.off('recycle-bin-change', onChange);
        socket?.disconnect();
        socket = null;
    };
}
