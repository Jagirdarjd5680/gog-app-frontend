import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Rating, TextField, Button, Avatar, Stack, Paper, CircularProgress } from '@mui/material';
import { courseViewerService } from '../../../api/courseViewer/service';
import { toast } from 'react-toastify';

export function ReviewsTab({ courseId, isEnrolled }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        try {
            const result = await courseViewerService.getReviews(courseId);
            setData(result);
            const mine = result.reviews.find((r) => r.isMine);
            if (mine) {
                setRating(mine.rating);
                setComment(mine.comment);
            }
        } catch (err) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        load();
    }, [load]);

    const myReview = data?.reviews.find((r) => r.isMine);

    const handleSubmit = async () => {
        if (!rating) {
            toast.error('Please select a star rating');
            return;
        }
        setSubmitting(true);
        try {
            await courseViewerService.submitReview(courseId, rating, comment);
            toast.success(myReview ? 'Review updated!' : 'Review submitted!');
            await load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h3" fontWeight={900}>{data.average || 0}</Typography>
                <Box>
                    <Rating value={data.average || 0} precision={0.1} readOnly />
                    <Typography variant="caption" color="text.secondary" display="block">{data.count} review{data.count === 1 ? '' : 's'}</Typography>
                </Box>
            </Stack>

            {isEnrolled ? (
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                        {myReview ? 'Edit your review' : 'Rate this course'}
                    </Typography>
                    <Rating value={rating} onChange={(_, v) => setRating(v)} size="large" sx={{ mb: 1.5 }} />
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        placeholder="Share your experience with this course..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        sx={{ mb: 1.5 }}
                    />
                    <Button
                        variant="contained"
                        disabled={submitting}
                        onClick={handleSubmit}
                        sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
                    >
                        {submitting ? <CircularProgress size={18} color="inherit" /> : myReview ? 'Update Review' : 'Submit Review'}
                    </Button>
                </Paper>
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Enroll in this course to leave a review.
                </Typography>
            )}

            <Stack spacing={2}>
                {data.reviews.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No reviews yet — be the first!</Typography>
                ) : (
                    data.reviews.map((r) => (
                        <Paper key={r.id} elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <Avatar src={r.user?.avatar} sx={{ width: 36, height: 36 }}>{(r.user?.name || '?').charAt(0)}</Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body2" fontWeight={700}>{r.user?.name}{r.isMine ? ' (You)' : ''}</Typography>
                                        <Rating value={r.rating} size="small" readOnly />
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">{r.comment}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    ))
                )}
            </Stack>
        </Box>
    );
}
