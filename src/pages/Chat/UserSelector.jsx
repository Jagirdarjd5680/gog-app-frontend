import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Checkbox,
    InputAdornment,
    Box,
    Typography,
    Chip,
    CircularProgress,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useState, useEffect } from 'react';
import api, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';

const MODES = {
    SINGLE: 'SINGLE',
    BULK_SPECIFIC: 'BULK_SPECIFIC',
    BULK_ALL: 'BULK_ALL'
};

const UserSelector = ({ open, onClose, onSelect, onSuccess, initialMode = MODES.SINGLE }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [mode, setMode] = useState(initialMode);
    const [bulkMessage, setBulkMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (open) {
            setMode(initialMode);
            setSearchTerm('');
            setSelectedUsers([]);
            setBulkMessage('');
            fetchUsers('');
        }
    }, [open, initialMode]);

    const fetchUsers = async (searchStr) => {
        setLoading(true);
        try {
            const url = searchStr
                ? `/users?search=${searchStr}&limit=50`
                : `/users?limit=50`;
            const response = await api.get(url);
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Users Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (open) fetchUsers(searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, open]);

    const handleToggleUser = (user) => {
        if (mode === MODES.BULK_SPECIFIC) {
            setSelectedUsers(prev =>
                prev.find(u => u._id === user._id)
                    ? prev.filter(u => u._id !== user._id)
                    : [...prev, user]
            );
        } else {
            onSelect(user);
        }
    };

    const handleSendMessage = async () => {
        if (!bulkMessage.trim()) return;
        if (mode === MODES.BULK_SPECIFIC && selectedUsers.length === 0) return;

        setSending(true);
        try {
            let response;
            if (mode === MODES.BULK_ALL) {
                response = await api.post('/chat/bulk-send-all', { message: bulkMessage });
            } else {
                response = await api.post('/chat/bulk-send', {
                    receivers: selectedUsers.map(u => u._id),
                    message: bulkMessage
                });
            }

            if (response.data.success) {
                toast.success(response.data.message);
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" fontWeight={800}>
                    {mode === MODES.SINGLE ? 'New Chat' : mode === MODES.BULK_ALL ? 'Broadcast to All Students' : 'Select Recipients'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {mode !== MODES.BULK_ALL && (
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>
                )}



                {mode === MODES.BULK_SPECIFIC && selectedUsers.length > 0 && (
                    <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedUsers.map(u => (
                            <Chip
                                key={u._id}
                                label={u.name}
                                size="small"
                                onDelete={() => handleToggleUser(u)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                )}

                {mode !== MODES.BULK_ALL && (
                    <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : users.length === 0 ? (
                            <Typography variant="body2" color="text.disabled" sx={{ p: 2, textAlign: 'center' }}>
                                No users found
                            </Typography>
                        ) : (
                            users.map((user) => (
                                <ListItem
                                    key={user._id}
                                    button
                                    onClick={() => handleToggleUser(user)}
                                    sx={{ borderRadius: 2, mb: 0.5 }}
                                >
                                    <ListItemAvatar>
                                        <Avatar src={fixUrl(user.avatar)}>{user.name?.charAt(0)}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={user.name}
                                        secondary={`${user.role} • ${user.email}`}
                                    />
                                    {mode === MODES.BULK_SPECIFIC && (
                                        <Checkbox
                                            checked={!!selectedUsers.find(u => u._id === user._id)}
                                            sx={{ p: 0 }}
                                        />
                                    )}
                                </ListItem>
                            ))
                        )}
                    </List>
                )}

                {mode !== MODES.SINGLE && (
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            autoFocus
                            placeholder={mode === MODES.BULK_ALL ? "Type message for ALL students..." : "Type broadcast message..."}
                            value={bulkMessage}
                            onChange={(e) => setBulkMessage(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={onClose} sx={{ borderRadius: 2 }}>Cancel</Button>
                {mode !== MODES.SINGLE && (
                    <Button
                        variant="contained"
                        disabled={(mode === MODES.BULK_SPECIFIC && selectedUsers.length === 0) || !bulkMessage.trim() || sending}
                        onClick={handleSendMessage}
                        startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Send {mode === MODES.BULK_ALL ? 'to All' : 'Broadcast'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export { MODES };
export default UserSelector;
