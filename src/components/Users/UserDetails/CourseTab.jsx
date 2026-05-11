import React from 'react';
import { Box, Button, List, Paper, Stack, Avatar, Typography, LinearProgress, Chip } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DownloadIcon from '@mui/icons-material/Download';
import { fixUrl } from '../../../utils/api';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CourseTab = ({ user, loading, handleSyncSubscriptions, calculateCorrectExpiry }) => {
    return (
        <>
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
                                    src={fixUrl(course.thumbnail)}
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
                                <Box sx={{ minWidth: 150, textAlign: 'right' }}>
                                    {course.certificate ? (
                                        <Stack spacing={1}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                startIcon={<WorkspacePremiumIcon />}
                                                href={`${import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api'}/certificates/${course.certificate._id}/download?token=${localStorage.getItem('token')}`}
                                                target="_blank"
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                Download Certificate
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={async () => {
                                                    if (!window.confirm('Are you sure you want to cancel and delete this certificate?')) return;
                                                    try {
                                                        const res = await api.delete(`/certificates/${course.certificate._id}`);
                                                        if (res.data.success) {
                                                            toast.success('Certificate cancelled!');
                                                            handleSyncSubscriptions(); // Refresh data
                                                        }
                                                    } catch (err) {
                                                        toast.error(err.response?.data?.message || 'Failed to cancel');
                                                    }
                                                }}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                                            >
                                                Cancel Certificate
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Stack spacing={1}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                disabled={course.progress < 95}
                                                onClick={async () => {
                                                    try {
                                                        const res = await api.post('/certificates/issue', { studentId: user._id, courseId: course._id });
                                                        if (res.data.success) {
                                                            toast.success('Certificate issued!');
                                                            handleSyncSubscriptions(); // Refresh data
                                                        }
                                                    } catch (err) {
                                                        toast.error(err.response?.data?.message || 'Failed to issue');
                                                    }
                                                }}
                                                startIcon={<CardMembershipIcon />}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                Issue Certificate
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="info"
                                                size="small"
                                                href={`${import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api'}/certificates/preview/${user._id}/${course._id}?token=${localStorage.getItem('token')}`}
                                                target="_blank"
                                                startIcon={<DownloadIcon />}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                                            >
                                                Download PDF (Preview)
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="warning"
                                                size="small"
                                                onClick={async () => {
                                                    if (!window.confirm('Force issue certificate regardless of progress?')) return;
                                                    try {
                                                        const res = await api.post('/certificates/issue', { studentId: user._id, courseId: course._id, force: true });
                                                        if (res.data.success) {
                                                            toast.success('Certificate forced issued!');
                                                            handleSyncSubscriptions(); // Refresh data
                                                        }
                                                    } catch (err) {
                                                        toast.error(err.response?.data?.message || 'Failed to force issue');
                                                    }
                                                }}
                                                startIcon={<AutoFixHighIcon />}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.7rem' }}
                                            >
                                                Force Issue
                                            </Button>
                                        </Stack>
                                    )}
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
        </>
    );
};

export default CourseTab;
