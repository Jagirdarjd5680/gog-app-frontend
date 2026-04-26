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
import VideoCallIcon from '@mui/icons-material/VideoCall';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import QuestionPickerModal from '../../Exams/QuestionPickerModal';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const LectureModal = ({ open, onClose, onSave, initialData, courseId }) => {
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
        resourceModel: '',
        // Google Meet fields
        meetLink: '',
        meetTitle: '',
        meetScheduledAt: '',
        meetEndsAt: '',
        // Assignment creation fields
        assignmentDesc: '',
        assignmentType: 'file_upload',
        maxMb: 10,
        allowedFormats: '.pdf,.zip,.jpg,.png',
        selectedQuestions: [],
        attachments: []
    });
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [questionPickerOpen, setQuestionPickerOpen] = useState(false);

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
                    resourceModel: initialData.resourceModel || '',
                    // Google Meet fields
                    meetLink: initialData.meetLink || '',
                    meetTitle: initialData.meetTitle || '',
                    meetScheduledAt: initialData.meetScheduledAt ? initialData.meetScheduledAt.slice(0, 16) : '',
                    meetEndsAt: initialData.meetEndsAt ? initialData.meetEndsAt.slice(0, 16) : '',
                    assignmentDesc: initialData.assignmentDesc || '',
                    assignmentType: initialData.assignmentType || 'file_upload',
                    maxMb: initialData.maxMb || 10,
                    allowedFormats: initialData.allowedFormats || '.pdf,.zip,.jpg,.png',
                    selectedQuestions: initialData.selectedQuestions || []
                });
            } else {
                setVideoForm({ 
                    title: '', type: 'video', videoUrl: '', duration: '', isFree: false, resourceId: '', resourceModel: '', 
                    meetLink: '', meetTitle: '', meetScheduledAt: '', meetEndsAt: '',
                    assignmentDesc: '', assignmentType: 'file_upload', maxMb: 10, allowedFormats: '.pdf,.zip,.jpg,.png', selectedQuestions: []
                });
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
            const { data } = await api.get(`/assignments?limit=100${courseId ? `&course=${courseId}` : ''}`);
            setAssignments(data.data || []);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        }
    };

    const fetchExams = async () => {
        try {
            const { data } = await api.get(`/exams?limit=100${courseId ? `&course=${courseId}` : ''}`);
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
            resourceModel: type === 'assignment' ? 'Assignment' : type === 'exam' ? 'Exam' : '',
            // Reset assignment fields if switching to assignment
            assignmentType: 'file_upload',
            assignmentDesc: '',
            maxMb: 10,
            selectedQuestions: []
        });
        if (type === 'assignment') fetchAssignments();
        if (type === 'exam') fetchExams();
    };

    const handleQuestionSelect = (ids) => {
        setVideoForm(prev => ({ ...prev, selectedQuestions: ids }));
    };

    const [generating, setGenerating] = useState(false);

    const handleGenerateMeet = async () => {
        const tokens = localStorage.getItem('googleMeetTokens');
        if (!tokens) {
            try {
                const response = await api.get('/live-classes/auth/url');
                // Redirect to Google Auth - it will return to CourseList which we will handle
                window.location.href = response.data.url;
            } catch (error) {
                toast.error('Failed to get auth URL');
            }
            return;
        }

        if (!videoForm.title || !videoForm.meetScheduledAt) {
            toast.warning('Please fill lecture title and scheduled date first');
            return;
        }

        setGenerating(true);
        try {
            const response = await api.post('/live-classes/generate-meet', {
                tokens: JSON.parse(tokens),
                classInfo: {
                    title: videoForm.title,
                    scheduledDate: videoForm.meetScheduledAt,
                    duration: 60 // Default duration
                }
            });
            if (response.data.success) {
                setVideoForm({ ...videoForm, meetLink: response.data.meetLink });
                toast.success('Meet link generated successfully!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate Meet link. You might need to re-connect Google.');
            localStorage.removeItem('googleMeetTokens');
        } finally {
            setGenerating(false);
        }
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

        let finalResourceId = videoForm.resourceId;
        let finalResourceModel = videoForm.resourceModel;

        // Instant Assignment Creation
        if (videoForm.type === 'assignment' && !initialData) {
            try {
                setUploading(true);
                const assRes = await api.post('/assignments', {
                    title: videoForm.title,
                    description: videoForm.assignmentDesc || 'No description provided',
                    assignmentType: videoForm.assignmentType,
                    deadline: videoForm.meetScheduledAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    totalMarks: 100,
                    questions: videoForm.selectedQuestions,
                    maxMb: videoForm.maxMb,
                    allowedFormats: videoForm.allowedFormats,
                    attachments: videoForm.attachments
                });
                
                if (assRes.data.success) {
                    finalResourceId = assRes.data.data._id;
                    finalResourceModel = 'Assignment';
                    toast.success('Assignment created successfully');
                }
            } catch (error) {
                toast.error('Failed to create assignment');
                setUploading(false);
                return;
            }
        }

        const saveData = { 
            ...videoForm, 
            videoUrl: finalUrl, 
            resourceId: finalResourceId, 
            resourceModel: finalResourceModel 
        };
        
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
            case 'google_meet': return <VideoCallIcon sx={{ color: '#1A73E8' }} />;
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
                            <MenuItem value="google_meet">📹 Google Meet</MenuItem>
                        </TextField>
                    </Grid>
                    {/* Instant Assignment Creation UI */}
                    {videoForm.type === 'assignment' && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    Assignment Description
                                </Typography>
                                <Box sx={{ 
                                    '.ql-editor': { minHeight: '120px' },
                                    '.ql-toolbar': { borderRadius: '12px 12px 0 0' },
                                    '.ql-container': { borderRadius: '0 0 12px 12px', bgcolor: 'white' }
                                }}>
                                    <ReactQuill
                                        theme="snow"
                                        value={videoForm.assignmentDesc}
                                        onChange={(content) => setVideoForm({ ...videoForm, assignmentDesc: content })}
                                        placeholder="Enter assignment details and instructions..."
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Assignment Type"
                                    value={videoForm.assignmentType}
                                    onChange={(e) => setVideoForm({ ...videoForm, assignmentType: e.target.value })}
                                    InputProps={{ sx: { borderRadius: '12px' } }}
                                >
                                    <MenuItem value="file_upload">📁 File Upload</MenuItem>
                                    <MenuItem value="quiz">📝 Quiz (Questions)</MenuItem>
                                    <MenuItem value="text_answer">✍️ Text Answer</MenuItem>
                                </TextField>
                            </Grid>
                            {videoForm.assignmentType === 'file_upload' && (
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Max File Size (MB)"
                                                value={videoForm.maxMb}
                                                onChange={(e) => setVideoForm({ ...videoForm, maxMb: e.target.value })}
                                                InputProps={{ sx: { borderRadius: '12px' } }}
                                                helperText="Limit for student upload"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Allowed Formats"
                                                placeholder=".pdf, .zip, .jpg"
                                                value={videoForm.allowedFormats}
                                                onChange={(e) => setVideoForm({ ...videoForm, allowedFormats: e.target.value })}
                                                InputProps={{ sx: { borderRadius: '12px' } }}
                                                helperText="Comma separated (e.g. .pdf, .zip)"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    Reference Attachments (Question Papers/Guides)
                                </Typography>
                                <Box sx={{ p: 2, border: '1px dashed #e2e8f0', borderRadius: '12px', bgcolor: '#f8fafc' }}>
                                    <Stack spacing={1}>
                                        {videoForm.attachments?.map((file, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <Typography variant="caption" noWrap sx={{ maxWidth: '80%', fontWeight: 600 }}>{file.title}</Typography>
                                                <IconButton size="small" color="error" onClick={() => {
                                                    setVideoForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));
                                                }}>
                                                    <CloseIcon fontSize="inherit" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                            disabled={uploading}
                                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Reference File'}
                                            <input type="file" hidden onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    try {
                                                        setUploading(true);
                                                        const res = await uploadFile(file);
                                                        if (res.success) {
                                                            setVideoForm(prev => ({ 
                                                                ...prev, 
                                                                attachments: [...(prev.attachments || []), { title: file.name, url: res.url }] 
                                                            }));
                                                            toast.success('Attachment added');
                                                        }
                                                    } catch (err) {
                                                        toast.error('Upload failed');
                                                    } finally {
                                                        setUploading(false);
                                                    }
                                                }
                                            }} />
                                        </Button>
                                    </Stack>
                                </Box>
                            </Grid>
                            
                            {videoForm.assignmentType === 'quiz' && (
                                <Grid item xs={12}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<PlaylistAddCheckIcon />}
                                        onClick={() => setQuestionPickerOpen(true)}
                                        sx={{ 
                                            height: '56px', 
                                            borderRadius: '12px',
                                            borderStyle: 'dashed',
                                            color: videoForm.selectedQuestions.length > 0 ? 'success.main' : 'primary.main',
                                            borderColor: videoForm.selectedQuestions.length > 0 ? 'success.main' : 'primary.main'
                                        }}
                                    >
                                        {videoForm.selectedQuestions.length > 0 
                                            ? `Questions Selected: ${videoForm.selectedQuestions.length}` 
                                            : 'Pick Questions for Quiz'}
                                    </Button>
                                </Grid>
                            )}

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Assignment Deadline"
                                    type="datetime-local"
                                    value={videoForm.meetScheduledAt || ''} // Reusing scheduledAt for deadline
                                    onChange={(e) => setVideoForm({ ...videoForm, meetScheduledAt: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{ sx: { borderRadius: '12px' } }}
                                />
                            </Grid>
                        </>
                    )}

                    {/* Dynamic Selection for Exam */}
                    {videoForm.type === 'exam' && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Select Exam"
                                select
                                value={videoForm.resourceId || ''}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selectedItem = exams.find(i => i._id === selectedId);
                                    setVideoForm({ 
                                        ...videoForm, 
                                        resourceId: selectedId,
                                        title: videoForm.title || selectedItem?.title || '',
                                        videoUrl: `linked_exam_${selectedId}`
                                    });
                                }}
                                InputProps={{ sx: { borderRadius: '12px' } }}
                            >
                                <MenuItem value=""><em>Select an exam</em></MenuItem>
                                {exams.map(ex => <MenuItem key={ex._id} value={ex._id}>{ex.title}</MenuItem>)}
                            </TextField>
                        </Grid>
                    )}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Estimated Duration (m)"
                            type="number"
                            value={videoForm.duration ? (videoForm.duration / 60).toFixed(1) : ''}
                            onChange={(e) => {
                                const mins = parseFloat(e.target.value) || 0;
                                setVideoForm({ ...videoForm, duration: Math.round(mins * 60) });
                            }}
                            InputProps={{ 
                                sx: { borderRadius: '12px' },
                                startAdornment: <Typography variant="caption" sx={{ mr: 1, color: 'text.disabled' }}>m</Typography>
                            }}
                        />
                    </Grid>
                    {videoForm.type !== 'assignment' && videoForm.type !== 'exam' && videoForm.type !== 'google_meet' && (
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
                                    onChange={async (e) => {
                                        const url = e.target.value;
                                        setVideoForm({ ...videoForm, videoUrl: url });
                                        
                                        // Auto-fetch duration if it's a direct video link
                                        if (url && (url.match(/\.(mp4|webm|ogg|mov)$/) || url.includes('storage.googleapis.com'))) {
                                            const video = document.createElement('video');
                                            video.preload = 'metadata';
                                            video.onloadedmetadata = () => {
                                                setVideoForm(prev => ({ ...prev, duration: Math.round(video.duration) }));
                                                window.URL.revokeObjectURL(video.src);
                                            };
                                            video.src = url;
                                        }
                                    }}
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
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    setVideoForm({ ...videoForm, videoUrl: file.name });
                                                    
                                                    // Auto-fetch duration for local file
                                                    if (videoForm.type === 'video' || videoForm.type === 'audio') {
                                                        const media = document.createElement(videoForm.type);
                                                        media.preload = 'metadata';
                                                        media.onloadedmetadata = () => {
                                                            setVideoForm(prev => ({ ...prev, duration: Math.round(media.duration) }));
                                                        };
                                                        media.src = URL.createObjectURL(file);
                                                    }
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

                    {/* Google Meet Fields */}
                    {videoForm.type === 'google_meet' && (
                        <Grid item xs={12}>
                            <Box sx={{ p: 2.5, bgcolor: '#E8F0FE', borderRadius: 3, border: '1px solid #1A73E8' }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <VideoCallIcon sx={{ color: '#1A73E8', fontSize: 24 }} />
                                    <Typography fontWeight={700} color="#1A73E8">Google Meet Session</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Meeting Title"
                                            value={videoForm.meetTitle || ''}
                                            onChange={(e) => setVideoForm({ ...videoForm, meetTitle: e.target.value })}
                                            placeholder="e.g. Week 3 Live Session"
                                            InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Start Date & Time"
                                            type="datetime-local"
                                            value={videoForm.meetScheduledAt || ''}
                                            onChange={(e) => setVideoForm({ ...videoForm, meetScheduledAt: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="End Date & Time"
                                            type="datetime-local"
                                            value={videoForm.meetEndsAt || ''}
                                            onChange={(e) => setVideoForm({ ...videoForm, meetEndsAt: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                            InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <TextField
                                                fullWidth
                                                label="Google Meet Link"
                                                value={videoForm.meetLink || ''}
                                                onChange={(e) => setVideoForm({ ...videoForm, meetLink: e.target.value })}
                                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                InputProps={{ sx: { borderRadius: '10px', bgcolor: 'white' } }}
                                            />
                                            <Button
                                                variant="outlined"
                                                onClick={handleGenerateMeet}
                                                disabled={generating}
                                                sx={{ minWidth: 140, borderRadius: 2 }}
                                            >
                                                {generating ? <CircularProgress size={20} /> : 'Auto Generate'}
                                            </Button>
                                        </Box>
                                    </Grid>
                                    {videoForm.meetLink && (
                                        <Grid item xs={12}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                href={videoForm.meetLink}
                                                target="_blank"
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#1A73E8', '&:hover': { bgcolor: '#1557B0' } }}
                                                startIcon={<VideoCallIcon />}
                                            >
                                                Join Meeting (Preview)
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Grid>
                    )}

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
                    const url = file.url;
                    setVideoForm(prev => ({ ...prev, videoUrl: url }));
                    setSelectedFile(null);
                    
                    // Auto-fetch duration from library file
                    if (url && (videoForm.type === 'video' || videoForm.type === 'audio')) {
                        const media = document.createElement(videoForm.type);
                        media.preload = 'metadata';
                        media.onloadedmetadata = () => {
                            setVideoForm(prev => ({ ...prev, duration: Math.round(media.duration) }));
                        };
                        media.src = url;
                    }
                }}
            />

            <QuestionPickerModal
                open={questionPickerOpen}
                onClose={() => setQuestionPickerOpen(false)}
                onSelect={handleQuestionSelect}
                selectedIds={videoForm.selectedQuestions}
            />
        </Dialog>
    );
};

export default LectureModal;

