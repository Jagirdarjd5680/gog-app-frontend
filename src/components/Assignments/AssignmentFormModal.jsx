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
import QuestionPickerModal from '../Exams/QuestionPickerModal';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

const AssignmentFormModal = ({ open, onClose, assignment, onSuccess }) => {
    const fileInputRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const isEdit = Boolean(assignment?._id);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: assignment?.title || '',
        description: assignment?.description || '',
        thumbnail: assignment?.thumbnail || '',
        course: assignment?.course?._id || assignment?.course || '',
        deadline: assignment?.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '',
        deadlineType: assignment?.deadlineDays > 0 ? 'relative' : 'fixed',
        deadlineDays: assignment?.deadlineDays || 0,
        totalMarks: assignment?.totalMarks || 100,
        isPublished: assignment?.isPublished || false,
        assignmentType: assignment?.assignmentType || 'file_upload',
        maxMb: assignment?.maxMb || 10,
        allowedFormats: assignment?.allowedFormats || '.pdf,.zip,.jpg,.png',
        attachments: assignment?.attachments || [],
        moduleId: assignment?.moduleId?._id || assignment?.moduleId || '',
        lectureId: assignment?.lectureId?._id || assignment?.lectureId || '',
        questions: assignment?.questions || []
    });
    const [questionPickerOpen, setQuestionPickerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingAttachment, setUploadingAttachment] = useState(false);
    const [modules, setModules] = useState([]);
    const [lectures, setLectures] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses?limit=100');
                setCourses(data.data || []);
            } catch (error) {
                
            }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (formData.course) {
            const course = courses.find(c => c._id === formData.course);
            if (course) {
                setModules(course.modules || []);
                // If moduleId is already set (edit mode), set lectures
                if (formData.moduleId) {
                    const module = course.modules.find(m => m._id === formData.moduleId || m.id === formData.moduleId);
                    setLectures(module?.videos || []);
                }
            } else if (isEdit && assignment?.course?._id === formData.course) {
                // Handle case where course is in assignment but not in small courses list
                setModules(assignment.course.modules || []);
            }
        } else {
            setModules([]);
            setLectures([]);
        }
    }, [formData.course, courses, assignment]);

    useEffect(() => {
        if (formData.moduleId && modules.length > 0) {
            const module = modules.find(m => m._id === formData.moduleId || m.id === formData.moduleId);
            setLectures(module?.videos || []);
        } else {
            setLectures([]);
        }
    }, [formData.moduleId, modules]);

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
        e.stopPropagation();
        
        if (!formData.title) {
            toast.error('Please fill assignment title');
            return;
        }

        if (formData.deadlineType === 'fixed' && !formData.deadline) {
            toast.error('Please select a deadline date');
            return;
        }

        if (formData.deadlineType === 'relative' && formData.deadlineDays <= 0) {
            toast.error('Please enter valid deadline days');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                deadline: formData.deadlineType === 'fixed' ? formData.deadline : undefined,
                deadlineDays: formData.deadlineType === 'relative' ? formData.deadlineDays : 0,
                questions: formData.assignmentType === 'quiz' ? formData.questions : []
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
                                    disabled={Boolean(formData.course)}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <MenuItem value=""><em>Select Course</em></MenuItem>
                                    {courses.map(course => (
                                        <MenuItem key={course._id} value={course._id}>
                                            {course.title}
                                        </MenuItem>
                                    ))}
                                    {formData.course && !courses.find(c => c._id === formData.course) && (
                                        <MenuItem value={formData.course}>Selected Course</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Module (Required for Auto-Unlock)</InputLabel>
                                <Select
                                    name="moduleId"
                                    value={formData.moduleId}
                                    label="Module (Required for Auto-Unlock)"
                                    onChange={handleChange}
                                    disabled={!formData.course}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <MenuItem value=""><em>Select Module</em></MenuItem>
                                    {modules.map(mod => (
                                        <MenuItem key={mod._id || mod.id} value={mod._id || mod.id}>
                                            {mod.title}
                                        </MenuItem>
                                    ))}
                                    {formData.moduleId && !modules.find(m => (m._id || m.id) === formData.moduleId) && (
                                        <MenuItem value={formData.moduleId}>Selected Module</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Lecture (Optional)</InputLabel>
                                <Select
                                    name="lectureId"
                                    value={formData.lectureId}
                                    label="Lecture (Optional)"
                                    onChange={handleChange}
                                    disabled={!formData.moduleId}
                                    sx={{ borderRadius: 1 }}
                                >
                                    <MenuItem value=""><em>Select Lecture</em></MenuItem>
                                    {lectures.map(lec => (
                                        <MenuItem key={lec._id || lec.id} value={lec._id || lec.id}>
                                            {lec.title}
                                        </MenuItem>
                                    ))}
                                    {formData.lectureId && !lectures.find(l => (l._id || l.id) === formData.lectureId) && (
                                        <MenuItem value={formData.lectureId}>Selected Lecture</MenuItem>
                                    )}
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

                        {formData.assignmentType === 'quiz' && (
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
                                        color: formData.questions?.length > 0 ? 'success.main' : 'primary.main',
                                        borderColor: formData.questions?.length > 0 ? 'success.main' : 'primary.main'
                                    }}
                                >
                                    {formData.questions?.length > 0 
                                        ? `Questions Selected: ${formData.questions.length}` 
                                        : 'Pick Questions for Quiz'}
                                </Button>
                            </Grid>
                        )}

                        {formData.assignmentType === 'file_upload' && (
                            <>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        name="maxMb"
                                        label="Max File Size (MB)"
                                        value={formData.maxMb}
                                        onChange={handleChange}
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
                                        InputProps={{ sx: { borderRadius: 1 } }}
                                    />
                                </Grid>
                            </>
                        )}

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

                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Submission Deadline</Typography>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Button 
                                        variant={formData.deadlineType === 'fixed' ? 'contained' : 'outlined'}
                                        onClick={() => setFormData(prev => ({ ...prev, deadlineType: 'fixed' }))}
                                        size="small"
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Fixed Date
                                    </Button>
                                    <Button 
                                        variant={formData.deadlineType === 'relative' ? 'contained' : 'outlined'}
                                        onClick={() => setFormData(prev => ({ ...prev, deadlineType: 'relative' }))}
                                        size="small"
                                        sx={{ borderRadius: 2, textTransform: 'none' }}
                                    >
                                        Days After Unlock
                                    </Button>
                                </Stack>

                                {formData.deadlineType === 'fixed' ? (
                                    <TextField
                                        fullWidth
                                        type="datetime-local"
                                        name="deadline"
                                        label="Select Deadline Date"
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        InputProps={{ sx: { borderRadius: 1, bgcolor: 'white' } }}
                                    />
                                ) : (
                                    <TextField
                                        fullWidth
                                        type="number"
                                        name="deadlineDays"
                                        label="Number of Days to Submit"
                                        placeholder="e.g. 7"
                                        value={formData.deadlineDays}
                                        onChange={handleChange}
                                        helperText="Students must submit within these many days after assignment is unlocked for them."
                                        InputProps={{ 
                                            sx: { borderRadius: 1, bgcolor: 'white' },
                                            endAdornment: <InputAdornment position="end">Days</InputAdornment>
                                        }}
                                    />
                                )}
                            </Box>
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

            <QuestionPickerModal
                open={questionPickerOpen}
                onClose={() => setQuestionPickerOpen(false)}
                onSelect={(ids) => setFormData(prev => ({ ...prev, questions: ids }))}
                selectedIds={formData.questions}
            />
        </Dialog>
    );
};

export default AssignmentFormModal;
