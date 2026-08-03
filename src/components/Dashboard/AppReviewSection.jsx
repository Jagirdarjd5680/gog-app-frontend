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
                
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    if (loading) {
        return (
            <Paper sx={{ 
                p: 3, 
                borderRadius: '8px', 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                bgcolor: 'var(--color-vc-canvas)',
                border: '1px solid var(--color-vc-hairline)',
                boxShadow: 'none'
            }}>
                <CircularProgress size={20} sx={{ color: 'var(--color-vc-primary)' }} />
            </Paper>
        );
    }

    return (
        <Paper sx={{ 
            p: 3, 
            borderRadius: '8px', 
            height: '100%', 
            bgcolor: 'var(--color-vc-canvas)',
            border: '1px solid var(--color-vc-hairline)',
            boxShadow: '0px 1px 1px rgba(0,0,0,0.02)',
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                        App Reviews
                    </Typography>
                </Box>
                <Tooltip title="Manage Reviews">
                    <IconButton size="small" onClick={() => navigate('/app-reviews')} sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)' } }}>
                        <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider sx={{ mb: 2, borderColor: 'var(--color-vc-hairline)' }} />

            {reviews.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit' }}>No reviews found.</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reviews.map((r) => (
                        <Box key={r._id} sx={{ display: 'flex', gap: 1.5 }}>
                            <Avatar src={r.profileImage} sx={{ width: 32, height: 32, border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-ink)' }}>
                                {r.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }} noWrap>
                                        {r.name}
                                    </Typography>
                                    <Rating value={r.rating} readOnly size="small" />
                                </Box>
                                <Typography sx={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: 1.4,
                                    fontSize: '11px',
                                    color: 'var(--color-vc-body)',
                                    fontFamily: 'inherit'
                                }}>
                                    {r.review}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}

            {reviews.length > 0 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography
                        sx={{ 
                            cursor: 'pointer', 
                            fontWeight: 500, 
                            color: 'var(--color-vc-link)', 
                            fontSize: '12px', 
                            fontFamily: 'inherit',
                            '&:hover': { color: 'var(--color-vc-link-deep)' }
                        }}
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
