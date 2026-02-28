import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    MenuItem,
    LinearProgress,
    CircularProgress
} from '@mui/material';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import VideoPreview from '../../Common/VideoPreview';
import { uploadFile } from '../../../utils/upload';
import { toast } from 'react-toastify';
import MediaPickerModal from '../../Media/MediaPickerModal';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const LectureModal = ({ open, onClose, onSave, initialData }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [videoForm, setVideoForm] = useState({
        title: '',
        type: 'video',
        videoUrl: '',
        duration: '',
        isFree: false
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setVideoForm({
                    title: initialData.title || '',
                    type: initialData.type || 'video',
                    videoUrl: initialData.url || initialData.videoUrl || '',
                    duration: initialData.duration || '',
                    isFree: initialData.freePreview || false
                });
            } else {
                setVideoForm({ title: '', type: 'video', videoUrl: '', duration: '', isFree: false });
            }
            setSelectedFile(null);
            setUploadProgress(0);
            setUploading(false);
        }
    }, [open, initialData]);

    const handleSave = async () => {
        if (!videoForm.title.trim()) {
            toast.error('Please enter a lecture title');
            return;
        }

        let finalUrl = videoForm.videoUrl;

        // Upload file if selected
        if (selectedFile) {
            try {
                setUploading(true);
                const result = await uploadFile(selectedFile, (progress) => {
                    setUploadProgress(progress);
                });

                if (result.success) {
                    finalUrl = result.url;
                    toast.success('File uploaded successfully');
                } else {
                    toast.error('Upload failed');
                    setUploading(false);
                    return;
                }
            } catch (error) {
                console.error('Upload Error:', error);
                toast.error('Upload failed');
                setUploading(false);
                return;
            }
        }

        onSave({ ...videoForm, videoUrl: finalUrl });
        setUploading(false);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ pb: 1 }}>
                {initialData ? 'Edit Lecture' : 'Add New Lecture'}
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Lecture Title"
                            value={videoForm.title || ''}
                            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Resource Type"
                            select
                            value={videoForm.type || 'video'}
                            onChange={(e) => setVideoForm({ ...videoForm, type: e.target.value, videoUrl: '' })}
                        >
                            <MenuItem value="video">Video</MenuItem>
                            <MenuItem value="pdf">PDF Document</MenuItem>
                            <MenuItem value="audio">Audio Lesson</MenuItem>
                            <MenuItem value="zip">Project File (ZIP)</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Duration (min) / Size (MB)"
                            type="number"
                            value={videoForm.duration || ''}
                            onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                label={`${videoForm.type.toUpperCase()} URL / File`}
                                placeholder="Paste URL or Upload File"
                                value={videoForm.videoUrl || ''}
                                onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ minWidth: 100, borderRadius: 1.5 }}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                                <input
                                    type="file"
                                    hidden
                                    accept={
                                        videoForm.type === 'video' ? 'video/*' :
                                            videoForm.type === 'pdf' ? 'application/pdf' :
                                                videoForm.type === 'audio' ? 'audio/*' :
                                                    '.zip,.rar,.7z'
                                    }
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setSelectedFile(file);
                                            // Set a temporary preview URL
                                            const previewUrl = URL.createObjectURL(file);
                                            setVideoForm({
                                                ...videoForm,
                                                videoUrl: previewUrl
                                            });
                                        }
                                    }}
                                />
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                startIcon={<LibraryBooksIcon />}
                                onClick={() => setMediaPickerOpen(true)}
                                sx={{ borderRadius: 1.5 }}
                            >
                                Library
                            </Button>
                        </Box>
                    </Grid>
                    {uploading && (
                        <Grid item xs={12}>
                            <Box sx={{ width: '100%', mt: 1 }}>
                                <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    Uploading: {uploadProgress}%
                                </Typography>
                            </Box>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        {videoForm.type === 'video' ? (
                            <VideoPreview url={videoForm.videoUrl} height={180} />
                        ) : videoForm.videoUrl ? (
                            <Box sx={{ p: 2, bgcolor: 'action.hover', textAlign: 'center', borderRadius: 1.5, border: '1px dashed', borderColor: 'divider' }}>
                                <PlaylistAddCheckIcon color="success" />
                                <Typography variant="body2" fontWeight={600}>{videoForm.type.toUpperCase()} Selected</Typography>
                                <Typography variant="caption" color="text.secondary" noWrap display="block">{videoForm.videoUrl}</Typography>
                            </Box>
                        ) : null}
                    </Grid>

                    <MediaPickerModal
                        open={mediaPickerOpen}
                        onClose={() => setMediaPickerOpen(false)}
                        type={videoForm.type}
                        onSelect={(file) => {
                            setVideoForm({ ...videoForm, videoUrl: file.url });
                            setSelectedFile(null); // Reset local selection if any
                        }}
                    />
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Is Free Preview?"
                            select
                            value={videoForm.isFree}
                            onChange={(e) => setVideoForm({ ...videoForm, isFree: e.target.value })}
                        >
                            <MenuItem value={false}>No</MenuItem>
                            <MenuItem value={true}>Yes</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={uploading}>
                    {uploading ? <CircularProgress size={24} color="inherit" /> : 'Save Lecture'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LectureModal;
