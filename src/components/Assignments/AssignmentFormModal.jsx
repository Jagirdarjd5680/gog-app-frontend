import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogContent, DialogActions, Box,
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

const labelStyles = {
    fontFamily: 'inherit',
    fontSize: '13px',
    color: 'var(--color-vc-mute)',
    '&.Mui-focused': { color: 'var(--color-vc-ink)' }
};

const inputStyles = {
    borderRadius: '6px',
    fontFamily: 'inherit',
    fontSize: '13px',
    color: 'var(--color-vc-ink)',
    bgcolor: 'var(--color-vc-canvas)',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-vc-hairline)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-vc-hairline-strong)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-vc-ink)',
        borderWidth: '1px'
    }
};

const selectStyles = {
    ...inputStyles,
    '& .MuiSelect-select': {
        py: '10.5px'
    }
};

const AssignmentFormModal = ({ open, onClose, assignment, onSuccess, autoCourseId }) => {
    const fileInputRef = useRef(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const isEdit = Boolean(assignment?._id);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: assignment?.title || '',
        description: assignment?.description || '',
        thumbnail: assignment?.thumbnail || '',
        course: assignment?.courseId ?? assignment?.course?._id ?? assignment?.course ?? autoCourseId ?? '',
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

    useEffect(() => {
        if (open) {
            setFormData({
                title: assignment?.title || '',
                description: assignment?.description || '',
                thumbnail: assignment?.thumbnail || '',
                course: assignment?.courseId ?? assignment?.course?._id ?? assignment?.course ?? autoCourseId ?? '',
                deadline: assignment?.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '',
                deadlineType: (assignment?.deadlineDays > 0 || assignment?.deadlineDays === 0) ? (assignment.deadlineDays > 0 ? 'relative' : 'fixed') : 'fixed',
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
        }
    }, [open, assignment, autoCourseId]);
    
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
                if (formData.moduleId) {
                    const module = course.modules.find(m => m._id === formData.moduleId || m.id === formData.moduleId);
                    setLectures(module?.videos || []);
                }
            } else if (isEdit && assignment?.course?._id === formData.course) {
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
                // Backend field is `courseId` (a bare nullable int) — `formData.course` is
                // just this form's dropdown state key, and was being sent as-is, which the
                // API never reads under that name, so saving never linked the assignment
                // to the selected course.
                courseId: formData.course ? Number(formData.course) : null,
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
        <Dialog 
            open={open} 
            onClose={loading ? undefined : onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { 
                    bgcolor: 'var(--color-vc-canvas)', 
                    color: 'var(--color-vc-ink)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: 'none',
                    backgroundImage: 'none'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid var(--color-vc-hairline)' }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', letterSpacing: '-0.02em' }}>
                    {isEdit ? 'Edit Assignment' : 'Create Assignment'}
                </Typography>
                <IconButton onClick={onClose} disabled={loading} size="small" sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)' } }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 3 }}>
                    <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                name="title"
                                label="Assignment Title"
                                value={formData.title}
                                onChange={handleChange}
                                InputLabelProps={{ sx: labelStyles }}
                                InputProps={{ sx: inputStyles }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={labelStyles}>Course (Optional)</InputLabel>
                                <Select
                                    name="course"
                                    value={formData.course}
                                    label="Course (Optional)"
                                    onChange={handleChange}
                                    disabled={Boolean(formData.course)}
                                    sx={selectStyles}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: 'var(--color-vc-canvas)',
                                                border: '1px solid var(--color-vc-hairline)',
                                                boxShadow: 'none',
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    color: 'var(--color-vc-body)',
                                                    '&.Mui-selected': { bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' },
                                                    '&:hover': { bgcolor: 'var(--color-vc-canvas-soft-2)' }
                                                }
                                            }
                                        }
                                    }}
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
                                <InputLabel sx={labelStyles}>Module (Required for Auto-Unlock)</InputLabel>
                                <Select
                                    name="moduleId"
                                    value={formData.moduleId}
                                    label="Module (Required for Auto-Unlock)"
                                    onChange={handleChange}
                                    disabled={!formData.course}
                                    sx={selectStyles}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: 'var(--color-vc-canvas)',
                                                border: '1px solid var(--color-vc-hairline)',
                                                boxShadow: 'none',
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    color: 'var(--color-vc-body)',
                                                    '&.Mui-selected': { bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' },
                                                    '&:hover': { bgcolor: 'var(--color-vc-canvas-soft-2)' }
                                                }
                                            }
                                        }
                                    }}
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
                                <InputLabel sx={labelStyles}>Lecture (Optional)</InputLabel>
                                <Select
                                    name="lectureId"
                                    value={formData.lectureId}
                                    label="Lecture (Optional)"
                                    onChange={handleChange}
                                    disabled={!formData.moduleId}
                                    sx={selectStyles}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: 'var(--color-vc-canvas)',
                                                border: '1px solid var(--color-vc-hairline)',
                                                boxShadow: 'none',
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    color: 'var(--color-vc-body)',
                                                    '&.Mui-selected': { bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' },
                                                    '&:hover': { bgcolor: 'var(--color-vc-canvas-soft-2)' }
                                                }
                                            }
                                        }
                                    }}
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
                            <Card variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CloudUploadIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 18 }} />
                                            <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Assignment Cover Image</Typography>
                                        </Box>
                                        
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 160,
                                                border: '1px dashed var(--color-vc-hairline)',
                                                borderRadius: '6px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                transition: 'all 0.15s',
                                                bgcolor: 'var(--color-vc-canvas-soft-2)',
                                                '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                            }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {uploadingImage && (
                                                <Box sx={{
                                                    position: 'absolute', inset: 0, zIndex: 10,
                                                    bgcolor: 'rgba(255,255,255,0.7)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    <CircularProgress size={24} thickness={4} sx={{ color: 'var(--color-vc-ink)' }} />
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
                                                    <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: 'var(--color-vc-canvas)', border: '1px solid var(--color-vc-hairline)' }}>
                                                        <CloudUploadIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 24 }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Click to upload cover image</Typography>
                                                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>PNG, JPG or WEBP</Typography>
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

                                        <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                name="thumbnail"
                                                label="Image URL"
                                                placeholder="Or paste an image URL here..."
                                                value={formData.thumbnail || ''}
                                                onChange={handleChange}
                                                InputLabelProps={{ sx: labelStyles }}
                                                InputProps={{ 
                                                    sx: inputStyles,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <CollectionsIcon sx={{ fontSize: 16, color: 'var(--color-vc-mute)' }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Button 
                                                                size="small" 
                                                                variant="outlined" 
                                                                onClick={() => setPickerOpen(true)}
                                                                sx={{ 
                                                                    borderRadius: '4px', 
                                                                    textTransform: 'none',
                                                                    fontSize: '11px',
                                                                    fontFamily: 'inherit',
                                                                    fontWeight: 500,
                                                                    borderColor: 'var(--color-vc-hairline)',
                                                                    color: 'var(--color-vc-ink)',
                                                                    bgcolor: 'var(--color-vc-canvas)',
                                                                    '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                                                }}
                                                            >
                                                                Browse
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
                                <InputLabel sx={labelStyles}>Assignment Type</InputLabel>
                                <Select
                                    name="assignmentType"
                                    value={formData.assignmentType}
                                    label="Assignment Type"
                                    onChange={handleChange}
                                    sx={selectStyles}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                bgcolor: 'var(--color-vc-canvas)',
                                                border: '1px solid var(--color-vc-hairline)',
                                                boxShadow: 'none',
                                                '& .MuiMenuItem-root': {
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    color: 'var(--color-vc-body)',
                                                    '&.Mui-selected': { bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' },
                                                    '&:hover': { bgcolor: 'var(--color-vc-canvas-soft-2)' }
                                                }
                                            }
                                        }
                                    }}
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
                                    startIcon={<PlaylistAddCheckIcon sx={{ fontSize: 18 }} />}
                                    onClick={() => setQuestionPickerOpen(true)}
                                    sx={{ 
                                        height: '48px', 
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontFamily: 'inherit',
                                        fontWeight: 500,
                                        border: '1px dashed var(--color-vc-hairline)',
                                        color: formData.questions?.length > 0 ? 'var(--color-vc-cyan-deep)' : 'var(--color-vc-ink)',
                                        bgcolor: formData.questions?.length > 0 ? 'rgba(41, 188, 155, 0.08)' : 'var(--color-vc-canvas)',
                                        '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
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
                                        InputLabelProps={{ sx: labelStyles }}
                                        InputProps={{ sx: inputStyles }}
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
                                        InputLabelProps={{ sx: labelStyles }}
                                        InputProps={{ sx: inputStyles }}
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1, fontFamily: 'inherit' }}>Reference Attachments (for students)</Typography>
                            <Box sx={{ p: 2, border: '1px dashed var(--color-vc-hairline)', borderRadius: '6px', bgcolor: 'var(--color-vc-canvas-soft-2)' }}>
                                <Stack spacing={1}>
                                    {formData.attachments.map((file, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 1, bgcolor: 'var(--color-vc-canvas)', border: '1px solid var(--color-vc-hairline)', borderRadius: '4px' }}>
                                            <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-body)', fontFamily: 'inherit', noWrap: true, maxWidth: '80%' }}>{file.title}</Typography>
                                            <IconButton size="small" onClick={() => removeAttachment(idx)} sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-error-deep)' } }}>
                                                <CloseIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        disabled={uploadingAttachment}
                                        sx={{ 
                                            borderRadius: '6px', 
                                            textTransform: 'none',
                                            fontSize: '12px',
                                            fontFamily: 'inherit',
                                            fontWeight: 500,
                                            height: 36,
                                            borderColor: 'var(--color-vc-hairline)',
                                            color: 'var(--color-vc-ink)',
                                            bgcolor: 'var(--color-vc-canvas)',
                                            '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                                        }}
                                    >
                                        {uploadingAttachment ? 'Uploading...' : 'Upload Reference File'}
                                        <input type="file" hidden onChange={handleAttachmentUpload} />
                                    </Button>
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1, display: 'block', fontFamily: 'inherit' }}>
                                Description / Instructions
                            </Typography>
                            <Box sx={{ 
                                '& .ql-toolbar': { borderRadius: '6px 6px 0 0', border: '1px solid var(--color-vc-hairline) !important', bgcolor: 'var(--color-vc-canvas-soft-2)' },
                                '& .ql-container': { borderRadius: '0 0 6px 6px', border: '1px solid var(--color-vc-hairline) !important', minHeight: '180px', fontSize: '13px', fontFamily: 'inherit', bgcolor: 'var(--color-vc-canvas)' },
                                '& .ql-editor': { minHeight: '180px', color: 'var(--color-vc-ink)', fontFamily: 'inherit' }
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
                            <Box sx={{ p: 2, bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '6px', border: '1px solid var(--color-vc-hairline)' }}>
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-vc-ink)', mb: 2, fontFamily: 'inherit' }}>Submission Deadline</Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                    <Button 
                                        variant={formData.deadlineType === 'fixed' ? 'contained' : 'outlined'}
                                        onClick={() => setFormData(prev => ({ ...prev, deadlineType: 'fixed' }))}
                                        size="small"
                                        sx={{ 
                                            borderRadius: '4px', 
                                            textTransform: 'none',
                                            fontSize: '11px',
                                            fontFamily: 'inherit',
                                            fontWeight: 500,
                                            boxShadow: 'none',
                                            bgcolor: formData.deadlineType === 'fixed' ? 'var(--color-vc-ink)' : 'transparent',
                                            color: formData.deadlineType === 'fixed' ? 'var(--color-vc-on-primary)' : 'var(--color-vc-ink)',
                                            borderColor: 'var(--color-vc-hairline)',
                                            '&:hover': { 
                                                bgcolor: formData.deadlineType === 'fixed' ? 'var(--color-vc-ink)' : 'var(--color-vc-canvas-soft-2)',
                                                borderColor: 'var(--color-vc-hairline-strong)',
                                                boxShadow: 'none'
                                            }
                                        }}
                                    >
                                        Fixed Date
                                    </Button>
                                    <Button 
                                        variant={formData.deadlineType === 'relative' ? 'contained' : 'outlined'}
                                        onClick={() => setFormData(prev => ({ ...prev, deadlineType: 'relative' }))}
                                        size="small"
                                        sx={{ 
                                            borderRadius: '4px', 
                                            textTransform: 'none',
                                            fontSize: '11px',
                                            fontFamily: 'inherit',
                                            fontWeight: 500,
                                            boxShadow: 'none',
                                            bgcolor: formData.deadlineType === 'relative' ? 'var(--color-vc-ink)' : 'transparent',
                                            color: formData.deadlineType === 'relative' ? 'var(--color-vc-on-primary)' : 'var(--color-vc-ink)',
                                            borderColor: 'var(--color-vc-hairline)',
                                            '&:hover': { 
                                                bgcolor: formData.deadlineType === 'relative' ? 'var(--color-vc-ink)' : 'var(--color-vc-canvas-soft-2)',
                                                borderColor: 'var(--color-vc-hairline-strong)',
                                                boxShadow: 'none'
                                            }
                                        }}
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
                                        InputLabelProps={{ shrink: true, sx: labelStyles }}
                                        value={formData.deadline}
                                        onChange={handleChange}
                                        InputProps={{ sx: { ...inputStyles, bgcolor: 'var(--color-vc-canvas)' } }}
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
                                        InputLabelProps={{ sx: labelStyles }}
                                        FormHelperTextProps={{ sx: { fontSize: '10px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.5 } }}
                                        InputProps={{ 
                                            sx: { ...inputStyles, bgcolor: 'var(--color-vc-canvas)' },
                                            endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>Days</Typography></InputAdornment>
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
                                InputLabelProps={{ sx: labelStyles }}
                                InputProps={{ inputProps: { min: 1 }, sx: inputStyles }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        name="isPublished" 
                                        checked={formData.isPublished} 
                                        onChange={handleChange} 
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-vc-ink)' },
                                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: 'var(--color-vc-ink)' }
                                        }}
                                    />
                                }
                                label={<Typography sx={{ fontSize: '13px', color: 'var(--color-vc-body)', fontFamily: 'inherit' }}>Publish Immediately</Typography>}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid var(--color-vc-hairline)' }}>
                    <Button 
                        onClick={onClose} 
                        disabled={loading}
                        sx={{ 
                            textTransform: 'none',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            fontWeight: 500,
                            color: 'var(--color-vc-body)',
                            '&:hover': { color: 'var(--color-vc-ink)', bgcolor: 'var(--color-vc-canvas-soft)' }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading} 
                        sx={{ 
                            borderRadius: '6px', 
                            px: 3, 
                            height: 36,
                            textTransform: 'none',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            fontWeight: 500,
                            boxShadow: 'none',
                            bgcolor: 'var(--color-vc-primary)',
                            color: 'var(--color-vc-on-primary)',
                            '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' }
                        }}
                    >
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
