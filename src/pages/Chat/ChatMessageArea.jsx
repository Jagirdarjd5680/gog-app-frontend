import {
    Box,
    Typography,
    Avatar,
    IconButton,
    TextField,
    Button,
    Paper,
    Divider,
    Tooltip,
    Menu,
    MenuItem,
    useTheme,
    CircularProgress,
    Badge,
    Modal,
    Backdrop,
    Fade
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import BlockIcon from '@mui/icons-material/Block';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import api, { fixUrl } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import socket from '../../utils/socket';

const ChatMessageArea = ({ recipient: initialRecipient, onMessageSent, user: propUser }) => {
    const theme = useTheme();
    const { user: authUser } = useAuth();
    const user = propUser || authUser;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [recipientTyping, setRecipientTyping] = useState(false);
    const [recipient, setRecipient] = useState(initialRecipient);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState('');

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const recipientRef = useRef(recipient);
    const userRef = useRef(user);
    const sentAudioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));
    const receivedAudioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));

    // Keep refs in sync with latest values to avoid stale closures in socket handlers
    useEffect(() => { recipientRef.current = recipient; }, [recipient]);
    useEffect(() => { userRef.current = user; }, [user]);

    // Sync recipient with prop updates
    useEffect(() => {
        setRecipient(initialRecipient);
    }, [initialRecipient]);

    const fetchHistory = async () => {
        if (!recipient) return;
        try {
            const response = await api.get(`/chat/history/${recipient._id}`);
            if (response.data.success) {
                // Normalize IDs to strings for consistent comparison
                const normalized = response.data.data.map(m => ({
                    ...m,
                    sender: m.sender?._id || m.sender,
                    receiver: m.receiver?._id || m.receiver
                }));
                setMessages(normalized);
            }
        } catch (error) {
            console.error('Fetch History Error:', error);
        }
    };

    useEffect(() => {
        if (!user?._id) return;

        const handleMessageReceived = (newMsg) => {
            const senderId = (newMsg.sender?._id || newMsg.sender)?.toString();
            const receiverId = (newMsg.receiver?._id || newMsg.receiver)?.toString();
            const currentRecipientId = recipientRef.current?._id?.toString();
            const currentUserId = userRef.current?._id?.toString();

            // If it's for this conversation
            if (currentRecipientId && (senderId === currentRecipientId || receiverId === currentRecipientId)) {
                setMessages(prev => {
                    // Prevent duplicates
                    if (newMsg._id && prev.some(m => m._id === newMsg._id)) return prev;

                    const normalizedMsg = {
                        ...newMsg,
                        sender: senderId,
                        receiver: receiverId
                    };
                    return [...prev, normalizedMsg];
                });

                if (receiverId === currentUserId) {
                    receivedAudioRef.current.play().catch(() => { });
                }
            } else if (receiverId === userRef.current?._id?.toString()) {
                // Message for me but from a different conversation — just play sound
                receivedAudioRef.current.play().catch(() => { });
            }
        };

        const handleTyping = (data) => {
            const senderId = data.senderId?.toString();
            const currentRecipientId = recipientRef.current?._id?.toString();
            if (currentRecipientId && senderId === currentRecipientId) {
                setRecipientTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            const senderId = data.senderId?.toString();
            const currentRecipientId = recipientRef.current?._id?.toString();
            if (currentRecipientId && senderId === currentRecipientId) {
                setRecipientTyping(false);
            }
        };

        const handleStatusChange = (data) => {
            const userId = data.userId?.toString();
            const currentRecipientId = recipientRef.current?._id?.toString();
            if (currentRecipientId && userId === currentRecipientId) {
                setRecipient(prev => ({
                    ...prev,
                    isOnline: data.isOnline !== undefined ? data.isOnline : prev.isOnline,
                    lastSeen: data.lastSeen || prev.lastSeen,
                    isBlockedFromChat: data.isBlockedFromChat !== undefined ? data.isBlockedFromChat : prev.isBlockedFromChat
                }));
            }
        };

        socket.on('message_received', handleMessageReceived);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);
        socket.on('user_status_changed', handleStatusChange);

        return () => {
            socket.off('message_received', handleMessageReceived);
            socket.off('typing', handleTyping);
            socket.off('stop_typing', handleStopTyping);
            socket.off('user_status_changed', handleStatusChange);
        };
    }, [user?._id]);

    useEffect(() => {
        setMessages([]);
        if (recipient) {
            setLoading(true);
            fetchHistory().finally(() => setLoading(false));
        }
    }, [recipient?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, recipientTyping]);

    const typingHandler = (e) => {
        setNewMessage(e.target.value);

        if (!socket.connected || !recipient) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', { room: recipient._id, senderId: user._id });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { room: recipient._id, senderId: user._id });
            setIsTyping(false);
        }, 3000);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = (imageUrl) => {
        setModalImage(imageUrl);
        setPreviewModalOpen(true);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !recipient || sending) return;

        socket.emit('stop_typing', { room: recipient._id, senderId: user._id });
        setIsTyping(false);

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('receiver', recipient._id);
            if (newMessage.trim()) formData.append('message', newMessage);
            if (selectedImage) formData.append('image', selectedImage);

            const response = await api.post('/chat/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                const sentMsg = response.data.data;
                setNewMessage('');
                setSelectedImage(null);
                setImagePreview(null);
                setMessages(prev => [...prev, sentMsg]);
                sentAudioRef.current.play().catch(() => { });
                socket.emit('new_message', sentMsg);
                onMessageSent();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleBlock = async () => {
        try {
            const response = await api.put(`/chat/block/${recipient._id}`);
            if (response.data.success) {
                toast.success(response.data.message);
                const updatedStatus = !recipient.isBlockedFromChat;
                setRecipient(prev => ({ ...prev, isBlockedFromChat: updatedStatus }));
                onMessageSent();
                setAnchorEl(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update block status');
        }
    };

    const handleClearChat = async () => {
        if (!window.confirm('Are you sure you want to clear this chat history?')) return;
        try {
            const response = await api.delete(`/chat/clear/${recipient._id}`);
            if (response.data.success) {
                setMessages([]);
                toast.success('Chat history cleared');
                setAnchorEl(null);
            }
        } catch (error) {
            toast.error('Failed to clear chat');
        }
    };

    const formatLastSeen = (date) => {
        if (!date) return 'Offline';
        const d = new Date(date);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();

        if (isToday) {
            return `Last seen at ${format(d, 'hh:mm a')}`;
        }
        return `Last seen on ${format(d, 'MMM dd, hh:mm a')}`;
    };

    if (!recipient && user?.role === 'admin') return null;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar src={fixUrl(recipient?.avatar)} sx={{ width: 45, height: 45, bgcolor: 'primary.main' }}>
                            {recipient?.name?.charAt(0) || 'A'}
                        </Avatar>
                        {recipient?.isOnline && (
                            <Box sx={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, bgcolor: '#44b700', borderRadius: '50%', border: '2px solid white' }} />
                        )}
                    </Box>
                    <Box>
                        <Typography variant="body1" fontWeight={700}>
                            {(user?.role !== 'admin' && recipient?.role === 'admin') ? 'Admin Support' : (recipient?.name || 'User')}
                        </Typography>
                        <Typography variant="caption" color={recipient?.isBlockedFromChat || user?.isBlockedFromChat ? 'error' : 'text.secondary'} fontWeight={600}>
                            {user?.isBlockedFromChat ? 'You are blocked' : (
                                recipient?.isBlockedFromChat ? 'Blocked' : (
                                    recipient?.isOnline ? 'Online' : formatLastSeen(recipient?.lastSeen)
                                )
                            )}
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}
                    >
                        {user?.role === 'admin' && (
                            <MenuItem onClick={handleBlock}>
                                <BlockIcon fontSize="small" sx={{ mr: 1, color: recipient?.isBlockedFromChat ? 'success.main' : 'error.main' }} />
                                {recipient?.isBlockedFromChat ? 'Unblock User' : 'Block User'}
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleClearChat}>
                            <ClearAllIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} /> Clear Chat
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* Messages */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: 'rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.disabled' }}>
                        No messages yet. Say hello!
                    </Box>
                ) : (
                    messages.map((msg, index) => {
                        const senderId = (msg.sender?._id || msg.sender)?.toString();
                        const isMe = senderId === user?._id?.toString();
                        return (
                            <Box
                                key={msg._id || index}
                                sx={{
                                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: msg.image ? '4px' : '10px 16px',
                                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        bgcolor: isMe ? 'primary.main' : 'background.paper',
                                        color: isMe ? 'white' : 'text.primary',
                                        boxShadow: isMe ? '0 4px 12px rgba(25, 118, 210, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                                        border: isMe ? 'none' : `1px solid ${theme.palette.divider}`,
                                        overflow: 'hidden'
                                    }}
                                >
                                    {msg.image ? (
                                        <Box sx={{ position: 'relative' }}>
                                            <Box
                                                component="img"
                                                src={fixUrl(msg.image)}
                                                alt="Chat Image"
                                                sx={{
                                                    maxWidth: '100%',
                                                    maxHeight: 300,
                                                    borderRadius: 2,
                                                    display: 'block',
                                                    cursor: 'pointer',
                                                    '&:hover': { opacity: 0.9 }
                                                }}
                                                onClick={() => handleImageClick(fixUrl(msg.image))}
                                            />
                                            {msg.message && (
                                                <Typography variant="body2" sx={{ p: 1, color: isMe ? 'white' : 'text.primary' }}>
                                                    {msg.message}
                                                </Typography>
                                            )}
                                        </Box>
                                    ) : (
                                        <Typography variant="body2">{msg.message}</Typography>
                                    )}
                                </Paper>
                                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.disabled', fontSize: 10 }}>
                                    {format(new Date(msg.createdAt), 'hh:mm a')} {msg.isRead && isMe && '✓✓'}
                                </Typography>
                            </Box>
                        );
                    })
                )}
                {recipientTyping && (
                    <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1, ml: 1, mb: 1 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: '10px 16px',
                                borderRadius: '18px 18px 18px 4px',
                                bgcolor: 'background.paper',
                                border: `1px solid ${theme.palette.divider}`,
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                        </Paper>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Image Preview Modal */}
            <Modal
                open={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                    sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
                }}
            >
                <Fade in={previewModalOpen}>
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        outline: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    }}>
                        <IconButton
                            onClick={() => setPreviewModalOpen(false)}
                            sx={{
                                position: 'absolute',
                                top: -40,
                                right: 0,
                                color: 'white'
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <Box
                            component="img"
                            src={modalImage}
                            alt="Full Preview"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                borderRadius: 1,
                                boxShadow: 24
                            }}
                        />
                    </Box>
                </Fade>
            </Modal>

            {/* Input Area */}
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
                {imagePreview && (
                    <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
                        <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative', border: `2px solid ${theme.palette.primary.main}` }}>
                            <Box
                                component="img"
                                src={imagePreview}
                                alt="Preview"
                                sx={{ height: 100, width: 'auto', display: 'block' }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                }}
                                sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Paper>
                    </Box>
                )}
                <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <input
                        type="file"
                        accept="image/*"
                        id="chat-image-input"
                        style={{ display: 'none' }}
                        onChange={handleImageSelect}
                    />
                    <label htmlFor="chat-image-input">
                        <Tooltip title="Send Image">
                            <IconButton component="span" color="primary" disabled={sending || user?.isBlockedFromChat || recipient?.isBlockedFromChat}>
                                <PhotoLibraryIcon />
                            </IconButton>
                        </Tooltip>
                    </label>
                    
                    <TextField
                        fullWidth
                        size="small"
                        placeholder={user?.isBlockedFromChat || recipient?.isBlockedFromChat ? "Chat disabled" : "Type a message..."}
                        value={newMessage}
                        disabled={user?.isBlockedFromChat || recipient?.isBlockedFromChat}
                        onChange={typingHandler}
                        InputProps={{
                            sx: { borderRadius: 4, bgcolor: 'action.hover', '& fieldset': { border: 'none' } }
                        }}
                    />
                    <IconButton
                        color="primary"
                        type="submit"
                        disabled={(!newMessage.trim() && !selectedImage) || sending || user?.isBlockedFromChat || recipient?.isBlockedFromChat}
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' },
                            '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }
                        }}
                    >
                        {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon size="small" />}
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatMessageArea;
