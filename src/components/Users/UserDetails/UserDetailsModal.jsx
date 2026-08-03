import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Tabs, Tab, Box, Typography, Avatar, Stack,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentIcon from '@mui/icons-material/Payment';
import BadgeIcon from '@mui/icons-material/Badge';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StarsIcon from '@mui/icons-material/Stars';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';

import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { UserDetailsSkeleton } from '../../Common/ModalSkeletons';

// Sub-components
import GeneralTab from './GeneralTab';
import CourseTab from './CourseTab';
import PersonalInfoTab from './PersonalInfoTab';
import SubmissionsTab from './SubmissionsTab';
import TokenTab from './TokenTab';
import UserAttendanceCalendar from '../Attendance/UserAttendanceCalendar';
import FaceCapture from '../FaceCaptureFolder/FaceCapture';
import UserFeeHistory from '../Payment/UserFeeHistory';
import AccountBlockingTab from './AccountBlockingTab';
import AccountActivitiesTab from './AccountActivitiesTab';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`user-details-tabpanel-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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
    const [tokenHistory, setTokenHistory] = useState([]);
    const [tokenBalance, setTokenBalance] = useState(0);
    const [tokenLoading, setTokenLoading] = useState(false);
    const [tokenTab, setTokenTab] = useState(0);

    useEffect(() => {
        if (open && userId) {
            fetchUserDetails();
            fetchUserPayments();
        }
    }, [open, userId]);

    useEffect(() => {
        if (value === 5) fetchUserSubmissions();
        if (value === 8) fetchTokenHistory();
    }, [value, userId]);

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

    const fetchUserPayments = async () => {
        try {
            const response = await api.get(`/payments/user/${userId}`);
            if (response.data.success) setPayments(response.data.data || []);
        } catch (error) { setPayments([]); }
    };

    const fetchUserSubmissions = async () => {
        try {
            const response = await api.get(`/users/${userId}/submissions`);
            if (response.data.success) setSubmissions(response.data.data || []);
        } catch (error) { }
    };

    const fetchTokenHistory = async () => {
        setTokenLoading(true);
        try {
            const response = await api.get(`/credits/history/${userId}`);
            if (response.data.success) {
                setTokenHistory(response.data.data || []);
                setTokenBalance(response.data.balance || 0);
            }
        } catch (error) { toast.error('Failed to load token history'); }
        finally { setTokenLoading(false); }
    };

    const calculateCorrectExpiry = (activationDate, backendExpiryDate) => {
        if (!activationDate) return null;
        const activation = new Date(activationDate);
        if (isNaN(activation.getTime())) return null;

        if (backendExpiryDate) {
            const expiry = new Date(backendExpiryDate);
            if (!isNaN(expiry.getTime()) && expiry > activation && (expiry - activation) >= 24 * 60 * 60 * 1000) {
                return backendExpiryDate;
            }
        }

        const correctExpiry = new Date(activation);
        correctExpiry.setDate(correctExpiry.getDate() + 30);
        return correctExpiry;
    };

    const handleSyncSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/users/${userId}/sync-subscriptions`);
            if (response.data.success) { toast.success(response.data.message); fetchUserDetails(); }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to sync subscriptions'); }
        finally { setLoading(false); }
    };

    const handleResendLetter = async () => {
        try {
            setActionLoading(true);
            const res = await api.post(`/users/${userId}/resend-registration-letter`);
            if (res.data.success) toast.success('Registration letter resent successfully');
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to resend letter'); }
        finally { setActionLoading(false); }
    };

    const handleApproveRegistration = async () => {
        setActionLoading(true);
        try {
            const response = await api.post(`/users/${userId}/approve-registration`);
            if (response.data.success) { toast.success('Registration approved and email sent'); fetchUserDetails(); }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to approve registration'); }
        finally { setActionLoading(false); }
    };

    const handleRejectRegistration = async () => {
        if (!window.confirm('Are you sure you want to REJECT this registration?')) return;
        setActionLoading(true);
        try {
            const response = await api.post(`/users/${userId}/reject-registration`);
            if (response.data.success) { toast.warn('Registration rejected'); fetchUserDetails(); }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to reject registration'); }
        finally { setActionLoading(false); }
    };

    const handleSaveProfile = async () => {
        setActionLoading(true);
        try {
            const response = await api.put(`/users/${userId}/student-profile-admin`, { profileData: editedProfile });
            if (response.data.success) { toast.success('Profile updated'); setIsEditingProfile(false); fetchUserDetails(); }
        } catch (error) { toast.error(error.response?.data?.message || 'Failed to update profile'); }
        finally { setActionLoading(false); }
    };

    const handleSyncTokens = async () => {
        setActionLoading(true);
        try {
            const response = await api.post(`/credits/sync/${userId}`);
            if (response.data.success) {
                toast.success(response.data.message);
                setTokenHistory(response.data.data || []);
                setTokenBalance(response.data.balance || 0);
            }
        } catch (error) { toast.error('Failed to load token history'); }
        finally { setActionLoading(false); }
    };

    const handleGradeSubmission = async (assignmentId, submissionId, gradeData) => {
        try {
            await api.put(`/assignments/${assignmentId}/grade`, {
                submissionId,
                grade: Number(gradeData.grade),
                feedback: gradeData.feedback
            });
            toast.success('Grade saved successfully');
            fetchUserSubmissions();
        } catch (error) {
            toast.error('Failed to save grade');
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{ 
                sx: { 
                    borderRadius: '8px',
                    bgcolor: 'var(--color-vc-canvas)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: '0px 32px 64px -12px rgba(0,0,0,0.16)'
                } 
            }}
        >
            <DialogTitle sx={{ borderBottom: '1px solid var(--color-vc-hairline)', pb: 2.5, bgcolor: 'var(--color-vc-canvas)' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar 
                        src={user?.avatar} 
                        sx={{ 
                            width: 48, 
                            height: 48, 
                            bgcolor: 'var(--color-vc-canvas-soft)', 
                            border: '1px solid var(--color-vc-hairline)',
                            color: 'var(--color-vc-ink)',
                            fontWeight: 600,
                            fontSize: '18px'
                        }}
                    >
                        {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                            {user?.name || 'Loading...'}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: '"JetBrains Mono", monospace' }}>
                            Student ID: {user?.rollNumber || 'N/A'}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: 'var(--color-vc-canvas)' }}>
                {(!user && loading) ? (
                    <UserDetailsSkeleton />
                ) : (
                    <>
                        <Box sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                            <Tabs 
                                value={value} 
                                onChange={(e, v) => setValue(v)} 
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ 
                                    px: 2.5,
                                    bgcolor: 'var(--color-vc-canvas)',
                                    '& .MuiTabs-indicator': {
                                        bgcolor: 'var(--color-vc-primary)',
                                        height: '2px'
                                    },
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        fontFamily: 'inherit',
                                        color: 'var(--color-vc-mute)',
                                        minHeight: 48,
                                        gap: 0.75,
                                        '&.Mui-selected': {
                                            color: 'var(--color-vc-ink)',
                                            fontWeight: 600
                                        },
                                        '&:hover': {
                                            color: 'var(--color-vc-ink)',
                                            opacity: 0.9
                                        }
                                    }
                                }}
                            >
                                <Tab label="General" icon={<PersonIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Course" icon={<MenuBookIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Exam" icon={<AssignmentIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Payment" icon={<PaymentIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Personal Info" icon={<BadgeIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Assignments" icon={<ListAltIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Face ID" icon={<CameraAltIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Attendance" icon={<EventAvailableIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Tokens" icon={<StarsIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Account Blocking" icon={<LockIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                                <Tab label="Account Activities" icon={<HistoryIcon sx={{ fontSize: 16 }} />} iconPosition="start" />
                            </Tabs>
                        </Box>

                        <TabPanel value={value} index={0}>
                            <GeneralTab user={user} loading={loading} actionLoading={actionLoading} handleResendLetter={handleResendLetter} />
                        </TabPanel>
                        <TabPanel value={value} index={1}>
                            <CourseTab user={user} loading={loading} handleSyncSubscriptions={handleSyncSubscriptions} calculateCorrectExpiry={calculateCorrectExpiry} />
                        </TabPanel>
                        <TabPanel value={value} index={2}>
                            {/* Exam Logic */}
                        </TabPanel>
                        <TabPanel value={value} index={3}>
                            <UserFeeHistory userId={userId} user={user} />
                        </TabPanel>
                        <TabPanel value={value} index={4}>
                            <PersonalInfoTab
                                user={user} isEditingProfile={isEditingProfile} setIsEditingProfile={setIsEditingProfile}
                                editedProfile={editedProfile} handleProfileChange={(e) => setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value })}
                                handleSaveProfile={handleSaveProfile} handleApproveRegistration={handleApproveRegistration}
                                handleRejectRegistration={handleRejectRegistration} handleResendLetter={handleResendLetter}
                                actionLoading={actionLoading}
                            />
                        </TabPanel>
                        <TabPanel value={value} index={5}>
                            <SubmissionsTab submissions={submissions} onGrade={handleGradeSubmission} />
                        </TabPanel>
                        <TabPanel value={value} index={6}>
                            <FaceCapture userId={userId} user={user} onComplete={fetchUserDetails} />
                        </TabPanel>
                        <TabPanel value={value} index={7}>
                            <UserAttendanceCalendar userId={userId} />
                        </TabPanel>
                        <TabPanel value={value} index={8}>
                            <TokenTab
                                tokenBalance={tokenBalance} tokenLoading={tokenLoading} tokenTab={tokenTab} setTokenTab={setTokenTab}
                                tokenHistory={tokenHistory} handleSyncTokens={handleSyncTokens} actionLoading={actionLoading}
                            />
                        </TabPanel>
                        <TabPanel value={value} index={9}>
                            <AccountBlockingTab userId={userId} />
                        </TabPanel>
                        <TabPanel value={value} index={10}>
                            <AccountActivitiesTab userId={userId} />
                        </TabPanel>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2.5, borderTop: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', gap: 1 }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    sx={{ 
                        px: 4, 
                        borderRadius: '6px', 
                        height: 36,
                        textTransform: 'none', 
                        fontWeight: 500,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxShadow: 'none',
                        bgcolor: 'var(--color-vc-primary)',
                        color: 'var(--color-vc-on-primary)',
                        '&:hover': {
                            bgcolor: 'var(--color-vc-primary)',
                            opacity: 0.9,
                            boxShadow: 'none'
                        }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserDetailsModal;
