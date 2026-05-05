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
    Stack,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { format } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SyncIcon from '@mui/icons-material/Sync';
import DownloadIcon from '@mui/icons-material/Download';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import UserAttendanceCalendar from './UserAttendanceCalendar';
import PaymentIcon from '@mui/icons-material/Payment';
import GroupsIcon from '@mui/icons-material/Groups';
import BadgeIcon from '@mui/icons-material/Badge';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FaceCapture from './FaceCapture';
import { fixUrl } from '../../utils/api';
import UserFeeHistory from './UserFeeHistory';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { TextField } from '@mui/material';

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
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedProfile, setEditedProfile] = useState({});

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
                setEditedProfile(response.data.data.studentProfile || {});
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

    // Fetch user assignment submissions
    const fetchUserSubmissions = async () => {
        try {
            const response = await api.get(`/users/${userId}/submissions`);
            if (response.data.success) {
                setSubmissions(response.data.data || []);
            }
        } catch (error) {
            console.error('Submission fetch error:', error);
        }
    };

    const handleApproveRegistration = async () => {
        setActionLoading(true);
        try {
            const response = await api.post(`/users/${userId}/approve-registration`);
            if (response.data.success) {
                toast.success('Registration approved and email sent with PDF');
                fetchUserDetails(); // Refresh status
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve registration');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectRegistration = async () => {
        if (!window.confirm('Are you sure you want to REJECT this registration? The student will need to resubmit.')) return;
        setActionLoading(true);
        try {
            const response = await api.post(`/users/${userId}/reject-registration`);
            if (response.data.success) {
                toast.warn('Registration rejected');
                fetchUserDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject registration');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setActionLoading(true);
        try {
            const response = await api.put(`/users/${userId}/student-profile-admin`, {
                profileData: editedProfile
            });
            if (response.data.success) {
                toast.success('Profile updated successfully');
                setIsEditingProfile(false);
                fetchUserDetails();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setActionLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setEditedProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        if (value === 5) fetchUserSubmissions();
    }, [value, userId]);

    if (!user && loading) return null; // Or a skeleton

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
                        <Tab label="Personal Info" icon={<BadgeIcon size="small" />} iconPosition="start" />
                        <Tab label="Assignments" icon={<ListAltIcon size="small" />} iconPosition="start" />
                        <Tab label="Face ID" icon={<CameraAltIcon size="small" />} iconPosition="start" />
                        <Tab label="Attendance" icon={<EventAvailableIcon size="small" />} iconPosition="start" />
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
                            <Divider sx={{ my: 1.5 }} />

                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Assigned Batches</Typography>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                                <GroupsIcon fontSize="small" color="primary" />
                                {(() => {
                                    const batches = user?.batches || (user?.batch ? [user.batch] : []);
                                    if (batches.length === 0) {
                                        return <Typography variant="body1" fontWeight={500} color="text.disabled">No Batches Assigned</Typography>;
                                    }
                                    return batches.map((b, i) => (
                                        <Chip
                                            key={i}
                                            label={b}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ fontWeight: 600, borderRadius: 1.5 }}
                                        />
                                    ));
                                })()}
                            </Stack>
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
                                            <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
                                                <Chip
                                                    label={`${course.assignmentCount || 0} Assignments`}
                                                    size="small"
                                                    sx={{ height: 24, fontSize: '0.7rem', bgcolor: 'rgba(99, 102, 241, 0.08)', color: 'primary.main', border: 'none', fontWeight: 600 }}
                                                />
                                                <Chip
                                                    label={`${course.examCount || 0} Exams`}
                                                    size="small"
                                                    sx={{ height: 24, fontSize: '0.7rem', bgcolor: 'rgba(233, 30, 99, 0.08)', color: 'error.main', border: 'none', fontWeight: 600 }}
                                                />
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
                    <UserFeeHistory userId={userId} user={user} />
                </TabPanel>

                <TabPanel value={value} index={4}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight={700}>Detailed Profile</Typography>
                        <Stack direction="row" spacing={1}>
                            {!isEditingProfile ? (
                                <Button startIcon={<EditIcon />} onClick={() => setIsEditingProfile(true)}>Edit Profile</Button>
                            ) : (
                                <Button startIcon={<SaveIcon />} color="success" onClick={handleSaveProfile} disabled={actionLoading}>Save Profile</Button>
                            )}

                            {user?.registrationStatus === 'pending' && (
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={handleApproveRegistration}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? <CircularProgress size={24} color="inherit" /> : 'Approve & Send PDF'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={handleRejectRegistration}
                                        disabled={actionLoading}
                                    >
                                        Reject
                                    </Button>
                                </Stack>
                            )}
                            {user?.registrationStatus === 'approved' && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label="OFFICIALLY REGISTERED" color="success" icon={<SyncIcon />} />
                                    <Button
                                        size="small"
                                        color="error"
                                        variant="text"
                                        onClick={handleRejectRegistration}
                                        disabled={actionLoading}
                                        sx={{ fontSize: '0.6rem' }}
                                    >
                                        (Reject Instead)
                                    </Button>
                                </Stack>
                            )}
                            {user?.registrationStatus === 'rejected' && (
                                <Chip label="REGISTRATION REJECTED" color="error" variant="outlined" />
                            )}
                        </Stack>
                    </Box>

                    {user?.studentProfile || isEditingProfile ? (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" color="primary" fontWeight={700}>Profile Information</Typography>
                                    <Chip label={user.studentProfile?.educationType || 'College'} size="small" color="secondary" variant="outlined" />
                                </Stack>
                                <Divider sx={{ mb: 2 }} />

                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'grey.50', width: '30%', fontWeight: 600 }}>Contact Number 2</TableCell>
                                                <TableCell>{isEditingProfile ? <TextField fullWidth size="small" name="contact2" value={editedProfile.contact2 || ''} onChange={handleProfileChange} /> : user.studentProfile?.contact2 || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Parent Details</TableCell>
                                                <TableCell>{isEditingProfile ? <TextField fullWidth size="small" name="parentDetails" value={editedProfile.parentDetails || ''} onChange={handleProfileChange} /> : user.studentProfile?.parentDetails || '-'}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Date of Birth / Age</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        {isEditingProfile ? (
                                                            <>
                                                                <TextField type="date" size="small" name="dob" value={editedProfile.dob ? format(new Date(editedProfile.dob), 'yyyy-MM-dd') : ''} onChange={handleProfileChange} />
                                                                <TextField type="number" label="Age" size="small" name="age" value={editedProfile.age || ''} onChange={handleProfileChange} sx={{ width: 80 }} />
                                                            </>
                                                        ) : (
                                                            <Typography variant="body2">
                                                                {user.studentProfile?.dob ? format(new Date(user.studentProfile.dob), 'PP') : '-'}
                                                                ({user.studentProfile?.age ? `${user.studentProfile.age} yrs` : '-'})
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Address & Pincode</TableCell>
                                                <TableCell>
                                                    {isEditingProfile ? (
                                                        <Stack spacing={1}>
                                                            <TextField fullWidth size="small" name="address" value={editedProfile.address || ''} onChange={handleProfileChange} label="Full Address" />
                                                            <TextField size="small" name="pincode" value={editedProfile.pincode || ''} onChange={handleProfileChange} label="Pincode" sx={{ width: 150 }} />
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="body2">{user.studentProfile?.address || '-'} (Pincode: {user.studentProfile?.pincode || '-'})</Typography>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Education Details</TableCell>
                                                <TableCell>
                                                    {user.studentProfile?.educationType === 'School' ? (
                                                        <Box>
                                                            <Typography variant="body2"><b>School:</b> {user.studentProfile?.schoolName || '-'}</Typography>
                                                            <Typography variant="body2"><b>Class:</b> {user.studentProfile?.className || '-'}</Typography>
                                                        </Box>
                                                    ) : (
                                                        <Box>
                                                            <Typography variant="body2"><b>College:</b> {user.studentProfile?.collegeName || '-'}</Typography>
                                                            <Typography variant="body2"><b>Branch:</b> {user.studentProfile?.branchName || '-'}</Typography>
                                                            <Typography variant="body2"><b>Semester:</b> {user.studentProfile?.semester || '-'}</Typography>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Registration Info</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2"><b>Join Date:</b> {user.studentProfile?.dateOfJoining ? format(new Date(user.studentProfile.dateOfJoining), 'PP') : '-'}</Typography>
                                                        <Typography variant="body2"><b>Exp. Ending:</b> {user.studentProfile?.expectedEndingDate ? format(new Date(user.studentProfile.expectedEndingDate), 'PP') : '-'}</Typography>
                                                        <Typography variant="body2"><b>Training:</b> {user.studentProfile?.trainingMode || '-'}</Typography>
                                                        <Typography variant="body2"><b>Reference:</b> {user.studentProfile?.reference || '-'}</Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                             <Grid item xs={12}>
                                <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom sx={{ mt: 1 }}>Documents & Photos</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Grid container spacing={2}>
                                    {[
                                        { label: 'Passport Photo', url: user.studentProfile?.photo1 },
                                        { label: 'Face ID (Biometric)', url: user.studentProfile?.biometricFace },
                                        { label: 'Aadhar / ID Card', url: user.studentProfile?.idCard },
                                        { label: 'Other Document', url: user.studentProfile?.document },
                                        { label: 'Payment Receipt', url: user.studentProfile?.paymentScreenshot }
                                    ].map((doc, idx) => (
                                        doc.url && (
                                            <Grid item xs={12} sm={6} md={3} key={idx}>
                                                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                                                    <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>{doc.label}</Typography>
                                                    <Box
                                                        component="img"
                                                        src={fixUrl(doc.url)}
                                                        alt={doc.label}
                                                        sx={{ width: '100%', height: 140, objectFit: 'contain', cursor: 'pointer', borderRadius: 1, mb: 1, bgcolor: '#fff' }}
                                                        onClick={() => window.open(fixUrl(doc.url), '_blank')}
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Invalid+Path'; }}
                                                    />
                                                    <Button fullWidth size="small" variant="text" startIcon={<DownloadIcon />} onClick={() => window.open(fixUrl(doc.url), '_blank')} sx={{ mt: 'auto', fontSize: '0.7rem' }}>View Full</Button>
                                                </Paper>
                                            </Grid>
                                        )
                                    ))}
                                    {!(user.studentProfile?.photo1 || user.studentProfile?.idCard || user.studentProfile?.document || user.studentProfile?.paymentScreenshot) && (
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>No documents uploaded yet.</Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom sx={{ mt: 1 }}>Fees & Payment Verification</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table size="small">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'grey.50', width: '30%', fontWeight: 600 }}>Fees Summary</TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={4}>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Total Fees</Typography>
                                                            <Typography variant="body1" fontWeight={700}>₹{user.studentProfile?.fees || 0}</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Total Installments</Typography>
                                                            <Typography variant="body1" fontWeight={700}>₹{user.studentProfile?.totalInstallment || 0}</Typography>
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">Net Fees (Total Payable)</Typography>
                                                            <Typography variant="body1" fontWeight={700} color="primary">₹{user.studentProfile?.totalFees || 0}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Payment Details</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2"><b>Method:</b> {user.studentProfile?.modeOfPayment || 'Offline'}</Typography>
                                                        {user.studentProfile?.modeOfPayment === 'Online' && (
                                                            <Typography variant="body2"><b>Transaction ID:</b> {user.studentProfile?.transactionId || '-'}</Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Grid>
                    ) : (
                        <Alert severity="info">Student has not filled their detailed profile yet.</Alert>
                    )}
                </TabPanel>

                <TabPanel value={value} index={5}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Assignment Submissions</Typography>
                    {submissions.length > 0 ? (
                        <Box sx={{ mt: 2 }}>
                            {/* Group by Batch logic */}
                            {Object.entries(
                                submissions.reduce((acc, sub) => {
                                    const batchName = sub.batch || 'General';
                                    if (!acc[batchName]) acc[batchName] = [];
                                    acc[batchName].push(sub);
                                    return acc;
                                }, {})
                            ).map(([batchName, batchSubmissions], idx) => (
                                <Accordion key={batchName} defaultExpanded={idx === 0} sx={{ mb: 2, borderRadius: '8px !important', overflow: 'hidden', border: '1px solid #eee' }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'grey.50' }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <FolderIcon color="primary" />
                                            <Typography fontWeight={700} color="primary.main">{batchName}</Typography>
                                            <Chip label={`${batchSubmissions.length} Items`} size="small" variant="outlined" />
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ p: 0 }}>
                                        <TableContainer component={Paper} elevation={0} sx={{ border: 'none' }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ fontWeight: 700 }}>Assignment</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
                                                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {batchSubmissions.map((sub, i) => (
                                                        <TableRow key={i} hover>
                                                            <TableCell>{sub.title}</TableCell>
                                                            <TableCell>
                                                                <Chip label={sub.course || 'N/A'} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Chip
                                                                    label={sub.submitted ? 'Submitted' : 'Pending'}
                                                                    color={sub.submitted ? 'success' : 'warning'}
                                                                    size="small"
                                                                    sx={{ fontWeight: 600 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                {sub.submissionDetails?.submittedAt ? format(new Date(sub.submissionDetails.submittedAt), 'PPp') : '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {sub.submitted && sub.submissionDetails?.fileUrl && (
                                                                    <Button 
                                                                        size="small" 
                                                                        variant="contained" 
                                                                        disableElevation 
                                                                        onClick={() => window.open(sub.submissionDetails.fileUrl, '_blank')}
                                                                    >
                                                                        View File
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ py: 5, textAlign: 'center' }}>
                            <Typography variant="body1" color="text.secondary">No assignments found for this user.</Typography>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={value} index={6}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>Biometric Face ID</Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Current Biometric Photo</Typography>
                                {user?.studentProfile?.biometricFace ? (
                                    <Box sx={{ position: 'relative', width: '100%', pt: '75%', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
                                        <img
                                            src={fixUrl(user.studentProfile.biometricFace)}
                                            alt="Biometric"
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                ) : (
                                    <Paper variant="outlined" sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, bgcolor: '#f9f9f9' }}>
                                        <Typography color="text.secondary">No face ID photo captured yet</Typography>
                                    </Paper>
                                )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>Capture New Face ID</Typography>
                                {user?._id && (
                                    <FaceCapture studentId={user._id} onCaptureSuccess={() => {
                                        // Refresh user data
                                        fetchUserDetails();
                                    }} />
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </TabPanel>

                {/* Attendance Calendar Tab */}
                <TabPanel value={value} index={7}>
                    <UserAttendanceCalendar userId={userId} enrolledDate={user?.createdAt} />
                </TabPanel>

            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDetailsModal;
