import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Paper, Chip, Button, CircularProgress, Stack, Divider, Tabs, Tab, LinearProgress, Rating, Avatar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SignalCellularAltRoundedIcon from '@mui/icons-material/SignalCellularAltRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { fixUrl } from '../../utils/api';
import { formatDuration } from '../../utils/formatDuration';
import { courseViewerService } from '../../api/courseViewer/service';
import { ReviewsTab } from './components/ReviewsTab';
import { AssignmentsTab } from './components/AssignmentsTab';
import { LiveClassesTab } from './components/LiveClassesTab';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

let razorpayScriptPromise = null;
function loadRazorpayScript() {
    if (razorpayScriptPromise) return razorpayScriptPromise;
    razorpayScriptPromise = new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Razorpay checkout'));
        document.body.appendChild(script);
    });
    return razorpayScriptPromise;
}

const TABS = ['Overview', 'Curriculum', 'Live Classes', 'Reviews', 'Materials', 'Assignments', 'Certificate'];

const ComingSoon = ({ label }) => (
    <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">{label} for this course will show up here soon.</Typography>
    </Box>
);

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState({ isEnrolled: false, progressPercent: 0 });
    const [reviewSummary, setReviewSummary] = useState({ average: 0, count: 0 });
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [tab, setTab] = useState(0);
    const [openingCourse, setOpeningCourse] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState('');

    const fetchCourse = useCallback(async () => {
        try {
            const [courseData, progressData, reviewsData] = await Promise.all([
                courseViewerService.getCourse(id),
                courseViewerService.getProgressSummary(id),
                courseViewerService.getReviews(id).catch(() => ({ average: 0, count: 0 })),
            ]);
            setCourse(courseData);
            setProgress(progressData);
            setReviewSummary({ average: reviewsData?.average || 0, count: reviewsData?.count || 0 });
        } catch (err) {
            // 403 here specifically means Course.platformAccess doesn't allow the web —
            // show the backend's own "only available on X" message instead of a generic toast.
            if (err.response?.status === 403 && err.response?.data?.message) {
                setBlockedMessage(err.response.data.message);
            } else {
                toast.error('Failed to load course');
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleEnrollFree = async () => {
        setPurchasing(true);
        try {
            await courseViewerService.enrollFree(id);
            toast.success('Enrolled! You can start watching now.');
            await fetchCourse();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to enroll');
        } finally {
            setPurchasing(false);
        }
    };

    const handleBuy = async () => {
        setPurchasing(true);
        try {
            const order = await courseViewerService.createOrder(Number(id));

            // Backend falls back to a mock order when no real RAZORPAY_KEY_ID/SECRET is configured
            // (same convention native-app/src/api/payments/useCoursePayment.ts already relies on) —
            // skip the real checkout UI and verify directly, since a mock order id doesn't exist on
            // Razorpay's real servers.
            if (order.orderId.startsWith('order_mock_')) {
                await courseViewerService.verifyPayment({
                    razorpayOrderId: order.orderId,
                    razorpayPaymentId: `pay_mock_${Date.now()}`,
                    razorpaySignature: 'mock_signature',
                    courseId: Number(id),
                });
                toast.success('Payment successful — enrolled!');
                await fetchCourse();
                setPurchasing(false);
                return;
            }

            await loadRazorpayScript();
            const rzp = new window.Razorpay({
                key: order.keyId,
                amount: order.amountInPaise,
                currency: order.currency,
                order_id: order.orderId,
                name: 'Course Purchase',
                description: order.courseTitle,
                prefill: { name: user?.name, email: user?.email },
                handler: async (response) => {
                    try {
                        await courseViewerService.verifyPayment({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            courseId: Number(id),
                        });
                        toast.success('Payment successful — enrolled!');
                        await fetchCourse();
                    } catch (err) {
                        toast.error('Payment verification failed');
                    } finally {
                        setPurchasing(false);
                    }
                },
                modal: { ondismiss: () => setPurchasing(false) },
            });
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to start checkout');
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 6, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (blockedMessage) {
        return (
            <Box sx={{ p: 6, textAlign: 'center', maxWidth: 480, mx: 'auto' }}>
                <BlockIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" fontWeight={800} gutterBottom>Not available here</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{blockedMessage}</Typography>
                <Button variant="outlined" onClick={() => navigate(-1)}>Go Back</Button>
            </Box>
        );
    }

    if (!course) return null;

    const isEnrolled = progress.isEnrolled;
    const hasDiscount = course.originalPrice > 0 && course.originalPrice > course.price;
    const discountPercent = hasDiscount ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100) : 0;

    const quickFacts = [
        { icon: <SignalCellularAltRoundedIcon sx={{ fontSize: 18 }} />, label: course.level ? course.level[0].toUpperCase() + course.level.slice(1) : 'Beginner' },
        { icon: <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />, label: `${course.durationValue} ${course.durationUnit} access` },
        { icon: <GroupsRoundedIcon sx={{ fontSize: 18 }} />, label: `${(course.fakeLikes || 0).toLocaleString()} students` },
        ...(course.isCertificate ? [{ icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />, label: 'Certificate' }] : []),
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
            {/* Hero */}
            <Box
                sx={{
                    borderRadius: '24px',
                    p: { xs: 2.5, md: 4 },
                    mb: 3,
                    background: 'linear-gradient(135deg, #0d9488 0%, #059669 55%, #10b981 100%)',
                    color: '#ffffff',
                    overflow: 'hidden',
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Chip
                            label={course.category?.name || 'Course'}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, mb: 1.5 }}
                        />
                        <Typography variant="h4" fontWeight={900} sx={{ mb: 1.5, lineHeight: 1.25 }}>
                            {course.title}
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ mb: 2, rowGap: 1 }}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                                <Rating
                                    value={reviewSummary.average || 0}
                                    precision={0.1}
                                    readOnly
                                    size="small"
                                    emptyIcon={<StarRoundedIcon sx={{ color: 'rgba(255,255,255,0.35)' }} fontSize="inherit" />}
                                    sx={{ color: '#fbbf24' }}
                                />
                                <Typography variant="body2" fontWeight={700}>{(reviewSummary.average || 0).toFixed(1)}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>({reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'})</Typography>
                            </Stack>
                        </Stack>

                        {course.instructor && (
                            <Stack direction="row" spacing={1.2} alignItems="center">
                                <Avatar src={fixUrl(course.instructor.avatar)} sx={{ width: 30, height: 30, border: '2px solid rgba(255,255,255,0.5)' }}>
                                    {(course.instructor.name || '?').charAt(0)}
                                </Avatar>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Created by <b>{course.instructor.name}</b>
                                </Typography>
                            </Stack>
                        )}
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                component="img"
                                src={course.thumbnail ? fixUrl(course.thumbnail) : 'https://via.placeholder.com/700x400?text=No+Image'}
                                sx={{
                                    width: '100%',
                                    borderRadius: '16px',
                                    aspectRatio: '16/9',
                                    objectFit: 'cover',
                                    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)',
                                }}
                            />
                            {reviewSummary.count > 0 && (
                                <Chip
                                    icon={<StarRoundedIcon sx={{ color: '#fbbf24 !important' }} />}
                                    label={`${(reviewSummary.average || 0).toFixed(1)} rating`}
                                    size="small"
                                    sx={{ position: 'absolute', bottom: 10, left: 10, bgcolor: 'rgba(0,0,0,0.65)', color: '#fff', fontWeight: 700 }}
                                />
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {/* Quick facts strip */}
                <Stack
                    direction="row"
                    spacing={{ xs: 2, sm: 4 }}
                    flexWrap="wrap"
                    sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.2)', rowGap: 1.5 }}
                >
                    {quickFacts.map((f) => (
                        <Stack key={f.label} direction="row" spacing={0.8} alignItems="center">
                            {f.icon}
                            <Typography variant="body2" fontWeight={600}>{f.label}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            mb: 2.5,
                            minHeight: 40,
                            '& .MuiTabs-indicator': { display: 'none' },
                        }}
                    >
                        {TABS.map((t, idx) => (
                            <Tab
                                key={t}
                                label={t}
                                disableRipple
                                sx={{
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    minHeight: 36,
                                    borderRadius: '999px',
                                    mr: 1,
                                    px: 2,
                                    color: 'text.secondary',
                                    '&.Mui-selected': { bgcolor: 'var(--color-vc-primary)', color: 'var(--color-vc-on-primary)' },
                                }}
                            />
                        ))}
                    </Tabs>

                    {tab === 0 && (
                        <Box>
                            <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>About this course</Typography>
                                <Box sx={{ '& p': { m: 0, mb: 1 } }} dangerouslySetInnerHTML={{ __html: course.description || '<p>No description available.</p>' }} />
                            </Paper>

                            {course.instructor && (
                                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider', mt: 2.5 }}>
                                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>Instructor</Typography>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar src={fixUrl(course.instructor.avatar)} sx={{ width: 52, height: 52 }}>
                                            {(course.instructor.name || '?').charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight={700}>{course.instructor.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{course.instructor.email}</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            )}
                        </Box>
                    )}

                    {tab === 1 && (
                        <Stack spacing={1.2}>
                            {(course.lessons || []).length === 0 ? (
                                <Typography variant="body2" color="text.secondary">No lectures added yet.</Typography>
                            ) : (
                                course.lessons.map((lesson, idx) => {
                                    const locked = !isEnrolled && !lesson.freePreview;
                                    return (
                                        <Paper
                                            key={lesson.id}
                                            elevation={0}
                                            sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: 'var(--color-vc-canvas-soft)',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {lesson.type === 'pdf' ? <PictureAsPdfIcon color="action" fontSize="small" /> : <PlayCircleOutlineIcon color="action" fontSize="small" />}
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body2" fontWeight={700} noWrap>{idx + 1}. {lesson.title}</Typography>
                                            </Box>
                                            {formatDuration(lesson.duration) ? <Typography variant="caption" color="text.secondary">{formatDuration(lesson.duration)}</Typography> : null}
                                            {locked && <LockRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
                                        </Paper>
                                    );
                                })
                            )}
                        </Stack>
                    )}

                    {tab === 2 && <LiveClassesTab courseId={id} />}
                    {tab === 3 && <ReviewsTab courseId={id} isEnrolled={isEnrolled} />}
                    {tab === 4 && <ComingSoon label="Materials" />}
                    {tab === 5 && <AssignmentsTab courseId={id} />}
                    {tab === 6 && <ComingSoon label="Certificate details" />}
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider', position: 'sticky', top: 24 }}>
                        <Stack direction="row" spacing={1.2} alignItems="baseline" sx={{ mb: 2 }}>
                            <Typography variant="h4" fontWeight={900}>
                                {course.price === 0 ? 'Free' : `₹${course.price}`}
                            </Typography>
                            {hasDiscount && (
                                <>
                                    <Typography variant="body1" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                        ₹{course.originalPrice}
                                    </Typography>
                                    <Chip label={`${discountPercent}% off`} size="small" color="success" sx={{ fontWeight: 700 }} />
                                </>
                            )}
                        </Stack>

                        {isEnrolled && (
                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>Your progress</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{Math.round(progress.progressPercent || 0)}%</Typography>
                                </Box>
                                <LinearProgress variant="determinate" value={progress.progressPercent || 0} sx={{ height: 6, borderRadius: 3 }} />
                            </Box>
                        )}

                        {isEnrolled ? (
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={openingCourse}
                                startIcon={openingCourse ? <CircularProgress size={18} color="inherit" /> : <PlayCircleOutlineIcon />}
                                onClick={() => {
                                    setOpeningCourse(true);
                                    navigate(`/my-courses/${course.id}`);
                                }}
                                sx={{ fontWeight: 700, borderRadius: '10px', py: 1.3 }}
                            >
                                {openingCourse ? 'Loading...' : 'Continue Learning'}
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={purchasing}
                                onClick={course.price === 0 ? handleEnrollFree : handleBuy}
                                sx={{ fontWeight: 700, borderRadius: '10px', py: 1.3 }}
                            >
                                {purchasing ? <CircularProgress size={22} color="inherit" /> : course.price === 0 ? 'Enroll Now' : 'Buy Now'}
                            </Button>
                        )}

                        <Divider sx={{ my: 2.5 }} />

                        <Stack spacing={1.2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CheckCircleIcon fontSize="small" color="success" />
                                <Typography variant="body2">{course.durationValue} {course.durationUnit} access</Typography>
                            </Stack>
                            {course.isCertificate && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CheckCircleIcon fontSize="small" color="success" />
                                    <Typography variant="body2">Certificate on completion</Typography>
                                </Stack>
                            )}
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CheckCircleIcon fontSize="small" color="success" />
                                <Typography variant="body2">Level: {course.level}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CheckCircleIcon fontSize="small" color="success" />
                                <Typography variant="body2">{(course.lessons || []).length} lecture{(course.lessons || []).length === 1 ? '' : 's'}</Typography>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CourseDetail;
