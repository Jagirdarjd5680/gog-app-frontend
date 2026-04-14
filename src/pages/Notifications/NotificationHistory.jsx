import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, IconButton, Button, Divider,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    Tooltip, Stack, Avatar, Pagination, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const TYPE_COLOR = {
    info: 'info',
    warning: 'warning',
    success: 'success',
    error: 'error',
    announcement: 'primary',
};

// ─── Notification Detail Modal ────────────────────────────────────────────────
const NotifDetailModal = ({ notif, onClose, onDelete }) => {
    if (!notif) return null;
    return (
        <Dialog open={Boolean(notif)} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon color="primary" />
                    <Typography fontWeight={700} variant="h6">Notification Detail</Typography>
                </Box>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="h6" fontWeight={700} gutterBottom>{notif.title}</Typography>

                <Stack direction="row" spacing={1} mb={2}>
                    <Chip
                        label={notif.type || 'info'}
                        color={TYPE_COLOR[notif.type] || 'default'}
                        size="small"
                    />
                    <Chip
                        label={notif.recipientRole || 'all'}
                        variant="outlined"
                        size="small"
                    />
                    {notif.isSent ? (
                        <Chip icon={<CheckCircleIcon />} label="Sent" color="success" size="small" />
                    ) : (
                        <Chip icon={<HourglassEmptyIcon />} label="Pending" color="warning" size="small" />
                    )}
                </Stack>

                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {notif.message}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                        {notif.sentBy?.name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Sent by</Typography>
                        <Typography variant="body2" fontWeight={600}>{notif.sentBy?.name || 'System'}</Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Date</Typography>
                        <Typography variant="body2">{format(new Date(notif.createdAt), 'dd MMM yyyy, hh:mm a')}</Typography>
                    </Box>
                </Stack>

                {notif.course?.title && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">Related Course</Typography>
                        <Typography variant="body2" fontWeight={600}>{notif.course.title}</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    variant="outlined"
                    onClick={() => { onDelete(notif._id); onClose(); }}
                >
                    Delete
                </Button>
                <Button onClick={onClose} variant="contained">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── Main Notification History Page ──────────────────────────────────────────
const NotificationHistory = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [sentOnly, setSentOnly] = useState(true); // Default to true as per user request
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    const fetchNotifications = async (pg = 1, onlyMe = sentOnly) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/notifications?page=${pg}&limit=10&sentByMe=${onlyMe}`);
            setNotifications(data.data || []);
            setTotalPages(data.totalPages || 1);
            setSelectedIds([]); // Clear selection on page change
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(page, sentOnly); }, [page, sentOnly]);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            toast.success('Notification deleted');
            fetchNotifications(page, sentOnly);
        } catch {
            toast.error('Failed to delete notification');
        }
        setDeleteConfirm(null);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        setBulkDeleting(true);
        try {
            await api.post('/notifications/bulk-delete', { ids: selectedIds });
            toast.success(`${selectedIds.length} notifications deleted`);
            fetchNotifications(page, sentOnly);
        } catch {
            toast.error('Failed to perform bulk delete');
        } finally {
            setBulkDeleting(false);
            setDeleteConfirm('bulk');
        }
    };

    const markRead = async (id) => {
        try { await api.put(`/notifications/${id}/read`); } catch { }
    };

    const handleView = (notif) => {
        setSelected(notif);
        markRead(notif._id);
    };

    const toggleSelect = (id, e) => {
        e.stopPropagation();
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === notifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(notifications.map(n => n._id));
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={800}>Notification History</Typography>
                        <Typography variant="body2" color="text.secondary">All sent notifications log</Typography>
                    </Box>
                    {selectedIds.length > 0 && (
                        <Button 
                            variant="contained" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteConfirm('bulk')}
                            sx={{ borderRadius: 2, ml: 2, height: 40 }}
                        >
                            Delete Selected ({selectedIds.length})
                        </Button>
                    )}
                </Box>
                
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={selectAll}
                        sx={{ borderRadius: 1.5, textTransform: 'none' }}
                    >
                        {selectedIds.length === notifications.length ? 'Deselect All' : 'Select All Page'}
                    </Button>

                    {/* Filter Toggle */}
                    <Box sx={{ display: 'flex', bgcolor: 'action.hover', p: 0.5, borderRadius: 2 }}>
                        <Button 
                            size="small"
                            variant={sentOnly ? 'contained' : 'text'}
                            onClick={() => setSentOnly(true)}
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                            Sent by Me
                        </Button>
                        <Button 
                            size="small"
                            variant={!sentOnly ? 'contained' : 'text'}
                            onClick={() => setSentOnly(false)}
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                            All History
                        </Button>
                    </Box>
                </Stack>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : notifications.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                    <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No notifications found</Typography>
                </Paper>
            ) : (
                <>
                    <Stack spacing={1.5}>
                        {notifications.map((notif) => (
                            <Paper
                                key={notif._id}
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    border: '1px solid',
                                    borderColor: selectedIds.includes(notif._id) ? 'primary.main' : 'divider',
                                    bgcolor: selectedIds.includes(notif._id) ? 'primary.50' : 'background.paper',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    '&:hover': {
                                        boxShadow: 3,
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                                onClick={() => handleView(notif)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={(e) => toggleSelect(notif._id, e)}>
                                    <Avatar
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: selectedIds.includes(notif._id) ? 'primary.main' : 'action.disabledBackground',
                                            color: selectedIds.includes(notif._id) ? '#fff' : 'action.disabled',
                                            fontSize: 18,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {selectedIds.includes(notif._id) ? <CheckCircleIcon /> : <NotificationsIcon fontSize="small" />}
                                    </Avatar>
                                </Box>

                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Typography variant="body1" fontWeight={700} noWrap>
                                            {notif.title}
                                        </Typography>
                                        <Chip
                                            label={notif.type || 'info'}
                                            color={TYPE_COLOR[notif.type] || 'default'}
                                            size="small"
                                            sx={{ fontSize: 10 }}
                                        />
                                        <Chip
                                            label={notif.recipientRole || 'all'}
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontSize: 10 }}
                                        />
                                    </Box>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}
                                    >
                                        {notif.message}
                                    </Typography>

                                    <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            By: <strong>{notif.sentBy?.name || 'System'}</strong>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(new Date(notif.createdAt), 'dd MMM yyyy, hh:mm a')}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title={selectedIds.includes(notif._id) ? "Deselect" : "Select"}>
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={(e) => toggleSelect(notif._id, e)}
                                        >
                                            <CheckCircleIcon fontSize="small" color={selectedIds.includes(notif._id) ? "primary" : "disabled"} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(notif._id); }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, v) => setPage(v)}
                            color="primary"
                        />
                    </Box>
                </>
            )}

            {/* Detail Modal */}
            <NotifDetailModal
                notif={selected}
                onClose={() => setSelected(null)}
                onDelete={handleDelete}
            />

            {/* Delete Confirm Dialog */}
            <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)} maxWidth="xs">
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        {deleteConfirm === 'bulk' 
                            ? `Are you sure you want to delete ${selectedIds.length} notifications? This action cannot be undone.`
                            : "Are you sure you want to delete this notification? This action cannot be undone."
                        }
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button 
                        color="error" 
                        variant="contained" 
                        onClick={() => deleteConfirm === 'bulk' ? handleBulkDelete() : handleDelete(deleteConfirm)}
                        disabled={bulkDeleting}
                    >
                        {bulkDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NotificationHistory;
