import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Typography,
    Grid,
    InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../utils/api';
import { toast } from 'react-toastify';

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

const ExamForm = ({ open, onClose, onSuccess, initialData, autoCourseId }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 40,
        attemptsPerUser: 1,
        isActive: true,
        course: '',
        moduleId: '',
        lectureId: ''
    });
    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchCourses();
            if (initialData) {
                const formatDateTime = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                };

                const cId = initialData.courseId ?? initialData.course?._id ?? initialData.course ?? '';
                setFormData({
                    ...initialData,
                    startDate: formatDateTime(initialData.startDate),
                    endDate: formatDateTime(initialData.endDate),
                    course: cId,
                    moduleId: initialData.moduleId || '',
                    lectureId: initialData.lectureId || ''
                });

                if (cId) {
                    fetchCourseDetails(cId, initialData.moduleId);
                }
            } else if (autoCourseId) {
                setFormData(prev => ({
                    ...prev,
                    course: autoCourseId,
                    title: '',
                    description: '',
                    startDate: '',
                    endDate: '',
                    moduleId: '',
                    lectureId: ''
                }));
                fetchCourseDetails(autoCourseId);
            } else {
                setFormData({
                    title: '',
                    description: '',
                    startDate: '',
                    endDate: '',
                    duration: 60,
                    totalMarks: 100,
                    passingMarks: 40,
                    attemptsPerUser: 1,
                    isActive: true,
                    course: '',
                    moduleId: '',
                    lectureId: ''
                });
                setModules([]);
                setLectures([]);
            }
        }
    }, [initialData, open, autoCourseId]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            const fetchedCourses = data.data || [];
            setCourses(fetchedCourses);
        } catch (error) {
            
        }
    };

    const fetchCourseDetails = async (courseId, modId) => {
        if (!courseId || courseId === 'None') return;
        try {
            const { data } = await api.get(`/courses/${courseId}`);
            if (data.success) {
                const mods = data.data.modules || [];
                setModules(mods);
                if (modId) {
                    const mod = mods.find(m => m._id === modId);
                    setLectures(mod?.videos || []);
                }
            }
        } catch (error) {
            console.error('Failed to fetch course details:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'course') {
            if (value) {
                fetchCourseDetails(value);
            } else {
                setModules([]);
                setLectures([]);
                setFormData(prev => ({ ...prev, moduleId: '', lectureId: '' }));
            }
        }

        if (name === 'moduleId') {
            if (value) {
                const mod = modules.find(m => m._id === value);
                setLectures(mod?.videos || []);
            } else {
                setLectures([]);
                setFormData(prev => ({ ...prev, lectureId: '' }));
            }
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.startDate || !formData.endDate) {
            return toast.warning('Please fill in all required fields');
        }

        setLoading(true);
        try {
            // Backend field is `courseId` (a bare nullable int) — `formData.course` (this
            // form's dropdown state key) was being sent as-is, which the create DTO's
            // whitelist silently drops and the update handler never reads, so saving
            // never actually linked/moved the exam to the selected course.
            const payload = { ...formData, courseId: formData.course ? Number(formData.course) : null };
            if (initialData?._id) {
                await api.put(`/exams/${initialData._id}`, payload);
                toast.success('Exam updated successfully');
            } else {
                await api.post('/exams', payload);
                toast.success('Exam created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to save exam');
        } finally {
            setLoading(false);
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
                    {initialData ? 'Edit Exam' : 'Create New Exam'}
                </Typography>
                <IconButton onClick={onClose} size="small" sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)' } }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                        <TextField
                            label="Exam Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={3}
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Start Date & Time"
                            name="startDate"
                            type="datetime-local"
                            value={formData.startDate}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true, sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="End Date & Time"
                            name="endDate"
                            type="datetime-local"
                            value={formData.endDate}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true, sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Duration"
                            name="duration"
                            type="number"
                            value={formData.duration}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ 
                                sx: inputStyles,
                                endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>m</Typography></InputAdornment>
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Total Marks"
                            name="totalMarks"
                            type="number"
                            value={formData.totalMarks}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Passing Marks"
                            name="passingMarks"
                            type="number"
                            value={formData.passingMarks}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Attempt Limit"
                            name="attemptsPerUser"
                            type="number"
                            value={formData.attemptsPerUser}
                            onChange={handleChange}
                            fullWidth
                            required
                            InputLabelProps={{ sx: labelStyles }}
                            InputProps={{ sx: inputStyles }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel sx={labelStyles}>Associated Course (Optional)</InputLabel>
                            <Select
                                value={formData.course}
                                label="Associated Course (Optional)"
                                onChange={handleChange}
                                name="course"
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
                                <MenuItem value=""><em>None</em></MenuItem>
                                {courses.map((course) => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {formData.course && (
                        <>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel sx={labelStyles}>Module (Optional)</InputLabel>
                                    <Select
                                        value={formData.moduleId}
                                        label="Module (Optional)"
                                        onChange={handleChange}
                                        name="moduleId"
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
                                        <MenuItem value=""><em>Global (No Module)</em></MenuItem>
                                        {modules.map((mod) => (
                                            <MenuItem key={mod._id} value={mod._id}>
                                                {mod.title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel sx={labelStyles}>Lecture (Optional)</InputLabel>
                                    <Select
                                        value={formData.lectureId}
                                        label="Lecture (Optional)"
                                        onChange={handleChange}
                                        name="lectureId"
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
                                        <MenuItem value=""><em>Module Level (No Lecture)</em></MenuItem>
                                        {lectures.map((lec) => (
                                            <MenuItem key={lec._id} value={lec._id}>
                                                {lec.title}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </>
                    )}
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
                    onClick={handleSubmit} 
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
                    {loading ? 'Saving...' : 'Save Exam'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExamForm;
