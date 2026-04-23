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
    Grid,
    Switch,
    FormControlLabel,
    CircularProgress,
} from '@mui/material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const BatchFormModal = ({ open, batch, onClose, onSuccess }) => {
    const isEdit = !!batch;
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        course: '',
        timing: '',
        startDate: '',
        maxStudents: 50,
        isActive: true
    });

    useEffect(() => {
        fetchInitialData();
            setFormData({
                name: batch?.name || '',
                course: batch?.course?._id || batch?.course || '',
                timing: batch?.timing || '',
                startDate: batch?.startDate ? batch.startDate.split('T')[0] : '',
                maxStudents: batch?.maxStudents || 50,
                isActive: batch?.isActive ?? true
            });
    }, [batch]);

    const fetchInitialData = async () => {
        try {
            const [coursesRes] = await Promise.all([
                api.get('/courses')
            ]);
            setCourses(coursesRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load initial data');
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await api.put(`/batches/${batch._id}`, formData);
                toast.success('Batch updated successfully');
            } else {
                await api.post('/batches', formData);
                toast.success('Batch created successfully');
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save batch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEdit ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Batch Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Course</InputLabel>
                                <Select
                                    name="course"
                                    value={formData.course}
                                    label="Course"
                                    onChange={handleChange}
                                >
                                    {courses.map(course => (
                                        <MenuItem key={course._id} value={course._id}>
                                            {course.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Timing (e.g. 10AM - 12PM)"
                                name="timing"
                                value={formData.timing}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Start Date"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Max Students"
                                name="maxStudents"
                                type="number"
                                value={formData.maxStudents}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                }
                                label="Active Batch"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={20} />}
                    >
                        {isEdit ? 'Update Batch' : 'Create Batch'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default BatchFormModal;
