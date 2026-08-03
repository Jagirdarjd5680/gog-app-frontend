import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Button, IconButton, Stack, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Rating
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AppReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [addOpen, setAddOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const emptyForm = { name: '', rating: 5, review: '', status: 'active' };
    const [form, setForm] = useState(emptyForm);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/app-reviews');
            const data = response.data?.data || response.data || [];
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load app reviews:', error);
            toast.error('Failed to load app reviews');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this app review?')) return;
        try {
            await api.delete(`/app-reviews/${id}`);
            toast.success('Review deleted');
            fetchReviews();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    const handleAdd = async () => {
        if (!form.review.trim()) {
            toast.error('Review text is required');
            return;
        }
        setSaving(true);
        try {
            await api.post('/app-reviews', {
                name: form.name.trim() || undefined,
                rating: Number(form.rating) || 5,
                review: form.review.trim(),
                status: form.status,
            });
            toast.success('Review added');
            setAddOpen(false);
            setForm(emptyForm);
            fetchReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add review');
        } finally {
            setSaving(false);
        }
    };

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const name = (r.name || r.author || '').toLowerCase();
            const comment = (r.comment || r.reviewText || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = name.includes(term) || comment.includes(term);
            if (!matchesSearch) return false;

            if (ratingFilter !== 'all' && String(r.rating || 5) !== ratingFilter) return false;
            return true;
        });
    }, [reviews, searchTerm, ratingFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Reviews', value: reviews.length, icon: <RateReviewIcon />, color: 'primary' },
        { title: '5-Star Ratings', value: reviews.filter(r => r.rating === 5).length, icon: <StarIcon />, color: 'warning' },
        { title: 'Approved Testimonials', value: reviews.filter(r => r.status !== 'inactive').length, icon: <CheckCircleIcon />, color: 'success' }
    ], [reviews]);



    const columns = useMemo(() => [
        {
            field: 'name',
            headerName: 'REVIEWER NAME',
            flex: 1.5,
            minWidth: 200,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                        {(params.data.name || params.data.author || 'A').charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                        {params.data.name || params.data.author || 'Anonymous User'}
                    </Typography>
                </Stack>
            )
        },
        {
            field: 'rating',
            headerName: 'STAR RATING',
            width: 140,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'amber.main', fontWeight: 800 }}>
                    <StarIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                    <Typography variant="body2" fontWeight={800}>{params.data.rating || 5} / 5</Typography>
                </Stack>
            )
        },
        {
            field: 'comment',
            headerName: 'COMMENT / TESTIMONIAL',
            flex: 2,
            minWidth: 260,
            valueGetter: (params) => params.data.comment || params.data.reviewText || 'N/A'
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 130,
            cellRenderer: (params) => {
                const active = params.data.status !== 'inactive';
                return (
                    <Chip
                        label={active ? 'APPROVED' : 'HIDDEN'}
                        color={active ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 120,
            cellRenderer: (params) => {
                const id = params.data._id || params.data.id;
                return (
                    <IconButton size="small" onClick={() => handleDelete(id)} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                );
            }
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    App Reviews & Student Testimonials
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Moderate student feedback, app store star ratings, and student success testimonials
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search reviewer name or testimonial comment..."
                filters={[
                    {
                        value: ratingFilter,
                        onChange: setRatingFilter,
                        options: [
                            { value: 'all', label: 'All Ratings' },
                            { value: '5', label: '5 Stars Only' },
                            { value: '4', label: '4 Stars Only' }
                        ]
                    }
                ]}
                actionButtonText="Add Review"
                actionButtonIcon={<AddIcon />}
                onActionClick={() => setAddOpen(true)}
            />

            <TableUI
                rowData={filteredReviews}
                columnDefs={columns}
                loading={loading}
            />

            <Dialog open={addOpen} onClose={() => !saving && setAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Add App Review</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Reviewer Name"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Priya Sharma"
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">Rating</Typography>
                        <Rating
                            value={Number(form.rating)}
                            onChange={(e, val) => setForm(f => ({ ...f, rating: val || 5 }))}
                        />
                    </Stack>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Review / Testimonial"
                        value={form.review}
                        onChange={(e) => setForm(f => ({ ...f, review: e.target.value }))}
                        placeholder="What did the student say about the app?"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        select
                        fullWidth
                        label="Status"
                        value={form.status}
                        onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                    >
                        <MenuItem value="active">Active (Approved)</MenuItem>
                        <MenuItem value="inactive">Inactive (Hidden)</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd} disabled={saving} sx={{ borderRadius: 2, px: 3 }}>
                        {saving ? 'Adding...' : 'Add Review'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppReviewManagement;
