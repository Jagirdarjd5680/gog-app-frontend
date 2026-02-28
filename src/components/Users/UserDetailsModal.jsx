import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab,
    Box,
    Typography,
    Divider,
    Grid,
    Avatar,
    Chip,
    LinearProgress,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Paper,
    Stack
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SyncIcon from '@mui/icons-material/Sync';
import PaymentIcon from '@mui/icons-material/Payment';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`user-details-tabpanel-${index}`}
            aria-labelledby={`user-details-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const UserDetailsModal = ({ open, onClose, userId }) => {
    const [value, setValue] = useState(0);
    const [user, setUser] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && userId) {
            console.log('Modal opened, fetching data for userId:', userId);
            fetchUserDetails();
            fetchUserPayments();
        }
    }, [open, userId]);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/users/${userId}`);
            if (response.data.success) {
                setUser(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load user details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    // Helper function to calculate correct expiry date (1 month = 30 days from activation)
    const calculateCorrectExpiry = (activationDate, backendExpiryDate) => {
        // If backend gives a valid future date that's after activation, use it
        if (backendExpiryDate && activationDate) {
            const activation = new Date(activationDate);
            const expiry = new Date(backendExpiryDate);
            // Check if expiry is after activation (at least 1 day)
            if (expiry > activation && (expiry - activation) >= 24 * 60 * 60 * 1000) {
                return backendExpiryDate;
            }
        }
        // Otherwise calculate 30 days from activation
        if (activationDate) {
            const activation = new Date(activationDate);
            const correctExpiry = new Date(activation);
            correctExpiry.setDate(activation.getDate() + 30); // 1 month = 30 days
            return correctExpiry;
        }
        return null;
    };

    const handleSyncSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/users/${userId}/sync-subscriptions`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchUserDetails(); // Refresh data
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    };

    // Fetch user payment history
    const fetchUserPayments = async () => {
        console.log('Fetching payments for userId:', userId);
        try {
            const response = await api.get(`/payments/user/${userId}`);
            console.log('Payment API response:', response.data);
            if (response.data.success) {
                console.log('Payments found:', response.data.data?.length || 0);
                setPayments(response.data.data || []);
            } else {
                console.log('API returned success:false', response.data);
                setPayments([]);
            }
        } catch (error) {
            console.error('Payment fetch error:', error);
            console.error('Error response:', error.response?.data);
            setPayments([]);
        }
    };

    if (!user && loading) return null; // Or a skeleton

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={user?.avatar}
                        sx={{ width: 50, height: 50, bgcolor: 'primary.main' }}
                    >
                        {user?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Student ID: {user?.rollNumber || 'N/A'}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleTabChange} sx={{ px: 2 }}>
                        <Tab label="General" icon={<PersonIcon size="small" />} iconPosition="start" />
                        <Tab label="Course" icon={<MenuBookIcon size="small" />} iconPosition="start" />
                        <Tab label="Exam" icon={<AssignmentIcon size="small" />} iconPosition="start" />
                        <Tab label="Payment" icon={<PaymentIcon size="small" />} iconPosition="start" />
                    </Tabs>
                </Box>

                <TabPanel value={value} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Full Name</Typography>
                            <Typography variant="body1" fontWeight={500}>{user?.name}</Typography>
                            <Divider sx={{ my: 1.5 }} />

                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Email Address</Typography>
                            <Typography variant="body1" fontWeight={500}>{user?.email}</Typography>
                            <Divider sx={{ my: 1.5 }} />

                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Phone Number</Typography>
                            <Typography variant="body1" fontWeight={500}>{user?.phone || 'Not Provided'}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Account Status</Typography>
                                <Chip
                                    label={user?.isActive ? 'Active' : 'Inactive'}
                                    color={user?.isActive ? 'success' : 'default'}
                                    size="small"
                                />
                                <Divider sx={{ my: 1.5 }} />

                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Enrolled Courses</Typography>
                                <Typography variant="h6" fontWeight={700}>{user?.enrolledCourses?.length || 0}</Typography>
                                <Divider sx={{ my: 1.5 }} />

                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Last Activity</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <AccessTimeIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        {user?.lastSeen ? format(new Date(user.lastSeen), 'PPpp') : 'Never'}
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>

                <TabPanel value={value} index={1}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            startIcon={<SyncIcon />}
                            variant="outlined"
                            size="small"
                            onClick={handleSyncSubscriptions}
                            disabled={loading}
                        >
                            Sync Subscriptions
                        </Button>
                    </Box>
                    {user?.coursesWithDetails?.length > 0 ? (
                        <List spacing={2}>
                            {user.coursesWithDetails.map((course) => (
                                <Paper key={course._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            variant="rounded"
                                            src={course.thumbnail}
                                            sx={{ width: 60, height: 60, bgcolor: 'primary.light' }}
                                        >
                                            <MenuBookIcon />
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={700}>{course.title}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                    <LinearProgress variant="determinate" value={course.progress} sx={{ height: 8, borderRadius: 4 }} />
                                                </Box>
                                                <Box sx={{ minWidth: 35 }}>
                                                    <Typography variant="body2" color="text.secondary">{`${Math.round(course.progress)}%`}</Typography>
                                                </Box>
                                            </Box>
                                            <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">Activation</Typography>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {course.activationDate ? format(new Date(course.activationDate), 'MMM dd, yyyy') : 'N/A'}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">Expiry</Typography>
                                                    <Typography variant="body2" fontWeight={500} color={
                                                        calculateCorrectExpiry(course.activationDate, course.expiryDate) && 
                                                        new Date(calculateCorrectExpiry(course.activationDate, course.expiryDate)) < new Date() 
                                                        ? 'error.main' : 'text.primary'
                                                    }>
                                                        {course.activationDate 
                                                            ? format(calculateCorrectExpiry(course.activationDate, course.expiryDate), 'MMM dd, yyyy')
                                                            : 'Lifetime'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Paper>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ py: 5, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">No courses enrolled yet.</Typography>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={value} index={2}>
                    {user?.examResults?.length > 0 ? (
                        <Grid container spacing={2}>
                            {user.examResults.map((result) => (
                                <Grid item xs={12} key={result._id}>
                                    <Paper variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={700}>{result.exam?.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Taken on: {format(new Date(result.createdAt), 'PPpp')}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h6" fontWeight={700} color={result.passed ? 'success.main' : 'error.main'}>
                                                    {result.score}/{result.maxScore}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {result.percentage.toFixed(1)}% Score
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={result.passed ? 'PASSED' : 'FAILED'}
                                                color={result.passed ? 'success' : 'error'}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </Stack>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ py: 5, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">No exams taken yet.</Typography>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={value} index={3}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            startIcon={<SyncIcon />}
                            variant="outlined"
                            size="small"
                            onClick={fetchUserPayments}
                            disabled={loading}
                        >
                            Refresh Payments
                        </Button>
                    </Box>
                    {payments?.length > 0 ? (
                        <List spacing={2}>
                            {payments.map((payment) => (
                                <Paper key={payment._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {payment.courseName || payment.course?.title || 'Course Payment'}
                                            </Typography>
                                            <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">Amount</Typography>
                                                    <Typography variant="body2" fontWeight={600} color="primary.main">
                                                        ₹{payment.amount?.toLocaleString() || '0'}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">Payment Date</Typography>
                                                    <Typography variant="body2">
                                                        {payment.paymentDate ? format(new Date(payment.paymentDate), 'MMM dd, yyyy') : 'N/A'}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">Payment ID</Typography>
                                                    <Typography variant="body2" fontFamily="monospace">
                                                        {payment.paymentId || payment.transactionId || 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                        <Chip
                                            label={payment.status || 'Completed'}
                                            color={payment.status === 'completed' || payment.status === 'success' ? 'success' : 'warning'}
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </Stack>
                                </Paper>
                            ))}
                        </List>
                    ) : user?.payments?.length > 0 ? (
                        // Fallback: Check if payments are in user object
                        <List spacing={2}>
                            {user.payments.map((payment) => (
                                <Paper key={payment._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={700}>
                                                {payment.courseName || payment.course?.title || 'Course Payment'}
                                            </Typography>
                                            <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">Amount</Typography>
                                                    <Typography variant="body2" fontWeight={600} color="primary.main">
                                                        ₹{payment.amount?.toLocaleString() || '0'}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">Payment Date</Typography>
                                                    <Typography variant="body2">
                                                        {payment.paymentDate ? format(new Date(payment.paymentDate), 'MMM dd, yyyy') : 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Box>
                                        <Chip
                                            label={payment.status || 'Completed'}
                                            color={payment.status === 'completed' || payment.status === 'success' ? 'success' : 'warning'}
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </Stack>
                                </Paper>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ py: 5, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">No payment history found.</Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                User ID: {userId}
                            </Typography>
                        </Box>
                    )}
                </TabPanel>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDetailsModal;
