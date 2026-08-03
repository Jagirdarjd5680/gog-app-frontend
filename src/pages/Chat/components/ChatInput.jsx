import React from 'react';
import { Box, Paper, IconButton, Tooltip, TextField, CircularProgress, Typography } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { hasModulePermission } from '../../../utils/permissions';

const ChatInput = ({
    imagePreview, setImagePreview, setSelectedImage, handleImageSelect,
    newMessage, setNewMessage, typingHandler, handleSend,
    sending, user, recipient, theme
}) => {
    const isBlocked = user?.isBlockedFromChat || recipient?.isBlockedFromChat;
    const canSend = hasModulePermission(user, 'chat', 'add');

    if (isBlocked) {
        return (
            <Box sx={{ p: 2, bgcolor: 'var(--color-vc-canvas-soft)', borderTop: '1px solid var(--color-vc-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', p: 0.5, borderRadius: '50%', display: 'flex' }}>
                    <CloseIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)', fontWeight: 600, fontFamily: 'inherit' }}>
                    {user?.isBlockedFromChat ? "You are blocked from sending messages" : "Chat disabled for this user"}
                </Typography>
            </Box>
        );
    }

    if (!canSend) {
        return (
            <Box sx={{ p: 2, bgcolor: 'var(--color-vc-canvas-soft)', borderTop: '1px solid var(--color-vc-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)', fontWeight: 600, fontFamily: 'inherit' }}>
                    You do not have permission to send messages
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, bgcolor: 'var(--color-vc-canvas)', borderTop: '1px solid var(--color-vc-hairline)' }}>
            {imagePreview && (
                <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
                    <Paper elevation={0} sx={{ borderRadius: '6px', overflow: 'hidden', position: 'relative', border: '1px solid var(--color-vc-primary)' }}>
                        <Box component="img" src={imagePreview} alt="Preview" sx={{ height: 100, width: 'auto', display: 'block' }} />
                        <IconButton size="small" onClick={() => { setSelectedImage(null); setImagePreview(null); }} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}><CloseIcon fontSize="small" /></IconButton>
                    </Paper>
                </Box>
            )}
            <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input type="file" accept="image/*" id="chat-image-input" style={{ display: 'none' }} onChange={handleImageSelect} />
                <label htmlFor="chat-image-input">
                    <Tooltip title="Send Image">
                        <IconButton component="span" disabled={sending} sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)' } }}><PhotoLibraryIcon /></IconButton>
                    </Tooltip>
                </label>
                <TextField
                    fullWidth size="small" placeholder="Type a message..."
                    value={newMessage} onChange={typingHandler}
                    InputProps={{ sx: { borderRadius: '6px', bgcolor: 'var(--color-vc-canvas-soft)', '& fieldset': { border: 'none' } } }}
                />
                <IconButton
                    color="primary" type="submit" disabled={(!newMessage.trim() && !imagePreview) || sending}
                    sx={{ bgcolor: 'var(--color-vc-primary)', color: 'var(--color-vc-on-primary)', '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9 }, '&.Mui-disabled': { bgcolor: 'var(--color-vc-canvas-soft-2)', color: 'var(--color-vc-mute)' } }}
                >
                    {sending ? <CircularProgress size={24} color="inherit" /> : <SendIcon size="small" />}
                </IconButton>
            </Box>
        </Box>
    );
};

export default ChatInput;
