import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    Grid,
    Divider,
    Chip,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TextField,
    InputAdornment,
    Stack,
    Tooltip,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import SyncIcon from '@mui/icons-material/Sync';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VideoPreview from '../Common/VideoPreview';
import { fixUrl } from '../../utils/api';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CourseViewModal = ({ open, onClose, course }) => {
    const [loading, setLoading] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tabIndex, setTabIndex] = useState(0);

    React.useEffect(() => {
        if (open && course?._id) {
            fetchFullCourseDetails();
        }
    }, [open, course?._id]);

    const fetchFullCourseDetails = async () => {
        try {
            const response = await api.get(`/courses/${course._id}`);
            if (response.data.success) {
                setFullCourseData(response.data.data);
            }
        } catch (error) {
            
        }
    };

    const stats = useMemo(() => {
        let videos = 0;
        let pdfs = 0;
        let audios = 0;
        let others = 0;

        if (!course) return { videos, pdfs, audios, others };

        (course.modules || []).forEach(mod => {
            (mod.videos || []).forEach(v => {
                if (v.type === 'video') videos++;
                else if (v.type === 'pdf') pdfs++;
                else if (v.type === 'audio') audios++;
                else others++;
            });
        });

        return { videos, pdfs, audios, others };
    }, [course]);

    const filteredModules = useMemo(() => {
        if (!course) return [];
        if (!searchQuery) return course.modules || [];
        const query = searchQuery.toLowerCase();

        return (course.modules || []).filter(mod => {
            const modTitleMatches = mod.title?.toLowerCase().includes(query);
            const lessonMatches = (mod.videos || []).some(v => v.title?.toLowerCase().includes(query));
            return modTitleMatches || lessonMatches;
        }).map(mod => {
            // Further filter the lessons within matching modules
            if (mod.title?.toLowerCase().includes(query)) return mod;
            return {
                ...mod,
                videos: (mod.videos || []).filter(v => v.title?.toLowerCase().includes(query))
            };
        });
    }, [course, searchQuery]);

    if (!course) return null;

    const handleSyncAllEnrollments = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/courses/${course._id}/sync-enrollments`);
            if (response.data.success) {
                toast.success(response.data.message);
                onClose();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync enrollments');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenResource = (url, type, download = false) => {
        if (!url) return;
        
        if (type === 'video' && !download) {
            setActiveVideoUrl(url);
            return;
        }

        let targetUrl = url;
        if (download) {
            if (url.includes('cloudinary.com') && (url.includes('/image/upload/') || url.includes('/video/upload/')) && !url.toLowerCase().endsWith('.pdf')) {
                targetUrl = url.replace('/upload/', '/upload/fl_attachment/');
            }
            const link = document.createElement('a');
            link.href = targetUrl;
            link.setAttribute('download', '');
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            window.open(targetUrl, '_blank');
        }
    };

    const handleCopyLink = (url) => {
        if (!url) return;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'video': return <PlayCircleOutlineIcon fontSize="small" color="primary" />;
            case 'pdf': return <DescriptionIcon fontSize="small" color="secondary" />;
            case 'audio': return <AudiotrackIcon fontSize="small" color="warning" />;
            case 'zip': return <FolderZipIcon fontSize="small" color="error" />;
            default: return <LayersIcon fontSize="small" color="action" />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xl"
            PaperProps={{ 
                sx: { 
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    minHeight: '80vh'
                } 
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, pt: 2, px: 3 }}>
                <Typography variant="subtitle1" component="span" fontWeight={900} color="primary">
                    Course Portfolio Manager
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button 
                        startIcon={<SyncIcon />} 
                        variant="outlined" 
                        size="small" 
                        onClick={handleSyncAllEnrollments} 
                        disabled={loading} 
                        sx={{ 
                            borderRadius: '8px', 
                            textTransform: 'none', 
                            fontWeight: 700
                        }}
                    >
                        Sync Access
                    </Button>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    {/* Left Column: Info & Curriculum */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h5" fontWeight={900} gutterBottom>{course.title}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                <Chip label={course.category?.name || 'Uncategorized'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                                <Chip label={course.level} color="primary" size="small" sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                                <Chip label={course.price === 0 ? 'FREE' : `₹${course.price}`} color={course.price === 0 ? "success" : "default"} size="small" sx={{ fontWeight: 900 }} />
                                <Chip label={`${stats.videos} Videos`} size="small" color="info" variant="outlined" sx={{ fontWeight: 600 }} />
                            </Box>

                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)', width: '25%' }}>Students Enrolled</TableCell>
                                            <TableCell>{course.enrolledStudents?.length || 0}</TableCell>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)', width: '25%' }}>Rating</TableCell>
                                            <TableCell>{course.rating || 0}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)' }}>Course Validity</TableCell>
                                            <TableCell>{course.durationValue === 0 ? 'Unlimited' : `${course.durationValue} ${course.durationUnit}`}</TableCell>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'rgba(0,0,0,0.02)' }}>Exams & Assignments</TableCell>
                                            <TableCell>{(course.examCount || 0) + (course.assignmentCount || 0)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '0.85rem',
                                    lineHeight: 1.5,
                                    mb: 2,
                                    width: '100%',
                                    overflowWrap: 'break-word',
                                    '& p': { mb: 1 },
                                    '& ul, & ol': { mb: 1, pl: 3 },
                                    '& li': { mb: 0.5 },
                                    '& strong': { fontWeight: 700, color: 'text.primary' },
                                    '& hr': { my: 1, border: 0, borderTop: '1px solid #eee' },
                                    '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 }
                                }}
                                dangerouslySetInnerHTML={{ __html: course.description || 'No description provided.' }}
                            />
                        </Box>

                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)}>
                                    <Tab label="Curriculum" sx={{ textTransform: 'none', fontWeight: 600 }} />
                                    <Tab label={`Assignments & Exams (${(fullCourseData?.assignments?.length || 0) + (fullCourseData?.exams?.length || 0)})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
                                </Tabs>
                            </Box>

                            <CardContent sx={{ p: 2 }}>
                                {tabIndex === 0 && (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                            <TextField
                                                placeholder="Search Curriculum..."
                                                size="small"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                                                    sx: { borderRadius: 2, bgcolor: 'white', maxWidth: 220 }
                                                }}
                                            />
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {filteredModules.length > 0 ? (
                                                filteredModules.map((module, index) => (
                                                    <Accordion key={index} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eee', '&:before': { display: 'none' } }}>
                                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: 'action.hover' }}>
                                                            <Typography variant="subtitle2" fontWeight={800}>{module.title}</Typography>
                                                            <Typography variant="caption" sx={{ ml: 'auto', mr: 2, opacity: 0.7 }}>{module.videos?.length || 0} items</Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ p: 0 }}>
                                                            <List disablePadding>
                                                                {module.videos && module.videos.map((vid, vIdx) => (
                                                                    <ListItem
                                                                        key={vIdx}
                                                                        divider={vIdx < module.videos.length - 1}
                                                                        sx={{ py: 1, px: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
                                                                        secondaryAction={
                                                                            <Stack direction="row" spacing={0.5}>
                                                                                <Tooltip title="View">
                                                                                    <IconButton size="small" color="primary" onClick={() => handleOpenResource(vid.url || vid.videoUrl, vid.type)}>
                                                                                        <VisibilityIcon sx={{ fontSize: 18 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                                <Tooltip title="Copy Link">
                                                                                    <IconButton size="small" onClick={() => handleCopyLink(vid.url || vid.videoUrl)}>
                                                                                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                                <Tooltip title="Download">
                                                                                    <IconButton size="small" color="info" onClick={() => handleOpenResource(vid.url || vid.videoUrl, true)}>
                                                                                        <DownloadIcon sx={{ fontSize: 18 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Stack>
                                                                        }
                                                                    >
                                                                        <ListItemIcon sx={{ minWidth: 40 }}>{getResourceIcon(vid.type)}</ListItemIcon>
                                                                        <ListItemText
                                                                            primary={vid.title}
                                                                            secondary={`${vid.type?.toUpperCase()} ${vid.duration ? `• ${vid.duration} min/MB` : ''}`}
                                                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                                                            secondaryTypographyProps={{ variant: 'caption' }}
                                                                        />
                                                                    </ListItem>
                                                                ))}
                                                            </List>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                ))
                                            ) : (
                                                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                                                    <Typography color="text.secondary">No materials match your search.</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                )}

                                {tabIndex === 1 && (
                                    <Box>
                                        {fullCourseData?.exams?.length > 0 && (
                                            <Box sx={{ mb: 3 }}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <ReceiptLongIcon fontSize="small" color="error" /> Exams
                                                </Typography>
                                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                                    <Table size="small">
                                                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>Total Marks</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {fullCourseData.exams.map(exam => (
                                                                <TableRow key={exam._id}>
                                                                    <TableCell>{exam.title}</TableCell>
                                                                    <TableCell>{exam.duration} Min</TableCell>
                                                                    <TableCell>{exam.totalMarks}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}

                                        {fullCourseData?.assignments?.length > 0 && (
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <DescriptionIcon fontSize="small" color="secondary" /> Assignments
                                                </Typography>
                                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                                    <Table size="small">
                                                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                                                <TableCell sx={{ fontWeight: 600 }}>Total Marks</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {fullCourseData.assignments.map(ass => (
                                                                <TableRow key={ass._id}>
                                                                    <TableCell>{ass.title}</TableCell>
                                                                    <TableCell sx={{ textTransform: 'capitalize' }}>{ass.assignmentType?.replace('_', ' ')}</TableCell>
                                                                    <TableCell>{ass.totalMarks}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}

                                        {(!fullCourseData?.assignments?.length && !fullCourseData?.exams?.length) && (
                                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3, fontStyle: 'italic' }}>
                                                No exams or assignments allocated to this course.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'sticky', top: 20 }}>
                            <Typography variant="caption" fontWeight={900} color="text.secondary" gutterBottom sx={{ mb: 1, display: 'block', textTransform: 'uppercase' }}>Course Media assets</Typography>
                            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, border: '1px solid #eee' }}>
                                <Box component="img" src={fixUrl(course.thumbnail)} sx={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                <CardContent sx={{ py: 1, px: 2 }}>
                                    <Typography variant="caption" fontWeight={700}>THUMBNAIL IMAGE</Typography>
                                </CardContent>
                            </Card>

                            <Card variant="outlined" sx={{ borderRadius: 2, p: 0.5, border: '1px solid #eee', mb: 3 }}>
                                <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" fontWeight={700}>DEMO PREVIEW</Typography>
                                    {course.demoVideoUrl && (
                                        <IconButton size="small" onClick={() => handleCopyLink(course.demoVideoUrl)}>
                                            <ContentCopyIcon sx={{ fontSize: 12 }} />
                                        </IconButton>
                                    )}
                                </Box>
                                <Box sx={{ height: 180, bgcolor: 'black', borderRadius: 1.5, overflow: 'hidden' }}>
                                    {course.demoVideoUrl ? <VideoPreview url={course.demoVideoUrl} height={180} /> : <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem' }}>No Demo</Box>}
                                </Box>
                            </Card>

                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
                                <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 0.5 }}>Advance Ready.</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9, lineHeight: 1.4, display: 'block' }}>All materials are double-checked for accessibility and performance.</Typography>
                                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Typography variant="caption" display="block" sx={{ fontWeight: 800 }}>CREATED DATE</Typography>
                                    <Typography variant="caption" fontWeight={500}>{new Date(course.createdAt).toLocaleDateString()}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <Dialog 
                open={!!activeVideoUrl} 
                onClose={() => setActiveVideoUrl(null)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: '#000', overflow: 'hidden' } }}
            >
                <Box sx={{ position: 'relative' }}>
                    <IconButton 
                        onClick={() => setActiveVideoUrl(null)} 
                        sx={{ position: 'absolute', right: 8, top: 8, zIndex: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <VideoPreview url={activeVideoUrl} height={500} />
                </Box>
            </Dialog>
        </Dialog>
    );
};

export default CourseViewModal;
