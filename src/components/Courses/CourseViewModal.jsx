import React from 'react';
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
    AccordionDetails
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
import VideoPreview from '../Common/VideoPreview';
import { fixUrl } from '../../utils/api';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CourseViewModal = ({ open, onClose, course }) => {
    const [loading, setLoading] = React.useState(false);
    if (!course) return null;

    const handleSyncAllEnrollments = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/courses/${course._id}/sync-enrollments`);
            if (response.data.success) {
                toast.success(response.data.message);
                onClose(); // Close and let parent refresh if needed, or just stay open
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
            // For Cloudinary images/videos (NOT raw files or PDFs), we can use fl_attachment
            if (url.includes('cloudinary.com') &&
                (url.includes('/image/upload/') || url.includes('/video/upload/')) &&
                !url.toLowerCase().endsWith('.pdf')) {
                targetUrl = url.replace('/upload/', '/upload/fl_attachment/');
            }

            // Create a hidden anchor to force download
            const link = document.createElement('a');
            link.href = targetUrl;
            link.setAttribute('download', ''); // Native browser download hint
            link.setAttribute('target', '_blank');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // VIEW mode - just open in new tab
            window.open(targetUrl, '_blank');
        }
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'video': return <PlayCircleOutlineIcon fontSize="small" color="primary" />;
            case 'pdf': return <DescriptionIcon fontSize="small" color="secondary" />;
            case 'audio': return <AudiotrackIcon fontSize="small" color="warning" />;
            case 'zip': return <FolderZipIcon fontSize="small" color="error" />;
            default: return <PlayCircleOutlineIcon fontSize="small" color="action" />;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" component="span" fontWeight={700} color="primary">
                    Course Details
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {course.durationValue > 0 && (
                        <Button
                            startIcon={<SyncIcon />}
                            variant="outlined"
                            size="small"
                            onClick={handleSyncAllEnrollments}
                            disabled={loading}
                            sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
                        >
                            Sync All Enrollments
                        </Button>
                    )}
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Left Column: Info & Curriculum */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {course.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                <Chip label={course.category?.name || course.category || 'Uncategorized'} size="small" variant="outlined" />
                                <Chip label={course.level || 'Beginner'} size="small" color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                                <Chip
                                    label={course.price === 0 ? 'FREE' : `₹${course.price}`}
                                    size="small"
                                    color={course.price === 0 ? "success" : "default"}
                                    sx={{ fontWeight: 700 }}
                                />
                                <Chip
                                    icon={<ThumbUpIcon style={{ fontSize: 14 }} />}
                                    label={`${(course.fakeLikes || 0) + (course.likes?.length || 0)} Likes`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)', color: 'primary.main', fontWeight: 600 }}
                                />
                                <Chip
                                    icon={<StarIcon style={{ fontSize: 14, color: '#f57c00' }} />}
                                    label={`${course.totalReviews || 0} Reviews`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(245, 124, 0, 0.08)', color: '#f57c00', fontWeight: 600 }}
                                />
                                <Chip
                                    icon={<VisibilityIcon style={{ fontSize: 14 }} />}
                                    label={`${course.enrolledStudents?.length || 0} Students`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(76, 175, 80, 0.08)', color: 'success.main', fontWeight: 600 }}
                                />
                            </Box>

                            {/* Duration Row */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimerIcon fontSize="small" color="action" />
                                    <Typography variant="body2" fontWeight={600}>
                                        {course.durationValue === 0 ? 'Lifetime Access' : `${course.durationValue || 0} ${course.durationUnit || 'Months'}`}
                                    </Typography>
                                </Box>
                                {(course.readingDurationValue > 0 || course.readingDuration) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <MenuBookIcon fontSize="small" color="action" />
                                        <Typography variant="body2" fontWeight={600}>
                                            {course.readingDurationValue !== undefined
                                                ? `${course.readingDurationValue} ${course.readingDurationUnit || 'Hours'}`
                                                : course.readingDuration}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                                {course.description}
                            </Typography>

                            {/* GST & Certificate Box */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                                {course.isCertificate && (
                                    <Box sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1.5, flex: '1 1 200px' }}>
                                        <WorkspacePremiumIcon color="success" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Certificate Issued</Typography>
                                            <Typography variant="body2" fontWeight={700}>{course.certificateName || 'Completion Certificate'}</Typography>
                                        </Box>
                                    </Box>
                                )}
                                <Box sx={{ p: 1.5, borderRadius: 1.5, border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1.5, flex: '1 1 200px' }}>
                                    <ReceiptLongIcon color="primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">GST Details</Typography>
                                        <Typography variant="body2" fontWeight={700}>
                                            {course.gstType === 'none' ? 'No GST Applied' : `${course.gstType ? course.gstType.toUpperCase() : 'NONE'} (${course.gstPercent || 0}%)`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LayersIcon fontSize="small" color="primary" /> Curriculum
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {course.modules && course.modules.length > 0 ? (
                                course.modules.map((module, index) => (
                                    <Accordion key={index} variant="outlined" sx={{ borderRadius: 1, '&:before': { display: 'none' } }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {index + 1}. {module.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                                                ({(module.videos?.length || 0) + (module.pdfs?.length || 0)} Resources)
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ pt: 0 }}>
                                            <List size="small" disablePadding>
                                                {module.videos && module.videos.map((vid, vIdx) => (
                                                    <ListItem
                                                        key={vIdx}
                                                        sx={{ px: 1, py: 0.5 }}
                                                        secondaryAction={
                                                            <Box>
                                                                {/* Only show View for video/audio/pdf */}
                                                                {(vid.type === 'video' || vid.type === 'pdf' || vid.type === 'audio') && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleOpenResource(vid.url || vid.videoUrl)}
                                                                        color="primary"
                                                                        title="View"
                                                                    >
                                                                        <VisibilityIcon sx={{ fontSize: 18 }} />
                                                                    </IconButton>
                                                                )}
                                                                {/* Show Download for all except video maybe? Or all. Let's do all except video if user prefers, but typically all are downloadable */}
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleOpenResource(vid.url || vid.videoUrl, true)}
                                                                    color="primary"
                                                                    title="Download"
                                                                >
                                                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                                                </IconButton>
                                                            </Box>
                                                        }
                                                    >
                                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                                            {getResourceIcon(vid.type)}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={vid.title}
                                                            secondary={`${vid.type.toUpperCase()} ${vid.duration ? `• ${vid.duration} min/MB` : ''}`}
                                                            primaryTypographyProps={{ variant: 'body2' }}
                                                            secondaryTypographyProps={{ variant: 'caption', sx: { textTransform: 'uppercase' } }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </AccordionDetails>
                                    </Accordion>
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    No modules added yet.
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Right Column: Media */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ position: 'sticky', top: 0 }}>
                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                Course Thumbnail
                            </Typography>
                            <Card variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
                                {course.thumbnail ? (
                                    <Box
                                        component="img"
                                        src={fixUrl(course.thumbnail)}
                                        alt={course.title}
                                        sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Box sx={{ height: 180, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                                    </Box>
                                )}
                            </Card>

                            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                Demo Video
                            </Typography>
                            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', p: 1, minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
                                {course.demoVideoUrl ? (
                                    <VideoPreview url={course.demoVideoUrl} height={160} />
                                ) : (
                                    <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                                        <PlayCircleOutlineIcon sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography variant="caption" display="block">No Demo Video</Typography>
                                    </Box>
                                )}
                            </Card>

                            <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>Created On</Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    {new Date(course.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};

export default CourseViewModal;
