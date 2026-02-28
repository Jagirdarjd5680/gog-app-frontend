import { useState, useEffect, useRef } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import ChatSidebar from './ChatSidebar';
import ChatMessageArea from './ChatMessageArea';
import socket from '../../utils/socket';

const ChatCenter = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [selectedUser, setSelectedUser] = useState(null);
    const [chatUsers, setChatUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [localMe, setLocalMe] = useState(user);
    const setupDoneRef = useRef(false);

    useEffect(() => {
        if (user) setLocalMe(user);
    }, [user]);

    const fetchChatUsers = async () => {
        try {
            const response = await api.get('/chat/users');
            if (response.data.success) {
                // Normalize _id to string to avoid Mongoose ObjectId comparison issues
                const normalized = response.data.data.map(u => ({
                    ...u,
                    _id: u._id?.toString()
                }));
                setChatUsers(normalized);
                if (user.role !== 'admin' && normalized.length > 0 && !selectedUser) {
                    const admin = normalized.find(u => u.role === 'admin');
                    if (admin) setSelectedUser(admin);
                }
            }
        } catch (error) {
            console.error('Fetch Chat Users Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChatUsers();
    }, []);

    // Connect socket and setup user room — only once when user._id is known
    useEffect(() => {
        if (!user?._id) return;
        if (setupDoneRef.current) return; // prevent double-fire in React StrictMode
        setupDoneRef.current = true;

        if (!socket.connected) {
            socket.connect();
        }
        socket.emit('setup', user._id);

        return () => {
            // Don't disconnect on cleanup — keep socket alive for the session
        };
    }, [user?._id]);

    // Listen for status changes and incoming messages to update sidebar
    useEffect(() => {
        if (!user?._id) return;

        const handleStatusChange = (data) => {
            const userId = data.userId?.toString();
            const myId = user?._id?.toString();

            if (userId === myId) {
                setLocalMe(prev => ({
                    ...prev,
                    isOnline: data.isOnline !== undefined ? data.isOnline : prev.isOnline,
                    lastSeen: data.lastSeen || prev.lastSeen,
                    isBlockedFromChat: data.isBlockedFromChat !== undefined ? data.isBlockedFromChat : prev.isBlockedFromChat
                }));
            }

            setChatUsers(prev => prev.map(u =>
                u._id === data.userId ? {
                    ...u,
                    isOnline: data.isOnline !== undefined ? data.isOnline : u.isOnline,
                    lastSeen: data.lastSeen || u.lastSeen,
                    isBlockedFromChat: data.isBlockedFromChat !== undefined ? data.isBlockedFromChat : u.isBlockedFromChat
                } : u
            ));
        };

        const handleMessageReceived = (newMsg) => {
            // Normalize sender to string ID
            const senderId = (newMsg.sender?._id || newMsg.sender)?.toString();

            setChatUsers(prev => {
                const userExists = prev.some(u => u._id?.toString() === senderId);

                if (!userExists) {
                    // If user not in sidebar, refresh the whole list to include them
                    fetchChatUsers();
                    return prev;
                }

                const updatedUsers = prev.map(u => {
                    if (u._id?.toString() === senderId) {
                        return {
                            ...u,
                            lastMessage: newMsg,
                            unreadCount: selectedUser?._id?.toString() === u._id?.toString()
                                ? u.unreadCount
                                : (u.unreadCount || 0) + 1
                        };
                    }
                    return u;
                });

                return updatedUsers.sort((a, b) => {
                    const dateA = a.lastMessage?.createdAt || 0;
                    const dateB = b.lastMessage?.createdAt || 0;
                    return new Date(dateB) - new Date(dateA);
                });
            });
        };

        socket.on('user_status_changed', handleStatusChange);
        socket.on('message_received', handleMessageReceived);

        return () => {
            socket.off('user_status_changed', handleStatusChange);
            socket.off('message_received', handleMessageReceived);
        };
    }, [user?._id, selectedUser?._id]);

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', p: 2, display: 'flex', gap: 2 }}>
            {user?.role === 'admin' && (
                <ChatSidebar
                    users={chatUsers}
                    selectedUser={selectedUser}
                    onSelectUser={(u) => {
                        setSelectedUser(u);
                        // Reset unread count locally
                        setChatUsers(prev => prev.map(item =>
                            item._id === u._id ? { ...item, unreadCount: 0 } : item
                        ));
                    }}
                    loading={loading}
                    onRefresh={fetchChatUsers}
                />
            )}

            <Paper
                elevation={0}
                sx={{
                    flexGrow: 1,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
            >
                {(selectedUser || (user?.role !== 'admin' && chatUsers.some(u => u.role === 'admin'))) ? (
                    <ChatMessageArea
                        recipient={selectedUser || chatUsers.find(u => u.role === 'admin')}
                        user={localMe}
                        onMessageSent={() => {
                            // Update last message in sidebar
                            fetchChatUsers();
                        }}
                    />
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'text.disabled',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <img src="/chat-placeholder.svg" alt="Select user" style={{ width: 200, opacity: 0.5 }} />
                        <h3 style={{ fontWeight: 600 }}>Select a conversation to start chatting</h3>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ChatCenter;
