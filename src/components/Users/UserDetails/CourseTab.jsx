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
                    sx={{
                        textTransform: 'none',
                        fontSize: '12px',
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        borderRadius: '6px',
                        color: 'var(--color-vc-ink)',
                        borderColor: 'var(--color-vc-hairline)',
                        bgcolor: 'var(--color-vc-canvas)',
                        '&:hover': {
                            bgcolor: 'var(--color-vc-canvas-soft)',
                            borderColor: 'var(--color-vc-hairline-strong)'
                        }
                    }}
                >
                    Sync Subscriptions
                </Button>
            </Box>
            {user?.coursesWithDetails?.length > 0 ? (
                <List sx={{ p: 0 }}>
                    {user.coursesWithDetails.map((course) => (
                        <Paper 
                            key={course._id} 
                            variant="outlined" 
                            sx={{ 
                                mb: 2, 
                                p: 2.5, 
                                borderRadius: '6px', 
                                borderColor: 'var(--color-vc-hairline)', 
                                bgcolor: 'var(--color-vc-canvas)' 
                            }}
                        >
                            <Stack direction="row" spacing={3} alignItems="flex-start" flexWrap="wrap" useFlexGap>
                                <Avatar
                                    variant="rounded"
                                    src={fixUrl(course.thumbnail)}
                                    sx={{ 
                                        width: 56, 
                                        height: 56, 
                                        bgcolor: 'var(--color-vc-canvas-soft)', 
                                        border: '1px solid var(--color-vc-hairline)',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <MenuBookIcon sx={{ color: 'var(--color-vc-mute)' }} />
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                        {course.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Box sx={{ width: '100%', mr: 1.5 }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={course.progress} 
                                                sx={{ 
                                                    height: 6, 
                                                    borderRadius: '3px',
                                                    bgcolor: 'var(--color-vc-hairline)',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: 'var(--color-vc-primary)'
                                                    }
                                                }} 
                                            />
                                        </Box>
                                        <Box sx={{ minWidth: 30 }}>
                                            <Typography sx={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700, color: 'var(--color-vc-body)' }}>
                                                {`${Math.round(course.progress)}%`}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Stack direction="row" spacing={4} sx={{ mt: 1.5 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                                                Activation
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-vc-body)', fontFamily: '"JetBrains Mono", monospace' }}>
                                                {course.activationDate ? format(new Date(course.activationDate), 'MMM dd, yyyy') : 'N/A'}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.5 }}>
                                                Expiry
                                            </Typography>
                                            <Typography sx={{ 
                                                fontSize: '12px', 
                                                fontWeight: 500, 
                                                fontFamily: '"JetBrains Mono", monospace',
                                                color: calculateCorrectExpiry(course.activationDate, course.expiryDate) &&
                                                    new Date(calculateCorrectExpiry(course.activationDate, course.expiryDate)) < new Date()
                                                    ? 'var(--color-vc-error-deep)' : 'var(--color-vc-body)'
                                            }}>
                                                {course.activationDate
                                                    ? format(calculateCorrectExpiry(course.activationDate, course.expiryDate), 'MMM dd, yyyy')
                                                    : 'Lifetime'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                                        <Chip
                                            label={`${course.assignmentsSubmitted ?? 0}/${course.assignmentCount || 0} Assignments`}
                                            size="small"
                                            sx={{
                                                height: 22,
                                                fontSize: '11px',
                                                bgcolor: 'var(--color-vc-link-bg-soft)',
                                                color: 'var(--color-vc-link-deep)',
                                                borderRadius: '4px',
                                                fontWeight: 600
                                            }}
                                        />
                                        <Chip
                                            label={`${course.examsAttempted ?? 0}/${course.examCount || 0} Exams`}
                                            size="small"
                                            sx={{
                                                height: 22,
                                                fontSize: '11px',
                                                bgcolor: 'var(--color-vc-violet-soft)',
                                                color: 'var(--color-vc-violet-deep)',
                                                borderRadius: '4px',
                                                fontWeight: 600 
                                            }}
                                        />
                                    </Stack>
                                </Box>
                                <Box sx={{ minWidth: 160, textAlign: 'right' }}>
                                    {course.certificate ? (
                                        <Stack spacing={1}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<WorkspacePremiumIcon sx={{ fontSize: 14 }} />}
                                                href={`${import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api'}/certificates/${course.certificate._id}/download?token=${localStorage.getItem('token')}`}
                                                target="_blank"
                                                sx={{ 
                                                    textTransform: 'none',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    fontFamily: 'inherit',
                                                    borderRadius: '6px',
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
                                                Download Certificate
                                            </Button>
                                            <Button
                                                variant="outlined"
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
                                                sx={{ 
                                                    textTransform: 'none',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                    fontFamily: 'inherit',
                                                    borderRadius: '6px',
                                                    color: 'var(--color-vc-error-deep)',
                                                    borderColor: 'var(--color-vc-error-soft)',
                                                    bgcolor: 'var(--color-vc-canvas)',
                                                    '&:hover': {
                                                        bgcolor: 'var(--color-vc-error-soft)',
                                                        borderColor: 'var(--color-vc-error-soft)'
                                                    }
                                                }}
                                            >
                                                Cancel Certificate
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Stack spacing={1}>
                                            <Button
                                                variant="contained"
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
                                                startIcon={<CardMembershipIcon sx={{ fontSize: 14 }} />}
                                                sx={{ 
                                                    textTransform: 'none',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    fontFamily: 'inherit',
                                                    borderRadius: '6px',
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
                                                Issue Certificate
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                href={`${import.meta.env.VITE_API_BASE_URL || 'https://backend.godofgraphics.in/api'}/certificates/preview/${user._id}/${course._id}?token=${localStorage.getItem('token')}`}
                                                target="_blank"
                                                startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                                                sx={{ 
                                                    textTransform: 'none',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                    fontFamily: 'inherit',
                                                    borderRadius: '6px',
                                                    color: 'var(--color-vc-ink)',
                                                    borderColor: 'var(--color-vc-hairline)',
                                                    bgcolor: 'var(--color-vc-canvas)',
                                                    '&:hover': {
                                                        bgcolor: 'var(--color-vc-canvas-soft)',
                                                        borderColor: 'var(--color-vc-hairline-strong)'
                                                    }
                                                }}
                                            >
                                                Download Preview
                                            </Button>
                                            <Button
                                                variant="outlined"
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
                                                startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
                                                sx={{ 
                                                    textTransform: 'none',
                                                    fontSize: '11px',
                                                    fontWeight: 500,
                                                    fontFamily: 'inherit',
                                                    borderRadius: '6px',
                                                    color: 'var(--color-vc-warning-deep)',
                                                    borderColor: 'var(--color-vc-warning-soft)',
                                                    bgcolor: 'var(--color-vc-canvas)',
                                                    '&:hover': {
                                                        bgcolor: 'var(--color-vc-warning-soft)',
                                                        borderColor: 'var(--color-vc-warning-soft)'
                                                    }
                                                }}
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
                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit' }}>
                        No courses enrolled yet.
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default CourseTab;
