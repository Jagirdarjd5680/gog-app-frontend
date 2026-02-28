import { Box, Typography, Card, CardContent, Divider, Grid } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment'; // Added this import
import VideoPreview from '../../Common/VideoPreview';

const ReviewStep = ({ values }) => {
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
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {values.description || 'No description provided.'}
                            </Typography>

                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <Typography variant="caption" color="text.secondary">Category</Typography>
                                    <Typography variant="body2">{values.category || 'N/A'}</Typography>
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
                                <Card key={index} variant="outlined" sx={{ borderRadius: 1, bgcolor: 'background.default' }}>
                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {index + 1}. {module.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {module.videos?.length || 0} Resources
                                        </Typography>
                                    </CardContent>
                                </Card>
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
