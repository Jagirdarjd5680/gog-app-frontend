import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import socket from '../../realtime/socketClient';
import { CHAT_EVENTS } from '../../realtime/events';

import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import ImagePreviewModal from './components/ImagePreviewModal';

// Backend responses go through two different paths that don't normalize IDs the
// same way: REST responses get an `_id` mirror of `id` added by MongoIdInterceptor
// (backend_nestjs/src/common/interceptors/mongo-id.interceptor.ts), but Socket.IO
// `emit()` calls bypass that interceptor entirely, so live messages only ever have
// `id`. Always read through this helper instead of `.{_id}` directly.
const getId = (x) => (x?.id ?? x?._id ?? x)?.toString?.();

const ChatMessageArea = ({ recipient: initialRecipient, onMessageSent, user: propUser }) => {
    const theme = useTheme();
    const { user: authUser } = useAuth();
    const user = propUser || authUser;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
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

    useEffect(() => { recipientRef.current = recipient; }, [recipient]);
    useEffect(() => { userRef.current = user; }, [user]);
    useEffect(() => { setRecipient(initialRecipient); }, [initialRecipient]);

    const fetchHistory = useCallback(async () => {
        if (!recipient) return;
        try {
            const response = await api.get(`/chat/history/${getId(recipient)}`);
            if (response.data.success) {
                const normalized = response.data.data.map(m => ({
                    ...m,
                    sender: getId(m.sender),
                    receiver: getId(m.receiver)
                }));
                console.log('[Chat] history loaded:', normalized.length, 'messages with', getId(recipient));
                setMessages(normalized);
            }
        } catch (err) {
            console.error('[Chat] fetchHistory failed:', err);
        }
    }, [recipient]);

    useEffect(() => {
        if (!getId(user)) return;
        const handleMessageReceived = (newMsg) => {
            const senderId = getId(newMsg.sender);
            const receiverId = getId(newMsg.receiver);
            const currentRecipientId = getId(recipientRef.current);
            const myId = getId(userRef.current);
            console.log('[Chat] message_received:', { id: newMsg.id, senderId, receiverId, currentRecipientId });
            if (currentRecipientId && (senderId === currentRecipientId || receiverId === currentRecipientId)) {
                setMessages(prev => {
                    if (newMsg.id != null && prev.some(m => (m.id ?? m._id) === newMsg.id)) return prev;
                    return [...prev, { ...newMsg, sender: senderId, receiver: receiverId }];
                });
                if (receiverId === myId) receivedAudioRef.current.play().catch(() => {});
            } else if (receiverId === myId) {
                receivedAudioRef.current.play().catch(() => {});
            }
        };
        const handleTypingStatus = (data) => {
            if (getId(recipientRef.current) === getId(data.senderId)) {
                console.log('[Chat] typing_status from recipient:', data.isTyping);
                setRecipientTyping(!!data.isTyping);
            }
        };
        const handleMessagesRead = (data) => {
            const readerId = getId(data.by);
            if (readerId && readerId === getId(recipientRef.current)) {
                console.log('[Chat] messages_read by recipient — flipping ticks');
                setMessages(prev => prev.map(m => (getId(m.sender) === getId(userRef.current) ? { ...m, isRead: true } : m)));
            }
        };
        socket.on(CHAT_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
        socket.on(CHAT_EVENTS.TYPING_STATUS, handleTypingStatus);
        socket.on(CHAT_EVENTS.MESSAGES_READ, handleMessagesRead);
        return () => {
            socket.off(CHAT_EVENTS.MESSAGE_RECEIVED, handleMessageReceived);
            socket.off(CHAT_EVENTS.TYPING_STATUS, handleTypingStatus);
            socket.off(CHAT_EVENTS.MESSAGES_READ, handleMessagesRead);
        };
    }, [getId(user)]);

    useEffect(() => {
        setMessages([]);
        if (recipient) { setLoading(true); fetchHistory().finally(() => setLoading(false)); }
    }, [getId(recipient), fetchHistory]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, recipientTyping]);

    const emitTyping = (isTypingNow) => {
        if (!socket.connected || !recipient) return;
        socket.emit(CHAT_EVENTS.TYPING_STATUS, { receiverId: getId(recipient), isTyping: isTypingNow });
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socket.connected || !recipient) return;
        if (!isTyping) { setIsTyping(true); emitTyping(true); }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { emitTyping(false); setIsTyping(false); }, 3000);
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('Image size should be less than 5MB'); return; }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || !recipient || sending) return;
        emitTyping(false);
        setIsTyping(false);
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('receiver', getId(recipient));
            if (newMessage.trim()) formData.append('message', newMessage);
            if (selectedImage) formData.append('image', selectedImage);
            console.log('[Chat] sending message to', getId(recipient), selectedImage ? '(with image)' : '');
            const response = await api.post('/chat/send', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (response.data.success) {
                const sentMsg = response.data.data;
                setNewMessage(''); setSelectedImage(null); setImagePreview(null);
                // The backend broadcasts this to the receiver's socket room itself
                // (see chat.service.ts broadcastMessage) — we just need to show it
                // on our own side immediately, normalized the same way fetchHistory does.
                setMessages(prev => [...prev, { ...sentMsg, sender: getId(sentMsg.sender), receiver: getId(sentMsg.receiver) }]);
                sentAudioRef.current.play().catch(() => {});
                console.log('[Chat] send succeeded, message id:', sentMsg.id);
                onMessageSent();
            }
        } catch (error) {
            console.error('[Chat] send failed:', error);
            toast.error(error.response?.data?.message || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const handleBlock = async () => {
        try {
            const response = await api.put(`/chat/block/${getId(recipient)}`);
            if (response.data.success) {
                toast.success(response.data.message);
                setRecipient(prev => ({ ...prev, isBlockedFromChat: !prev.isBlockedFromChat }));
                onMessageSent();
            }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to update block status'); }
    };

    const handleClearChat = async () => {
        if (!window.confirm('Clear chat history?')) return;
        try {
            const response = await api.delete(`/chat/clear/${getId(recipient)}`);
            if (response.data.success) { setMessages([]); toast.success('Chat history cleared'); }
        } catch { toast.error('Failed to clear chat'); }
    };

    if (!recipient && user?.role === 'admin') return null;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ChatHeader recipient={recipient} user={user} handleBlock={handleBlock} handleClearChat={handleClearChat} theme={theme} />
            <ChatMessageList messages={messages} loading={loading} user={user} recipientTyping={recipientTyping} handleImageClick={(url) => { setModalImage(url); setPreviewModalOpen(true); }} theme={theme} messagesEndRef={messagesEndRef} />
            <ImagePreviewModal open={previewModalOpen} onClose={() => setPreviewModalOpen(false)} imageUrl={modalImage} />
            <ChatInput imagePreview={imagePreview} setImagePreview={setImagePreview} setSelectedImage={setSelectedImage} handleImageSelect={handleImageSelect} newMessage={newMessage} setNewMessage={setNewMessage} typingHandler={typingHandler} handleSend={handleSend} sending={sending} user={user} recipient={recipient} theme={theme} />
        </Box>
    );
};

export default ChatMessageArea;
