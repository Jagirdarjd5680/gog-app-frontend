
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Rating,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    IconButton,
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ReviewModal = ({ open, onClose, courseId, courseTitle }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: '',
        studentName: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && courseId) {
            fetchReviews();
        }
    }, [open, courseId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            // Note: Update backend route to fetch reviews by courseId
            // Assuming GET /api/reviews/:courseId
            const { data } = await api.get(`/reviews/${courseId}`);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            // toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!newReview.comment.trim()) {
            toast.warning('Please enter a comment');
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await api.post('/reviews', {
                courseId,
                rating: newReview.rating,
                comment: newReview.comment,
                studentName: newReview.studentName
            });
            setReviews([data, ...reviews]);
            setNewReview({ rating: 5, comment: '', studentName: '' });
            toast.success('Review submitted successfully');
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.msg || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                Ratings & Reviews - {courseTitle}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 4, bgcolor: 'rgba(0,0,0,0.02)', p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Write a Review</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography component="legend" sx={{ mr: 1 }}>Rating:</Typography>
                        <Rating
                            name="simple-controlled"
                            value={newReview.rating}
                            onChange={(event, newValue) => {
                                setNewReview({ ...newReview, rating: newValue });
                            }}
                        />
                    </Box>

                    <TextField
                        fullWidth
                        size="small"
                        variant="outlined"
                        placeholder="Student Name (Optional)"
                        value={newReview.studentName}
                        onChange={(e) => setNewReview({ ...newReview, studentName: e.target.value })}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        placeholder="Share your experience with this course..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    />
                    <Box sx={{ textAlign: 'right', mt: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting...' : 'Post Review'}
                        </Button>
                    </Box>
                </Box>

                <Typography variant="h6" gutterBottom>Student Reviews ({reviews.length})</Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {reviews.length === 0 ? (
                            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                                No reviews yet. Be the first to review!
                            </Typography>
                        ) : (
                            reviews.map((review) => (
                                <React.Fragment key={review._id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemAvatar>
                                            <Avatar alt={review.user?.name} src={review.user?.avatar} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography component="span" variant="subtitle1" fontWeight="bold">
                                                        {review.studentName || review.user?.name || 'Anonymous'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <React.Fragment>
                                                    <Rating value={review.rating} readOnly size="small" />
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                        display="block"
                                                        sx={{ mt: 1 }}
                                                    >
                                                        {review.comment}
                                                    </Typography>
                                                </React.Fragment>
                                            }
                                        />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                </React.Fragment>
                            ))
                        )}
                    </List>
                )}
            </DialogContent>
        </Dialog >
    );
};

export default ReviewModal;
