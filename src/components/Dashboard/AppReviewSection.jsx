import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Avatar, Rating, Divider,
    CircularProgress, IconButton, Tooltip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AppReviewSection = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await api.get('/app-reviews');
                // Only show top 5 active reviews
                setReviews(data.data.slice(0, 5) || []);
            } catch (error) {
                console.error('Failed to fetch reviews', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) {
        return (
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, borderRadius: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon color="primary" />
                    <Typography variant="h6" fontWeight={800}>
                        App Reviews
                    </Typography>
                </Box>
                <Tooltip title="Manage Reviews">
                    <IconButton size="small" onClick={() => navigate('/app-reviews')}>
                        <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {reviews.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No reviews found.</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reviews.map((r) => (
                        <Box key={r._id} sx={{ display: 'flex', gap: 2 }}>
                            <Avatar src={r.profileImage} sx={{ width: 40, height: 40 }}>
                                {r.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                                        {r.name}
                                    </Typography>
                                    <Rating value={r.rating} readOnly size="small" />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: 1.4
                                }}>
                                    {r.review}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {reviews.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography
                        variant="caption"
                        color="primary"
                        sx={{ cursor: 'pointer', fontWeight: 700 }}
                        onClick={() => navigate('/app-reviews')}
                    >
                        View All Reviews
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default AppReviewSection;
