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

    const fetchNotifications = async (pg = 1) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/notifications?page=${pg}&limit=10`);
            setNotifications(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNotifications(page); }, [page]);

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            toast.success('Notification deleted');
            fetchNotifications(page);
        } catch {
            toast.error('Failed to delete notification');
        }
        setDeleteConfirm(null);
    };

    const markRead = async (id) => {
        try { await api.put(`/notifications/${id}/read`); } catch { }
    };

    const handleView = (notif) => {
        setSelected(notif);
        markRead(notif._id);
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>Notification History</Typography>
                    <Typography variant="body2" color="text.secondary">All sent notifications log</Typography>
                </Box>
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
                                    borderColor: 'divider',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        boxShadow: 3,
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                                onClick={() => handleView(notif)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    <Avatar
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: 'primary.main',
                                            fontSize: 18
                                        }}
                                    >
                                        <NotificationsIcon fontSize="small" />
                                    </Avatar>

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
                                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
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
                    <Alert severity="warning">Are you sure you want to delete this notification? This action cannot be undone.</Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={() => handleDelete(deleteConfirm)}>Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NotificationHistory;
