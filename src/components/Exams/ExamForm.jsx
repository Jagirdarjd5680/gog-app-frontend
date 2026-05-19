
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
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

    useEffect(() => {
        if (open) {
            fetchCourses();
            if (initialData) {
                // Format dates for input type="datetime-local" which requires YYYY-MM-DDTHH:MM
                const formatDateTime = (dateString) => {
                    if (!dateString) return '';
                    const date = new Date(dateString);
                    // Adjust to local ISO string
                    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                };

                const cId = initialData.course?._id || initialData.course || '';
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
            
            // If we have an autoCourseId or initialData, and it's not in courses yet, 
            // the MUI Select might warn. But we fetch courses first now.
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

        try {
            if (initialData?._id) {
                await api.put(`/exams/${initialData._id}`, formData);
                toast.success('Exam updated successfully');
            } else {
                await api.post('/exams', formData);
                toast.success('Exam created successfully');
            }
            onSuccess();
        } catch (error) {
            
            toast.error('Failed to save exam');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {initialData ? 'Edit Exam' : 'Create New Exam'}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 0 }}>
                    <Grid item xs={12}>
                        <TextField
                            label="Exam Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
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
                            InputLabelProps={{ shrink: true }}
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
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={3}>
                        <TextField
                            label="Duration (mins)"
                            name="duration"
                            type="number"
                            value={formData.duration}
                            onChange={handleChange}
                            fullWidth
                            required
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
                            helperText="Attempts per user"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Associated Course (Optional)</InputLabel>
                            <Select
                                value={formData.course}
                                label="Associated Course (Optional)"
                                onChange={handleChange}
                                name="course"
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
                                    <InputLabel>Module (Optional)</InputLabel>
                                    <Select
                                        value={formData.moduleId}
                                        label="Module (Optional)"
                                        onChange={handleChange}
                                        name="moduleId"
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
                                    <InputLabel>Lecture (Optional)</InputLabel>
                                    <Select
                                        value={formData.lectureId}
                                        label="Lecture (Optional)"
                                        onChange={handleChange}
                                        name="lectureId"
                                        disabled={!formData.moduleId}
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
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Save Exam</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExamForm;
