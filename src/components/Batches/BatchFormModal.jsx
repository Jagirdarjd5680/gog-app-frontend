import React, { useState, useEffect } from 'react';
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
    Typography,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const selectStyles = {
    bgcolor: 'var(--color-vc-canvas)',
    color: 'var(--color-vc-body)',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: 500,
    height: 40,
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' },
};

const inputStyles = {
    '& .MuiOutlinedInput-root': {
        bgcolor: 'var(--color-vc-canvas)',
        borderRadius: '6px',
        fontSize: '13px',
        fontFamily: 'inherit',
        color: 'var(--color-vc-ink)',
        '& fieldset': { borderColor: 'var(--color-vc-hairline)' },
        '&:hover fieldset': { borderColor: 'var(--color-vc-hairline-strong)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--color-vc-hairline-strong)' },
    },
    '& .MuiInputLabel-root': {
        fontSize: '13px',
        fontFamily: 'inherit',
        color: 'var(--color-vc-mute)',
    },
};

const menuStyles = {
    PaperProps: {
        sx: {
            bgcolor: 'var(--color-vc-canvas)',
            color: 'var(--color-vc-ink)',
            border: '1px solid var(--color-vc-hairline)',
            borderRadius: '6px',
            '& .MuiMenuItem-root': {
                fontSize: '13px',
                fontFamily: 'inherit',
                py: 1,
            },
        },
    },
};

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
        isActive: true,
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (batch) {
            const courseVal = batch.course?._id || batch.course?.id || batch.course || '';
            setFormData({
                name: batch.name || '',
                course: courseVal ? String(courseVal) : '',
                timing: batch.timing || '',
                startDate: batch.startDate ? batch.startDate.split('T')[0] : '',
                maxStudents: batch.maxStudents || 50,
                isActive: batch.isActive ?? true,
            });
        } else {
            setFormData({
                name: '',
                course: '',
                timing: '10:00 AM - 12:00 PM',
                startDate: new Date().toISOString().split('T')[0],
                maxStudents: 50,
                isActive: true,
            });
        }
    }, [batch, open]);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses');
            const list = res.data?.data || res.data || [];
            setCourses(list);
        } catch (error) {
            toast.error('Failed to load courses');
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return toast.error('Please enter a batch name');
        }
        if (!formData.course) {
            return toast.error('Please select a course');
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                courseId: formData.course,
            };

            if (isEdit) {
                const batchId = batch._id || batch.id;
                await api.put(`/batches/${batchId}`, payload);
                toast.success('Batch updated successfully');
            } else {
                await api.post('/batches', payload);
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
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{
                sx: {
                    borderRadius: '8px',
                    bgcolor: 'var(--color-vc-canvas)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: '0px 32px 64px -12px rgba(0,0,0,0.16)',
                },
            }}
        >
            <DialogTitle
                sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--color-vc-ink)',
                    fontFamily: 'inherit',
                    pb: 1.5,
                    borderBottom: '1px solid var(--color-vc-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Typography variant="span" sx={{ fontSize: '16px', fontWeight: 600, fontFamily: 'inherit' }}>
                    {isEdit ? 'Edit Batch Cohort' : 'Add New Batch Cohort'}
                </Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: 'var(--color-vc-mute)' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ py: 3, bgcolor: 'var(--color-vc-canvas)' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Batch Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Graphic Design Morning Batch - A"
                                fullWidth
                                required
                                size="small"
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl fullWidth required size="small">
                                <InputLabel sx={{ fontSize: '13px', fontFamily: 'inherit', color: 'var(--color-vc-mute)' }}>
                                    Associated Course
                                </InputLabel>
                                <Select
                                    name="course"
                                    value={formData.course}
                                    label="Associated Course"
                                    onChange={handleChange}
                                    sx={selectStyles}
                                    MenuProps={menuStyles}
                                >
                                    <MenuItem key="default-course" value="" disabled>
                                        <em>Select Course</em>
                                    </MenuItem>
                                    {courses.map((c) => (
                                        <MenuItem key={String(c._id || c.id)} value={String(c._id || c.id)}>
                                            {c.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Schedule / Timing"
                                name="timing"
                                value={formData.timing}
                                onChange={handleChange}
                                placeholder="e.g. 10:00 AM - 12:00 PM"
                                fullWidth
                                required
                                size="small"
                                sx={inputStyles}
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
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Max Capacity"
                                name="maxStudents"
                                type="number"
                                value={formData.maxStudents}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                sx={inputStyles}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Box
                                sx={{
                                    px: 2,
                                    height: 40,
                                    bgcolor: 'var(--color-vc-canvas-soft)',
                                    border: '1px solid var(--color-vc-hairline)',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', color: 'var(--color-vc-ink)' }}>
                                            {formData.isActive ? 'Active Cohort' : 'Inactive Cohort'}
                                        </Typography>
                                    }
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        bgcolor: 'var(--color-vc-canvas)',
                        borderTop: '1px solid var(--color-vc-hairline)',
                        gap: 1.5,
                    }}
                >
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            borderRadius: '6px',
                            height: 36,
                            color: 'var(--color-vc-body)',
                            borderColor: 'var(--color-vc-hairline)',
                            bgcolor: 'var(--color-vc-canvas)',
                            '&:hover': {
                                bgcolor: 'var(--color-vc-canvas-soft)',
                                borderColor: 'var(--color-vc-hairline-strong)',
                            },
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={16} color="inherit" />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            boxShadow: 'none',
                            borderRadius: '6px',
                            height: 36,
                            bgcolor: 'var(--color-vc-primary)',
                            color: 'var(--color-vc-on-primary)',
                            '&:hover': {
                                bgcolor: 'var(--color-vc-primary)',
                                opacity: 0.9,
                                boxShadow: 'none',
                            },
                        }}
                    >
                        {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Batch'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default BatchFormModal;
