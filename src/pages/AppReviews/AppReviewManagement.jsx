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
import api, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';

/* ─────────────────── helpers ──────────────────── */
const statusColor = (s) => s === 'active' ? 'success' : 'warning';

const VideoPreview = ({ url }) => {
    if (!url) return null;

    try {
        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let vidId = '';
            if (url.includes('v=')) vidId = url.split('v=')[1].split('&')[0];
            else if (url.includes('shorts/')) vidId = url.split('shorts/')[1].split('?')[0];
            else if (url.includes('youtu.be/')) vidId = url.split('youtu.be/')[1].split('?')[0];

            return (
                <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', width: '100%', aspectRatio: '16/9', bgcolor: '#f0f0f0' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${vidId}`}
                        title="YouTube Preview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </Box>
            );
        }

        // Instagram
        if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
            const embedUrl = url.split('?')[0].replace(/\/$/, "") + "/embed";
            return (
                <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', width: '100%', height: 450, maxWidth: 300, mx: 'auto', bgcolor: '#f0f0f0' }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title="Instagram Preview"
                        frameBorder="0"
                        scrolling="no"
                        allowtransparency="true"
                    ></iframe>
                </Box>
            );
        }

        // Direct Video
        if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')) {
            return (
                <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', width: '100%', bgcolor: 'black' }}>
                    <video controls width="100%" src={url}>
                        Your browser does not support the video tag.
                    </video>
                </Box>
            );
        }
    } catch (e) {
        return <Typography color="error" variant="caption">Invalid URL format for preview</Typography>;
    }

    return null;
};

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
    const [videoUrl, setVideoUrl] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [aspectRatio, setAspectRatio] = useState('16:9');

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
            setVideoUrl(review.videoUrl || '');
            setThumbnail(review.thumbnail || '');
            setAspectRatio(review.aspectRatio || '16:9');
        } else {
            setName(''); setProfileImage(''); setRating(5); setComment(''); setStatus('active');
            setVideoUrl(''); setThumbnail(''); setAspectRatio('16:9');
        }
    }, [open]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfileImage(data.url);
            toast.success('Image uploaded!');
        } catch { toast.error('Upload failed'); } finally { setUploading(false); }
    };

    const handleThumbnailUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setThumbnail(data.url);
            toast.success('Thumbnail uploaded!');
        } catch { toast.error('Upload failed'); } finally { setUploading(false); }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/upload', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setVideoUrl(data.url);
            toast.success('Video uploaded!');
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
                videoUrl: videoUrl.trim(),
                thumbnail: thumbnail.trim(),
                aspectRatio,
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
                            <Avatar src={fixUrl(profileImage)} sx={{ width: 56, height: 56 }} />
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

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" fontWeight={700} color="primary" mb={2}>
                            Video Details (Success Story)
                        </Typography>
                        <TextField
                            label="Video URL (YT, Instagram Reels, Direct)"
                            fullWidth
                            size="small"
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            placeholder="YT Shorts, Instagram Reel, or MP4 URL"
                            sx={{ mb: 1 }}
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            disabled={uploading}
                            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                            sx={{ mb: 2 }}
                        >
                            {uploading ? 'Uploading Video…' : 'Upload Video File'}
                            <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
                        </Button>

                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Video Aspect Ratio</InputLabel>
                            <Select
                                value={aspectRatio}
                                label="Video Aspect Ratio"
                                onChange={e => setAspectRatio(e.target.value)}
                            >
                                <MenuItem value="16:9">16:9 (Horizontal/YT)</MenuItem>
                                <MenuItem value="9:16">9:16 (Vertical/Reel)</MenuItem>
                            </Select>
                        </FormControl>

                        <VideoPreview url={videoUrl} />
                        
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>
                            Video Thumbnail
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {thumbnail && (
                                <Box component="img" src={fixUrl(thumbnail)} sx={{ width: 100, height: 60, borderRadius: 1, objectFit: 'cover' }} />
                            )}
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label="Thumbnail URL"
                                    fullWidth
                                    size="small"
                                    value={thumbnail}
                                    onChange={e => setThumbnail(e.target.value)}
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
                                    {uploading ? 'Uploading…' : 'Upload Thumbnail'}
                                    <input type="file" accept="image/*" hidden onChange={handleThumbnailUpload} />
                                </Button>
                            </Box>
                        </Box>
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
                                        <Avatar src={fixUrl(r.profileImage)}>{r.name.charAt(0)}</Avatar>
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
