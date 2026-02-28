import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
    MenuItem, Box, Typography, Switch, FormControlLabel, Divider, Collapse,
    ToggleButtonGroup, ToggleButton, InputAdornment, Grid, Chip
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import DevicesIcon from '@mui/icons-material/Devices';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    category: Yup.string().required('Category is required'),
    price: Yup.number().required('Price is required').min(0),
    level: Yup.string().required('Level is required'),
});

const CourseFormModal = ({ open, onClose, course, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [basicInfoOpen, setBasicInfoOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data.data || []);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        if (open) fetchCategories();
    }, [open]);

    const initialValues = {
        title: course?.title || '',
        description: course?.description || '',
        category: course?.category?._id || course?.category || '',
        price: course?.price ?? 0,
        durationValue: course?.durationValue ?? 0,
        durationUnit: course?.durationUnit || 'months',
        readingDurationValue: course?.readingDurationValue ?? 0,
        readingDurationUnit: course?.readingDurationUnit || 'hours',
        level: course?.level || 'beginner',
        // Basic Information
        isCertificate: course?.isCertificate ?? false,
        certificateName: course?.certificateName || '',
        gstType: course?.gstType || 'none',
        gstPercent: course?.gstPercent ?? 0,
        accessDevice: course?.accessDevice || 'both',
        fakeLikes: course?.fakeLikes ?? 0,
        originalPrice: course?.originalPrice ?? 0,
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (course) {
                await api.put(`/courses/${course._id}`, values);
                toast.success('Course updated successfully');
            } else {
                await api.post('/courses', values);
                toast.success('Course created successfully');
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{course ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                    <Form>
                        <DialogContent>
                            {/* ── Core Fields ── */}
                            <TextField
                                fullWidth label="Title" name="title" margin="normal"
                                value={values.title} onChange={handleChange} onBlur={handleBlur}
                                error={touched.title && Boolean(errors.title)}
                                helperText={touched.title && errors.title}
                            />

                            <TextField
                                fullWidth multiline rows={3} label="Description" name="description" margin="normal"
                                value={values.description} onChange={handleChange} onBlur={handleBlur}
                                error={touched.description && Boolean(errors.description)}
                                helperText={touched.description && errors.description}
                            />

                            <TextField
                                fullWidth select label="Category" name="category" margin="normal"
                                value={values.category} onChange={handleChange} onBlur={handleBlur}
                                error={touched.category && Boolean(errors.category)}
                                helperText={touched.category && errors.category}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
                                ))}
                            </TextField>

                            <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2} alignItems="flex-start">
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth label="Price (₹)" name="price" type="number"
                                            value={values.price} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.price && Boolean(errors.price)}
                                            helperText={touched.price && errors.price}
                                            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth select label="Level" name="level"
                                            value={values.level} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.level && Boolean(errors.level)}
                                            helperText={touched.level && errors.level}
                                        >
                                            <MenuItem value="beginner">Beginner</MenuItem>
                                            <MenuItem value="intermediate">Intermediate</MenuItem>
                                            <MenuItem value="advanced">Advanced</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Course Access Duration
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={8} sm={9}>
                                        <TextField
                                            fullWidth label="Duration Value" name="durationValue" type="number"
                                            value={values.durationValue} onChange={handleChange}
                                            helperText="0 = Lifetime access"
                                        />
                                    </Grid>
                                    <Grid item xs={4} sm={3}>
                                        <TextField
                                            fullWidth select label="Unit" name="durationUnit"
                                            value={values.durationUnit} onChange={handleChange}
                                        >
                                            <MenuItem value="days">Days</MenuItem>
                                            <MenuItem value="months">Months</MenuItem>
                                            <MenuItem value="years">Years</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ mt: 2, mb: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Reading Duration
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={8} sm={9}>
                                        <TextField
                                            fullWidth label="Expected Reading Time" name="readingDurationValue" type="number"
                                            value={values.readingDurationValue} onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs={4} sm={3}>
                                        <TextField
                                            fullWidth select label="Unit" name="readingDurationUnit"
                                            value={values.readingDurationUnit} onChange={handleChange}
                                        >
                                            <MenuItem value="hours">Hours</MenuItem>
                                            <MenuItem value="days">Days</MenuItem>
                                            <MenuItem value="months">Months</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* ── Basic Information Toggle ── */}
                            <Box
                                onClick={() => setBasicInfoOpen(!basicInfoOpen)}
                                sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    cursor: 'pointer', p: 1.5, borderRadius: 2, bgcolor: 'action.hover',
                                    '&:hover': { bgcolor: 'action.selected' }
                                }}
                            >
                                <Typography fontWeight={700} variant="subtitle1">
                                    🔧 Basic Information (Advanced Settings)
                                </Typography>
                                {basicInfoOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Box>

                            <Collapse in={basicInfoOpen}>
                                <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>

                                    {/* Original Price */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <ReceiptLongIcon color="primary" fontSize="small" />
                                            <Typography fontWeight={600}>Original Price (Strikethrough)</Typography>
                                        </Box>
                                        <TextField
                                            fullWidth label="Original Price (₹)" name="originalPrice" type="number"
                                            value={values.originalPrice} onChange={handleChange} onBlur={handleBlur}
                                            error={touched.originalPrice && Boolean(errors.originalPrice)}
                                            helperText="Higher price shown with a strikethrough to indicate a discount"
                                            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Certificate */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <CardMembershipIcon color="primary" fontSize="small" />
                                            <Typography fontWeight={600}>Certificate</Typography>
                                        </Box>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={values.isCertificate}
                                                    onChange={(e) => setFieldValue('isCertificate', e.target.checked)}
                                                />
                                            }
                                            label="Issue Certificate on Completion"
                                        />
                                        {values.isCertificate && (
                                            <TextField
                                                fullWidth label="Certificate Name" name="certificateName" margin="dense"
                                                value={values.certificateName} onChange={handleChange}
                                                placeholder="e.g. Certificate of Completion – Graphic Design"
                                            />
                                        )}
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* GST */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <ReceiptLongIcon color="warning" fontSize="small" />
                                            <Typography fontWeight={600}>GST Settings</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <TextField
                                                select label="GST Type" name="gstType" value={values.gstType}
                                                onChange={handleChange} sx={{ minWidth: 180 }}
                                            >
                                                <MenuItem value="none">No GST</MenuItem>
                                                <MenuItem value="inclusive">Inclusive (GST in price)</MenuItem>
                                                <MenuItem value="exclusive">Exclusive (GST added on top)</MenuItem>
                                            </TextField>
                                            {values.gstType !== 'none' && (
                                                <TextField
                                                    label="GST %" name="gstPercent" type="number" value={values.gstPercent}
                                                    onChange={handleChange}
                                                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                                    sx={{ width: 120 }}
                                                    inputProps={{ min: 0, max: 100 }}
                                                />
                                            )}
                                        </Box>
                                        {values.gstType !== 'none' && values.price > 0 && (
                                            <Box sx={{ mt: 1, p: 1.5, bgcolor: 'warning.light', borderRadius: 1, opacity: 0.8 }}>
                                                <Typography variant="caption">
                                                    {values.gstType === 'inclusive'
                                                        ? `GST Amount: ₹${((values.price * values.gstPercent) / (100 + values.gstPercent)).toFixed(2)} (included in ₹${values.price})`
                                                        : `Total Payable: ₹${(values.price * (1 + values.gstPercent / 100)).toFixed(2)} (Base ₹${values.price} + ${values.gstPercent}% GST)`
                                                    }
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Device Access */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <DevicesIcon color="info" fontSize="small" />
                                            <Typography fontWeight={600}>Access Device</Typography>
                                        </Box>
                                        <ToggleButtonGroup
                                            value={values.accessDevice}
                                            exclusive
                                            onChange={(_, value) => value && setFieldValue('accessDevice', value)}
                                            size="small"
                                        >
                                            <ToggleButton value="mobile">
                                                <PhoneAndroidIcon sx={{ mr: 0.5 }} fontSize="small" /> Mobile Only
                                            </ToggleButton>
                                            <ToggleButton value="desktop">
                                                <DesktopWindowsIcon sx={{ mr: 0.5 }} fontSize="small" /> Desktop Only
                                            </ToggleButton>
                                            <ToggleButton value="both">
                                                <DevicesIcon sx={{ mr: 0.5 }} fontSize="small" /> Both
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Fake Likes */}
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <ThumbUpAltIcon color="success" fontSize="small" />
                                            <Typography fontWeight={600}>Social Proof (Fake Likes)</Typography>
                                        </Box>
                                        <TextField
                                            label="Fake Like Count (shown to users)" name="fakeLikes" type="number"
                                            value={values.fakeLikes} onChange={handleChange}
                                            InputProps={{ startAdornment: <InputAdornment position="start">👍</InputAdornment> }}
                                            helperText="This number is shown on the course page to increase trust"
                                            sx={{ width: 280 }}
                                            inputProps={{ min: 0 }}
                                        />
                                    </Box>

                                </Box>
                            </Collapse>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Course'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default CourseFormModal;
