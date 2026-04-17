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
    CircularProgress,
    Stack,
    Tooltip,
    Switch
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import VideoPreview from '../../Common/VideoPreview';
import { uploadFile } from '../../../utils/upload';
import { toast } from 'react-toastify';
import MediaPickerModal from '../../Media/MediaPickerModal';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import api from '../../../utils/api';

const LectureModal = ({ open, onClose, onSave, initialData }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [videoForm, setVideoForm] = useState({
        title: '',
        type: 'video',
        videoUrl: '',
        duration: '',
        isFree: false,
        resourceId: '',
        resourceModel: ''
    });
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (open) {
            if (initialData) {
                setVideoForm({
                    title: initialData.title || '',
                    type: initialData.type || 'video',
                    videoUrl: initialData.url || initialData.videoUrl || '',
                    duration: initialData.duration || '',
                    isFree: initialData.freePreview || false,
                    resourceId: initialData.resourceId || '',
                    resourceModel: initialData.resourceModel || ''
                });
            } else {
                setVideoForm({ title: '', type: 'video', videoUrl: '', duration: '', isFree: false, resourceId: '', resourceModel: '' });
            }
            setSelectedFile(null);
            setUploadProgress(0);
            setUploading(false);
            
            // Pre-fetch if needed
            if (initialData?.type === 'assignment') fetchAssignments();
            if (initialData?.type === 'exam') fetchExams();
        }
    }, [open, initialData]);

    const fetchAssignments = async () => {
        try {
            const { data } = await api.get('/assignments?limit=100');
            setAssignments(data.data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchExams = async () => {
        try {
            const { data } = await api.get('/exams?limit=100');
            setExams(data.data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
        }
    };

    const handleTypeChange = (type) => {
        setVideoForm({ 
            ...videoForm, 
            type, 
            videoUrl: '', 
            resourceId: '', 
            resourceModel: type === 'assignment' ? 'Assignment' : type === 'exam' ? 'Exam' : '' 
        });
        if (type === 'assignment') fetchAssignments();
        if (type === 'exam') fetchExams();
    };

    const handleSave = async () => {
        if (!videoForm.title.trim()) {
            toast.error('Please enter a lecture title');
            return;
        }

        let finalUrl = videoForm.videoUrl;

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

        const saveData = { ...videoForm, videoUrl: finalUrl };
        if (!saveData.resourceId) delete saveData.resourceId;
        if (!saveData.resourceModel) delete saveData.resourceModel;

        onSave(saveData);
        setUploading(false);
    };

    const getTypeIcon = () => {
        switch (videoForm.type) {
            case 'pdf': return <PictureAsPdfIcon color="error" />;
            case 'audio': return <AudiotrackIcon color="warning" />;
            case 'zip': return <FolderZipIcon color="primary" />;
            case 'assignment': return <AssignmentIcon color="secondary" />;
            case 'exam': return <ReceiptLongIcon color="error" />;
            default: return <OndemandVideoIcon color="success" />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
        >
            <DialogTitle sx={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2, pb: 1 
            }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: '10px', bgcolor: 'primary.light', color: 'primary.dark' }}>
                        {getTypeIcon()}
                    </Box>
                    <Typography variant="h6" fontWeight={800}>{initialData ? 'Edit Lecture' : 'New Lecture'}</Typography>
                </Stack>
                <IconButton onClick={onClose} size="small" sx={{ bgcolor: '#f1f5f9' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ px: 3, pt: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Lecture Title"
                            placeholder="e.g. Introduction to React Hooks"
                            value={videoForm.title || ''}
                            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                            InputProps={{ sx: { borderRadius: '12px' } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Content Type"
                            select
                            value={videoForm.type || 'video'}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            InputProps={{ sx: { borderRadius: '12px' } }}
                        >
                            <MenuItem value="video">🎥 High Quality Video</MenuItem>
                            <MenuItem value="pdf">📄 PDF Document</MenuItem>
                            <MenuItem value="audio">🎧 Audio Lesson</MenuItem>
                            <MenuItem value="zip">📦 Resource Pack (ZIP)</MenuItem>
                            <MenuItem value="assignment">📝 Student Assignment</MenuItem>
                            <MenuItem value="exam">🏆 Quiz/Exam</MenuItem>
                        </TextField>
                    </Grid>
                    {/* Dynamic Selection for Assignment/Exam */}
                    {(videoForm.type === 'assignment' || videoForm.type === 'exam') && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label={videoForm.type === 'assignment' ? "Select Assignment" : "Select Exam"}
                                select
                                value={videoForm.resourceId || ''}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const items = videoForm.type === 'assignment' ? assignments : exams;
                                    const selectedItem = items.find(i => i._id === selectedId);
                                    setVideoForm({ 
                                        ...videoForm, 
                                        resourceId: selectedId,
                                        title: videoForm.title || selectedItem?.title || '',
                                        videoUrl: `linked_${videoForm.type}_${selectedId}` // Placeholder for UI compatibility
                                    });
                                }}
                                InputProps={{ sx: { borderRadius: '12px' } }}
                            >
                                <MenuItem value=""><em>Select {videoForm.type === 'assignment' ? 'an assignment' : 'an exam'}</em></MenuItem>
                                {videoForm.type === 'assignment' ? (
                                    assignments.map(ass => <MenuItem key={ass._id} value={ass._id}>{ass.title}</MenuItem>)
                                ) : (
                                    exams.map(ex => <MenuItem key={ex._id} value={ex._id}>{ex.title}</MenuItem>)
                                )}
                            </TextField>
                        </Grid>
                    )}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Estimated Duration (m)"
                            type="number"
                            value={videoForm.duration || ''}
                            onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                            InputProps={{ 
                                sx: { borderRadius: '12px' },
                                startAdornment: <Typography variant="caption" sx={{ mr: 1, color: 'text.disabled' }}>m</Typography>
                            }}
                        />
                    </Grid>
                    {videoForm.type !== 'assignment' && videoForm.type !== 'exam' && (
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Lecture Source
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5 }}>
                                <TextField
                                    fullWidth
                                    label="Source URL"
                                    placeholder="Paste link or upload..."
                                    value={videoForm.videoUrl || ''}
                                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                                    InputProps={{ sx: { borderRadius: '12px' } }}
                                />
                                <Tooltip title="Upload from Device">
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{ minWidth: 56, height: 56, borderRadius: '12px', borderStyle: 'dashed' }}
                                        disabled={uploading}
                                    >
                                        {uploading ? <CircularProgress size={20} /> : '↑'}
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
                                                    setVideoForm({ ...videoForm, videoUrl: file.name });
                                                }
                                            }}
                                        />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Open Media Library">
                                    <Button
                                        variant="contained"
                                        sx={{ minWidth: 56, height: 56, borderRadius: '12px', bgcolor: '#1e293b' }}
                                        onClick={() => setMediaPickerOpen(true)}
                                    >
                                        <LibraryBooksIcon size="small" />
                                    </Button>
                                </Tooltip>
                            </Box>
                        </Grid>
                    )}

                    {uploading && (
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                                <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 10, height: 8 }} />
                                <Typography variant="caption" fontWeight={700} color="primary" sx={{ mt: 1, display: 'block' }}>
                                    Uploading files... {uploadProgress}%
                                </Typography>
                            </Box>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        {videoForm.type === 'video' ? (
                            <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <VideoPreview url={videoForm.videoUrl} height={180} />
                            </Box>
                        ) : videoForm.videoUrl ? (
                            <Box sx={{ p: 3, bgcolor: '#f0fdf4', textAlign: 'center', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                                <PlaylistAddCheckIcon sx={{ color: '#16a34a', mb: 1 }} />
                                <Typography variant="body2" fontWeight={800} color="#166534">Content Linked Successfully</Typography>
                                <Typography variant="caption" color="#166534" noWrap display="block" sx={{ opacity: 0.7 }}>{videoForm.videoUrl}</Typography>
                            </Box>
                        ) : null}
                    </Grid>

                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <Box>
                                <Typography variant="body2" fontWeight={700}>Free Preview</Typography>
                                <Typography variant="caption" color="text.secondary">Allow students to watch this for free</Typography>
                            </Box>
                            <Switch
                                checked={videoForm.isFree}
                                onChange={(e) => setVideoForm({ ...videoForm, isFree: e.target.checked })}
                                color="primary"
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                <Button onClick={onClose} sx={{ 
                    borderRadius: '10px', textTransform: 'none', fontWeight: 700, px: 3, color: 'text.secondary' 
                }}>
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleSave} 
                    disabled={uploading}
                    sx={{ 
                        borderRadius: '10px', textTransform: 'none', fontWeight: 800, px: 4, py: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    {uploading ? <CircularProgress size={24} color="inherit" /> : 'Save Lecture'}
                </Button>
            </DialogActions>

            <MediaPickerModal
                open={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                type={videoForm.type}
                onSelect={(file) => {
                    setVideoForm({ ...videoForm, videoUrl: file.url });
                    setSelectedFile(null);
                }}
            />
        </Dialog>
    );
};

export default LectureModal;

