import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, Box, FormControl, Select, MenuItem,
    IconButton, Typography, ToggleButton, ToggleButtonGroup, Stack, InputAdornment,
    CircularProgress
} from '@mui/material';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import LinkIcon from '@mui/icons-material/Link';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import api from '../../utils/api';
import { uploadFile } from '../../utils/upload';
import { toast } from 'react-toastify';
import MediaPickerModal from '../Media/MediaPickerModal';

// The real backend model (`FreeMaterial`) is just { title, type, url } — this form used to
// send a much richer Mongo-era shape (category/subject/exam/meeting/assignment/etc.) that
// doesn't exist on the current Prisma model at all, so create/update errored on unknown
// Prisma fields every time. Trimmed to match what the API (and the native app's reader,
// which already only expects these three fields) actually supports.
const TYPES = [
    { value: 'pdf', label: 'PDF', icon: <PictureAsPdfIcon sx={{ mr: 1, fontSize: 18 }} /> },
    { value: 'video', label: 'VIDEO', icon: <VideoLibraryIcon sx={{ mr: 1, fontSize: 18 }} /> },
    { value: 'audio', label: 'AUDIO', icon: <AudiotrackIcon sx={{ mr: 1, fontSize: 18 }} /> },
    { value: 'image', label: 'IMAGE', icon: <ImageIcon sx={{ mr: 1, fontSize: 18 }} /> },
    { value: 'other', label: 'OTHER', icon: <InsertDriveFileIcon sx={{ mr: 1, fontSize: 18 }} /> },
];

const EMPTY_FORM = { title: '', type: 'pdf', url: '' };

const FreeMaterialFormModal = ({ open, onClose, material, onSuccess }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        setFormData(
            material
                ? { title: material.title || '', type: material.type || 'pdf', url: material.url || '' }
                : EMPTY_FORM
        );
    }, [open, material]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        try {
            setUploading(true);
            setUploadProgress(0);
            const result = await uploadFile(file, (p) => setUploadProgress(p));
            if (result.success) {
                setFormData((prev) => ({ ...prev, url: result.url }));
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
        setFormData((prev) => ({ ...prev, url: file.url }));
        setMediaPickerOpen(false);
    };

    const handleSubmit = async () => {
        if (!formData.title) return toast.error('Please enter a title');
        if (!formData.url) return toast.error('Please provide a link or upload a file');

        setLoading(true);
        try {
            if (material) {
                await api.put(`/free-materials/${material.id || material._id}`, formData);
                toast.success('Updated successfully');
            } else {
                await api.post('/free-materials', formData);
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
                                {TYPES.map((t) => (
                                    <ToggleButton key={t.value} value={t.value}>{t.icon} {t.label}</ToggleButton>
                                ))}
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

                        <Box>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                FILE / LINK
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Paste a link or upload"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon fontSize="small" /></InputAdornment>, sx: { borderRadius: 2, bgcolor: 'white' } }}
                                />
                                <Button variant="outlined" startIcon={<PermMediaIcon />} onClick={() => setMediaPickerOpen(true)} sx={{ borderRadius: 2, px: 1 }}>Lib</Button>
                                <input type="file" id="material-upload" hidden onChange={handleFileUpload} />
                                <Button component="label" htmlFor="material-upload" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <AddIcon />} disabled={uploading} sx={{ borderRadius: 2, px: 1 }}>
                                    {uploading ? `${uploadProgress}%` : 'Up'}
                                </Button>
                            </Box>
                        </Box>
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
                open={mediaPickerOpen}
                type={formData.type === 'video' ? 'video' : 'pdf'}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={onMediaSelect}
            />
        </>
    );
};

export default FreeMaterialFormModal;
