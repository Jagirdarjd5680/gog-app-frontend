import { 
    Box, Typography, Card, CardContent, Divider, Grid, 
    Accordion, AccordionSummary, AccordionDetails, 
    List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment'; // Added this import
import VideoPreview from '../../Common/VideoPreview';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const ReviewStep = ({ values, categories = [] }) => {
    const categoryName = categories.find(c => c._id === values.category)?.name || values.category || 'N/A';

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
                                    '& strong': { fontWeight: 700, color: 'text.primary' }
                                }}
                                dangerouslySetInnerHTML={{ __html: values.description || 'No description provided.' }}
                            />

                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">Category</Typography>
                                    <Typography variant="body2">{categoryName}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">Level</Typography>
                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{values.level}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">Price</Typography>
                                    <Typography variant="body2" fontWeight={600}>
                                        {values.price > 0 ? `₹${values.price}` : 'Free'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Course Duration</Typography>
                                    <Typography variant="body2">
                                        {values.durationValue || 0} {values.durationUnit}
                                        {values.durationValue === 0 && ' (Lifetime)'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">Reading Duration</Typography>
                                    <Typography variant="body2">
                                        {values.readingDurationValue || 0} {values.readingDurationUnit}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Curriculum Summary */}
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Curriculum Structure
                    </Typography>
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
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No topics added yet.
                            </Typography>
                        )}
                    </Box>
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
