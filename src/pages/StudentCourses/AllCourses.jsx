import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip, CircularProgress, Stack, Button } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import api, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import { courseViewerService } from '../../api/courseViewer/service';

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Public course catalog for students — browse → CourseDetail.jsx → buy/enroll.
 * Also doubles as the "My Courses" view (?mine=1, linked from StudentSidebar)
 * showing only enrolled courses, clicking straight into the CourseViewer player
 * instead of the buy/enroll detail page.
 */
const AllCourses = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mineOnly = searchParams.get('mine') === '1';
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if (mineOnly) {
            courseViewerService.getMyEnrollments()
                .then((enrollments) => setCourses(enrollments.map((e) => e.course).filter(Boolean)))
                .catch(() => toast.error('Failed to load your courses'))
                .finally(() => setLoading(false));
        } else {
            api.get('/courses')
                .then((res) => setCourses((res.data.data || []).filter((c) => c.isPublished)))
                .catch(() => toast.error('Failed to load courses'))
                .finally(() => setLoading(false));
        }
    }, [mineOnly]);

    if (loading) {
        return (
            <Box sx={{ p: 6, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900}>{mineOnly ? 'My Courses' : 'All Courses'}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {mineOnly ? 'Continue learning where you left off' : 'Browse and enroll in a course to get started'}
                </Typography>
            </Box>

            {courses.length === 0 ? (
                mineOnly ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                        <Typography variant="body1" fontWeight={700} gutterBottom>You haven't enrolled in any course yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Browse the catalog and enroll to start learning</Typography>
                        <Button variant="contained" onClick={() => navigate('/all-courses')} sx={{ fontWeight: 700, borderRadius: '10px' }}>
                            Browse Courses
                        </Button>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">No courses available right now.</Typography>
                )
            ) : (
                <Grid container spacing={3}>
                    {courses.map((course) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
                            <Card
                                onClick={() => navigate(mineOnly ? `/my-courses/${course.id}` : `/all-courses/${course.id}`)}
                                elevation={0}
                                sx={{
                                    cursor: 'pointer',
                                    borderRadius: '16px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px -10px rgba(0,0,0,0.2)', borderColor: 'primary.main' },
                                }}
                            >
                                <Box sx={{ position: 'relative', pt: '56%', bgcolor: 'action.hover' }}>
                                    {course.thumbnail ? (
                                        <CardMedia
                                            component="img"
                                            image={fixUrl(course.thumbnail)}
                                            alt={course.title}
                                            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                        </Box>
                                    )}
                                    <Chip
                                        label={course.price === 0 ? 'FREE' : `₹${course.price}`}
                                        color={course.price === 0 ? 'success' : 'primary'}
                                        size="small"
                                        sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 800 }}
                                    />
                                </Box>
                                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="subtitle1" fontWeight={800} noWrap>{course.title}</Typography>
                                    {!mineOnly && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ mb: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                        >
                                            {stripHtml(course.description) || 'No description available.'}
                                        </Typography>
                                    )}
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {course.level && <Chip label={course.level} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />}
                                        {course.isCertificate && <Chip label="Certificate" size="small" variant="outlined" color="success" />}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default AllCourses;
