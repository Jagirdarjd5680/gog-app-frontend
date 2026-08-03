// Central registry of Socket.IO event names shared between the frontend and
// backend_nestjs/src/chat/chat.gateway.ts. Add new real-time features here
// (one constants block per domain) instead of hardcoding event strings inline,
// so every emitter/listener pair stays in sync.

export const CHAT_EVENTS = {
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    MESSAGE_RECEIVED: 'message_received',
    TYPING_STATUS: 'typing_status',
    MESSAGES_READ: 'messages_read',
};
