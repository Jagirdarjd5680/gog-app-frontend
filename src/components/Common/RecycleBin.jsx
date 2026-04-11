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
    Avatar,
    Checkbox,
    ListItemIcon,
    Stack
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
    const [selected, setSelected] = useState([]);

    const fetchDeletedItems = async () => {
        try {
            setLoading(true);
            const endpoint = type === 'user' ? '/users/bin/all' : '/questions/bin/all';
            const response = await api.get(endpoint);

            // Handle different response formats
            const data = type === 'user' ? response.data.data : response.data;
            setItems(data || []);
            setSelected([]);
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

    const handleRestore = async (idOrIds) => {
        try {
            const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
            if (ids.length === 0) return;

            const endpoint = type === 'user' ? '/users/restore-multiple' : '/questions/restore-multiple';
            // Fallback to single restore if multiple endpoint doesn't exist yet, 
            // but we'll assume we can implement it or use sequential calls for now.
            // For robustness, let's use Promise.all if it's just a few
            
            await Promise.all(ids.map(id => {
                const ep = type === 'user' ? `/users/restore/${id}` : `/questions/restore/${id}`;
                return api.put(ep);
            }));

            toast.success(`${ids.length} item(s) restored successfully`);
            fetchDeletedItems();
            if (onRestore) onRestore();
        } catch (error) {
            console.error('Restore error:', error);
            toast.error('Failed to restore items');
        }
    };

    const handlePermanentDelete = async (idOrIds) => {
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        if (ids.length === 0) return;

        if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} item(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            await Promise.all(ids.map(id => {
                const ep = type === 'user' ? `/users/permanent/${id}` : `/questions/permanent/${id}`;
                return api.delete(ep);
            }));
            
            toast.success('Items permanently deleted');
            fetchDeletedItems();
        } catch (error) {
            console.error('Permanent delete error:', error);
            toast.error('Failed to delete items permanently');
        }
    };

    const handleToggleSelect = (id) => {
        setSelected(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selected.length === items.length) {
            setSelected([]);
        } else {
            setSelected(items.map(i => i._id));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ fontWeight: 800, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={800}>
                    {type === 'user' ? 'User Recycle Bin' : 'Question Recycle Bin'}
                </Typography>
                {items.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox 
                            size="small"
                            checked={items.length > 0 && selected.length === items.length}
                            indeterminate={selected.length > 0 && selected.length < items.length}
                            onChange={handleSelectAll}
                        />
                        <Typography variant="caption" sx={{ ml: -0.5, fontWeight: 700 }}>Select All</Typography>
                    </Box>
                )}
            </DialogTitle>
            
            {selected.length > 0 && (
                <Box sx={{ px: 2, py: 1, bgcolor: 'primary.light', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                        {selected.length} items selected
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button 
                            size="small" 
                            color="inherit" 
                            variant="outlined" 
                            startIcon={<RestoreFromTrashIcon />}
                            onClick={() => handleRestore(selected)}
                            sx={{ borderColor: 'rgba(255,255,255,0.5)', fontWeight: 700 }}
                        >
                            Restore
                        </Button>
                        <Button 
                            size="small" 
                            color="error" 
                            variant="contained" 
                            startIcon={<DeleteForeverIcon />}
                            onClick={() => handlePermanentDelete(selected)}
                            sx={{ fontWeight: 700 }}
                        >
                            Delete
                        </Button>
                    </Stack>
                </Box>
            )}

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
                                <ListItem 
                                    sx={{ py: 1, '&:hover': { bgcolor: 'action.hover' } }}
                                    button
                                    onClick={() => handleToggleSelect(item._id)}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Checkbox 
                                            size="small" 
                                            checked={selected.includes(item._id)} 
                                            onClick={(e) => e.stopPropagation()} 
                                            onChange={() => handleToggleSelect(item._id)}
                                        />
                                    </ListItemIcon>
                                    <Avatar sx={{ mr: 2, width: 32, height: 32, bgcolor: type === 'user' ? 'primary.main' : 'secondary.main', fontSize: '0.8rem' }}>
                                        {type === 'user' ? <PersonIcon fontSize="inherit" /> : <HelpOutlineIcon fontSize="inherit" />}
                                    </Avatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
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
                                            <IconButton onClick={(e) => { e.stopPropagation(); handleRestore(item._id); }} color="primary" size="small" sx={{ mr: 0.5 }}>
                                                <RestoreFromTrashIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Permanently">
                                            <IconButton onClick={(e) => { e.stopPropagation(); handlePermanentDelete(item._id); }} color="error" size="small">
                                                <DeleteForeverIcon fontSize="small" />
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
                <Button onClick={onClose} variant="outlined" size="small" sx={{ borderRadius: 1.5, fontWeight: 700 }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecycleBin;
