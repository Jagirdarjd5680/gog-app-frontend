import React, { useState } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BlockIcon from '@mui/icons-material/Block';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { fixUrl } from '../../../utils/api';
import { format } from 'date-fns';

const ChatHeader = ({ recipient, user, handleBlock, handleClearChat, theme }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    
    const formatLastSeen = (date) => {
        if (!date) return 'Offline';
        const d = new Date(date);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) return `Last seen at ${format(d, 'hh:mm a')}`;
        return `Last seen on ${format(d, 'MMM dd, hh:mm a')}`;
    };

    return (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                    <Avatar src={fixUrl(recipient?.avatar)} sx={{ width: 45, height: 45, bgcolor: 'primary.main' }}>{recipient?.name?.charAt(0) || 'A'}</Avatar>
                    {recipient?.isOnline && <Box sx={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, bgcolor: '#44b700', borderRadius: '50%', border: '2px solid white' }} />}
                </Box>
                <Box>
                    <Typography variant="body1" fontWeight={700}>{(user?.role !== 'admin' && recipient?.role === 'admin') ? 'Admin Support' : (recipient?.name || 'User')}</Typography>
                    <Typography variant="caption" color={recipient?.isBlockedFromChat || user?.isBlockedFromChat ? 'error' : 'text.secondary'} fontWeight={600}>
                        {user?.isBlockedFromChat ? 'You are blocked' : (recipient?.isBlockedFromChat ? 'Blocked' : (recipient?.isOnline ? 'Online' : formatLastSeen(recipient?.lastSeen)))}
                    </Typography>
                </Box>
            </Box>
            <Box>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}><MoreVertIcon /></IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 2, minWidth: 160 } }}>
                    {user?.role === 'admin' && (
                        <MenuItem onClick={() => { handleBlock(); setAnchorEl(null); }}>
                            <BlockIcon fontSize="small" sx={{ mr: 1, color: recipient?.isBlockedFromChat ? 'success.main' : 'error.main' }} />
                            {recipient?.isBlockedFromChat ? 'Unblock User' : 'Block User'}
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => { handleClearChat(); setAnchorEl(null); }}>
                        <ClearAllIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} /> Clear Chat
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
};

export default ChatHeader;
