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
    CircularProgress,
    InputAdornment,
    Switch,
    FormControlLabel,
    Autocomplete,
    IconButton,
    Tooltip
} from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CouponForm = ({ open, onClose, initialData, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);

    // ... (rest of state)

    const generateCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: 0,
        maxDiscountAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        usageLimit: '',
        perUserLimit: 1,
        applicableType: 'all',
        applicableIds: [],
        isActive: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                startDate: initialData.startDate?.split('T')[0] || '',
                endDate: initialData.endDate?.split('T')[0] || '',
                // Ensure applicableIds is an array
                applicableIds: initialData.applicableIds || []
            });
        }

        // Fetch courses if needed
        fetchCourses();
        fetchUsers();
    }, [initialData]);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            // Check if data.data exists (pagination) or directly array
            setCourses(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            // Handle different possible response structures
            let userList = [];
            if (Array.isArray(data)) {
                userList = data;
            } else if (Array.isArray(data.users)) {
                userList = data.users;
            } else if (data.data && Array.isArray(data.data)) {
                userList = data.data;
            }
            setUsers(userList);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.code || !formData.discountValue || !formData.endDate) {
            toast.warning('Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                // Ensure number types
                discountValue: Number(formData.discountValue),
                minPurchaseAmount: Number(formData.minPurchaseAmount),
                maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                perUserLimit: Number(formData.perUserLimit),
            };

            if (initialData?._id) {
                await api.put(`/coupons/${initialData._id}`, payload);
                toast.success('Coupon updated successfully');
            } else {
                await api.post('/coupons', payload);
                toast.success('Coupon created successfully');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving coupon:', error);
            const msg = error.response?.data?.msg || 'Failed to save coupon';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{initialData ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Coupon Code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            disabled={!!initialData}
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Generate Random Code">
                                            <IconButton onClick={generateCode} edge="end">
                                                <AutorenewIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    name="isActive"
                                    color="primary"
                                />
                            }
                            label="Active Status"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={2}
                        />
                    </Grid>

                    {/* Discount Settings */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Discount Type</InputLabel>
                            <Select
                                name="discountType"
                                value={formData.discountType}
                                onChange={handleChange}
                                label="Discount Type"
                            >
                                <MenuItem value="percentage">Percentage (%)</MenuItem>
                                <MenuItem value="flat">Flat Amount (₹)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Discount Value"
                            name="discountValue"
                            type="number"
                            value={formData.discountValue}
                            onChange={handleChange}
                            required
                            InputProps={{
                                endAdornment: <InputAdornment position="end">{formData.discountType === 'percentage' ? '%' : '₹'}</InputAdornment>,
                            }}
                        />
                    </Grid>

                    {/* Dates */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="End Date"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    {/* Usage Limits */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Total Usage Limit"
                            name="usageLimit"
                            type="number"
                            value={formData.usageLimit}
                            onChange={handleChange}
                            helperText="Total times coupon can be used (Leave empty for unlimited)"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Per User Limit"
                            name="perUserLimit"
                            type="number"
                            value={formData.perUserLimit}
                            onChange={handleChange}
                            helperText="Max uses per user"
                        />
                    </Grid>

                    {/* Applicability */}
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Applicable To</InputLabel>
                            <Select
                                name="applicableType"
                                value={formData.applicableType}
                                onChange={handleChange}
                                label="Applicable To"
                            >
                                <MenuItem value="all">All Courses / Global</MenuItem>
                                <MenuItem value="course">Specific Courses</MenuItem>
                                <MenuItem value="user">Specific Users</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {formData.applicableType === 'course' && (
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={courses}
                                getOptionLabel={(option) => option.title}
                                value={courses.filter(c => formData.applicableIds.includes(c._id))}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        applicableIds: newValue.map(item => item._id)
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Courses" placeholder="Courses" />
                                )}
                            />
                        </Grid>
                    )}

                    {formData.applicableType === 'user' && (
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={users}
                                getOptionLabel={(option) => option.name || option.email || option._id}
                                value={users.filter(u => formData.applicableIds.includes(u._id))}
                                onChange={(event, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        applicableIds: newValue.map(item => item._id)
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Select Users" placeholder="Search Users..." />
                                )}
                            />
                        </Grid>
                    )}

                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : (initialData ? 'Update Coupon' : 'Create Coupon')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CouponForm;
