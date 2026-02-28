import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Box, FormControl, Select, MenuItem,
    IconButton, Typography, Grid, Switch, FormControlLabel,
    Paper, ToggleButton, ToggleButtonGroup, Stack, InputAdornment,
    CircularProgress
} from '@mui/material';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import QuizIcon from '@mui/icons-material/Quiz';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import api from '../../utils/api';
import { uploadFile } from '../../utils/upload';
import { toast } from 'react-toastify';
import MediaPickerModal from '../Media/MediaPickerModal';

const FreeMaterialFormModal = ({ open, onClose, material, onSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [exams, setExams] = useState([]);
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mediaPicker, setMediaPicker] = useState({ open: false, target: '' });

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        subject: '',
        type: 'pdf',
        pdfUrl: '',
        videoUrl: '',
        thumbnail: '',
        exam: '',
        meeting: '',
        isDownloadableOffline: false,
        isActive: true,
        order: 0
    });

    useEffect(() => {
        if (open) {
            fetchInitialData();
            if (material) {
                setFormData({
                    title: material.title || '',
                    category: material.category?._id || material.category || '',
                    subject: material.subject || '',
                    type: material.type || 'pdf',
                    pdfUrl: material.pdfUrl || '',
                    videoUrl: material.videoUrl || '',
                    thumbnail: material.thumbnail || '',
                    exam: material.exam?._id || material.exam || '',
                    meeting: material.meeting?._id || material.meeting || '',
                    isDownloadableOffline: material.isDownloadableOffline || false,
                    isActive: material.isActive ?? true,
                    order: material.order || 0
                });
            } else {
                setFormData({
                    title: '',
                    category: '',
                    subject: '',
                    type: 'pdf',
                    pdfUrl: '',
                    videoUrl: '',
                    thumbnail: '',
                    exam: '',
                    meeting: '',
                    isDownloadableOffline: false,
                    isActive: true,
                    order: 0
                });
            }
        }
    }, [open, material]);

    const fetchInitialData = async () => {
        try {
            const [catRes, examRes, liveRes] = await Promise.all([
                api.get('/categories'),
                api.get('/exams'),
                api.get('/live-classes', { params: { limit: 100 } })
            ]);
            setCategories(catRes.data.data || catRes.data || []);
            setExams(Array.isArray(examRes.data) ? examRes.data : (examRes.data.data || []));
            setLiveClasses(liveRes.data.data || liveRes.data || []);
        } catch (error) {
            console.error('Error fetching modal data:', error);
        }
    };

    const handleFileUpload = async (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setUploadProgress(0);
            const result = await uploadFile(file, (p) => setUploadProgress(p));
            if (result.success) {
                if (type === 'pdf') setFormData(prev => ({ ...prev, pdfUrl: result.url }));
                else if (type === 'video') setFormData(prev => ({ ...prev, videoUrl: result.url, thumbnail: result.thumbnail || '' }));
                toast.success('Uploaded successfully');
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const onMediaSelect = (file) => {
        if (mediaPicker.target === 'pdf') {
            setFormData(prev => ({ ...prev, pdfUrl: file.url }));
        } else if (mediaPicker.target === 'video') {
            setFormData(prev => ({ ...prev, videoUrl: file.url, thumbnail: file.thumbnail || '' }));
        }
        setMediaPicker({ open: false, target: '' });
    };

    const handleSubmit = async () => {
        if (!formData.title) return toast.error('Please enter a title');
        if (!formData.category) return toast.error('Please select a category');

        if (formData.type === 'pdf' && !formData.pdfUrl) return toast.error('Please provide PDF URL or upload');
        if (formData.type === 'video' && !formData.videoUrl) return toast.error('Please provide Video URL or upload');
        if (formData.type === 'test' && !formData.exam) return toast.error('Please select an exam');
        if (formData.type === 'zoom' && !formData.meeting) return toast.error('Please select a meeting');

        setLoading(true);
        try {
            const dataToSubmit = {
                title: formData.title,
                category: formData.category,
                subject: formData.subject,
                type: formData.type,
                isActive: formData.isActive,
                order: formData.order
            };

            if (formData.type === 'pdf') dataToSubmit.pdfUrl = formData.pdfUrl;
            if (formData.type === 'video') {
                dataToSubmit.videoUrl = formData.videoUrl;
                dataToSubmit.thumbnail = formData.thumbnail;
            }
            if (formData.type === 'test') dataToSubmit.exam = formData.exam;
            if (formData.type === 'zoom') dataToSubmit.meeting = formData.meeting;
            if (['pdf', 'video'].includes(formData.type)) {
                dataToSubmit.isDownloadableOffline = formData.isDownloadableOffline;
            }

            if (material) {
                await api.put(`/free-materials/${material._id}`, dataToSubmit);
                toast.success('Updated successfully');
            } else {
                await api.post('/free-materials', dataToSubmit);
                toast.success('Created successfully');
            }
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
                    <Typography variant="h6" fontWeight={800}>
                        {material ? 'Edit Material' : 'Add New Material'}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ bgcolor: '#f8f9fa' }}>
                    <Stack spacing={3}>
                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                MATERIAL TYPE
                            </Typography>
                            <ToggleButtonGroup
                                value={formData.type}
                                exclusive
                                onChange={(e, val) => val && setFormData({ ...formData, type: val })}
                                fullWidth
                                size="small"
                                sx={{
                                    '& .MuiToggleButton-root': {
                                        borderRadius: 2,
                                        py: 1,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        border: '1px solid #ddd',
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' }
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="pdf"><PictureAsPdfIcon sx={{ mr: 1, fontSize: 18 }} /> DOC</ToggleButton>
                                <ToggleButton value="video"><VideoLibraryIcon sx={{ mr: 1, fontSize: 18 }} /> VIDEO</ToggleButton>
                                <ToggleButton value="test"><QuizIcon sx={{ mr: 1, fontSize: 18 }} /> TEST</ToggleButton>
                                <ToggleButton value="zoom"><VideoCallIcon sx={{ mr: 1, fontSize: 18 }} /> MEET</ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                TITLE
                            </Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="e.g., Physics Chapter 1 Notes"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                            />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    CATEGORY
                                </Typography>
                                <FormControl fullWidth size="small">
                                    <Select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        displayEmpty
                                        sx={{ borderRadius: 2, bgcolor: 'white' }}
                                    >
                                        <MenuItem value="" disabled>Select Category</MenuItem>
                                        {categories.map((c) => (
                                            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    SUBJECT (OPT)
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="e.g., Chemistry"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                                />
                            </Grid>
                        </Grid>

                        <Box>
                            {formData.type === 'pdf' && (
                                <>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                        PDF RESOURCE
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Paste PDF link or upload"
                                            value={formData.pdfUrl}
                                            onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment>, sx: { borderRadius: 2, bgcolor: 'white' } }}
                                        />
                                        <Button variant="outlined" startIcon={<PermMediaIcon />} onClick={() => setMediaPicker({ open: true, target: 'pdf' })} sx={{ borderRadius: 2, px: 1 }}>Lib</Button>
                                        <input type="file" id="pdf-upload" hidden onChange={(e) => handleFileUpload(e, 'pdf')} accept=".pdf" />
                                        <Button component="label" htmlFor="pdf-upload" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <AddIcon />} disabled={uploading} sx={{ borderRadius: 2, px: 1 }}>
                                            {uploading ? `${uploadProgress}%` : 'Up'}
                                        </Button>
                                    </Box>
                                </>
                            )}
                            {formData.type === 'video' && (
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                            VIDEO RESOURCE
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Video link or upload"
                                                value={formData.videoUrl}
                                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                                InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment>, sx: { borderRadius: 2, bgcolor: 'white' } }}
                                            />
                                            <Button variant="outlined" startIcon={<PermMediaIcon />} onClick={() => setMediaPicker({ open: true, target: 'video' })} sx={{ borderRadius: 2, px: 1 }}>Lib</Button>
                                            <input type="file" id="vid-upload" hidden onChange={(e) => handleFileUpload(e, 'video')} accept="video/*" />
                                            <Button component="label" htmlFor="vid-upload" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <AddIcon />} disabled={uploading} sx={{ borderRadius: 2, px: 1 }}>
                                                {uploading ? `${uploadProgress}%` : 'Up'}
                                            </Button>
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                            THUMBNAIL (OPT)
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Thumbnail URL"
                                            value={formData.thumbnail}
                                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                                        />
                                    </Box>
                                </Stack>
                            )}
                            {formData.type === 'test' && (
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                        SELECT TEST
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={formData.exam}
                                            onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                                            displayEmpty
                                            sx={{ borderRadius: 2, bgcolor: 'white' }}
                                        >
                                            <MenuItem value="" disabled>Select Free Test</MenuItem>
                                            {exams.map((ex) => (
                                                <MenuItem key={ex._id} value={ex._id}>{ex.title}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                            {formData.type === 'zoom' && (
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                        SELECT MEETING
                                    </Typography>
                                    <FormControl fullWidth size="small">
                                        <Select
                                            value={formData.meeting}
                                            onChange={(e) => setFormData({ ...formData, meeting: e.target.value })}
                                            displayEmpty
                                            sx={{ borderRadius: 2, bgcolor: 'white' }}
                                        >
                                            <MenuItem value="" disabled>Select Live Meeting</MenuItem>
                                            {liveClasses.map((lc) => (
                                                <MenuItem key={lc._id} value={lc._id}>{lc.title}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}
                        </Box>

                        {['pdf', 'video'].includes(formData.type) && (
                            <FormControlLabel
                                control={<Switch checked={formData.isDownloadableOffline} onChange={(e) => setFormData({ ...formData, isDownloadableOffline: e.target.checked })} color="primary" />}
                                label={<Typography variant="body2" fontWeight={700}>Allow Offline Download</Typography>}
                            />
                        )}

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    ORDER
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
                                />
                            </Grid>
                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center', pt: 4 }}>
                                <FormControlLabel
                                    control={<Switch checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} color="primary" />}
                                    label={<Typography variant="body2" fontWeight={700}>Active</Typography>}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, bgcolor: '#f8f9fa' }}>
                    <Button onClick={onClose} variant="text" color="inherit" sx={{ fontWeight: 700 }}>CLOSE</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                        fullWidth
                        sx={{ borderRadius: 2, py: 1.2, fontWeight: 800, textTransform: 'none' }}
                    >
                        {loading ? 'Saving...' : (material ? 'UPDATE MATERIAL' : 'SAVE MATERIAL')}
                    </Button>
                </DialogActions>
            </Dialog>

            <MediaPickerModal
                open={mediaPicker.open}
                type={mediaPicker.target === 'pdf' ? 'pdf' : 'video'}
                onClose={() => setMediaPicker({ open: false, target: '' })}
                onSelect={onMediaSelect}
            />
        </>
    );
};

export default FreeMaterialFormModal;
