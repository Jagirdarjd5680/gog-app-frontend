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
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SyncIcon from '@mui/icons-material/Sync';
import AddIcon from '@mui/icons-material/Add';
import VideoPreview from '../Common/VideoPreview';
import { fixUrl } from '../../utils/api';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import ExamForm from '../Exams/ExamForm';
import AssignmentFormModal from '../Assignments/AssignmentFormModal';

const CourseViewModal = ({ open, onClose, course }) => {
    const [loading, setLoading] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [tabIndex, setTabIndex] = useState(0);
    const [fullCourseData, setFullCourseData] = useState(null);
    const [examFormOpen, setExamFormOpen] = useState(false);
    const [assignmentFormOpen, setAssignmentFormOpen] = useState(false);

    React.useEffect(() => {
        if (open && course?._id) {
            fetchFullCourseDetails();
        }
    }, [open, course?._id]);

    const fetchFullCourseDetails = async () => {
        try {
            // /courses/:id is the public, platform-gated (Course.platformAccess) student
            // endpoint — viewing course details here must bypass that, or a course locked
            // to "app"/"web" only 403s the moment an admin opens this modal. This route also
            // brings back real enrolledCount/examCount/assignmentCount/rating numbers instead
            // of the always-zero Mongo-era fields (course.enrolledStudents, course.examCount, ...).
            const response = await api.get(`/courses/manage/${course._id}`);
            if (response.data.success) {
                setFullCourseData(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load course details');
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
            case 'video': return <PlayCircleOutlineIcon fontSize="small" sx={{ color: 'var(--color-vc-link)' }} />;
            case 'pdf': return <DescriptionIcon fontSize="small" sx={{ color: 'var(--color-vc-warning-deep)' }} />;
            case 'audio': return <AudiotrackIcon fontSize="small" sx={{ color: 'var(--color-vc-violet-deep)' }} />;
            case 'zip': return <FolderZipIcon fontSize="small" sx={{ color: 'var(--color-vc-error-deep)' }} />;
            default: return <LayersIcon fontSize="small" sx={{ color: 'var(--color-vc-mute)' }} />;
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
                    borderRadius: '8px',
                    bgcolor: 'var(--color-vc-canvas)',
                    color: 'var(--color-vc-ink)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: '0px 24px 32px -8px rgba(0,0,0,0.1)',
                    minHeight: '80vh'
                } 
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, pt: 2, px: 3 }}>
                <Typography variant="subtitle2" component="span" fontWeight={600} sx={{ color: 'var(--color-vc-link)', fontFamily: '"JetBrains Mono", monospace', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.08em' }}>
                    Course Portfolio Manager
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button 
                        startIcon={<SyncIcon sx={{ fontSize: 16 }} />} 
                        variant="outlined" 
                        size="small" 
                        onClick={handleSyncAllEnrollments} 
                        disabled={loading} 
                        sx={{ 
                            borderRadius: '6px', 
                            textTransform: 'none', 
                            fontWeight: 500,
                            fontFamily: 'inherit',
                            fontSize: '13px',
                            height: 32,
                            borderColor: 'var(--color-vc-hairline)',
                            color: 'var(--color-vc-ink)',
                            bgcolor: 'var(--color-vc-canvas)',
                            '&:hover': {
                                borderColor: 'var(--color-vc-hairline-strong)',
                                bgcolor: 'var(--color-vc-canvas-soft)'
                            }
                        }}
                    >
                        Sync Access
                    </Button>
                    <IconButton 
                        onClick={onClose} 
                        size="small" 
                        sx={{ 
                            color: 'var(--color-vc-mute)',
                            '&:hover': {
                                color: 'var(--color-vc-ink)',
                                bgcolor: 'var(--color-vc-canvas-soft)'
                            }
                        }}
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>
            </DialogTitle>
            <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />

            <DialogContent sx={{ p: 3, bgcolor: 'var(--color-vc-canvas-soft)' }}>
                <Grid container spacing={3}>
                    {/* Left Column: Info & Curriculum */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, color: 'var(--color-vc-ink)', letterSpacing: '-0.02em', mb: 1, fontFamily: 'inherit' }}>
                                {course.title}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                                <Chip 
                                    label={course.category?.name || course.category || 'Uncategorized'} 
                                    size="small" 
                                    sx={{ 
                                        fontWeight: 500, 
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        bgcolor: 'var(--color-vc-canvas)',
                                        color: 'var(--color-vc-body)',
                                        border: '1px solid var(--color-vc-hairline)'
                                    }} 
                                />
                                <Chip 
                                    label={course.level} 
                                    size="small" 
                                    sx={{ 
                                        textTransform: 'capitalize', 
                                        fontWeight: 600,
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        bgcolor: 'var(--color-vc-link-bg-soft)',
                                        color: 'var(--color-vc-link-deep)'
                                    }} 
                                />
                                <Chip 
                                    label={course.price === 0 ? 'FREE' : `₹${course.price}`} 
                                    size="small" 
                                    sx={{ 
                                        fontWeight: 600,
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        bgcolor: course.price === 0 ? 'rgba(41, 188, 155, 0.15)' : 'var(--color-vc-canvas-soft-2)',
                                        color: course.price === 0 ? 'var(--color-vc-cyan-deep)' : 'var(--color-vc-ink)'
                                    }} 
                                />
                                <Chip 
                                    label={`${stats.videos} Videos`} 
                                    size="small" 
                                    sx={{ 
                                        fontWeight: 500,
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        bgcolor: 'var(--color-vc-violet-soft)',
                                        color: 'var(--color-vc-violet-deep)'
                                    }} 
                                />
                            </Box>

                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none', mb: 3 }}>
                                <Table size="small">
                                    <TableBody>
                                        <TableRow sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', width: '25%', fontFamily: 'inherit', fontSize: '13px' }}>Students Enrolled</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', color: 'var(--color-vc-body)', fontFamily: 'inherit', fontSize: '13px' }}>{fullCourseData?.enrolledCount ?? '—'}</TableCell>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', width: '25%', fontFamily: 'inherit', fontSize: '13px' }}>Rating</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', color: 'var(--color-vc-body)', fontFamily: 'inherit', fontSize: '13px' }}>{fullCourseData ? `${(fullCourseData.rating || 0).toFixed(1)} (${fullCourseData.reviewCount || 0})` : '—'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', fontFamily: 'inherit', fontSize: '13px' }}>Course Validity</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', color: 'var(--color-vc-body)', fontFamily: 'inherit', fontSize: '13px' }}>{course.durationValue === 0 ? 'Unlimited' : `${course.durationValue} ${course.durationUnit}`}</TableCell>
                                            <TableCell component="th" sx={{ fontWeight: 600, bgcolor: 'var(--color-vc-canvas-soft)', borderBottom: 'none', color: 'var(--color-vc-ink)', fontFamily: 'inherit', fontSize: '13px' }}>Exams & Assignments</TableCell>
                                            <TableCell sx={{ borderBottom: 'none', color: 'var(--color-vc-body)', fontFamily: 'inherit', fontSize: '13px' }}>{fullCourseData ? (fullCourseData.examCount || 0) + (fullCourseData.assignmentCount || 0) : '—'}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box 
                                sx={{ 
                                    color: 'var(--color-vc-body)',
                                    fontSize: '14px',
                                    lineHeight: 1.6,
                                    mb: 3,
                                    width: '100%',
                                    overflowWrap: 'break-word',
                                    fontFamily: 'inherit',
                                    '& p': { mb: 1.5 },
                                    '& ul, & ol': { mb: 1.5, pl: 3 },
                                    '& li': { mb: 0.5 },
                                    '& strong': { fontWeight: 600, color: 'var(--color-vc-ink)' },
                                    '& hr': { my: 2, border: 0, borderTop: '1px solid var(--color-vc-hairline)' },
                                    '& img': { maxWidth: '100%', height: 'auto', borderRadius: '4px' }
                                }}
                                dangerouslySetInnerHTML={{ __html: course.description || 'No description provided.' }}
                            />
                        </Box>

                        <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'var(--color-vc-hairline)' }}>
                                <Tabs 
                                    value={tabIndex} 
                                    onChange={(e, v) => setTabIndex(v)}
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
                                    <Tab label="Curriculum" />
                                    <Tab label={`Assignments & Exams (${(fullCourseData?.assignments?.length || 0) + (fullCourseData?.exams?.length || 0)})`} />
                                </Tabs>
                            </Box>

                            <CardContent sx={{ p: 3 }}>
                                {tabIndex === 0 && (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                            <TextField
                                                placeholder="Search Curriculum..."
                                                size="small"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'var(--color-vc-mute)' }} /></InputAdornment>,
                                                    sx: { 
                                                        borderRadius: '6px', 
                                                        bgcolor: 'var(--color-vc-canvas)', 
                                                        maxWidth: 220,
                                                        fontSize: '13px',
                                                        fontFamily: 'inherit',
                                                        height: 36,
                                                        color: 'var(--color-vc-ink)',
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'var(--color-vc-hairline)'
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'var(--color-vc-hairline-strong)'
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'var(--color-vc-hairline-strong)'
                                                        }
                                                    }
                                                }}
                                            />
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {filteredModules.length > 0 ? (
                                                filteredModules.map((module, index) => (
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
                                                        <AccordionSummary 
                                                            expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 18 }} />} 
                                                            sx={{ 
                                                                bgcolor: 'var(--color-vc-canvas-soft)',
                                                                borderBottom: '1px solid transparent',
                                                                '&.Mui-expanded': {
                                                                    borderBottomColor: 'var(--color-vc-hairline)'
                                                                }
                                                            }}
                                                        >
                                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{module.title}</Typography>
                                                            <Typography sx={{ ml: 'auto', mr: 2, fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>{module.videos?.length || 0} items</Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails sx={{ p: 0 }}>
                                                            <List disablePadding>
                                                                {module.videos && module.videos.map((vid, vIdx) => (
                                                                    <ListItem
                                                                        key={vIdx}
                                                                        divider={vIdx < module.videos.length - 1}
                                                                        sx={{ 
                                                                            py: 1.25, 
                                                                            px: 2, 
                                                                            borderColor: 'var(--color-vc-hairline)',
                                                                            '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } 
                                                                        }}
                                                                        secondaryAction={
                                                                            <Stack direction="row" spacing={0.5}>
                                                                                <Tooltip title="View">
                                                                                    <IconButton 
                                                                                        size="small" 
                                                                                        onClick={() => handleOpenResource(vid.url || vid.videoUrl, vid.type)}
                                                                                        sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-link)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)' } }}
                                                                                    >
                                                                                        <VisibilityIcon sx={{ fontSize: 16 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                                <Tooltip title="Copy Link">
                                                                                    <IconButton 
                                                                                        size="small" 
                                                                                        onClick={() => handleCopyLink(vid.url || vid.videoUrl)}
                                                                                        sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-mute)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', color: 'var(--color-vc-ink)' } }}
                                                                                    >
                                                                                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                                <Tooltip title="Download">
                                                                                    <IconButton 
                                                                                        size="small" 
                                                                                        onClick={() => handleOpenResource(vid.url || vid.videoUrl, true)}
                                                                                        sx={{ border: '1px solid transparent', borderRadius: '4px', p: '4px', color: 'var(--color-vc-mute)', '&:hover': { borderColor: 'var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', color: 'var(--color-vc-ink)' } }}
                                                                                    >
                                                                                        <DownloadIcon sx={{ fontSize: 16 }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Stack>
                                                                        }
                                                                    >
                                                                        <ListItemIcon sx={{ minWidth: 32 }}>{getResourceIcon(vid.type)}</ListItemIcon>
                                                                        <ListItemText
                                                                            primary={vid.title}
                                                                            secondary={`${vid.type?.toUpperCase()} ${vid.duration ? `• ${parseFloat((vid.duration / 60).toFixed(1))} min` : ''}`}
                                                                            primaryTypographyProps={{ sx: { fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit' } }}
                                                                            secondaryTypographyProps={{ sx: { fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 } }}
                                                                        />
                                                                    </ListItem>
                                                                ))}
                                                            </List>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                ))
                                            ) : (
                                                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--color-vc-canvas-soft)', border: '1px dashed var(--color-vc-hairline)', borderRadius: '6px' }}>
                                                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit' }}>No materials match your search.</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                )}

                                {tabIndex === 1 && (
                                    <Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 1.5 }}>
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                startIcon={<AddIcon />}
                                                onClick={() => setAssignmentFormOpen(true)}
                                                sx={{ 
                                                    borderRadius: '6px', 
                                                    textTransform: 'none', 
                                                    fontWeight: 500,
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    height: 32,
                                                    boxShadow: 'none',
                                                    bgcolor: 'var(--color-vc-canvas)',
                                                    color: 'var(--color-vc-ink)',
                                                    border: '1px solid var(--color-vc-hairline)',
                                                    '&:hover': {
                                                        bgcolor: 'var(--color-vc-canvas-soft)',
                                                        boxShadow: 'none',
                                                        borderColor: 'var(--color-vc-hairline-strong)'
                                                    }
                                                }}
                                            >
                                                Add Assignment
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                size="small" 
                                                startIcon={<AddIcon />}
                                                onClick={() => setExamFormOpen(true)}
                                                sx={{ 
                                                    borderRadius: '6px', 
                                                    textTransform: 'none', 
                                                    fontWeight: 500,
                                                    fontSize: '13px',
                                                    fontFamily: 'inherit',
                                                    height: 32,
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
                                                Add Exam
                                            </Button>
                                        </Box>

                                        {fullCourseData?.exams?.length > 0 && (
                                            <Box sx={{ mb: 4 }}>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'inherit' }}>
                                                    <ReceiptLongIcon fontSize="small" sx={{ color: 'var(--color-vc-mute)' }} /> Exams
                                                </Typography>
                                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                                                    <Table size="small">
                                                        <TableHead sx={{ bgcolor: 'var(--color-vc-canvas-soft)' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-ink)', fontSize: '12px', py: 1, fontFamily: 'inherit' }}>Title</TableCell>
                                                                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-ink)', fontSize: '12px', py: 1, fontFamily: 'inherit' }}>Duration</TableCell>
                                                                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-ink)', fontSize: '12px', py: 1, fontFamily: 'inherit' }}>Total Marks</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {fullCourseData.exams.map(exam => (
                                                                <TableRow key={exam._id} sx={{ '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-body)', fontSize: '13px', py: 1.25, fontFamily: 'inherit' }}>{exam.title}</TableCell>
                                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-body)', fontSize: '13px', py: 1.25, fontFamily: 'inherit' }}>{exam.duration} Min</TableCell>
                                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-body)', fontSize: '13px', py: 1.25, fontFamily: 'inherit' }}>{exam.totalMarks}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}

                                        {fullCourseData?.assignments?.length > 0 && (
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'inherit' }}>
                                                    <DescriptionIcon fontSize="small" sx={{ color: 'var(--color-vc-mute)' }} /> Assignments
                                                </Typography>
                                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', boxShadow: 'none' }}>
                                                    <Table size="small">
                                                        <TableHead sx={{ bgcolor: 'var(--color-vc-canvas-soft)' }}>
                                                            <TableRow>
                                                                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-ink)', fontSize: '12px', py: 1, fontFamily: 'inherit' }}>Title</TableCell>
                                                                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-ink)', fontSize: '12px', py: 1, fontFamily: 'inherit' }}>Type</TableCell>
                                                                <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-ink)', fontSize: '12px', py: 1, fontFamily: 'inherit' }}>Total Marks</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {fullCourseData.assignments.map(ass => (
                                                                <TableRow key={ass._id} sx={{ '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' } }}>
                                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-body)', fontSize: '13px', py: 1.25, fontFamily: 'inherit' }}>{ass.title}</TableCell>
                                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-body)', fontSize: '13px', py: 1.25, fontFamily: 'inherit', textTransform: 'capitalize' }}>{ass.assignmentType?.replace('_', ' ')}</TableCell>
                                                                    <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)', color: 'var(--color-vc-body)', fontSize: '13px', py: 1.25, fontFamily: 'inherit' }}>{ass.totalMarks}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        )}

                                        {(!fullCourseData?.assignments?.length && !fullCourseData?.exams?.length) && (
                                            <Typography sx={{ textAlign: 'center', py: 4, color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit', fontStyle: 'italic' }}>
                                                No exams or assignments allocated to this course.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'sticky', top: 20, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1, fontFamily: 'inherit' }}>
                                    Course Media assets
                                </Typography>
                                <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', overflow: 'hidden', boxShadow: 'none' }}>
                                    <Box component="img" src={fixUrl(course.thumbnail)} sx={{ width: '100%', height: 160, objectFit: 'cover' }} />
                                    <Box sx={{ p: 1.5, bgcolor: 'var(--color-vc-canvas-soft)', borderTop: '1px solid var(--color-vc-hairline)' }}>
                                        <Typography sx={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-vc-mute)', fontFamily: '"JetBrains Mono", monospace' }}>THUMBNAIL IMAGE</Typography>
                                    </Box>
                                </Card>
                            </Box>

                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'inherit' }}>
                                        Demo Preview
                                    </Typography>
                                    {course.demoVideoUrl && (
                                        <IconButton size="small" onClick={() => handleCopyLink(course.demoVideoUrl)} sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)' } }}>
                                            <ContentCopyIcon sx={{ fontSize: 13 }} />
                                        </IconButton>
                                    )}
                                </Box>
                                <Card variant="outlined" sx={{ borderRadius: '8px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', overflow: 'hidden', p: 0.5, boxShadow: 'none' }}>
                                    <Box sx={{ height: 180, bgcolor: 'black', borderRadius: '6px', overflow: 'hidden' }}>
                                        {course.demoVideoUrl ? <VideoPreview url={course.demoVideoUrl} height={180} /> : <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-vc-mute)', fontSize: '0.8rem', fontFamily: 'inherit' }}>No Demo Video</Box>}
                                    </Box>
                                </Card>
                            </Box>

                            <Box sx={{ p: 3, borderRadius: '8px', bgcolor: 'var(--color-vc-primary)', color: 'var(--color-vc-on-primary)', border: '1px solid var(--color-vc-primary)', vcShadow: 'vc-shadow-l2' }}>
                                <Typography sx={{ fontSize: '15px', fontWeight: 600, mb: 0.5, fontFamily: 'inherit' }}>Advance Ready.</Typography>
                                <Typography sx={{ opacity: 0.8, lineHeight: 1.4, fontSize: '12px', display: 'block', fontFamily: 'inherit' }}>All materials are double-checked for accessibility and performance.</Typography>
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                                    <Typography sx={{ fontSize: '10px', display: 'block', fontWeight: 600, color: 'var(--color-vc-mute)', opacity: 0.9, fontFamily: '"JetBrains Mono", monospace', mb: 0.5 }}>CREATED DATE</Typography>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 500, fontFamily: 'inherit' }}>{new Date(course.createdAt).toLocaleDateString()}</Typography>
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
                PaperProps={{ sx: { borderRadius: '8px', bgcolor: '#000', overflow: 'hidden' } }}
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

            {examFormOpen && (
                <ExamForm 
                    open={examFormOpen} 
                    onClose={() => setExamFormOpen(false)} 
                    onSuccess={() => { setExamFormOpen(false); fetchFullCourseDetails(); }}
                    autoCourseId={course._id}
                />
            )}

            {assignmentFormOpen && (
                <AssignmentFormModal 
                    open={assignmentFormOpen} 
                    onClose={() => setAssignmentFormOpen(false)} 
                    onSuccess={() => { setAssignmentFormOpen(false); fetchFullCourseDetails(); }}
                    autoCourseId={course._id}
                />
            )}
        </Dialog>
    );
};

export default CourseViewModal;
