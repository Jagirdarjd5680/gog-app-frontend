import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import socket from '../../utils/socket';

import ChatHeader from './components/ChatHeader';
import ChatMessageList from './components/ChatMessageList';
import ChatInput from './components/ChatInput';
import ImagePreviewModal from './components/ImagePreviewModal';

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
            const response = await api.get(`/chat/history/${recipient._id}`);
            if (response.data.success) {
                const normalized = response.data.data.map(m => ({
                    ...m,
                    sender: m.sender?._id || m.sender,
                    receiver: m.receiver?._id || m.receiver
                }));
                setMessages(normalized);
            }
        } catch {}
    }, [recipient]);

    useEffect(() => {
        if (!user?._id) return;
        const handleMessageReceived = (newMsg) => {
            const senderId = (newMsg.sender?._id || newMsg.sender)?.toString();
            const receiverId = (newMsg.receiver?._id || newMsg.receiver)?.toString();
            const currentRecipientId = recipientRef.current?._id?.toString();
            if (currentRecipientId && (senderId === currentRecipientId || receiverId === currentRecipientId)) {
                setMessages(prev => {
                    if (newMsg._id && prev.some(m => m._id === newMsg._id)) return prev;
                    return [...prev, { ...newMsg, sender: senderId, receiver: receiverId }];
                });
                if (receiverId === userRef.current?._id?.toString()) receivedAudioRef.current.play().catch(() => {});
            } else if (receiverId === userRef.current?._id?.toString()) {
                receivedAudioRef.current.play().catch(() => {});
            }
        };
        const handleTyping = (data) => { if (recipientRef.current?._id?.toString() === data.senderId?.toString()) setRecipientTyping(true); };
        const handleStopTyping = (data) => { if (recipientRef.current?._id?.toString() === data.senderId?.toString()) setRecipientTyping(false); };
        const handleStatusChange = (data) => {
            if (recipientRef.current?._id?.toString() === data.userId?.toString()) {
                setRecipient(prev => ({ ...prev, isOnline: data.isOnline ?? prev.isOnline, lastSeen: data.lastSeen || prev.lastSeen, isBlockedFromChat: data.isBlockedFromChat ?? prev.isBlockedFromChat }));
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
        if (recipient) { setLoading(true); fetchHistory().finally(() => setLoading(false)); }
    }, [recipient?._id, fetchHistory]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, recipientTyping]);

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socket.connected || !recipient) return;
        if (!isTyping) { setIsTyping(true); socket.emit('typing', { room: recipient._id, senderId: user._id }); }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => { socket.emit('stop_typing', { room: recipient._id, senderId: user._id }); setIsTyping(false); }, 3000);
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
        socket.emit('stop_typing', { room: recipient._id, senderId: user._id });
        setIsTyping(false);
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('receiver', recipient._id);
            if (newMessage.trim()) formData.append('message', newMessage);
            if (selectedImage) formData.append('image', selectedImage);
            const response = await api.post('/chat/send', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (response.data.success) {
                const sentMsg = response.data.data;
                setNewMessage(''); setSelectedImage(null); setImagePreview(null);
                setMessages(prev => [...prev, sentMsg]);
                sentAudioRef.current.play().catch(() => {});
                socket.emit('new_message', sentMsg);
                onMessageSent();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const handleBlock = async () => {
        try {
            const response = await api.put(`/chat/block/${recipient._id}`);
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
            const response = await api.delete(`/chat/clear/${recipient._id}`);
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
