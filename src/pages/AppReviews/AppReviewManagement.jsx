import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, IconButton,
    Chip, Avatar, Tooltip, InputBase, MenuItem, Select, FormControl,
    InputLabel, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, Divider, Rating
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StarIcon from '@mui/icons-material/Star';
import api from '../../utils/api';
import { toast } from 'react-toastify';

/* ─────────────────── helpers ──────────────────── */
const statusColor = (s) => s === 'active' ? 'success' : 'warning';

/* ══════════════════════════════════════════════════
   REVIEW FORM MODAL
══════════════════════════════════════════════════ */
const ReviewFormModal = ({ open, onClose, review, onSuccess }) => {
    const isEdit = !!review;

    const [name, setName] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState('active');

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    /* Populate on open */
    useEffect(() => {
        if (!open) return;
        if (isEdit) {
            setName(review.name || '');
            setProfileImage(review.profileImage || '');
            setRating(review.rating || 5);
            setComment(review.review || '');
            setStatus(review.status || 'active');
        } else {
            setName(''); setProfileImage(''); setRating(5); setComment(''); setStatus('active');
        }
    }, [open]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/upload', fd);
            setProfileImage(data.url);
            toast.success('Image uploaded!');
        } catch { toast.error('Upload failed'); } finally { setUploading(false); }
    };

    const handleSave = async () => {
        if (!name.trim()) return toast.error('Name is required');
        if (!comment.trim()) return toast.error('Review text is required');

        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                profileImage,
                rating: Number(rating),
                review: comment.trim(),
                status,
            };
            if (isEdit) {
                await api.put(`/app-reviews/${review._id}`, payload);
                toast.success('Review updated!');
            } else {
                await api.post('/app-reviews', payload);
                toast.success('Review created!');
            }
            onSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800, fontSize: 20, pb: 1 }}>
                {isEdit ? '✏️ Edit App Review' : '📝 Add App Review'}
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="User Name *"
                            fullWidth
                            value={name}
                            onChange={e => setName(e.target.value)}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>
                            Rating *
                        </Typography>
                        <Rating
                            value={rating}
                            onChange={(_, newValue) => setRating(newValue)}
                            precision={1}
                            size="large"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Review Content *"
                            fullWidth
                            multiline
                            rows={3}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>
                            Profile Image (Optional)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar src={profileImage} sx={{ width: 56, height: 56 }} />
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label="Image URL"
                                    fullWidth
                                    size="small"
                                    value={profileImage}
                                    onChange={e => setProfileImage(e.target.value)}
                                    placeholder="https://..."
                                    sx={{ mb: 1 }}
                                />
                                <Button
                                    variant="outlined"
                                    component="label"
                                    size="small"
                                    disabled={uploading}
                                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                >
                                    {uploading ? 'Uploading…' : 'Upload File'}
                                    <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>

            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving} sx={{ borderRadius: 2 }}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Review'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const AppReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [selected, setSelected] = useState(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/app-reviews');
            setReviews(data.data || []);
        } catch {
            toast.error('Failed to load reviews');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review?')) return;
        try {
            await api.delete(`/app-reviews/${id}`);
            toast.success('Review deleted');
            fetchReviews();
        } catch { toast.error('Delete failed'); }
    };

    const filteredReviews = reviews.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.review.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        ⭐ App Review Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage user reviews that will be displayed in the application
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setSelected(null); setOpenForm(true); }}
                    sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 700 }}
                >
                    Add Review
                </Button>
            </Box>

            {/* Search */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Paper elevation={0} sx={{
                    p: '2px 4px', display: 'flex', alignItems: 'center',
                    width: 400, border: '1px solid', borderColor: 'divider', borderRadius: 2
                }}>
                    <SearchIcon sx={{ p: 1, color: 'text.secondary' }} />
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search reviews…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </Paper>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Review</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : filteredReviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No reviews found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredReviews.map((r) => (
                            <TableRow key={r._id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={r.profileImage}>{r.name.charAt(0)}</Avatar>
                                        <Typography variant="body2" fontWeight={700}>
                                            {r.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="body2">{r.rating}</Typography>
                                        <StarIcon sx={{ color: '#faaf00', fontSize: 18 }} />
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 300 }}>
                                    <Typography variant="body2" noWrap title={r.review}>
                                        {r.review}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={r.status}
                                        color={statusColor(r.status)}
                                        size="small"
                                        sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit">
                                        <IconButton size="small" color="info"
                                            onClick={() => { setSelected(r); setOpenForm(true); }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" color="error" onClick={() => handleDelete(r._id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ReviewFormModal
                open={openForm}
                onClose={() => { setOpenForm(false); setSelected(null); }}
                review={selected}
                onSuccess={() => { setOpenForm(false); setSelected(null); fetchReviews(); }}
            />
        </Box>
    );
};

export default AppReviewManagement;
