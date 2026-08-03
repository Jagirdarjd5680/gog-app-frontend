import { io } from 'socket.io-client';

// Dedicated client for backend_nestjs/src/session/session.gateway.ts — a SEPARATE
// socket.io namespace ('/session') from the default-namespace `socket` in
// socketClient.js (chat + realtime_update toasts). The force-logout push for the
// single-device-login policy is only emitted on this namespace as a 'force-logout'
// (hyphen) event, so listening for it on the default-namespace socket (as this
// file used to, under the name 'force_logout') never fires. Mirrors
// native-app/src/lib/sessionSocket.ts, which the mobile app already uses correctly.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api';
const SOCKET_ENDPOINT = API_BASE_URL.replace(/\/api\/?$/, '');

let socket = null;

/** Connects (or reconnects) to the /session namespace with the given token. */
export function connectSessionSocket(token, onForceLogout) {
    disconnectSessionSocket();

    socket = io(`${SOCKET_ENDPOINT}/session`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
    });

    socket.on('force-logout', (data) => {
        onForceLogout(data?.reason ?? 'session_revoked');
    });

    return socket;
}

export function disconnectSessionSocket() {
    socket?.disconnect();
    socket = null;
}
