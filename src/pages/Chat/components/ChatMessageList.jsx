import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { fixUrl } from '../../../utils/api';

// Same normalization as ChatMessageArea.jsx — messages arrive either flattened
// (REST via fetchHistory) or as raw sender/receiver objects (fresh send/socket).
const getId = (x) => (x?.id ?? x?._id ?? x)?.toString?.();

const ChatMessageList = ({ messages, loading, user, recipientTyping, handleImageClick, theme, messagesEndRef }) => {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30} /></Box>;
    if (messages.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.disabled' }}>No messages yet. Say hello!</Box>;

    return (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: 'var(--color-vc-canvas)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg, index) => {
                const senderId = getId(msg.sender);
                const isMe = senderId === getId(user);
                return (
                    <Box key={msg.id ?? msg._id ?? index} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: msg.image ? '4px' : '10px 14px', 
                                borderRadius: '8px',
                                bgcolor: isMe ? 'var(--color-vc-primary)' : 'var(--color-vc-canvas-soft)', 
                                color: isMe ? 'var(--color-vc-on-primary)' : 'var(--color-vc-ink)',
                                boxShadow: 'none',
                                border: isMe ? 'none' : '1px solid var(--color-vc-hairline)', 
                                overflow: 'hidden'
                            }}
                        >
                            {msg.image ? (
                                <Box sx={{ position: 'relative' }}>
                                    <Box component="img" src={fixUrl(msg.image)} alt="Chat Image" sx={{ maxWidth: '100%', maxHeight: 300, borderRadius: '6px', display: 'block', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} onClick={() => handleImageClick(fixUrl(msg.image))} />
                                    {msg.message && <Typography variant="body2" sx={{ p: 1, color: isMe ? 'var(--color-vc-on-primary)' : 'var(--color-vc-ink)' }}>{msg.message}</Typography>}
                                </Box>
                            ) : (
                                <Typography variant="body2" sx={{ fontFamily: 'inherit', lineHeight: 1.4 }}>{msg.message}</Typography>
                            )}
                        </Paper>
                        <Typography variant="caption" sx={{ mt: 0.5, color: 'text.disabled', fontSize: 10 }}>
                            {format(new Date(msg.createdAt), 'hh:mm a')} {msg.isRead && isMe && '✓✓'}
                        </Typography>
                    </Box>
                );
            })}
            {recipientTyping && (
                <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1, ml: 1, mb: 1 }}>
                    <Paper elevation={0} sx={{ p: '10px 14px', borderRadius: '8px', bgcolor: 'var(--color-vc-canvas-soft)', border: '1px solid var(--color-vc-hairline)', display: 'flex', alignItems: 'center' }}>
                        <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                    </Paper>
                </Box>
            )}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default ChatMessageList;
