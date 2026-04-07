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
    InputAdornment
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
    const [searchQuery, setSearchQuery] = useState('');

    if (!course) return null;

    const stats = useMemo(() => {
        let videos = 0;
        let pdfs = 0;
        let audios = 0;
        let others = 0;

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
        if (!searchQuery) return course.modules || [];
        const query = searchQuery.toLowerCase();
        
        return (course.modules || []).filter(mod => {
            const modTitleMatches = mod.title.toLowerCase().includes(query);
            const lessonMatches = (mod.videos || []).some(v => v.title.toLowerCase().includes(query));
            return modTitleMatches || lessonMatches;
        }).map(mod => {
            // Further filter the lessons within matching modules
            if (mod.title.toLowerCase().includes(query)) return mod;
            return {
                ...mod,
                videos: mod.videos.filter(v => v.title.toLowerCase().includes(query))
            };
        });
    }, [course, searchQuery]);

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

    const handleOpenResource = (url, download = false) => {
        if (!url) return;
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
            maxWidth="lg"
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" fontWeight={800} color="primary">Course Portfolio Manager</Typography>
                <Box>
                    <Button startIcon={<SyncIcon />} variant="outlined" size="small" onClick={handleSyncAllEnrollments} disabled={loading} sx={{ borderRadius: 1.5, textTransform: 'none', mr: 1 }}>
                        Sync Access
                    </Button>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ p: 4 }}>
                <Grid container spacing={4}>
                    {/* Left Column: Info & Curriculum */}
                    <Grid item xs={12} md={7.5}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" fontWeight={900} gutterBottom>{course.title}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                                <Chip label={course.category?.name || 'Uncategorized'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                                <Chip label={course.level} color="primary" size="small" sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                                <Chip label={course.price === 0 ? 'FREE' : `₹${course.price}`} color={course.price === 0 ? "success" : "default"} size="small" sx={{ fontWeight: 900 }} />
                                <Chip label={`${stats.videos} Videos`} size="small" color="info" variant="outlined" />
                                <Chip label={`${stats.pdfs} PDFs`} size="small" color="secondary" variant="outlined" />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 4, mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <VisibilityIcon color="success" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Students</Typography>
                                        <Typography variant="subtitle2" fontWeight={800}>{course.enrolledStudents?.length || 0}</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <StarIcon sx={{ color: 'orange' }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Rating</Typography>
                                        <Typography variant="subtitle2" fontWeight={800}>{course.rating || 0} ({course.totalReviews || 0} reviews)</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TimerIcon color="primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Validity</Typography>
                                        <Typography variant="subtitle2" fontWeight={800}>{course.durationValue === 0 ? 'Unlimited' : `${course.durationValue} ${course.durationUnit}`}</Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 4, lineHeight: 1.6 }}>
                                {course.description}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={900}>Curriculum Dashboard</Typography>
                            <TextField
                                placeholder="Search materials..."
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                                    sx: { borderRadius: 2, bgcolor: 'white' }
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                                                        sx={{ py: 1.5, px: 2, '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
                                                        secondaryAction={
                                                            <Stack direction="row" spacing={0.5}>
                                                                <Tooltip title="View">
                                                                    <IconButton size="small" color="primary" onClick={() => handleOpenResource(vid.url || vid.videoUrl)}>
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
                    </Grid>

                    {/* Right Column: Visuals */}
                    <Grid item xs={12} md={4.5}>
                        <Box sx={{ position: 'sticky', top: 20 }}>
                            <Typography variant="subtitle2" fontWeight={800} gutterBottom sx={{ mb: 2 }}>Course Media assets</Typography>
                            <Card variant="outlined" sx={{ mb: 4, borderRadius: 3, border: '1px solid #eee' }}>
                                <Box component="img" src={fixUrl(course.thumbnail)} sx={{ width: '100%', height: 220, objectFit: 'cover' }} />
                                <CardContent sx={{ py: 1.5 }}>
                                    <Typography variant="caption" fontWeight={700}>THUMBNAIL IMAGE</Typography>
                                </CardContent>
                            </Card>

                            <Card variant="outlined" sx={{ borderRadius: 3, p: 0.5, border: '1px solid #eee' }}>
                                <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" fontWeight={700}>DEMO PREVIEW</Typography>
                                    {course.demoVideoUrl && (
                                        <IconButton size="small" onClick={() => handleCopyLink(course.demoVideoUrl)}>
                                            <ContentCopyIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    )}
                                </Box>
                                <Box sx={{ height: 200, bgcolor: 'black', borderRadius: 2.5, overflow: 'hidden' }}>
                                    {course.demoVideoUrl ? <VideoPreview url={course.demoVideoUrl} height={200} /> : <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Demo</Box>}
                                </Box>
                            </Card>

                            <Box sx={{ mt: 4, p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'white', boxShadow: '0 10px 20px rgba(25, 118, 210, 0.2)' }}>
                                <Typography variant="h5" fontWeight={900} fontStyle="italic" sx={{ mb: 1.5 }}>Advance Ready.</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5 }}>All materials are double-checked for accessibility and streaming performance.</Typography>
                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                                    <Typography variant="caption" display="block">CREATED DATE</Typography>
                                    <Typography variant="subtitle2" fontWeight={700}>{new Date(course.createdAt).toLocaleDateString()}</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default CourseViewModal;
