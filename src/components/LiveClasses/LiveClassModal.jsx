import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Grid,
    MenuItem,
    CircularProgress,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const LiveClassModal = ({ open, onClose, onSuccess, initialData = null }) => {
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        course: '',
        scheduledDate: '',
        duration: 60,
        meetingLink: '',
        status: 'scheduled'
    });

    useEffect(() => {
        if (open) {
            fetchCourses();
            if (initialData) {
                setFormData({
                    ...initialData,
                    course: initialData.course?._id || initialData.course,
                    scheduledDate: new Date(initialData.scheduledDate).toISOString().slice(0, 16)
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    course: '',
                    scheduledDate: '',
                    duration: 60,
                    meetingLink: '',
                    status: 'scheduled'
                });
            }
        }
    }, [open, initialData]);

    const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
            const response = await api.get('/courses?limit=100'); // Corrected endpoint
            if (response.data.success) {
                setCourses(response.data.data);
            }
        } catch (error) {
            console.error('Fetch Courses Error:', error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            let response;
            if (initialData) {
                response = await api.put(`/live-classes/${initialData._id}`, formData);
            } else {
                response = await api.post('/live-classes', formData);
            }

            if (response.data.success) {
                toast.success(`Live class ${initialData ? 'updated' : 'scheduled'} successfully`);
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save live class');
        } finally {
            setSaving(false);
        }
    };

    const [generating, setGenerating] = useState(false);

    const handleGenerateMeet = async () => {
        const tokens = localStorage.getItem('googleMeetTokens');
        if (!tokens) {
            // Need to authenticate
            try {
                const response = await api.get('/live-classes/auth/url');
                window.location.href = response.data.url;
            } catch (error) {
                toast.error('Failed to get auth URL');
            }
            return;
        }

        if (!formData.title || !formData.scheduledDate) {
            toast.warning('Please fill title and date first');
            return;
        }

        setGenerating(true);
        try {
            const response = await api.post('/live-classes/generate-meet', {
                tokens: JSON.parse(tokens),
                classInfo: formData
            });
            if (response.data.success) {
                setFormData({ ...formData, meetingLink: response.data.meetLink });
                toast.success('Meet link generated successfully!');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate Meet link. You might need to re-login to Google.');
            localStorage.removeItem('googleMeetTokens'); // Clear invalid tokens
        } finally {
            setGenerating(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800} component="span">
                    {initialData ? 'Edit Live Class' : 'Schedule Live Class'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Class Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Intro to Advanced React Hooks"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Course"
                                name="course"
                                select
                                value={formData.course}
                                onChange={handleChange}
                                required
                            >
                                {loadingCourses ? (
                                    <MenuItem disabled><CircularProgress size={20} /></MenuItem>
                                ) : courses.map(course => (
                                    <MenuItem key={course._id} value={course._id}>{course.title}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Date & Time"
                                name="scheduledDate"
                                type="datetime-local"
                                value={formData.scheduledDate}
                                onChange={handleChange}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Duration (minutes)"
                                name="duration"
                                type="number"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    label="Google Meet Link"
                                    name="meetingLink"
                                    value={formData.meetingLink}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
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
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Status"
                                name="status"
                                select
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="scheduled">Scheduled</MenuItem>
                                <MenuItem value="ongoing">Ongoing</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
                        sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}
                    >
                        {saving ? <CircularProgress size={24} /> : initialData ? 'Update' : 'Schedule'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default LiveClassModal;
