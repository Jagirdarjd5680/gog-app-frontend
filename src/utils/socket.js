// Real-time socket implementation lives in src/realtime/ now (see that folder
// for the auth/debug-logging details). Kept as a re-export so existing
// `import socket from '../../utils/socket'` call sites don't need to change.
export { default, connectSocket, disconnectSocket } from '../realtime/socketClient';
