import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Box,
    TextField, Button, Grid, IconButton, FormControl, InputLabel, Select, MenuItem, Typography, 
    Switch, FormControlLabel, InputAdornment, CircularProgress, Stack, Card, CardContent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CollectionsIcon from '@mui/icons-material/Collections';
import api, { fixUrl } from '../../utils/api';
import { uploadFile } from '../../utils/upload';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import MediaPickerModal from '../Media/MediaPickerModal';

const AssignmentFormModal = ({ open, onClose, assignment, onSuccess }) => {
    const fileInputRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const isEdit = Boolean(assignment);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: assignment?.title || '',
        description: assignment?.description || '',
        thumbnail: assignment?.thumbnail || '',
        course: assignment?.course?._id || assignment?.course || '',
        deadline: assignment?.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '',
        totalMarks: assignment?.totalMarks || 100,
        isPublished: assignment?.isPublished || false,
        assignmentType: assignment?.assignmentType || 'file_upload',
        maxMb: assignment?.maxMb || 10,
        allowedFormats: assignment?.allowedFormats || '.pdf,.zip,.jpg,.png',
        attachments: assignment?.attachments || []
    });
    const [loading, setLoading] = useState(false);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses?limit=100');
                setCourses(data.data || []);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                setUploadingImage(true);
                const result = await uploadFile(file);
                if (result.success) {
                    setFormData(prev => ({ ...prev, thumbnail: result.url }));
                    toast.success('Image uploaded successfully');
                }
            } catch (error) {
                console.error('Upload Error:', error);
                toast.error('Failed to upload image');
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleAttachmentUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                setUploadingAttachment(true);
                const result = await uploadFile(file);
                if (result.success) {
                    setFormData(prev => ({
                        ...prev,
                        attachments: [...prev.attachments, { title: file.name, url: result.url }]
                    }));
                    toast.success('Attachment added');
                }
            } catch (error) {
                toast.error('Failed to upload attachment');
            } finally {
                setUploadingAttachment(false);
            }
        }
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleMediaSelect = (file) => {
        setFormData(prev => ({ ...prev, thumbnail: file.url }));
        toast.success('Image selected from library');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.deadline) {
            toast.error('Please fill required fields (Title, Deadline)');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData
            };
            
            if (isEdit) {
                await api.put(`/assignments/${assignment._id}`, payload);
                toast.success('Assignment updated');
            } else {
                await api.post('/assignments', payload);
                toast.success('Assignment created');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                <Typography variant="h6" fontWeight={700}>
                    {isEdit ? 'Edit Assignment' : 'Create Assignment'}
                </Typography>
                <IconButton onClick={onClose} disabled={loading} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                name="title"
                                label="Assignment Title"
                                value={formData.title}
                                onChange={handleChange}
                                InputProps={{ sx: { borderRadius: 1 } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Course (Optional)</InputLabel>
                                <Select
                                    name="course"
                                    value={formData.course}
                                    label="Course (Optional)"
                                    onChange={handleChange}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <MenuItem value=""><em>Select Course</em></MenuItem>
                                    {courses.map(course => (
                                        <MenuItem key={course._id} value={course._id}>
                                            {course.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            {/* Course Thumbnail */}
                            <Card className="premium-card" sx={{ mb: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CloudUploadIcon color="primary" />
                                            <Typography variant="subtitle2" fontWeight={700}>Assignment Cover Image</Typography>
                                        </Box>
                                        
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 180,
                                                border: '2px dashed #cbd5e1',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.3s ease',
                                                bgcolor: 'rgba(0,0,0,0.02)',
                                                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(99, 102, 241, 0.05)' }
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {uploadingImage && (
                                                <Box sx={{
                                                    position: 'absolute', inset: 0, zIndex: 10,
                                                    bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <CircularProgress size={40} />
                                                </Box>
                                            )}
                                            {formData.thumbnail ? (
                                                <img
                                                    src={fixUrl(formData.thumbnail)}
                                                    alt="Thumbnail"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <Stack spacing={1} alignItems="center">
                                                    <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                                        <CloudUploadIcon color="primary" sx={{ fontSize: 32 }} />
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={600}>Click to upload Image</Typography>
                                                    <Typography variant="caption" color="text.secondary">PNG, JPG or WEBP</Typography>
                                                </Stack>
                                            )}
                                            <input
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                            />
                                        </Box>

                                        <Stack spacing={1.5} sx={{ mt: 1 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                name="thumbnail"
                                                label="Image URL"
                                                placeholder="Or paste an image URL here..."
                                                value={formData.thumbnail || ''}
                                                onChange={handleChange}
                                                InputProps={{ 
                                                    sx: { borderRadius: '8px' },
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <CollectionsIcon fontSize="small" color="action" />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Button 
                                                                size="small" 
                                                                variant="outlined" 
                                                                onClick={() => setPickerOpen(true)}
                                                                sx={{ borderRadius: '6px', textTransform: 'none' }}
                                                            >
                                                                Browse Library
                                                            </Button>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Assignment Type</InputLabel>
                                <Select
                                    name="assignmentType"
                                    value={formData.assignmentType}
                                    label="Assignment Type"
                                    onChange={handleChange}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <MenuItem value="file_upload">File Upload</MenuItem>
                                    <MenuItem value="text_answer">Text Answer</MenuItem>
                                    <MenuItem value="quiz">Quiz (Question Bank)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                type="number"
                                name="maxMb"
                                label="Max File Size (MB)"
                                value={formData.maxMb}
                                onChange={handleChange}
                                disabled={formData.assignmentType !== 'file_upload'}
                                InputProps={{ sx: { borderRadius: 1 } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                name="allowedFormats"
                                label="Allowed Formats (comma separated)"
                                placeholder=".pdf,.zip,.jpg"
                                value={formData.allowedFormats}
                                onChange={handleChange}
                                disabled={formData.assignmentType !== 'file_upload'}
                                InputProps={{ sx: { borderRadius: 1 } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Reference Attachments (for students)</Typography>
                            <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 2, bgcolor: 'background.paper' }}>
                                <Stack spacing={1}>
                                    {formData.attachments.map((file, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>{file.title}</Typography>
                                            <IconButton size="small" color="error" onClick={() => removeAttachment(idx)}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={uploadingAttachment ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                        disabled={uploadingAttachment}
                                    >
                                        {uploadingAttachment ? 'Uploading...' : 'Upload Reference File'}
                                        <input type="file" hidden onChange={handleAttachmentUpload} />
                                    </Button>
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                Description / Instructions
                            </Typography>
                            <Box sx={{ 
                                '& .ql-toolbar': { borderRadius: '8px 8px 0 0', border: '1px solid rgba(0,0,0,0.2) !important', bgcolor: '#f8fafc' },
                                '& .ql-container': { borderRadius: '0 0 8px 8px', border: '1px solid rgba(0,0,0,0.2) !important', minHeight: '180px', fontSize: '1rem', bgcolor: 'white' },
                                '& .ql-editor': { minHeight: '180px' }
                            }}>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.description || ''}
                                    onChange={(content) => {
                                        setFormData(prev => ({ ...prev, description: content }));
                                    }}
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            ['link', 'image'],
                                            ['clean']
                                        ]
                                    }}
                                    placeholder="Provide detailed instructions for this assignment..."
                                />
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                type="datetime-local"
                                name="deadline"
                                label="Deadline"
                                InputLabelProps={{ shrink: true }}
                                value={formData.deadline}
                                onChange={handleChange}
                                InputProps={{ sx: { borderRadius: 1 } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                type="number"
                                name="totalMarks"
                                label="Total Marks"
                                value={formData.totalMarks}
                                onChange={handleChange}
                                InputProps={{ inputProps: { min: 1 }, sx: { borderRadius: 1 } }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        name="isPublished" 
                                        checked={formData.isPublished} 
                                        onChange={handleChange} 
                                    />
                                }
                                label="Publish Immediately"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading} sx={{ px: 3, borderRadius: 1 }}>
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </DialogActions>
            </form>

            <MediaPickerModal 
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleMediaSelect}
                type="image"
            />
        </Dialog>
    );
};

export default AssignmentFormModal;
