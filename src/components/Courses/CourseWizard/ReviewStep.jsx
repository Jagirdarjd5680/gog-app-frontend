import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Card, CardContent, Divider, Grid, 
    Accordion, AccordionSummary, AccordionDetails, 
    List, ListItem, ListItemIcon, ListItemText,
    Table, TableBody, TableCell, TableContainer, TableRow, Paper,
    Tabs, Tab, CircularProgress, Stack
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import VideoPreview from '../../Common/VideoPreview';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import api, { fixUrl } from '../../../utils/api';

const ReviewStep = ({ values, categories = [], courseId }) => {
    const categoryName = categories.find(c => c._id === values.category)?.name || values.category || 'N/A';
    const [tabIndex, setTabIndex] = useState(0);
    const [assignments, setAssignments] = useState([]);
    const [exams, setExams] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    useEffect(() => {
        if (courseId && tabIndex === 1) {
            fetchAssignments();
        } else if (courseId && tabIndex === 2) {
            fetchExams();
        }
    }, [courseId, tabIndex]);

    const fetchAssignments = async () => {
        setLoadingAssignments(true);
        try {
            const { data } = await api.get(`/assignments?course=${courseId}&limit=100`);
            setAssignments(data.data || []);
        } catch (error) {
            
        } finally {
            setLoadingAssignments(false);
        }
    };

    const fetchExams = async () => {
        setLoadingExams(true);
        try {
            const { data } = await api.get(`/exams?course=${courseId}`);
            const list = data.data || data;
            setExams(Array.isArray(list) ? list : []);
        } catch (error) {
            
        } finally {
            setLoadingExams(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Box sx={{ p: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', letterSpacing: '-0.02em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 18 }} /> Review Course Details
            </Typography>
            <Divider sx={{ borderColor: 'var(--color-vc-hairline)', mb: 3 }} />

            <Grid container spacing={3}>
                {/* Course Summary */}
                <Grid item xs={12} md={8}>
                    <Card variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', letterSpacing: '-0.02em', mb: 1.5 }}>
                                {values.title || 'Untitled Course'}
                            </Typography>
                            <Box 
                                sx={{ 
                                    color: 'var(--color-vc-body)',
                                    fontSize: '13px',
                                    fontFamily: 'inherit',
                                    lineHeight: 1.55,
                                    '& p': { mb: 1.25 },
                                    '& ul, & ol': { mb: 1.25, pl: 2.5 },
                                    '& li': { mb: 0.5 },
                                    '& strong': { fontWeight: 600, color: 'var(--color-vc-ink)' },
                                    mb: 2.5
                                }}
                                dangerouslySetInnerHTML={{ __html: values.description || 'No description provided.' }}
                            />

                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', width: '30%', fontFamily: 'inherit', fontSize: '13px' }}>Category</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', color: 'var(--color-vc-body)', fontFamily: 'inherit', fontSize: '13px' }}>{categoryName}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', fontFamily: 'inherit', fontSize: '13px' }}>Level</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', color: 'var(--color-vc-body)', fontFamily: 'inherit', fontSize: '13px', textTransform: 'capitalize' }}>{values.level}</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', fontFamily: 'inherit', fontSize: '13px' }}>Price</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', fontSize: '13px' }}>
                                                {values.price > 0 ? `₹${values.price}` : 'Free'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', fontFamily: 'inherit', fontSize: '13px' }}>Course Duration</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', color: 'var(--color-vc-body)', fontFamily: 'inherit', fontSize: '13px' }}>
                                                {values.durationValue || 0} {values.durationUnit}
                                                {values.durationValue === 0 && ' (Lifetime)'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', fontFamily: 'inherit', fontSize: '13px' }}>Reading Duration</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', color: 'var(--color-vc-body)', fontFamily: 'inherit', fontSize: '13px' }}>
                                                {values.readingDurationValue || 0} {values.readingDurationUnit}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'var(--color-vc-hairline)' }}>
                            <Tabs 
                                value={tabIndex} 
                                onChange={handleTabChange} 
                                TabIndicatorProps={{ sx: { bgcolor: 'var(--color-vc-ink)' } }}
                                sx={{
                                    '& .MuiTab-root': {
                                        color: 'var(--color-vc-body)',
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        fontFamily: 'inherit',
                                        fontSize: '13px',
                                        py: 1.5,
                                        '&.Mui-selected': {
                                            color: 'var(--color-vc-ink)',
                                            fontWeight: 600
                                        }
                                    }
                                }}
                            >
                                <Tab label="Curriculum Structure" />
                                <Tab label="Assignments" />
                                <Tab label="Quizzes" />
                            </Tabs>
                        </Box>

                        <CardContent sx={{ p: 3 }}>
                            {tabIndex === 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {values.modules.length > 0 ? (
                                        values.modules.map((module, index) => (
                                            <Accordion 
                                                key={index} 
                                                variant="outlined" 
                                                elevation={0}
                                                sx={{ 
                                                    borderRadius: '6px !important', 
                                                    overflow: 'hidden', 
                                                    border: '1px solid var(--color-vc-hairline)', 
                                                    bgcolor: 'var(--color-vc-canvas)',
                                                    '&:before': { display: 'none' } 
                                                }}
                                            >
                                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 18 }} />} sx={{ bgcolor: 'var(--color-vc-canvas-soft)' }}>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                                        {index + 1}. {module.title}
                                                    </Typography>
                                                    <Typography sx={{ ml: 'auto', mr: 2, fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                        {module.videos?.length || 0} items
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ p: 0 }}>
                                                    <List disablePadding>
                                                        {module.videos && module.videos.map((item, idx) => (
                                                            <ListItem key={idx} divider={idx < module.videos.length - 1} sx={{ py: 1.25, px: 2, borderColor: 'var(--color-vc-hairline)' }}>
                                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                                    {item.type === 'video' ? <PlayCircleOutlineIcon sx={{ color: 'var(--color-vc-cyan-deep)', fontSize: 16 }} /> :
                                                                     item.type === 'pdf' ? <DescriptionIcon sx={{ color: 'var(--color-vc-error-deep)', fontSize: 16 }} /> :
                                                                     item.type === 'audio' ? <AudiotrackIcon sx={{ color: 'var(--color-vc-violet-deep)', fontSize: 16 }} /> :
                                                                     item.type === 'exam' ? <ReceiptLongIcon sx={{ color: 'var(--color-vc-error-deep)', fontSize: 16 }} /> :
                                                                     item.type === 'assignment' ? <AssignmentIcon sx={{ color: 'var(--color-vc-link-deep)', fontSize: 16 }} /> :
                                                                     <FolderZipIcon sx={{ color: 'var(--color-vc-link-deep)', fontSize: 16 }} />}
                                                                </ListItemIcon>
                                                                <ListItemText 
                                                                    primary={item.title} 
                                                                    primaryTypographyProps={{ sx: { fontSize: '12px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit' } }}
                                                                    secondary={item.type.toUpperCase()}
                                                                    secondaryTypographyProps={{ sx: { fontSize: '10px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 } }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))
                                    ) : (
                                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit', fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            No topics added yet.
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {tabIndex === 1 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {!courseId ? (
                                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit', fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            Save the course to view assignments.
                                        </Typography>
                                    ) : loadingAssignments ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                            <CircularProgress size={24} thickness={4} sx={{ color: 'var(--color-vc-ink)' }} />
                                        </Box>
                                    ) : assignments.length > 0 ? (
                                        assignments.map((assignment, index) => (
                                            <Card key={assignment._id || index} variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{ width: 40, height: 40, borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft-2)', color: 'var(--color-vc-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <AssignmentIcon sx={{ fontSize: 18 }} />
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{assignment.title}</Typography>
                                                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.25 }}>
                                                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                                    Marks: {assignment.totalMarks}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                                    • Type: {assignment.assignmentType.replace('_', ' ').toUpperCase()}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit', fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            No assignments added yet.
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {tabIndex === 2 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {!courseId ? (
                                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit', fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            Save the course to view quizzes.
                                        </Typography>
                                    ) : loadingExams ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                            <CircularProgress size={24} thickness={4} sx={{ color: 'var(--color-vc-ink)' }} />
                                        </Box>
                                    ) : exams.length > 0 ? (
                                        exams.map((exam, index) => (
                                            <Card key={exam._id || index} variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{ width: 40, height: 40, borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft-2)', color: 'var(--color-vc-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <QuizIcon sx={{ fontSize: 18 }} />
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{exam.title}</Typography>
                                                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.25 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--color-vc-mute)' }}>
                                                                    <TimerOutlinedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                                    <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>{exam.duration} Mins</Typography>
                                                                </Box>
                                                                <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                                    • Marks: {exam.totalMarks}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit', fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            No quizzes added yet.
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Media Preview */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Card variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1, fontFamily: 'inherit' }}>Thumbnail</Typography>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 160,
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        bgcolor: 'var(--color-vc-canvas-soft-2)',
                                        border: '1px solid var(--color-vc-hairline)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {values.thumbnailPreview ? (
                                        <img
                                            src={fixUrl(values.thumbnailPreview)}
                                            alt="Thumbnail"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>No Image</Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', p: 0.5, boxShadow: 'none' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1, fontFamily: 'inherit' }}>Demo Video</Typography>
                                <Box sx={{ borderRadius: '6px', overflow: 'hidden' }}>
                                    <VideoPreview url={values.demoVideoUrl} height={160} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReviewStep;
