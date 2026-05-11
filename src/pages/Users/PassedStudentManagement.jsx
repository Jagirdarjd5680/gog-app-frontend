import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Switch, FormControlLabel, Stack, Grid, CircularProgress,
    Tooltip, Avatar, Chip
} from '@mui/material';
import { 
    Add as AddIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    PhotoCamera as PhotoCameraIcon,
    School as SchoolIcon,
    Star as StarIcon,
    YouTube as YouTubeIcon,
    VideoLibrary as VideoIcon,
    PermMedia as MediaIcon
} from '@mui/icons-material';
import api, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import { ImageList, ImageListItem } from '@mui/material';
import MediaLibrary from '../Media/MediaLibrary';

const PassedStudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [pickerTarget, setPickerTarget] = useState('image');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        achievement: '',
        image: '', // Kept for compatibility
        images: [],
        videos: [],
        isPublished: true,
        showInApp: true
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/passed-students/admin');
            if (res.data.success) {
                setStudents(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch alumni data");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (student = null) => {
        if (student) {
            setEditMode(true);
            setSelectedStudent(student);
            setFormData({
                name: student.name,
                description: student.description || '',
                achievement: student.achievement || '',
                image: student.image || '',
                images: student.images || [],
                videos: student.videos || [],
                isPublished: student.isPublished,
                showInApp: student.showInApp ?? true
            });
        } else {
            setEditMode(false);
            setSelectedStudent(null);
            setFormData({
                name: '',
                description: '',
                achievement: '',
                image: '',
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
        const url = prompt("Enter video URL:");
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
        if (!formData.name || (!formData.image && formData.images.length === 0)) {
            toast.warning("Name and at least one Image are required");
            return;
        }

        try {
            setActionLoading(true);
            if (editMode) {
                const res = await api.put(`/passed-students/${selectedStudent._id}`, formData);
                if (res.data.success) {
                    toast.success("Entry updated successfully");
                    fetchStudents();
                    handleCloseDialog();
                }
            } else {
                const res = await api.post('/passed-students', formData);
                if (res.data.success) {
                    toast.success("Entry created successfully");
                    fetchStudents();
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
        if (window.confirm("Are you sure you want to delete this alumni entry?")) {
            try {
                const res = await api.delete(`/passed-students/${id}`);
                if (res.data.success) {
                    toast.success("Entry deleted");
                    fetchStudents();
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
                    Passed Students (Alumni)
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    Add Alumni Entry
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Student</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Achievement</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Visibility</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    No alumni entries found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student._id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar src={student.image} alt={student.name} sx={{ width: 40, height: 40 }}>
                                                {student.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body1" fontWeight={600}>{student.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{student.description?.substring(0, 50)}...</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            icon={<StarIcon sx={{ fontSize: '1rem !important' }} />} 
                                            label={student.achievement} 
                                            size="small" 
                                            color="secondary" 
                                            variant="outlined" 
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="Admin Visibility">
                                                <Chip 
                                                    label="ADM" 
                                                    size="small" 
                                                    color={student.isPublished ? 'success' : 'default'} 
                                                    variant={student.isPublished ? 'filled' : 'outlined'} 
                                                />
                                            </Tooltip>
                                            <Tooltip title="Mobile App Visibility">
                                                <Chip 
                                                    label="APP" 
                                                    size="small" 
                                                    color={student.showInApp ? 'primary' : 'default'} 
                                                    variant={student.showInApp ? 'filled' : 'outlined'} 
                                                />
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton color="primary" onClick={() => handleOpenDialog(student)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton color="error" onClick={() => handleDelete(student._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle fontWeight={800}>
                    {editMode ? 'Edit Alumni' : 'Add New Alumni'}
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Student Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Achievement"
                            name="achievement"
                            value={formData.achievement}
                            onChange={handleInputChange}
                            placeholder="e.g. Placed at Google, Top Scorer"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            placeholder="Describe their journey or specific achievements..."
                        />
                        <Typography variant="subtitle2" fontWeight={700}>Images</Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <Button startIcon={<PhotoCameraIcon />} variant="outlined" size="small" onClick={handleAddImageUrl}>URL</Button>
                            <Button startIcon={<MediaIcon />} variant="contained" size="small" onClick={() => { setPickerTarget('image'); setMediaPickerOpen(true); }}>Library</Button>
                        </Stack>
                        <ImageList sx={{ width: '100%', height: 120, borderRadius: 2, border: '1px solid', borderColor: 'divider', p: 1 }} cols={4} rowHeight={100}>
                            {formData.images.map((img, index) => (
                                <ImageListItem key={index} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                                    <img src={img} alt="" loading="lazy" style={{ height: '100%', objectFit: 'cover' }} />
                                    <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.8)' }} onClick={() => handleRemoveImage(index)}>
                                        <DeleteIcon fontSize="small" color="error" />
                                    </IconButton>
                                </ImageListItem>
                            ))}
                        </ImageList>

                        <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Videos</Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            <Button startIcon={<YouTubeIcon />} variant="outlined" size="small" onClick={handleAddVideoUrl}>URL</Button>
                            <Button startIcon={<VideoIcon />} variant="contained" size="small" onClick={() => { setPickerTarget('video'); setMediaPickerOpen(true); }}>Library</Button>
                        </Stack>
                        <Stack spacing={1}>
                            {formData.videos.map((vid, index) => (
                                <Paper key={index} variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2 }}>
                                    <VideoIcon color="primary" fontSize="small" />
                                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>{vid}</Typography>
                                    <IconButton size="small" color="error" onClick={() => handleRemoveVideo(index)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Paper>
                            ))}
                        </Stack>

                        <TextField
                            fullWidth
                            label="Legacy Image URL (Optional)"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            placeholder="Used if Gallery is empty"
                        />
                        <Stack spacing={1}>
                            <FormControlLabel
                                control={<Switch checked={formData.isPublished} onChange={handleToggle('isPublished')} />}
                                label="Published (Admin Panel)"
                            />
                            <FormControlLabel
                                control={<Switch checked={formData.showInApp} onChange={handleToggle('showInApp')} />}
                                label="Show in Mobile App"
                            />
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={actionLoading}
                    >
                        {actionLoading ? <CircularProgress size={24} /> : (editMode ? 'Update Alumni' : 'Add Alumni')}
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

export default PassedStudentManagement;
