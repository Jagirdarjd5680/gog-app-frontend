import { io } from 'socket.io-client';

// Canonical real-time socket client. All other real-time features (chat,
// live notifications, admin recycle-bin, etc.) should connect through this
// same singleton instead of creating their own `io(...)` instance, so there
// is one auth story and one place to watch connection health.
//
// backend_nestjs/src/chat/chat.gateway.ts rejects any connection that doesn't
// carry a valid JWT in the handshake `auth.token` (see handleConnection) —
// the socket must NOT be connected before a token exists in localStorage.

const DEBUG = true; // flip off once real-time chat is verified stable in prod
const log = (...args) => { if (DEBUG) console.log('[realtime]', ...args); };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api';
const ENDPOINT = API_BASE_URL.replace(/\/api\/?$/, '');

const socket = io(ENDPOINT, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    // Read fresh on every (re)connect attempt instead of a static object,
    // so a token obtained after this module first loaded (e.g. login
    // happening later in the same tab) is still picked up.
    auth: (cb) => cb({ token: localStorage.getItem('token') }),
});

socket.on('connect', () => log('connected', socket.id));
socket.on('disconnect', (reason) => log('disconnected:', reason));
socket.on('connect_error', (err) => log('connect_error:', err.message));

/** Connect (or reconnect) the shared socket, picking up the current auth token. */
export function connectSocket() {
    if (socket.connected) return socket;
    if (!localStorage.getItem('token')) {
        log('connectSocket() skipped — no auth token in localStorage yet');
        return socket;
    }
    log('connecting to', ENDPOINT);
    socket.connect();
    return socket;
}

export function disconnectSocket() {
    if (socket.connected) {
        log('disconnecting');
        socket.disconnect();
    }
}

export default socket;
