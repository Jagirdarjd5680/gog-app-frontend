import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, IconButton, Button, Skeleton, Tooltip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';
import { courseViewerService } from '../../api/courseViewer/service';
import { useAuth } from '../../context/AuthContext';
import { CourseVideoPlayer } from './components/CourseVideoPlayer';
import { CurriculumSidebar, CurriculumSidebarSkeleton } from './components/CurriculumSidebar';

// Same synthetic-roll-number scheme native-app already uses (SidebarMenu.tsx/profile/Screen.tsx)
// — kept identical so the watermark reads the same account identifier on both apps.
const formatRollNumber = (user) => (user?.id ? `GOG${String(user.id).replace(/\D/g, '').padStart(8, '0')}` : '');

/**
 * Deliberately rendered OUTSIDE MainLayout (see AppRoutes.jsx — this is a top-level route, not
 * nested under the admin sidebar/topbar route) — a lecture player needs the full viewport, not
 * ~80% of it squeezed next to the main app chrome.
 */
const CourseViewerLayout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const rollNumber = useMemo(() => formatRollNumber(user), [user]);
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState({ progressPercent: 0, completedLessonIds: [] });
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);

    const loadProgress = useCallback(async () => {
        const p = await courseViewerService.getProgressSummary(id);
        setProgress(p);
        return p;
    }, [id]);

    useEffect(() => {
        (async () => {
            try {
                const [courseData, progressData] = await Promise.all([
                    courseViewerService.getCourse(id),
                    courseViewerService.getProgressSummary(id),
                ]);
                if (!progressData.isEnrolled) {
                    toast.error('Enroll in this course first to watch its lectures');
                    navigate(`/all-courses/${id}`, { replace: true });
                    return;
                }
                setCourse(courseData);
                setProgress(progressData);
                setActiveLesson(courseData?.lessons?.[0] || null);
            } catch (err) {
                // Course.platformAccess flipped after this student enrolled (or they deep-linked
                // directly) — same block CourseDetail.jsx shows before enrolling, just redirected
                // from here since this route has no room for a standalone blocked screen.
                if (err.response?.status === 403 && err.response?.data?.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error('Failed to load course');
                }
                navigate(`/all-courses/${id}`, { replace: true });
            } finally {
                setLoading(false);
            }
        })();
    }, [id, navigate]);

    const lessons = course?.lessons || [];
    const activeIndex = useMemo(() => lessons.findIndex((l) => l.id === activeLesson?.id), [lessons, activeLesson]);

    const goToLesson = (lesson) => setActiveLesson(lesson);
    const goNext = () => activeIndex < lessons.length - 1 && setActiveLesson(lessons[activeIndex + 1]);
    const goPrev = () => activeIndex > 0 && setActiveLesson(lessons[activeIndex - 1]);

    const handleMarkComplete = async () => {
        if (!activeLesson) return;
        setMarking(true);
        try {
            await courseViewerService.completeLecture(id, activeLesson.id);
            await loadProgress();
            toast.success('Marked as complete');
        } catch {
            toast.error('Failed to update progress');
        } finally {
            setMarking(false);
        }
    };

    const handleVideoEnded = () => {
        if (activeLesson && !progress.completedLessonIds.includes(String(activeLesson.id))) {
            handleMarkComplete();
        }
    };

    if (loading) {
        return (
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0b0b0f' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.2, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Skeleton variant="rounded" width={160} height={32} />
                    <Skeleton variant="text" width={220} height={28} />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 0 }}>
                    <Box sx={{ width: { xs: '100%', md: '80%' }, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <Skeleton variant="rectangular" sx={{ flex: 1, bgcolor: 'grey.900' }} />
                        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                            <Skeleton variant="text" width="40%" height={28} />
                            <Skeleton variant="text" width="70%" />
                        </Box>
                    </Box>
                    <CurriculumSidebarSkeleton />
                </Box>
            </Box>
        );
    }

    if (!course) return null;

    const isActiveDone = activeLesson && progress.completedLessonIds.includes(String(activeLesson.id));

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0b0b0f' }}>
            {/* Top bar */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.2,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    size="small"
                    sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '8px' }}
                >
                    Back to Dashboard
                </Button>
                <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ flex: 1 }}>
                    {course.title}
                </Typography>
            </Box>

            {/* Body: 80% video / 20% curriculum */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 0, gap: { xs: 0, md: '2px' } }}>
                <Box sx={{ width: { xs: '100%', md: '80%' }, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Box sx={{ flex: 1, minHeight: 0, bgcolor: 'black', borderRadius: { md: '0 0 0 16px' }, overflow: 'hidden' }}>
                        <CourseVideoPlayer lesson={activeLesson} watermarkLabel={rollNumber} onEnded={handleVideoEnded} />
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={800}>{activeLesson?.title}</Typography>
                                {activeLesson?.description && (
                                    <Typography variant="body2" color="text.secondary">{activeLesson.description}</Typography>
                                )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title="Previous lecture">
                                    <span>
                                        <IconButton onClick={goPrev} disabled={activeIndex <= 0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px' }}>
                                            <NavigateBeforeIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Button
                                    variant={isActiveDone ? 'outlined' : 'contained'}
                                    color={isActiveDone ? 'success' : 'primary'}
                                    startIcon={<CheckCircleIcon />}
                                    onClick={handleMarkComplete}
                                    disabled={marking || isActiveDone}
                                    sx={{ fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}
                                >
                                    {isActiveDone ? 'Completed' : 'Mark Complete'}
                                </Button>
                                <Tooltip title="Next lecture">
                                    <span>
                                        <IconButton onClick={goNext} disabled={activeIndex >= lessons.length - 1} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px' }}>
                                            <NavigateNextIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <CurriculumSidebar
                    lessons={lessons}
                    activeLessonId={activeLesson?.id}
                    onSelect={goToLesson}
                    completedLessonIds={progress.completedLessonIds || []}
                    progressPercent={progress.progressPercent || 0}
                />
            </Box>
        </Box>
    );
};

export default CourseViewerLayout;
