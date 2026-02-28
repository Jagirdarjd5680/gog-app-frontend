
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

const ExamForm = ({ open, onClose, onSuccess, initialData }) => {
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
        course: ''
    });
    const [courses, setCourses] = useState([]);

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

                setFormData({
                    ...initialData,
                    startDate: formatDateTime(initialData.startDate),
                    endDate: formatDateTime(initialData.endDate),
                    course: initialData.course?._id || initialData.course || ''
                });
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
                    course: ''
                });
            }
        }
    }, [initialData, open]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
            console.error('Error saving exam:', error);
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
