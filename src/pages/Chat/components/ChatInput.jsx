import React from 'react';
import { Box, Paper, IconButton, Tooltip, TextField, CircularProgress, Typography } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ 
    imagePreview, setImagePreview, setSelectedImage, handleImageSelect, 
    newMessage, setNewMessage, typingHandler, handleSend, 
    sending, user, recipient, theme 
}) => {
    const isBlocked = user?.isBlockedFromChat || recipient?.isBlockedFromChat;

    if (isBlocked) {
        return (
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: 'error.50', p: 0.5, borderRadius: '50%', display: 'flex' }}>
                    <CloseIcon sx={{ color: 'error.main', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    {user?.isBlockedFromChat ? "You are blocked from sending messages" : "Chat disabled for this user"}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
            {imagePreview && (
                <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
                    <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative', border: `2px solid ${theme.palette.primary.main}` }}>
                        <Box component="img" src={imagePreview} alt="Preview" sx={{ height: 100, width: 'auto', display: 'block' }} />
                        <IconButton size="small" onClick={() => { setSelectedImage(null); setImagePreview(null); }} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}><CloseIcon fontSize="small" /></IconButton>
                    </Paper>
                </Box>
            )}
            <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input type="file" accept="image/*" id="chat-image-input" style={{ display: 'none' }} onChange={handleImageSelect} />
                <label htmlFor="chat-image-input">
                    <Tooltip title="Send Image">
                        <IconButton component="span" color="primary" disabled={sending}><PhotoLibraryIcon /></IconButton>
                    </Tooltip>
                </label>
                <TextField
                    fullWidth size="small" placeholder="Type a message..."
                    value={newMessage} onChange={typingHandler}
                    InputProps={{ sx: { borderRadius: 4, bgcolor: 'action.hover', '& fieldset': { border: 'none' } } }}
                />
                <IconButton
                    color="primary" type="submit" disabled={(!newMessage.trim() && !imagePreview) || sending}
                    sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' } }}
                >
                    {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon size="small" />}
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatInput;
