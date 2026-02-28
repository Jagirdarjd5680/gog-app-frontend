import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    Paper,
    Tooltip,
    Divider,
    CircularProgress,
    Avatar
} from '@mui/material';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const RecycleBin = ({ open, onClose, type, onRestore }) => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const fetchDeletedItems = async () => {
        try {
            setLoading(true);
            const endpoint = type === 'user' ? '/users/bin/all' : '/questions/bin/all';
            const response = await api.get(endpoint);

            // Handle different response formats
            const data = type === 'user' ? response.data.data : response.data;
            setItems(data || []);
        } catch (error) {
            console.error('Fetch deleted items error:', error);
            toast.error('Failed to load recycle bin items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchDeletedItems();
        }
    }, [open, type]);

    const handleRestore = async (id) => {
        try {
            const endpoint = type === 'user' ? `/users/restore/${id}` : `/questions/restore/${id}`;
            await api.put(endpoint);
            toast.success('Item restored successfully');
            fetchDeletedItems();
            if (onRestore) onRestore();
        } catch (error) {
            console.error('Restore error:', error);
            toast.error('Failed to restore item');
        }
    };

    const handlePermanentDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            const endpoint = type === 'user' ? `/users/permanent/${id}` : `/questions/permanent/${id}`;
            await api.delete(endpoint);
            toast.success('Item permanently deleted');
            fetchDeletedItems();
        } catch (error) {
            console.error('Permanent delete error:', error);
            toast.error('Failed to delete item permanently');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ fontWeight: 800, bgcolor: 'action.hover' }}>
                {type === 'user' ? 'User Recycle Bin' : 'Question Recycle Bin'}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : items.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">Recycle bin is empty</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {items.map((item, index) => (
                            <Box key={item._id}>
                                <ListItem sx={{ py: 1.5 }}>
                                    <Avatar sx={{ mr: 2, bgcolor: type === 'user' ? 'primary.main' : 'secondary.main' }}>
                                        {type === 'user' ? <PersonIcon /> : <HelpOutlineIcon />}
                                    </Avatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight={700}>
                                                {type === 'user' ? item.name : (item.content.length > 60 ? item.content.substring(0, 60) + '...' : item.content)}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {type === 'user' ? item.email : `Type: ${item.type} | Cat: ${item.category || 'N/A'}`}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="Restore">
                                            <IconButton onClick={() => handleRestore(item._id)} color="primary" size="small" sx={{ mr: 1 }}>
                                                <RestoreFromTrashIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Permanently">
                                            <IconButton onClick={() => handlePermanentDelete(item._id)} color="error" size="small">
                                                <DeleteForeverIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < items.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="contained" size="small" sx={{ borderRadius: 1.5 }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecycleBin;
