import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import ChatSidebar from './ChatSidebar';
import ChatMessageArea from './ChatMessageArea';
import socket, { connectSocket } from '../../realtime/socketClient';
import { CHAT_EVENTS } from '../../realtime/events';
import { Box } from '@mui/material';

const ChatCenter = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlUserId = searchParams.get('userId');
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatUsers, setChatUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [localMe, setLocalMe] = useState(user);
    const setupDoneRef = useRef(false);
    const selectedUserRef = useRef(selectedUser);

    useEffect(() => {
        if (user) setLocalMe(user);
    }, [user]);

    useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

    const fetchChatUsers = useCallback(async () => {
        try {
            const response = await api.get('/chat/users');
            const userData = response.data?.data || response.data || [];
            if (Array.isArray(userData)) {
                const normalized = userData.map(u => ({
                    ...u,
                    _id: (u._id || u.id)?.toString()
                }));
                console.log('[Chat] chat users list refreshed:', normalized.length);
                setChatUsers(normalized);

                if (user?.role === 'admin' && urlUserId) {
                    const userFromUrl = normalized.find(u => u._id === urlUserId);
                    if (userFromUrl) setSelectedUser(userFromUrl);
                } else if (normalized.length > 0 && !selectedUserRef.current) {
                    const admin = normalized.find(u => u.role === 'admin');
                    if (admin) setSelectedUser(admin);
                }
            }
        } catch (error) {
            console.error('[Chat] Failed to fetch chat users:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.role, urlUserId]);

    useEffect(() => {
        fetchChatUsers();
    }, [fetchChatUsers]);

    // Keep the sidebar (last message preview, unread badge, ordering) live —
    // without this, an incoming message only shows up in the open conversation
    // and the list looks stale until the page is manually reloaded.
    useEffect(() => {
        const handleIncoming = () => fetchChatUsers();
        socket.on(CHAT_EVENTS.MESSAGE_RECEIVED, handleIncoming);
        return () => socket.off(CHAT_EVENTS.MESSAGE_RECEIVED, handleIncoming);
    }, [fetchChatUsers]);

    useEffect(() => {
        if (user?.role === 'admin' && selectedUser?._id) {
            if (searchParams.get('userId') !== selectedUser._id) {
                setSearchParams({ userId: selectedUser._id }, { replace: true });
            }
        }
    }, [selectedUser?._id, user?.role, searchParams, setSearchParams]);

    useEffect(() => {
        const myId = user?._id || user?.id;
        if (!myId) return;
        if (setupDoneRef.current) return;
        setupDoneRef.current = true;

        // No 'setup' emit needed — chat.gateway.ts auto-joins `user_${id}` from the
        // verified JWT the moment the socket connects (see handleConnection).
        connectSocket();
    }, [user]);

    return (
        <Box sx={{ 
            height: 'calc(100vh - 100px)', 
            display: 'flex', 
            gap: 2, 
            p: { xs: 2, md: 3 }, 
            bgcolor: 'var(--color-vc-canvas)' 
        }}>
            <Box sx={{ 
                width: 320, 
                flexShrink: 0, 
                bgcolor: 'var(--color-vc-canvas)', 
                borderRadius: '12px', 
                border: '1px solid var(--color-vc-hairline)', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column'
            }}>
                <ChatSidebar
                    users={chatUsers}
                    selectedUser={selectedUser}
                    onSelectUser={setSelectedUser}
                    loading={loading}
                    onRefresh={fetchChatUsers}
                />
            </Box>

            <Box sx={{ 
                flexGrow: 1, 
                bgcolor: 'var(--color-vc-canvas)', 
                borderRadius: '12px', 
                border: '1px solid var(--color-vc-hairline)', 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column'
            }}>
                <ChatMessageArea
                    recipient={selectedUser}
                    onMessageSent={fetchChatUsers}
                    user={localMe}
                />
            </Box>
        </Box>
    );
};

export default ChatCenter;
