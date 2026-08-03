import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton,
    List, ListItem, ListItemText, Paper, CircularProgress, Chip, Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideocamIcon from '@mui/icons-material/Videocam';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import DeleteConfirmDialog from '../Common/DeleteConfirmDialog';

const emptyForm = {
    title: '',
    description: '',
    scheduledAt: '',
    durationMins: 60,
    meetingLink: '',
    status: 'scheduled',
};

const statusColor = (status) => {
    if (status === 'ongoing' || status === 'live') return 'error';
    if (status === 'completed') return 'success';
    if (status === 'cancelled') return 'default';
    return 'warning';
};

const LiveClassManageModal = ({ open, onClose, courseId, courseTitle, onSuccess }) => {
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
        if (open) {
            setFormOpen(false);
            setEditingClass(null);
            fetchLiveClasses();
        }
    }, [open, courseId]);

    const fetchLiveClasses = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/live-classes/course/${courseId}`);
            setLiveClasses(data?.data || []);
        } catch {
            toast.error('Failed to load live classes');
        } finally {
            setLoading(false);
        }
    };

    const openCreateForm = () => {
        setEditingClass(null);
        setFormData(emptyForm);
        setFormOpen(true);
    };

    const openEditForm = (item) => {
        setEditingClass(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            scheduledAt: item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : '',
            durationMins: item.durationMins ?? 60,
            meetingLink: item.meetingLink || '',
            status: item.status || 'scheduled',
        });
        setFormOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.scheduledAt || !formData.meetingLink) {
            toast.warning('Please fill title, date/time, and meeting link');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...formData,
                scheduledAt: new Date(formData.scheduledAt).toISOString(),
                durationMins: Number(formData.durationMins) || 60,
            };
            if (editingClass) {
                await api.patch(`/live-classes/${editingClass.id}`, payload);
                toast.success('Live class updated');
            } else {
                await api.post(`/live-classes/course/${courseId}`, payload);
                toast.success('Live class scheduled');
            }
            setFormOpen(false);
            await fetchLiveClasses();
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save live class');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/live-classes/${deleteTarget.id}`);
            toast.success('Live class deleted');
            setDeleteTarget(null);
            await fetchLiveClasses();
            if (onSuccess) onSuccess();
        } catch {
            toast.error('Failed to delete live class');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {formOpen && (
                    <IconButton size="small" onClick={() => setFormOpen(false)}>
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                )}
                <Typography variant="h6" fontWeight={800} component="span" sx={{ flexGrow: 1 }}>
                    {formOpen
                        ? (editingClass ? 'Edit Live Class' : 'Schedule Live Class')
                        : `Live Classes — ${courseTitle || ''}`}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : formOpen ? (
                    <Box component="form" noValidate sx={{ mt: 1 }}>
                        <TextField
                            fullWidth margin="normal" label="Class Title *" name="title"
                            value={formData.title} onChange={handleChange}
                            placeholder="e.g., Intro to Advanced React Hooks"
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth margin="normal" label="Date & Time *" name="scheduledAt"
                                type="datetime-local" value={formData.scheduledAt} onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                fullWidth margin="normal" label="Duration (minutes)" name="durationMins"
                                type="number" value={formData.durationMins} onChange={handleChange}
                            />
                        </Stack>
                        <TextField
                            fullWidth margin="normal" label="Meeting Link *" name="meetingLink"
                            value={formData.meetingLink} onChange={handleChange}
                            placeholder="https://youtube.com/watch?v=... or Zoom/Meet link"
                            helperText="YouTube link will play inline for students; other links show a Join button"
                        />
                        <TextField
                            fullWidth margin="normal" label="Description" name="description"
                            multiline rows={3} value={formData.description} onChange={handleChange}
                        />
                        <TextField
                            fullWidth margin="normal" label="Status" name="status" select
                            value={formData.status} onChange={handleChange}
                            SelectProps={{ native: true }}
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </TextField>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                            <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={openCreateForm}>
                                Schedule New
                            </Button>
                        </Box>
                        <Paper variant="outlined" sx={{ maxHeight: 360, overflow: 'auto' }}>
                            <List dense>
                                {liveClasses.length === 0 ? (
                                    <ListItem>
                                        <ListItemText primary="No live classes scheduled for this course yet." />
                                    </ListItem>
                                ) : liveClasses.map((item) => (
                                    <ListItem
                                        key={item.id}
                                        secondaryAction={
                                            <Stack direction="row" spacing={0.5}>
                                                <IconButton size="small" onClick={() => openEditForm(item)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        }
                                    >
                                        <VideocamIcon fontSize="small" color="action" sx={{ mr: 1.5 }} />
                                        <ListItemText
                                            primary={item.title}
                                            secondary={`${new Date(item.scheduledAt).toLocaleString()} · ${item.durationMins} min`}
                                        />
                                        <Chip
                                            label={(item.status || 'scheduled').toUpperCase()}
                                            color={statusColor(item.status)}
                                            size="small"
                                            sx={{ mr: 6 }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                {formOpen ? (
                    <>
                        <Button onClick={() => setFormOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
                            {saving ? <CircularProgress size={20} /> : editingClass ? 'Update' : 'Schedule'}
                        </Button>
                    </>
                ) : (
                    <Button onClick={onClose}>Close</Button>
                )}
            </DialogActions>

            <DeleteConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Live Class"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
            />
        </Dialog>
    );
};

export default LiveClassManageModal;
