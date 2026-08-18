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
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { toast } from 'react-toastify';
import MediaPickerModal from '../../Media/MediaPickerModal';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import api from '../../../utils/api';
import { getYoutubeVideoDuration } from '../../../utils/youtube';


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
        meetLink: '',
        meetTitle: '',
        meetScheduledAt: '',
        meetEndsAt: '',
        selectedQuestions: [],
        assignmentType: 'file_upload',
        assignmentDesc: '',
        maxMb: 10,
    });
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
                    resourceModel: initialData.resourceModel || '',
                    meetLink: initialData.meetLink || '',
                    meetTitle: initialData.meetTitle || '',
                    meetScheduledAt: initialData.meetScheduledAt ? initialData.meetScheduledAt.slice(0, 16) : '',
                    meetEndsAt: initialData.meetEndsAt ? initialData.meetEndsAt.slice(0, 16) : '',
                    selectedQuestions: initialData.selectedQuestions || [],
                    assignmentType: initialData.assignmentType || 'file_upload',
                    assignmentDesc: initialData.assignmentDesc || '',
                    maxMb: initialData.maxMb || 10,
                });
            } else {
                setVideoForm({ 
                    title: '', type: 'video', videoUrl: '', duration: '', isFree: false, resourceId: '', resourceModel: '', 
                    meetLink: '', meetTitle: '', meetScheduledAt: '', meetEndsAt: '',
                    selectedQuestions: [], assignmentType: 'file_upload', assignmentDesc: '', maxMb: 10,
                });
            }
            setSelectedFile(null);
            setUploadProgress(0);
            setUploading(false);
            
            if (initialData?.type === 'exam') fetchExams();
        }
    }, [open, initialData]);

    const fetchExams = async () => {
        try {
            const { data } = await api.get(`/exams?limit=100${courseId ? `&course=${courseId}` : ''}`);
            setExams(data.data || []);
        } catch (error) {
            
        }
    };

    const handleTypeChange = (type) => {
        setVideoForm({ 
            ...videoForm, 
            type, 
            videoUrl: type === 'none' ? 'none' : '', 
            resourceId: '', 
            resourceModel: type === 'exam' ? 'Exam' : '',
            assignmentType: 'file_upload',
            assignmentDesc: '',
            maxMb: 10,
            selectedQuestions: []
        });
        if (type === 'exam') fetchExams();
    };

    const [generating, setGenerating] = useState(false);

    const handleGenerateMeet = async () => {
        const tokens = localStorage.getItem('googleMeetTokens');
        if (!tokens) {
            try {
                const response = await api.get('/live-classes/auth/url');
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
                    duration: 60
                }
            });
            if (response.data.success) {
                setVideoForm({ ...videoForm, meetLink: response.data.meetLink });
                toast.success('Meet link generated successfully!');
            }
        } catch (error) {
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
                }, videoForm.title, courseId);

                if (result.success) {
                    finalUrl = result.url;
                    toast.success('File uploaded successfully');
                } else {
                    toast.error('Upload failed');
                    setUploading(false);
                    return;
                }
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || 'Upload failed';
                toast.error(`❌ ${errorMsg}`);
                setUploading(false);
                return;
            }
        }

        let finalResourceId = videoForm.resourceId;
        let finalResourceModel = videoForm.resourceModel;

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
            case 'pdf': return <PictureAsPdfIcon sx={{ color: 'var(--color-vc-error-deep)' }} />;
            case 'audio': return <AudiotrackIcon sx={{ color: 'var(--color-vc-violet-deep)' }} />;
            case 'zip': return <FolderZipIcon sx={{ color: 'var(--color-vc-link-deep)' }} />;
            case 'exam': return <ReceiptLongIcon sx={{ color: 'var(--color-vc-error-deep)' }} />;
            case 'google_meet': return <VideoCallIcon sx={{ color: '#1A73E8' }} />;
            case 'none': return <LibraryBooksIcon sx={{ color: 'var(--color-vc-mute)' }} />;
            default: return <OndemandVideoIcon sx={{ color: 'var(--color-vc-cyan-deep)' }} />;
        }
    };

    const inputStyles = {
        fontFamily: 'inherit',
        fontSize: '13px',
        color: 'var(--color-vc-ink)',
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline)',
            borderRadius: '6px'
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong)'
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong)'
        }
    };

    const labelStyles = {
        fontFamily: 'inherit',
        fontSize: '13px',
        color: 'var(--color-vc-mute)',
        '&.Mui-focused': {
            color: 'var(--color-vc-ink)'
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ 
                sx: { 
                    borderRadius: '8px', 
                    p: 1,
                    bgcolor: 'var(--color-vc-canvas)',
                    color: 'var(--color-vc-ink)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: '0px 24px 32px -8px rgba(0,0,0,0.1)'
                } 
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, pt: 2, pb: 1.5 
            }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'var(--color-vc-canvas-soft-2)', border: '1px solid var(--color-vc-hairline)', display: 'flex' }}>
                        {getTypeIcon()}
                    </Box>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', letterSpacing: '-0.02em' }}>
                        {initialData ? 'Edit Lecture' : 'New Lecture'}
                    </Typography>
                </Stack>
                <IconButton 
                    onClick={onClose} 
                    size="small" 
                    sx={{ 
                        color: 'var(--color-vc-mute)',
                        '&:hover': {
                            color: 'var(--color-vc-ink)',
                            bgcolor: 'var(--color-vc-canvas-soft)'
                        }
                    }}
                >
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </DialogTitle>
            <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
            
            <DialogContent sx={{ px: 3, pt: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Lecture Title"
                            placeholder="e.g. Introduction to React Hooks"
                            value={videoForm.title || ''}
                            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Content Type"
                            select
                            value={videoForm.type || 'video'}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        >
                            <MenuItem value="video">🎥 High Quality Video</MenuItem>
                            <MenuItem value="pdf">📄 PDF Document</MenuItem>
                            <MenuItem value="audio">🎧 Audio Lesson</MenuItem>
                            <MenuItem value="zip">📦 Resource Pack (ZIP)</MenuItem>
                            <MenuItem value="exam">🏆 Quiz/Exam</MenuItem>
                            <MenuItem value="google_meet">📹 Google Meet</MenuItem>
                            <MenuItem value="youtube_live">▶️ YouTube Live</MenuItem>
                            <MenuItem value="zoom">🔵 Zoom Meet</MenuItem>
                            <MenuItem value="none">📖 Informational (No File)</MenuItem>
                        </TextField>
                    </Grid>

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
                                InputLabelProps={{ sx: labelStyles }}
                                InputProps={{ sx: inputStyles }}
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
                            value={videoForm.duration && videoForm.duration > 0 ? (videoForm.duration / 60).toFixed(1) : ''}
                            onChange={(e) => {
                                  const mins = Math.max(0, parseFloat(e.target.value) || 0);
                                  setVideoForm({ ...videoForm, duration: Math.round(mins * 60) });
                            }}
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ 
                                  sx: inputStyles,
                                  startAdornment: <Typography variant="caption" sx={{ mr: 1, color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>m</Typography>
                            }}
                        />
                    </Grid>
                    {videoForm.type !== 'assignment' && videoForm.type !== 'exam' && videoForm.type !== 'google_meet' && videoForm.type !== 'none' && (
                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.5, display: 'block', fontFamily: 'inherit' }}>
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
                                        setVideoForm(prev => ({ ...prev, videoUrl: url }));
                                        
                                        if (url && (url.match(/\.(mp4|webm|ogg|mov)$/) || url.includes('storage.googleapis.com'))) {
                                            const video = document.createElement('video');
                                            video.preload = 'metadata';
                                            video.onloadedmetadata = () => {
                                                setVideoForm(prev => ({ ...prev, duration: Math.round(video.duration) }));
                                            };
                                            video.src = url;
                                        } else if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                                            toast.info('Fetching YouTube video duration...');
                                            const { duration: dur, errorCode } = await getYoutubeVideoDuration(url);
                                            if (dur > 0) {
                                                setVideoForm(prev => ({ ...prev, duration: dur }));
                                                toast.success(`Fetched duration: ${Math.round(dur / 60)} mins`);
                                            } else if (errorCode === 101 || errorCode === 150) {
                                                toast.warning('This video\'s owner disabled playback on other websites — preview/embed won\'t work here. Please enter the duration manually.');
                                            } else if (errorCode === 100) {
                                                toast.error('This YouTube video is private or was removed.');
                                            } else if (errorCode === 2 || errorCode === 'invalid_url') {
                                                toast.error('Couldn\'t read a valid YouTube video ID from that link.');
                                            } else {
                                                toast.warning('Couldn\'t auto-detect the duration — please enter it manually.');
                                            }
                                        }
                                    }}
                                    InputLabelProps={{ sx: labelStyles }}
                                    InputProps={{ sx: inputStyles }}
                                />
                                <Tooltip title="Upload from Device">
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        sx={{ 
                                            minWidth: 56, 
                                            height: 40, 
                                            borderRadius: '6px', 
                                            borderColor: 'var(--color-vc-hairline)',
                                            color: 'var(--color-vc-ink)',
                                            bgcolor: 'var(--color-vc-canvas)',
                                            '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                        }}
                                        disabled={uploading}
                                    >
                                        {uploading ? <CircularProgress size={16} /> : '↑'}
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
                                        sx={{ 
                                            minWidth: 56, 
                                            height: 40, 
                                            borderRadius: '6px', 
                                            boxShadow: 'none',
                                            bgcolor: 'var(--color-vc-ink)',
                                            color: 'var(--color-vc-on-primary)',
                                            '&:hover': { bgcolor: 'var(--color-vc-ink)', opacity: 0.9, boxShadow: 'none' } 
                                        }}
                                        onClick={() => setMediaPickerOpen(true)}
                                    >
                                        <LibraryBooksIcon sx={{ fontSize: 18 }} />
                                    </Button>
                                </Tooltip>
                             </Box>
                        </Grid>
                    )}

                    {uploading && (
                        <Grid item xs={12}>
                            <Box sx={{ 
                                p: 2.5, 
                                bgcolor: 'var(--color-vc-canvas-soft)', 
                                borderRadius: '6px', 
                                border: '1px solid var(--color-vc-hairline)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                                textAlign: 'center'
                            }}>
                                <CircularProgress size={32} thickness={4} sx={{ color: 'var(--color-vc-ink)' }} />
                                <Box sx={{ width: '100%' }}>
                                    <Stack direction="row" justifyContent="space-between" mb={1}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                            {uploadProgress < 100 ? '🚀 Uploading Content...' : '⚙️ Processing & Encrypting...'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                            {uploadProgress}%
                                        </Typography>
                                    </Stack>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={uploadProgress} 
                                        sx={{ 
                                            borderRadius: 5, 
                                            height: 4,
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: 'var(--color-vc-ink)'
                                            }
                                        }} 
                                    />
                                </Box>
                            </Box>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        {videoForm.type === 'video' ? (
                            <Box sx={{ borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-vc-hairline)' }}>
                                <VideoPreview url={videoForm.videoUrl} height={180} />
                            </Box>
                        ) : videoForm.videoUrl ? (
                            <Box sx={{ p: 2.5, bgcolor: 'var(--color-vc-canvas-soft)', textAlign: 'center', borderRadius: '6px', border: '1px solid var(--color-vc-hairline)' }}>
                                <PlaylistAddCheckIcon sx={{ color: 'var(--color-vc-cyan-deep)', mb: 1 }} />
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Content Linked Successfully</Typography>
                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', noWrap: true, display: 'block', mt: 0.25 }}>{videoForm.videoUrl}</Typography>
                            </Box>
                        ) : null}
                    </Grid>

                    {videoForm.type === 'google_meet' && (
                        <Grid item xs={12}>
                            <Box sx={{ p: 2.5, bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '6px', border: '1px solid var(--color-vc-hairline)' }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                                    <VideoCallIcon sx={{ color: '#1A73E8', fontSize: 22 }} />
                                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Google Meet Session</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Meeting Title"
                                            value={videoForm.meetTitle || ''}
                                            onChange={(e) => setVideoForm({ ...videoForm, meetTitle: e.target.value })}
                                            placeholder="e.g. Week 3 Live Session"
                                            InputLabelProps={{ sx: labelStyles }}
                                            InputProps={{ sx: { ...inputStyles, bgcolor: 'var(--color-vc-canvas)' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Start Date & Time"
                                            type="datetime-local"
                                            value={videoForm.meetScheduledAt || ''}
                                            onChange={(e) => setVideoForm({ ...videoForm, meetScheduledAt: e.target.value })}
                                            InputLabelProps={{ shrink: true, sx: labelStyles }}
                                            InputProps={{ sx: { ...inputStyles, bgcolor: 'var(--color-vc-canvas)' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="End Date & Time"
                                            type="datetime-local"
                                            value={videoForm.meetEndsAt || ''}
                                            onChange={(e) => setVideoForm({ ...videoForm, meetEndsAt: e.target.value })}
                                            InputLabelProps={{ shrink: true, sx: labelStyles }}
                                            InputProps={{ sx: { ...inputStyles, bgcolor: 'var(--color-vc-canvas)' } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                                            <TextField
                                                fullWidth
                                                label={
                                                    videoForm.type === 'youtube_live' ? "YouTube Live Link" :
                                                    videoForm.type === 'zoom' ? "Zoom Invite Link" :
                                                    "Google Meet Link"
                                                }
                                                value={videoForm.meetLink || ''}
                                                onChange={(e) => setVideoForm({ ...videoForm, meetLink: e.target.value })}
                                                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                InputLabelProps={{ sx: labelStyles }}
                                                InputProps={{ sx: { ...inputStyles, bgcolor: 'var(--color-vc-canvas)' } }}
                                            />
                                            <Button
                                                variant="outlined"
                                                onClick={handleGenerateMeet}
                                                disabled={generating}
                                                sx={{ 
                                                    minWidth: 130, 
                                                    borderRadius: '6px',
                                                    textTransform: 'none',
                                                    fontSize: '12px',
                                                    fontFamily: 'inherit',
                                                    borderColor: 'var(--color-vc-hairline)',
                                                    color: 'var(--color-vc-ink)',
                                                    bgcolor: 'var(--color-vc-canvas)',
                                                    '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                                }}
                                            >
                                                {generating ? <CircularProgress size={16} /> : 'Auto Generate'}
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
                                                sx={{ 
                                                    borderRadius: '6px', 
                                                    textTransform: 'none', 
                                                    fontWeight: 500, 
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    bgcolor: '#1A73E8', 
                                                    boxShadow: 'none',
                                                    '&:hover': { bgcolor: '#1557B0', boxShadow: 'none' } 
                                                }}
                                                startIcon={<VideoCallIcon />}
                                            >
                                                Join/Preview Session
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'var(--color-vc-canvas-soft)', p: 2, borderRadius: '6px', border: '1px solid var(--color-vc-hairline)' }}>
                            <Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Free Preview</Typography>
                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', display: 'block', mt: 0.25 }}>Allow students to watch this for free</Typography>
                            </Box>
                            <Switch
                                checked={videoForm.isFree}
                                onChange={(e) => setVideoForm({ ...videoForm, isFree: e.target.checked })}
                                sx={{
                                    '& .MuiSwitch-thumb': {
                                        bgcolor: videoForm.isFree ? 'var(--color-vc-ink)' : 'var(--color-vc-mute)'
                                    },
                                    '& .MuiSwitch-track': {
                                        bgcolor: videoForm.isFree ? 'var(--color-vc-ink) !important' : 'var(--color-vc-hairline) !important'
                                    }
                                }}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
                <Button 
                    onClick={onClose} 
                    sx={{ 
                        borderRadius: '6px', 
                        textTransform: 'none', 
                        fontWeight: 500, 
                        px: 3, 
                        height: 36,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        color: 'var(--color-vc-body)',
                        '&:hover': {
                            bgcolor: 'var(--color-vc-canvas-soft)',
                            color: 'var(--color-vc-ink)'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    onClick={handleSave} 
                    disabled={uploading}
                    sx={{ 
                        borderRadius: '6px', 
                        textTransform: 'none', 
                        fontWeight: 500, 
                        px: 4, 
                        height: 36,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxShadow: 'none',
                        bgcolor: 'var(--color-vc-primary)',
                        color: 'var(--color-vc-on-primary)',
                        '&:hover': {
                            bgcolor: 'var(--color-vc-primary)',
                            opacity: 0.9,
                            boxShadow: 'none'
                        }
                    }}
                >
                    {uploading ? <CircularProgress size={16} color="inherit" /> : 'Save Lecture'}
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
        </Dialog>
    );
};

export default LectureModal;
