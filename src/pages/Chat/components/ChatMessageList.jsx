import React from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import { fixUrl } from '../../../utils/api';

const ChatMessageList = ({ messages, loading, user, recipientTyping, handleImageClick, theme, messagesEndRef }) => {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={30} /></Box>;
    if (messages.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'text.disabled' }}>No messages yet. Say hello!</Box>;

    return (
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: 'rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((msg, index) => {
                const senderId = (msg.sender?._id || msg.sender)?.toString();
                const isMe = senderId === user?._id?.toString();
                return (
                    <Box key={msg._id || index} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: msg.image ? '4px' : '10px 16px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                bgcolor: isMe ? 'primary.main' : 'background.paper', color: isMe ? 'white' : 'text.primary',
                                boxShadow: isMe ? '0 4px 12px rgba(25, 118, 210, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                                border: isMe ? 'none' : `1px solid ${theme.palette.divider}`, overflow: 'hidden'
                            }}
                        >
                            {msg.image ? (
                                <Box sx={{ position: 'relative' }}>
                                    <Box component="img" src={fixUrl(msg.image)} alt="Chat Image" sx={{ maxWidth: '100%', maxHeight: 300, borderRadius: 2, display: 'block', cursor: 'pointer', '&:hover': { opacity: 0.9 } }} onClick={() => handleImageClick(fixUrl(msg.image))} />
                                    {msg.message && <Typography variant="body2" sx={{ p: 1, color: isMe ? 'white' : 'text.primary' }}>{msg.message}</Typography>}
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
            })}
            {recipientTyping && (
                <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1, ml: 1, mb: 1 }}>
                    <Paper elevation={0} sx={{ p: '10px 16px', borderRadius: '18px 18px 18px 4px', bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center' }}>
                        <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                    </Paper>
                </Box>
            )}
            <div ref={messagesEndRef} />
        </Box>
    );
};

export default ChatMessageList;
