import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination, IconButton,
    Chip, Avatar, Tooltip, InputBase, MenuItem, Select, FormControl,
    InputLabel, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, ToggleButton, ToggleButtonGroup, Tabs, Tab,
    Grid, Divider, Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ImageIcon from '@mui/icons-material/Image';
import LinkIcon from '@mui/icons-material/Link';
import CollectionsIcon from '@mui/icons-material/Collections';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import api from '../../utils/api';
import { toast } from 'react-toastify';

/* ─────────────────── helpers ──────────────────── */
const LINK_TYPES = [
    { value: 'course', label: '📚 Course' },
    { value: 'blog', label: '📝 Blog' },
    { value: 'exam', label: '📋 Exam' },
    { value: 'external', label: '🌐 External URL' },
    { value: 'none', label: '❌ No Link' },
];

const linkLabel = (type) => LINK_TYPES.find(l => l.value === type)?.label || type;
const statusColor = (s) => s === 'published' ? 'success' : 'warning';

/* ══════════════════════════════════════════════════
   BANNER FORM MODAL
══════════════════════════════════════════════════ */
const BannerFormModal = ({ open, onClose, banner, onSuccess }) => {
    const isEdit = !!banner;

    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [imageTab, setImageTab] = useState(0); // 0=upload 1=url 2=gallery
    const [linkType, setLinkType] = useState('course');
    const [linkId, setLinkId] = useState(null);
    const [externalUrl, setExternalUrl] = useState('');
    const [order, setOrder] = useState(0);
    const [status, setStatus] = useState('draft');

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [gallery, setGallery] = useState([]);
    const [galleryLoading, setGalleryLoading] = useState(false);

    // Options for autocomplete
    const [courses, setCourses] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [exams, setExams] = useState([]);

    /* Populate on open */
    useEffect(() => {
        if (!open) return;
        if (isEdit) {
            setName(banner.name || '');
            setImage(banner.image || '');
            setLinkType(banner.linkType || 'course');
            setLinkId(banner.linkId || null);
            setExternalUrl(banner.externalUrl || '');
            setOrder(banner.order ?? 0);
            setStatus(banner.status || 'draft');
            setImageTab(0);
        } else {
            setName(''); setImage(''); setLinkType('course');
            setLinkId(null); setExternalUrl(''); setOrder(0); setStatus('draft');
            setImageTab(0);
        }
        // Load link options
        fetchOptions();
    }, [open]);

    const fetchOptions = async () => {
        try {
            const [c, b, e] = await Promise.all([
                api.get('/courses?limit=200'),
                api.get('/blogs?limit=200'),
                api.get('/exams?limit=200'),
            ]);
            setCourses((c.data.courses || c.data.data || []).map(x => ({ label: x.title || x.name, id: x._id })));
            setBlogs((b.data.blogs || b.data.data || []).map(x => ({ label: x.title, id: x._id })));
            setExams((e.data.exams || e.data.data || []).map(x => ({ label: x.title || x.name, id: x._id })));
        } catch { /* silent */ }
    };

    const loadGallery = async () => {
        setGalleryLoading(true);
        try {
            const { data } = await api.get('/upload?limit=30');
            const imgs = (data.files || []).filter(f => f.type === 'image');
            setGallery(imgs);
        } catch { } finally { setGalleryLoading(false); }
    };

    const handleTabChange = (_, v) => {
        setImageTab(v);
        if (v === 2) loadGallery();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/upload', fd);
            setImage(data.url);
            toast.success('Image uploaded!');
        } catch { toast.error('Upload failed'); } finally { setUploading(false); }
    };

    const getLinkOptions = () => {
        if (linkType === 'course') return courses;
        if (linkType === 'blog') return blogs;
        if (linkType === 'exam') return exams;
        return [];
    };

    const handleSave = async () => {
        if (!name.trim()) return toast.error('Banner name is required');
        if (!image) return toast.error('Please select or upload an image');
        if (linkType !== 'external' && linkType !== 'none' && !linkId) return toast.error('Please select a link target');
        if (linkType === 'external' && !externalUrl.trim()) return toast.error('Please enter the external URL');

        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                image,
                linkType,
                linkId: linkType !== 'external' ? linkId : null,
                externalUrl: linkType === 'external' ? externalUrl.trim() : '',
                order: parseInt(order) || 0,
                status,
            };
            if (isEdit) {
                await api.put(`/banners/${banner._id}`, payload);
                toast.success('Banner updated!');
            } else {
                await api.post('/banners', payload);
                toast.success('Banner created!');
            }
            onSuccess();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally { setSaving(false); }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800, fontSize: 20, pb: 1 }}>
                {isEdit ? '✏️ Edit Banner' : '🖼️ Add New Banner'}
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={3}>
                    {/* Left col */}
                    <Grid item xs={12} md={6}>
                        {/* Name */}
                        <TextField
                            label="Banner Name *"
                            fullWidth
                            value={name}
                            onChange={e => setName(e.target.value)}
                            sx={{ mb: 2 }}
                            size="small"
                        />

                        {/* Image selector */}
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>
                            🖼️ Banner Image *
                        </Typography>
                        <Tabs value={imageTab} onChange={handleTabChange}
                            variant="fullWidth" sx={{ mb: 2, bgcolor: 'action.hover', borderRadius: 2, p: 0.5 }}>
                            <Tab icon={<CloudUploadIcon fontSize="small" />} label="Upload" sx={{ fontSize: 11, minHeight: 40 }} />
                            <Tab icon={<LinkIcon fontSize="small" />} label="URL" sx={{ fontSize: 11, minHeight: 40 }} />
                            <Tab icon={<CollectionsIcon fontSize="small" />} label="Gallery" sx={{ fontSize: 11, minHeight: 40 }} />
                        </Tabs>

                        {imageTab === 0 && (
                            <Box>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    disabled={uploading}
                                    startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                    sx={{ borderRadius: 2, py: 1.5, borderStyle: 'dashed' }}
                                >
                                    {uploading ? 'Uploading…' : 'Click to Upload Image'}
                                    <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                                </Button>
                            </Box>
                        )}

                        {imageTab === 1 && (
                            <TextField
                                label="Paste Image URL"
                                fullWidth
                                size="small"
                                value={image}
                                onChange={e => setImage(e.target.value)}
                                placeholder="https://..."
                            />
                        )}

                        {imageTab === 2 && (
                            <Box>
                                {galleryLoading ? (
                                    <Box textAlign="center" py={2}><CircularProgress size={24} /></Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 180, overflowY: 'auto' }}>
                                        {gallery.length === 0 && (
                                            <Typography variant="caption" color="text.secondary">No images found</Typography>
                                        )}
                                        {gallery.map(f => (
                                            <Box
                                                key={f._id}
                                                onClick={() => setImage(f.url)}
                                                sx={{
                                                    width: 64, height: 64, cursor: 'pointer', borderRadius: 1,
                                                    overflow: 'hidden', border: image === f.url ? '2px solid' : '2px solid transparent',
                                                    borderColor: image === f.url ? 'primary.main' : 'transparent',
                                                    transition: '0.2s',
                                                    '&:hover': { opacity: 0.8 },
                                                }}
                                            >
                                                <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* Preview */}
                        {image && (
                            <Box mt={2} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                                <img src={image} alt="preview"
                                    style={{ width: '100%', height: 120, objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                            </Box>
                        )}
                    </Grid>

                    {/* Right col */}
                    <Grid item xs={12} md={6}>
                        {/* Link Type */}
                        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                            <InputLabel>Link Type *</InputLabel>
                            <Select value={linkType} label="Link Type *"
                                onChange={e => { setLinkType(e.target.value); setLinkId(null); setExternalUrl(''); }}>
                                {LINK_TYPES.map(l => (
                                    <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Link Target */}
                        {linkType === 'external' ? (
                            <TextField
                                label="External URL *"
                                fullWidth size="small" sx={{ mb: 2 }}
                                value={externalUrl}
                                onChange={e => setExternalUrl(e.target.value)}
                                placeholder="https://example.com"
                            />
                        ) : linkType !== 'none' ? (
                            <Autocomplete
                                options={getLinkOptions()}
                                getOptionLabel={o => o.label || ''}
                                value={getLinkOptions().find(o => o.id === linkId) || null}
                                onChange={(_, v) => setLinkId(v?.id || null)}
                                size="small"
                                sx={{ mb: 2 }}
                                renderInput={params => (
                                    <TextField {...params}
                                        label={`Select ${linkType.charAt(0).toUpperCase() + linkType.slice(1)} *`}
                                    />
                                )}
                            />
                        ) : null}

                        {/* Order */}
                        <TextField
                            label="Display Order"
                            type="number"
                            fullWidth size="small" sx={{ mb: 2 }}
                            value={order}
                            onChange={e => setOrder(e.target.value)}
                            helperText="Lower number appears first"
                            inputProps={{ min: 0 }}
                        />

                        {/* Status */}
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>Status</Typography>
                        <ToggleButtonGroup
                            value={status}
                            exclusive
                            onChange={(_, v) => v && setStatus(v)}
                            fullWidth
                            size="small"
                            sx={{ mb: 2 }}
                        >
                            <ToggleButton value="published" sx={{
                                '&.Mui-selected': { bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }
                            }}>
                                <PublishedWithChangesIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Published
                            </ToggleButton>
                            <ToggleButton value="draft" sx={{
                                '&.Mui-selected': { bgcolor: 'warning.main', color: 'white', '&:hover': { bgcolor: 'warning.dark' } }
                            }}>
                                <UnpublishedIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Draft
                            </ToggleButton>
                        </ToggleButtonGroup>
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
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ borderRadius: 2, px: 3 }}
                >
                    {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Banner'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [selected, setSelected] = useState(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/banners', {
                params: { page: page + 1, limit: rowsPerPage, status: statusFilter || undefined }
            });
            let list = data.data || [];
            if (search) {
                list = list.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
            }
            setBanners(list);
            setTotal(data.total || 0);
        } catch {
            toast.error('Failed to load banners');
        } finally { setLoading(false); }
    }, [page, rowsPerPage, statusFilter, search]);

    useEffect(() => {
        const t = setTimeout(fetchBanners, 300);
        return () => clearTimeout(t);
    }, [fetchBanners]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await api.delete(`/banners/${id}`);
            toast.success('Banner deleted');
            fetchBanners();
        } catch { toast.error('Delete failed'); }
    };

    const handleToggleStatus = async (banner) => {
        const newStatus = banner.status === 'published' ? 'draft' : 'published';
        try {
            await api.put(`/banners/${banner._id}`, { status: newStatus });
            toast.success(`Banner ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
            fetchBanners();
        } catch { toast.error('Status update failed'); }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        🖼️ App Banner Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage banners shown on the mobile app — link to courses, blogs, exams or external URLs
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setSelected(null); setOpenForm(true); }}
                    sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 700 }}
                >
                    Add Banner
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Paper elevation={0} sx={{
                    p: '2px 4px', display: 'flex', alignItems: 'center',
                    width: 320, border: '1px solid', borderColor: 'divider', borderRadius: 2
                }}>
                    <SearchIcon sx={{ p: 1, color: 'text.secondary' }} />
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search banners…"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(0); }}
                    />
                </Paper>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status"
                        onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                        sx={{ borderRadius: 2 }}>
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                    </Select>
                </FormControl>

                <Box ml="auto">
                    <Chip label={`Total: ${total}`} color="primary" variant="outlined" />
                </Box>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, width: 40 }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Banner</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Link Type</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Link Target</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                                    <Typography color="text.secondary">No banners yet. Click "Add Banner" to create one.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : banners.map((b, idx) => (
                            <TableRow key={b._id} hover>
                                <TableCell>
                                    <DragIndicatorIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar variant="rounded"
                                            src={b.image}
                                            sx={{ width: 72, height: 44, borderRadius: 1 }}
                                        >
                                            <ImageIcon />
                                        </Avatar>
                                        <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 220 }}>
                                            {b.name}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip label={linkLabel(b.linkType)} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 160, display: 'block' }}>
                                        {b.linkType === 'external' ? (b.externalUrl || '—') : (b.linkId ? String(b.linkId) : '—')}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={b.order} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={b.status}
                                        color={statusColor(b.status)}
                                        size="small"
                                        sx={{ fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer' }}
                                        onClick={() => handleToggleStatus(b)}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit">
                                        <IconButton size="small" color="info"
                                            onClick={() => { setSelected(b); setOpenForm(true); }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton size="small" color="error" onClick={() => handleDelete(b._id)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, v) => setPage(v)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                />
            </TableContainer>

            <BannerFormModal
                open={openForm}
                onClose={() => { setOpenForm(false); setSelected(null); }}
                banner={selected}
                onSuccess={() => { setOpenForm(false); setSelected(null); fetchBanners(); }}
            />
        </Box>
    );
};

export default BannerManagement;
