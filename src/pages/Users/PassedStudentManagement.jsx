import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Button, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField,
    Switch, FormControlLabel, Stack, CircularProgress,
    Avatar, Chip
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PhotoCamera as PhotoCameraIcon,
    School as SchoolIcon,
    Star as StarIcon,
    YouTube as YouTubeIcon,
    VideoLibrary as VideoIcon,
    PermMedia as MediaIcon,
    Visibility as VisibilityIcon,
    PhoneAndroid as PhoneAndroidIcon
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
    const [searchTerm, setSearchTerm] = useState('');

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

    const fetchStudents = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

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
        if (!window.confirm("Are you sure you want to delete this alumni entry?")) return;
        try {
            const res = await api.delete(`/passed-students/${id}`);
            if (res.data.success) {
                toast.success("Entry deleted");
                fetchStudents();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const filteredStudents = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return students;
        return students.filter(s =>
            (s.name || '').toLowerCase().includes(term) ||
            (s.achievement || '').toLowerCase().includes(term)
        );
    }, [students, searchTerm]);

    const metricsItems = useMemo(() => [
        { title: 'Total Alumni', value: students.length, icon: <SchoolIcon />, color: 'primary' },
        { title: 'Published', value: students.filter(s => s.isPublished).length, icon: <VisibilityIcon />, color: 'success' },
        { title: 'Visible in App', value: students.filter(s => s.showInApp).length, icon: <PhoneAndroidIcon />, color: 'info' },
        { title: 'With Achievement', value: students.filter(s => s.achievement).length, icon: <StarIcon />, color: 'warning' }
    ], [students]);

    const columns = useMemo(() => [
        {
            field: 'name',
            headerName: 'STUDENT',
            flex: 1.5,
            minWidth: 240,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar src={params.data.image} sx={{ width: 36, height: 36 }}>
                        {params.data.name?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {params.data.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            {(params.data.description || '').substring(0, 60) || 'No description'}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'achievement',
            headerName: 'ACHIEVEMENT',
            width: 220,
            cellRenderer: (params) => params.data.achievement ? (
                <Chip
                    icon={<StarIcon sx={{ fontSize: '14px !important' }} />}
                    label={params.data.achievement}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '6px' }}
                />
            ) : (
                <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>—</Typography>
            )
        },
        {
            field: 'visibility',
            headerName: 'VISIBILITY',
            width: 180,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1}>
                    <Chip
                        label="ADMIN"
                        size="small"
                        color={params.data.isPublished ? 'success' : 'default'}
                        variant={params.data.isPublished ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: '6px' }}
                    />
                    <Chip
                        label="APP"
                        size="small"
                        color={params.data.showInApp ? 'primary' : 'default'}
                        variant={params.data.showInApp ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: '6px' }}
                    />
                </Stack>
            )
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 120,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleOpenDialog(params.data)} sx={{ color: 'var(--color-vc-mute)' }} title="Edit">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(params.data._id)} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Stack>
            )
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Passed Students (Alumni)
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Showcase successful alumni, their achievements, and success stories
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search alumni name or achievement..."
                actionButtonText="Add Alumni Entry"
                actionButtonIcon={<AddIcon fontSize="small" />}
                onActionClick={() => handleOpenDialog()}
                totalCount={filteredStudents.length}
            />

            <TableUI
                rowData={filteredStudents}
                columnDefs={columns}
                loading={loading}
            />

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
                                <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                    <VideoIcon color="primary" fontSize="small" />
                                    <Typography variant="caption" noWrap sx={{ flex: 1 }}>{vid}</Typography>
                                    <IconButton size="small" color="error" onClick={() => handleRemoveVideo(index)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
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
