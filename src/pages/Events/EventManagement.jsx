import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Switch, FormControlLabel, Stack, Grid, CircularProgress,
    Tooltip, Card, CardMedia, ImageList, ImageListItem, Chip
} from '@mui/material';
import { 
    Add as AddIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    PhotoCamera as PhotoCameraIcon,
    YouTube as YouTubeIcon,
    CalendarMonth as CalendarIcon,
    LocationOn as LocationIcon,
    VideoLibrary as VideoIcon,
    PermMedia as MediaIcon
} from '@mui/icons-material';
import api, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MediaLibrary from '../Media/MediaLibrary';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState('image'); // 'image' or 'video'

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        videoLink: '',
        images: [],
        videos: [],
        isPublished: true,
        showInApp: true
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/events/admin');
            if (res.data.success) {
                setEvents(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch events");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (event = null) => {
        if (event) {
            setEditMode(true);
            setSelectedEvent(event);
            const startVal = event.startDate || event.date;
            const endVal = event.endDate || event.date;
            setFormData({
                title: event.title,
                description: event.description || '',
                startDate: startVal ? new Date(startVal).toISOString().split('T')[0] : '',
                endDate: endVal ? new Date(endVal).toISOString().split('T')[0] : '',
                location: event.location || '',
                videoLink: event.videoLink || '',
                images: event.images || [],
                videos: event.videos || [],
                isPublished: event.isPublished,
                showInApp: event.showInApp ?? true
            });
        } else {
            setEditMode(false);
            setSelectedEvent(null);
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                title: '',
                description: '',
                startDate: today,
                endDate: today,
                location: '',
                videoLink: '',
                images: [],
                videos: [],
                isPublished: true,
                showInApp: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, description: content }));
    };

    const handleToggle = (name) => (e) => {
        setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    };

    const handleAddImageUrl = () => {
        const url = prompt("Enter image URL:");
        if (url) {
            setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
        }
    };

    const handleAddVideoUrl = () => {
        const url = prompt("Enter video URL (Direct link or YouTube):");
        if (url) {
            setFormData(prev => ({ ...prev, videos: [...prev.videos, url] }));
        }
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({ 
            ...prev, 
            images: prev.images.filter((_, i) => i !== index) 
        }));
    };

    const handleRemoveVideo = (index) => {
        setFormData(prev => ({ 
            ...prev, 
            videos: prev.videos.filter((_, i) => i !== index) 
        }));
    };

    const handleMediaSelect = (file) => {
        const url = fixUrl(file.url);
        if (pickerTarget === 'image') {
            setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
        } else {
            setFormData(prev => ({ ...prev, videos: [...prev.videos, url] }));
        }
        setMediaPickerOpen(false);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.startDate || !formData.endDate) {
            toast.warning("Title, Start Date and End Date are required");
            return;
        }

        try {
            setActionLoading(true);
            if (editMode) {
                const res = await api.put(`/events/${selectedEvent._id}`, formData);
                if (res.data.success) {
                    toast.success("Event updated successfully");
                    fetchEvents();
                    handleCloseDialog();
                }
            } else {
                const res = await api.post('/events', formData);
                if (res.data.success) {
                    toast.success("Event created successfully");
                    fetchEvents();
                    handleCloseDialog();
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                const res = await api.delete(`/events/${id}`);
                if (res.data.success) {
                    toast.success("Event deleted");
                    fetchEvents();
                }
            } catch (error) {
                toast.error("Delete failed");
            }
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={800} color="primary">
                    Event Management
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Add New Event
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Event Title</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Start Date</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>End Date</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Visibility</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    No events found. Add your first event!
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => {
                                const now = new Date();
                                const start = event.startDate ? new Date(event.startDate) : (event.date ? new Date(event.date) : null);
                                const end = event.endDate ? new Date(event.endDate) : (event.date ? new Date(event.date) : null);
                                
                                let statusLabel = 'Upcoming';
                                let statusColor = 'info';

                                if (start && end) {
                                    if (now >= start && now <= end) {
                                        statusLabel = 'Live';
                                        statusColor = 'error';
                                    } else if (now > end) {
                                        statusLabel = 'Completed';
                                        statusColor = 'success';
                                    }
                                }

                                return (
                                    <TableRow key={event._id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{event.title}</TableCell>
                                        <TableCell>{start && !isNaN(start) ? format(start, 'dd MMM yyyy') : 'N/A'}</TableCell>
                                        <TableCell>{end && !isNaN(end) ? format(end, 'dd MMM yyyy') : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip label={statusLabel} color={statusColor} size="small" sx={{ fontWeight: 700 }} />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Admin Visibility">
                                                    <Chip 
                                                        label="ADM" 
                                                        size="small" 
                                                        color={event.isPublished ? 'success' : 'default'} 
                                                        variant={event.isPublished ? 'filled' : 'outlined'} 
                                                    />
                                                </Tooltip>
                                                <Tooltip title="Mobile App Visibility">
                                                    <Chip 
                                                        label="APP" 
                                                        size="small" 
                                                        color={event.showInApp ? 'primary' : 'default'} 
                                                        variant={event.showInApp ? 'filled' : 'outlined'} 
                                                    />
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" onClick={() => handleOpenDialog(event)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton color="error" onClick={() => handleDelete(event._id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle fontWeight={800}>
                    {editMode ? 'Edit Event' : 'Create New Event'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <TextField
                                fullWidth
                                label="Event Title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                margin="normal"
                                required
                            />
                            <Box sx={{ mt: 2, mb: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    Event Description (Rich Text)
                                </Typography>
                                <Box sx={{ 
                                    '& .ql-container': { 
                                        minHeight: '200px',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        borderRadius: '0 0 8px 8px'
                                    },
                                    '& .ql-toolbar': {
                                        borderRadius: '8px 8px 0 0',
                                        bgcolor: 'rgba(0,0,0,0.02)'
                                    }
                                }}>
                                    <ReactQuill 
                                        theme="snow"
                                        value={formData.description}
                                        onChange={handleEditorChange}
                                        placeholder="Write detailed event description here..."
                                    />
                                </Box>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                            <TextField
                                fullWidth
                                label="End Date"
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                margin="normal"
                                placeholder="E.g. Online, Mumbai Office"
                            />
                            <TextField
                                fullWidth
                                label="Video Link (YouTube)"
                                name="videoLink"
                                value={formData.videoLink}
                                onChange={handleInputChange}
                                margin="normal"
                                placeholder="https://youtube.com/..."
                            />
                            <Stack spacing={1} sx={{ mt: 2 }}>
                                <FormControlLabel
                                    control={<Switch checked={formData.isPublished} onChange={handleToggle('isPublished')} />}
                                    label="Published (Admin Panel)"
                                />
                                <FormControlLabel
                                    control={<Switch checked={formData.showInApp} onChange={handleToggle('showInApp')} />}
                                    label="Show in Mobile App"
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Event Gallery (Images)
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button startIcon={<PhotoCameraIcon />} variant="outlined" size="small" onClick={handleAddImageUrl}>
                                        URL
                                    </Button>
                                    <Button 
                                        startIcon={<MediaIcon />} 
                                        variant="contained" 
                                        size="small" 
                                        onClick={() => { setPickerTarget('image'); setMediaPickerOpen(true); }}
                                    >
                                        Media Library
                                    </Button>
                                </Stack>
                            </Box>
                            <ImageList sx={{ width: '100%', height: 200, borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 1 }} cols={4} rowHeight={164}>
                                {formData.images.map((img, index) => (
                                    <ImageListItem key={index} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                                        <img src={img} alt={`Event ${index}`} loading="lazy" style={{ height: '100%', objectFit: 'cover' }} />
                                        <IconButton 
                                            size="small" 
                                            sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                                            onClick={() => handleRemoveImage(index)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </ImageListItem>
                                ))}
                            </ImageList>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Event Videos
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button startIcon={<YouTubeIcon />} variant="outlined" size="small" onClick={handleAddVideoUrl}>
                                        URL
                                    </Button>
                                    <Button 
                                        startIcon={<VideoIcon />} 
                                        variant="contained" 
                                        size="small" 
                                        onClick={() => { setPickerTarget('video'); setMediaPickerOpen(true); }}
                                    >
                                        Media Library
                                    </Button>
                                </Stack>
                            </Box>
                            <Grid container spacing={2}>
                                {formData.videos.map((vid, index) => (
                                    <Grid item xs={12} sm={6} key={index}>
                                        <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
                                            <VideoIcon color="primary" />
                                            <Typography variant="caption" noWrap sx={{ flex: 1 }}>{vid}</Typography>
                                            <IconButton size="small" color="error" onClick={() => handleRemoveVideo(index)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : (editMode ? 'Update Event' : 'Create Event')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Media Picker Dialog */}
            <Dialog 
                open={mediaPickerOpen} 
                onClose={() => setMediaPickerOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}
            >
                <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Select {pickerTarget === 'image' ? 'Image' : 'Video'} from Library
                    <IconButton onClick={() => setMediaPickerOpen(false)}><DeleteIcon sx={{ transform: 'rotate(45deg)' }} /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <MediaLibrary onSelect={handleMediaSelect} />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default EventManagement;
