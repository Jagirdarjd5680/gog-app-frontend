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

const RecycleBin = ({ open, onClose, type, onRestore, refreshSignal }) => {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState([]);

    const fetchDeletedItems = async () => {
        try {
            setLoading(true);
            const endpoint = type === 'user' ? '/users/bin/all' : '/questions/bin/all';
            const response = await api.get(`${endpoint}?t=${Date.now()}`);

            // Handle different response formats
            const data = type === 'user' ? response.data.data : response.data;
            setItems(data || []);
            setSelected([]);
        } catch (error) {
            
            toast.error('Failed to load recycle bin items');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchDeletedItems();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, type]);

    // Live-refresh while the dialog is open — a real-time archive/restore/permanent-delete
    // event bumps refreshSignal (see UserList.jsx's socket subscription).
    useEffect(() => {
        if (open && refreshSignal) fetchDeletedItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshSignal]);

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
            if (onRestore) onRestore();
        } catch (error) {
            
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
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth 
            PaperProps={{ 
                sx: { 
                    borderRadius: '8px',
                    bgcolor: 'var(--color-vc-canvas)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: '0px 32px 64px -12px rgba(0,0,0,0.16)'
                } 
            }}
        >
            <DialogTitle sx={{ 
                p: 2.5, 
                borderBottom: '1px solid var(--color-vc-hairline)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: 'var(--color-vc-canvas)'
            }}>
                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                    {type === 'user' ? 'User Recycle Bin' : 'Question Recycle Bin'}
                </Typography>
                {items.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Checkbox 
                            size="small"
                            checked={items.length > 0 && selected.length === items.length}
                            indeterminate={selected.length > 0 && selected.length < items.length}
                            onChange={handleSelectAll}
                            sx={{
                                color: 'var(--color-vc-hairline-strong)',
                                '&.Mui-checked, &.MuiCheckbox-indeterminate': {
                                    color: 'var(--color-vc-primary)'
                                }
                            }}
                        />
                        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-vc-body)', fontFamily: 'inherit' }}>
                            Select All
                        </Typography>
                    </Box>
                )}
            </DialogTitle>
            
            {selected.length > 0 && (
                <Box sx={{ 
                    px: 2.5, 
                    py: 1.5, 
                    bgcolor: 'var(--color-vc-canvas-soft)', 
                    borderBottom: '1px solid var(--color-vc-hairline)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                        {selected.length} items selected
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button 
                            size="small" 
                            variant="outlined" 
                            startIcon={<RestoreFromTrashIcon />}
                            onClick={() => handleRestore(selected)}
                            sx={{ 
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                borderRadius: '6px',
                                borderColor: 'var(--color-vc-hairline)',
                                color: 'var(--color-vc-link)',
                                '&:hover': {
                                    borderColor: 'var(--color-vc-link)',
                                    bgcolor: 'var(--color-vc-canvas)'
                                }
                            }}
                        >
                            Restore
                        </Button>
                        <Button 
                            size="small" 
                            variant="contained" 
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            onClick={() => handlePermanentDelete(selected)}
                            sx={{ 
                                textTransform: 'none',
                                fontWeight: 500,
                                fontSize: '12px',
                                fontFamily: 'inherit',
                                borderRadius: '6px',
                                boxShadow: 'none',
                                bgcolor: 'var(--color-vc-error-deep)',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: 'var(--color-vc-error-deep)',
                                    opacity: 0.9,
                                    boxShadow: 'none'
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </Stack>
                </Box>
            )}

            <DialogContent sx={{ p: 0, bgcolor: 'var(--color-vc-canvas)' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress size={24} sx={{ color: 'var(--color-vc-primary)' }} />
                    </Box>
                ) : items.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit' }}>
                            Recycle bin is empty
                        </Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {items.map((item, index) => (
                            <Box key={item._id}>
                                <ListItem 
                                    sx={{ 
                                        py: 1.5, 
                                        px: 2.5,
                                        borderBottom: index === items.length - 1 ? 'none' : '1px solid var(--color-vc-hairline)',
                                        '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } 
                                    }}
                                    button
                                    onClick={() => handleToggleSelect(item._id)}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Checkbox 
                                            size="small" 
                                            checked={selected.includes(item._id)} 
                                            onClick={(e) => e.stopPropagation()} 
                                            onChange={() => handleToggleSelect(item._id)}
                                            sx={{
                                                color: 'var(--color-vc-hairline-strong)',
                                                '&.Mui-checked': {
                                                    color: 'var(--color-vc-primary)'
                                                }
                                            }}
                                        />
                                    </ListItemIcon>
                                    <Avatar sx={{ 
                                        mr: 2, 
                                        width: 32, 
                                        height: 32, 
                                        bgcolor: 'var(--color-vc-canvas-soft)', 
                                        border: '1px solid var(--color-vc-hairline)',
                                        color: 'var(--color-vc-ink)'
                                    }}>
                                        {type === 'user' ? <PersonIcon sx={{ fontSize: 16 }} /> : <HelpOutlineIcon sx={{ fontSize: 16 }} />}
                                    </Avatar>
                                    <ListItemText
                                        primary={
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                                {type === 'user' ? item.name : (item.content.length > 60 ? item.content.substring(0, 60) + '...' : item.content)}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: type === 'user' ? '"JetBrains Mono", monospace' : 'inherit' }}>
                                                {type === 'user' ? item.email : `Type: ${item.type} | Cat: ${item.category || 'N/A'}`}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction sx={{ right: 24 }}>
                                        <Tooltip title="Restore">
                                            <IconButton onClick={(e) => { e.stopPropagation(); handleRestore(item._id); }} sx={{ color: 'var(--color-vc-link)', mr: 0.5 }} size="small">
                                                <RestoreFromTrashIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Permanently">
                                            <IconButton onClick={(e) => { e.stopPropagation(); handlePermanentDelete(item._id); }} sx={{ color: 'var(--color-vc-error-deep)' }} size="small">
                                                <DeleteForeverIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </Box>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)' }}>
                <Button 
                    onClick={onClose} 
                    sx={{ 
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        color: 'var(--color-vc-mute)',
                        '&:hover': {
                            color: 'var(--color-vc-ink)',
                            bgcolor: 'var(--color-vc-canvas-soft)'
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecycleBin;
