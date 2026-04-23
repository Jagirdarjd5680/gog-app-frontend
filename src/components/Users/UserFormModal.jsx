import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    FormControlLabel,
    Switch,
    Autocomplete,
    Chip,
    Typography,
    Box,
    Checkbox,
    FormGroup,
    Grid,
    Alert,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EmailIcon from '@mui/icons-material/Email';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string(),
    role: Yup.string().required('Role is required'),
    source: Yup.string(),
    authMethod: Yup.string(),
});

const UserFormModal = ({ open, onClose, user, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [allBatches, setAllBatches] = useState([]);
    const [autoGenPassword, setAutoGenPassword] = useState(!user);
    const [credentialsSent, setCredentialsSent] = useState(false);
    const [courseFees, setCourseFees] = useState({});

    // Fetch existing fee records if editing
    useEffect(() => {
        if (user?._id) {
            fetchExistingFeeRecords();
        }
    }, [user]);

    const fetchExistingFeeRecords = async () => {
        try {
            const response = await api.get(`/fee-records/user/${user._id}`);
            if (response.data.success) {
                const feesMap = {};
                response.data.data.forEach(record => {
                    feesMap[record.course._id] = {
                        feeRecordId: record._id,
                        totalFee: record.totalFee,
                        discount: record.discount,
                        finalFee: record.finalFee,
                        emiEnabled: record.emiEnabled,
                        emiCount: record.emiCount,
                        paidAmount: record.paidAmount,
                        remainingAmount: record.remainingAmount,
                        payments: record.payments || [],
                        newPayments: []
                    };
                });
                setCourseFees(feesMap);
            }
        } catch (error) {
            console.error('Error fetching fee records:', error);
        }
    };

    useEffect(() => {
        if (open) {
            fetchCourses();
            fetchAllBatches();
            setAutoGenPassword(!user);
            setCredentialsSent(false);
        }
    }, [open, user]);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchAllBatches = async () => {
        try {
            const response = await api.get('/batches');
            if (response.data.success) {
                setAllBatches(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching batches:', error);
        }
    };

    const initialValues = {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        role: user?.role || 'student',
        password: '',
        isActive: user?.isActive !== undefined ? user.isActive : true,
        source: user?.source || 'web',
        authMethod: user?.authMethod || 'email',
        enrolledCourses: user?.enrolledCourses?.map(c => typeof c === 'object' ? c._id : c) || [],
        batches: user?.batches || (user?.batch ? [user.batch] : []),
        permissions: user?.permissions || 'fullControl',
        moduleAccess: user?.moduleAccess || [],
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        let newUserId = null;
        try {
            // --- Pre-validate Fee Records ---
            for (const courseId of values.enrolledCourses) {
                const feeData = courseFees[courseId];
                if (!feeData) continue;
                const pastTotal = (feeData.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                const newTotal = (feeData.newPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                if (pastTotal + newTotal > (feeData.finalFee || 0)) {
                    toast.error(`Total payments exceed final fee for one of the courses.`);
                    setLoading(false);
                    return;
                }
            }
            // --------------------------------

            if (user) {
                // Update
                await api.put(`/users/${user._id}`, values);
                toast.success('User updated successfully');
            } else {
                // Create with optional auto-generated password
                const payload = {
                    ...values,
                    autoGeneratePassword: autoGenPassword,
                    password: autoGenPassword ? undefined : values.password,
                };
                const res = await api.post('/users', payload);
                newUserId = res.data.data._id;
                if (res.data.credentialsSent) {
                    setCredentialsSent(true);
                    toast.success(`✅ User created & credentials sent to ${values.email}`);
                } else {
                    toast.success('User created successfully');
                    if (values.role === 'student' && values.email) {
                        toast.warn('⚠️ Could not send credential email — check SMTP settings.');
                    }
                }
            }

            // --- Handle Fee Records & Payments ---
            const targetUserId = user ? user._id : newUserId;
            
            for (const courseId of values.enrolledCourses) {
                const feeData = courseFees[courseId];
                if (!feeData) continue;

                if (feeData.feeRecordId) {
                    // Combine past and new payments
                    const combinedPayments = [...(feeData.payments || []), ...(feeData.newPayments || [])]
                        .filter(p => p.amount && Number(p.amount) > 0)
                        .map(p => ({
                            amount: Number(p.amount),
                            method: p.method || 'cash',
                            note: p.note || '',
                            paidAt: p.paidAt || new Date(),
                            recordedBy: p.recordedBy || undefined
                        }));

                    // Update existing fee record if needed (discount, emi, notes, payments)
                    await api.put(`/fee-records/${feeData.feeRecordId}`, {
                        discount: feeData.discount,
                        emiEnabled: feeData.emiEnabled,
                        emiCount: feeData.emiCount,
                        payments: combinedPayments
                    });
                } else {
                    // Combine new payments for new record
                    const initialPayments = (feeData.newPayments || [])
                        .filter(p => p.amount && Number(p.amount) > 0)
                        .map(p => ({
                            amount: Number(p.amount),
                            method: p.method || 'cash',
                            note: p.note || '',
                            paidAt: new Date()
                        }));

                    // Create new fee record
                    await api.post('/fee-records', {
                        user: targetUserId,
                        course: courseId,
                        batch: values.batches?.length > 0 ? allBatches.find(b => values.batches.includes(b.name))?._id : null,
                        totalFee: feeData.totalFee || 0,
                        discount: feeData.discount || 0,
                        finalFee: feeData.finalFee || 0,
                        emiEnabled: feeData.emiEnabled || false,
                        emiCount: feeData.emiCount || 1,
                        initialPayment: initialPayments.length > 0 ? initialPayments[0].amount : 0,
                        payments: initialPayments
                    });
                }
            }
            // -------------------------------------

            onSuccess();
            if (!autoGenPassword || user) onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{ 
                                        mb: 3, 
                                        p: 2.5, 
                                        bgcolor: 'primary.50', 
                                        borderRadius: 3, 
                                        border: '1px solid', 
                                        borderColor: 'primary.100',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                                    }}>
                                        <Typography variant="subtitle2" gutterBottom fontWeight={800} color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                                            1. Assign Courses (Required First)
                                        </Typography>
                                        <Autocomplete
                                            multiple
                                            id="enrolledCourses"
                                            options={courses}
                                            getOptionLabel={(option) => option.title}
                                            value={courses.filter(c => values.enrolledCourses?.includes(c._id))}
                                            onChange={(event, newValue) => {
                                                const newCourseIds = newValue.map(v => v._id);
                                                setFieldValue('enrolledCourses', newCourseIds);
                                                
                                                // Initialize fee data for newly selected courses
                                                const newFeeState = { ...courseFees };
                                                newValue.forEach(c => {
                                                    if (!newFeeState[c._id]) {
                                                        const finalPrice = c.price || 0;
                                                        newFeeState[c._id] = {
                                                            totalFee: finalPrice,
                                                            discount: 0,
                                                            finalFee: finalPrice,
                                                            emiEnabled: false,
                                                            emiCount: 1,
                                                            newPaymentAmount: '',
                                                            newPaymentMethod: 'cash',
                                                            newPaymentNote: ''
                                                        };
                                                    }
                                                });
                                                setCourseFees(newFeeState);
                                            }}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Select Courses" 
                                                    placeholder="Choose courses first..." 
                                                    sx={{ 
                                                        '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }
                                                    }}
                                                />
                                            )}
                                            renderTags={(tagValue, getTagProps) =>
                                                tagValue.map((option, index) => {
                                                    const { key, ...tagProps } = getTagProps({ index });
                                                    return (
                                                        <Chip
                                                            key={key}
                                                            label={option.title}
                                                            {...tagProps}
                                                            color="primary"
                                                            size="small"
                                                            sx={{ borderRadius: 1.5, fontWeight: 600 }}
                                                        />
                                                    );
                                                })
                                            }
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    {user?.rollNumber ? (
                                        <TextField
                                            fullWidth
                                            label="Roll Number"
                                            value={user.rollNumber}
                                            margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            InputProps={{ readOnly: true }}
                                            variant="filled"
                                            helperText="Auto-generated ID"
                                        />
                                    ) : (
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            name="phone"
                                            value={values.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    )}
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={values.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                        margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    {!user && (
                                        <Box>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={autoGenPassword}
                                                        onChange={(e) => setAutoGenPassword(e.target.checked)}
                                                        color="secondary"
                                                    />
                                                }
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <AutoAwesomeIcon sx={{ fontSize: 16, color: 'secondary.main' }} />
                                                        <span>Auto-generate password & email credentials</span>
                                                    </Box>
                                                }
                                                sx={{ mt: 1 }}
                                            />
                                            {!autoGenPassword && (
                                                <TextField
                                                    fullWidth
                                                    label="Account Password"
                                                    name="password"
                                                    type="password"
                                                    value={values.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                                    required
                                                    placeholder="Min 6 characters"
                                                />
                                            )}
                                            {autoGenPassword && (
                                                <Alert icon={<EmailIcon />} severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                                                    A secure password will be auto-generated and emailed to the student.
                                                </Alert>
                                            )}
                                        </Box>
                                    )}
                                    {user && user.rollNumber && (
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            name="phone"
                                            value={values.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    )}
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="User Role"
                                        name="role"
                                        value={values.role}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.role && Boolean(errors.role)}
                                        helperText={touched.role && errors.role}
                                        margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="student">Student</MenuItem>
                                        <MenuItem value="teacher">Teacher</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        multiple
                                        id="batches"
                                        options={allBatches.filter(b => 
                                            values.enrolledCourses.includes(b.course?._id || b.course)
                                        )}
                                        getOptionLabel={(option) => option.name}
                                        value={allBatches.filter(b => values.batches?.includes(b.name))}
                                        onChange={(event, newValue) => {
                                            setFieldValue('batches', newValue.map(v => v.name));
                                        }}
                                        disabled={values.enrolledCourses.length === 0}
                                        renderInput={(params) => (
                                            <TextField 
                                                {...params} 
                                                label="Assign Batches (Filtered by Course)" 
                                                placeholder={values.enrolledCourses.length === 0 ? "Select courses first" : "Search batches..."}
                                                margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                            />
                                        )}
                                        renderTags={(tagValue, getTagProps) =>
                                            tagValue.map((option, index) => {
                                                const { key, ...tagProps } = getTagProps({ index });
                                                return (
                                                    <Chip
                                                        key={key}
                                                        label={option.name}
                                                        {...tagProps}
                                                        color="info"
                                                        size="small"
                                                        sx={{ borderRadius: 1.5, fontWeight: 600, bgcolor: 'info.soft' }}
                                                    />
                                                );
                                            })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Signup Source"
                                        name="source"
                                        value={values.source}
                                        onChange={handleChange}
                                        margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="web">Web Portal</MenuItem>
                                        <MenuItem value="android">Android App</MenuItem>
                                        <MenuItem value="ios">iOS App</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Auth Method"
                                        name="authMethod"
                                        value={values.authMethod}
                                        onChange={handleChange}
                                        margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="email">Email/Password</MenuItem>
                                        <MenuItem value="google">Google Login</MenuItem>
                                        <MenuItem value="phone">Phone/OTP</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 2 }}>
                                <FormControlLabel
                                    control={<Switch checked={values.isActive} onChange={handleChange} name="isActive" />}
                                    label="Account Active"
                                />
                            </Box>

                            {values.role === 'student' && (
                                <>
                                    {/* Moved Assign Courses to top */}

                                    {/* Fee Config Accordions */}
                                    {values.enrolledCourses?.length > 0 && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant="subtitle2" gutterBottom>Course Fee & Payments</Typography>
                                            {values.enrolledCourses.map(courseId => {
                                                const courseObj = courses.find(c => c._id === courseId);
                                                const feeState = courseFees[courseId];
                                                if (!courseObj || !feeState) return null;

                                                const currentPastTotal = (feeState.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                                                const currentNewTotal = (feeState.newPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                                                const totalEntered = currentPastTotal + currentNewTotal;
                                                const isOverpaid = totalEntered > (feeState.finalFee || 0);

                                                return (
                                                    <Accordion key={courseId} variant="outlined" sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' }, borderColor: isOverpaid ? 'error.main' : 'divider' }}>
                                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                            <Typography fontWeight={600}>{courseObj.title}</Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            <Grid container spacing={2}>
                                                                <Grid item xs={12} sm={4}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Total Fee"
                                                                        type="number"
                                                                        value={feeState.totalFee}
                                                                        onChange={(e) => {
                                                                            const t = Number(e.target.value);
                                                                            setCourseFees(prev => ({
                                                                                ...prev,
                                                                                [courseId]: { ...feeState, totalFee: t, finalFee: t - (feeState.discount || 0) }
                                                                            }));
                                                                        }}
                                                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                                                        disabled={!!feeState.feeRecordId}
                                                                        size="small"
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} sm={4}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Discount"
                                                                        type="number"
                                                                        value={feeState.discount}
                                                                        onChange={(e) => {
                                                                            const d = Number(e.target.value);
                                                                            setCourseFees(prev => ({
                                                                                ...prev,
                                                                                [courseId]: { ...feeState, discount: d, finalFee: (feeState.totalFee || 0) - d }
                                                                            }));
                                                                        }}
                                                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                                                        size="small"
                                                                    />
                                                                </Grid>
                                                                <Grid item xs={12} sm={4}>
                                                                    <TextField
                                                                        fullWidth
                                                                        label="Final Fee"
                                                                        value={feeState.finalFee}
                                                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, readOnly: true }}
                                                                        size="small"
                                                                        variant="filled"
                                                                    />
                                                                </Grid>

                                                                {isOverpaid && (
                                                                    <Grid item xs={12}>
                                                                        <Alert severity="error" sx={{ py: 0, px: 2 }}>
                                                                            Error: Total entered payments (₹{totalEntered}) exceed the Final Fee (₹{feeState.finalFee})
                                                                        </Alert>
                                                                    </Grid>
                                                                )}

                                                                {feeState.feeRecordId && (
                                                                    <>
                                                                        <Grid item xs={6} sm={4}>
                                                                            <Typography variant="caption" color="text.secondary">Already Paid: ₹{feeState.paidAmount}</Typography>
                                                                        </Grid>
                                                                        <Grid item xs={6} sm={4}>
                                                                            <Typography variant="caption" color={feeState.remainingAmount > 0 ? 'error.main' : 'success.main'}>Remaining: ₹{feeState.remainingAmount}</Typography>
                                                                        </Grid>
                                                                        {feeState.payments?.length > 0 && (
                                                                            <Grid item xs={12}>
                                                                                <Typography variant="caption" fontWeight={600} display="block" mb={1} color="text.secondary">Past Payments (Editable):</Typography>
                                                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                                    {feeState.payments.map((payment, idx) => (
                                                                                        <Box key={`past-${idx}`} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                                                            <TextField
                                                                                                fullWidth
                                                                                                label="Amount"
                                                                                                type="number"
                                                                                                value={payment.amount}
                                                                                                onChange={(e) => {
                                                                                                    const updated = [...feeState.payments];
                                                                                                    updated[idx].amount = e.target.value;
                                                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                                                }}
                                                                                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                                                                                size="small"
                                                                                            />
                                                                                            <TextField
                                                                                                fullWidth
                                                                                                select
                                                                                                label="Method"
                                                                                                value={payment.method || 'cash'}
                                                                                                onChange={(e) => {
                                                                                                    const updated = [...feeState.payments];
                                                                                                    updated[idx].method = e.target.value;
                                                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                                                }}
                                                                                                size="small"
                                                                                            >
                                                                                                <MenuItem value="cash">Cash</MenuItem>
                                                                                                <MenuItem value="upi">UPI</MenuItem>
                                                                                                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                                                                                                <MenuItem value="online">Online</MenuItem>
                                                                                                <MenuItem value="cheque">Cheque</MenuItem>
                                                                                            </TextField>
                                                                                            <IconButton 
                                                                                                color="error" 
                                                                                                size="small"
                                                                                                onClick={() => {
                                                                                                    const updated = feeState.payments.filter((_, i) => i !== idx);
                                                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                                                }}
                                                                                            >
                                                                                                <DeleteIcon fontSize="small" />
                                                                                            </IconButton>
                                                                                        </Box>
                                                                                    ))}
                                                                                </Box>
                                                                            </Grid>
                                                                        )}
                                                                    </>
                                                                )}

                                                                <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                                                                    <Typography variant="caption" fontWeight={600} color="primary">
                                                                        {feeState.feeRecordId ? 'Add New Payment(s)' : 'Initial Payment(s)'}
                                                                    </Typography>
                                                                    <Button
                                                                        size="small"
                                                                        startIcon={<AddIcon />}
                                                                        onClick={() => {
                                                                            setCourseFees(prev => ({
                                                                                ...prev,
                                                                                [courseId]: {
                                                                                    ...feeState,
                                                                                    newPayments: [...(feeState.newPayments || []), { id: Date.now(), amount: '', method: 'cash', note: '' }]
                                                                                }
                                                                            }));
                                                                        }}
                                                                    >
                                                                        Payment
                                                                    </Button>
                                                                </Grid>

                                                                {feeState.newPayments?.map((payment, index) => (
                                                                    <Grid item xs={12} key={payment.id || index}>
                                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                                            <TextField
                                                                                fullWidth
                                                                                label="Amount"
                                                                                type="number"
                                                                                value={payment.amount}
                                                                                onChange={(e) => {
                                                                                    const updated = [...feeState.newPayments];
                                                                                    updated[index].amount = e.target.value;
                                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                                                }}
                                                                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                                                                size="small"
                                                                            />
                                                                            <TextField
                                                                                fullWidth
                                                                                select
                                                                                label="Method"
                                                                                value={payment.method}
                                                                                onChange={(e) => {
                                                                                    const updated = [...feeState.newPayments];
                                                                                    updated[index].method = e.target.value;
                                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                                                }}
                                                                                size="small"
                                                                            >
                                                                                <MenuItem value="cash">Cash</MenuItem>
                                                                                <MenuItem value="upi">UPI</MenuItem>
                                                                                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                                                                                <MenuItem value="online">Online</MenuItem>
                                                                                <MenuItem value="cheque">Cheque</MenuItem>
                                                                            </TextField>
                                                                            <IconButton 
                                                                                color="error" 
                                                                                size="small"
                                                                                onClick={() => {
                                                                                    const updated = feeState.newPayments.filter((_, i) => i !== index);
                                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                                                }}
                                                                            >
                                                                                <DeleteIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
                                                                    </Grid>
                                                                ))}

                                                                <Grid item xs={12}>
                                                                    <Divider sx={{ my: 0.5 }} />
                                                                </Grid>
                                                                <Grid item xs={12} sm={6}>
                                                                    <FormControlLabel
                                                                        control={<Switch size="small" checked={feeState.emiEnabled} onChange={(e) => setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, emiEnabled: e.target.checked } }))} />}
                                                                        label={<Typography variant="body2">Enable EMI</Typography>}
                                                                    />
                                                                    {feeState.emiEnabled && (
                                                                        <TextField
                                                                            fullWidth
                                                                            label="EMI Count"
                                                                            type="number"
                                                                            size="small"
                                                                            value={feeState.emiCount}
                                                                            onChange={(e) => setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, emiCount: Number(e.target.value) } }))}
                                                                            sx={{ mt: 1 }}
                                                                        />
                                                                    )}
                                                                </Grid>
                                                            </Grid>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                );
                                            })}
                                        </Box>
                                    )}
                                </>
                            )}

                            {values.role === 'teacher' && (
                                <>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Permissions"
                                        name="permissions"
                                        value={values.permissions}
                                        onChange={handleChange}
                                        margin="normal"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                    >
                                        <MenuItem value="read">Only Read</MenuItem>
                                        <MenuItem value="readWrite">Read and Write</MenuItem>
                                        <MenuItem value="fullControl">Full Control (Own Work)</MenuItem>
                                    </TextField>

                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2">Module Access</Typography>
                                        <FormGroup>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('courseManagement')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'courseManagement']
                                                                : values.moduleAccess.filter(i => i !== 'courseManagement');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Course Management"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('examManagement')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'examManagement']
                                                                : values.moduleAccess.filter(i => i !== 'examManagement');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Exam Management"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('questionManagement')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'questionManagement']
                                                                : values.moduleAccess.filter(i => i !== 'questionManagement');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Question Management"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('mediaAccess')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'mediaAccess']
                                                                : values.moduleAccess.filter(i => i !== 'mediaAccess');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Media Access"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('liveClasses')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'liveClasses']
                                                                : values.moduleAccess.filter(i => i !== 'liveClasses');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Live Classes"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('assignments')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'assignments']
                                                                : values.moduleAccess.filter(i => i !== 'assignments');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Assignments"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('notifications')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'notifications']
                                                                : values.moduleAccess.filter(i => i !== 'notifications');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Notifications"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('coupons')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'coupons']
                                                                : values.moduleAccess.filter(i => i !== 'coupons');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Coupons"
                                            />
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={values.moduleAccess.includes('chatAccess')}
                                                        onChange={(e) => {
                                                            const nextValue = e.target.checked
                                                                ? [...values.moduleAccess, 'chatAccess']
                                                                : values.moduleAccess.filter(i => i !== 'chatAccess');
                                                            setFieldValue('moduleAccess', nextValue);
                                                        }}
                                                    />
                                                }
                                                label="Chat Access"
                                            />
                                        </FormGroup>
                                    </Box>
                                </>
                            )}
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={onClose}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog >
    );
};

export default UserFormModal;
