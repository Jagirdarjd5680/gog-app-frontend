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
import api from '../../../utils/api';

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
        <Box sx={{ p: 1 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <AssignmentIcon color="primary" fontSize="small" /> Review Course Details
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
                {/* Course Summary */}
                <Grid item xs={12} md={8}>
                    <Card variant="outlined" sx={{ borderRadius: 1, mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                {values.title || 'Untitled Course'}
                            </Typography>
                            <Box 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '0.875rem',
                                    '& p': { mb: 1.5 },
                                    '& ul, & ol': { mb: 1.5, pl: 2 },
                                    '& li': { mb: 0.5 },
                                    '& strong': { fontWeight: 700, color: 'text.primary' },
                                    mb: 2
                                }}
                                dangerouslySetInnerHTML={{ __html: values.description || 'No description provided.' }}
                            />

                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)', width: '30%' }}>Category</TableCell>
                                            <TableCell>{categoryName}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)' }}>Level</TableCell>
                                            <TableCell sx={{ textTransform: 'capitalize' }}>{values.level}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)' }}>Price</TableCell>
                                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                {values.price > 0 ? `₹${values.price}` : 'Free'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)' }}>Course Duration</TableCell>
                                            <TableCell>
                                                {values.durationValue || 0} {values.durationUnit}
                                                {values.durationValue === 0 && ' (Lifetime)'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)' }}>Reading Duration</TableCell>
                                            <TableCell>
                                                {values.readingDurationValue || 0} {values.readingDurationUnit}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="course contents tabs">
                                <Tab label="Curriculum Structure" sx={{ textTransform: 'none', fontWeight: 600 }} />
                                <Tab label="Assignments" sx={{ textTransform: 'none', fontWeight: 600 }} />
                                <Tab label="Quizzes" sx={{ textTransform: 'none', fontWeight: 600 }} />
                            </Tabs>
                        </Box>

                        <CardContent>
                            {tabIndex === 0 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {values.modules.length > 0 ? (
                                        values.modules.map((module, index) => (
                                            <Accordion key={index} variant="outlined" sx={{ borderRadius: 1, '&:before': { display: 'none' } }}>
                                                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {index + 1}. {module.title}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ ml: 'auto', mr: 2, color: 'text.secondary' }}>
                                                        {module.videos?.length || 0} items
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ p: 0 }}>
                                                    <List disablePadding>
                                                        {module.videos && module.videos.map((item, idx) => (
                                                            <ListItem key={idx} divider={idx < module.videos.length - 1} sx={{ py: 0.5 }}>
                                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                                    {item.type === 'video' ? <PlayCircleOutlineIcon fontSize="small" color="primary" /> :
                                                                     item.type === 'pdf' ? <DescriptionIcon fontSize="small" color="error" /> :
                                                                     item.type === 'audio' ? <AudiotrackIcon fontSize="small" color="warning" /> :
                                                                     item.type === 'exam' ? <ReceiptLongIcon fontSize="small" color="error" /> :
                                                                     item.type === 'assignment' ? <AssignmentIcon fontSize="small" color="secondary" /> :
                                                                     <FolderZipIcon fontSize="small" color="info" />}
                                                                </ListItemIcon>
                                                                <ListItemText 
                                                                    primary={item.title} 
                                                                    primaryTypographyProps={{ variant: 'caption', fontWeight: 600 }}
                                                                    secondary={item.type.toUpperCase()}
                                                                    secondaryTypographyProps={{ variant: 'caption', sx: { fontSize: '0.6rem' } }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            No topics added yet.
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {tabIndex === 1 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {!courseId ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            Save the course to view assignments.
                                        </Typography>
                                    ) : loadingAssignments ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : assignments.length > 0 ? (
                                        assignments.map((assignment, index) => (
                                            <Card key={assignment._id || index} variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <AssignmentIcon fontSize="small" />
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight={700}>{assignment.title}</Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Marks: {assignment.totalMarks}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    • Type: {assignment.assignmentType.replace('_', ' ').toUpperCase()}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            No assignments added yet.
                                        </Typography>
                                    )}
                                </Box>
                            )}

                            {tabIndex === 2 && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {!courseId ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
                                            Save the course to view quizzes.
                                        </Typography>
                                    ) : loadingExams ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                            <CircularProgress size={24} />
                                        </Box>
                                    ) : exams.length > 0 ? (
                                        exams.map((exam, index) => (
                                            <Card key={exam._id || index} variant="outlined" sx={{ borderRadius: 2 }}>
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: 'warning.light', color: 'warning.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <QuizIcon fontSize="small" />
                                                        </Box>
                                                        <Box sx={{ flexGrow: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight={700}>{exam.title}</Typography>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                                    <TimerOutlinedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                                    <Typography variant="caption">{exam.duration} Mins</Typography>
                                                                </Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    • Marks: {exam.totalMarks}
                                                                </Typography>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2, textAlign: 'center' }}>
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Card variant="outlined" sx={{ borderRadius: 1 }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>Thumbnail</Typography>
                                <Box
                                    sx={{
                                        width: '100%',
                                        height: 160,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        bgcolor: 'background.default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {values.thumbnailPreview ? (
                                        <img
                                            src={values.thumbnailPreview}
                                            alt="Thumbnail"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">No Image</Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>

                        <Card variant="outlined" sx={{ borderRadius: 1 }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>Demo Video</Typography>
                                <VideoPreview url={values.demoVideoUrl} height={160} />
                            </CardContent>
                        </Card>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReviewStep;
