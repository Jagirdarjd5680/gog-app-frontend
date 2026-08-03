import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Button, IconButton, Stack, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TableUI from '../../components/UI/Table/TableUI';
import UniversalUpload from '../../components/Common/UniversalUpload';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import ImageIcon from '@mui/icons-material/Image';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api, { fixUrl } from '../../utils/api';
import { toast } from 'react-toastify';

const BannerManagement = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [addOpen, setAddOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const emptyForm = { name: '', imageUrl: '', linkType: 'none', externalUrl: '', status: 'published' };
    const [form, setForm] = useState(emptyForm);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/banners');
            const data = response.data?.data || response.data || [];
            setBanners(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load banners:', error);
            toast.error('Failed to load promotional banners');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this banner?')) return;
        try {
            await api.delete(`/banners/${id}`);
            toast.success('Banner deleted');
            fetchBanners();
        } catch (error) {
            toast.error('Failed to delete banner');
        }
    };



    const handleAdd = async () => {
        if (!form.name.trim()) {
            toast.error('Banner name is required');
            return;
        }
        if (!form.imageUrl.trim()) {
            toast.error('Banner image is required');
            return;
        }
        setSaving(true);
        try {
            await api.post('/banners', {
                name: form.name.trim(),
                imageUrl: form.imageUrl.trim(),
                linkType: form.linkType,
                externalUrl: form.linkType === 'external' ? form.externalUrl.trim() : undefined,
                status: form.status,
            });
            toast.success('Banner added');
            setAddOpen(false);
            setForm(emptyForm);
            fetchBanners();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add banner');
        } finally {
            setSaving(false);
        }
    };

    const filteredBanners = useMemo(() => {
        return banners.filter(b => {
            const title = (b.title || b.name || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();
            const matchesSearch = title.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (b.isPublished !== false ? 'published' : 'draft') !== statusFilter) return false;
            return true;
        });
    }, [banners, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Banners', value: banners.length, icon: <ImageIcon />, color: 'primary' },
        { title: 'Published Banners', value: banners.filter(b => b.isPublished !== false).length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Draft Slides', value: banners.filter(b => b.isPublished === false).length, icon: <EditNoteIcon />, color: 'warning' }
    ], [banners]);



    const columns = useMemo(() => [
        {
            field: 'image',
            headerName: 'BANNER PREVIEW',
            width: 160,
            cellRenderer: (params) => {
                const imgUrl = fixUrl(params.data.imageUrl || params.data.image || '');
                return (
                    <Box sx={{ width: 90, height: 45, borderRadius: '8px', overflow: 'hidden', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {imgUrl ? (
                            <Box component="img" src={imgUrl} alt="Banner" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <Typography variant="caption" color="text.secondary">NO IMAGE</Typography>
                        )}
                    </Box>
                );
            }
        },
        {
            field: 'title',
            headerName: 'TITLE / SLIDE NAME',
            flex: 2,
            minWidth: 240,
            valueGetter: (params) => params.data.title || params.data.name || 'Hero Promotion Slide'
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            cellRenderer: (params) => {
                const pub = params.data.isPublished !== false;
                return (
                    <Chip
                        label={pub ? 'PUBLISHED' : 'DRAFT'}
                        color={pub ? 'success' : 'default'}
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
                    Banner Slider & Offer Banners
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Manage homepage carousel banners, offer popups, and marketing slide links
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search banner slide title..."
                filters={[
                    {
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { value: 'all', label: 'All Banners' },
                            { value: 'published', label: 'Published' },
                            { value: 'draft', label: 'Drafts' }
                        ]
                    }
                ]}
                actionButtonText="Add Banner"
                actionButtonIcon={<AddIcon />}
                onActionClick={() => setAddOpen(true)}
            />

            <TableUI
                rowData={filteredBanners}
                columnDefs={columns}
                loading={loading}
            />

            <Dialog open={addOpen} onClose={() => !saving && setAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Add Banner</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Banner Name"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Summer Sale Hero Slide"
                        sx={{ mt: 1, mb: 2 }}
                    />

                    <UniversalUpload
                        label="Banner Image"
                        value={form.imageUrl}
                        onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
                        type="image"
                        placeholder="https://example.com/banner.jpg"
                    />

                    <TextField
                        select
                        fullWidth
                        label="Link Type"
                        value={form.linkType}
                        onChange={(e) => setForm(f => ({ ...f, linkType: e.target.value }))}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="none">No Link</MenuItem>
                        <MenuItem value="blog">Blog Post</MenuItem>
                        <MenuItem value="course">Course</MenuItem>
                        <MenuItem value="exam">Exam</MenuItem>
                        <MenuItem value="external">External URL</MenuItem>
                    </TextField>

                    {form.linkType === 'external' && (
                        <TextField
                            fullWidth
                            label="External URL"
                            value={form.externalUrl}
                            onChange={(e) => setForm(f => ({ ...f, externalUrl: e.target.value }))}
                            placeholder="https://example.com"
                            sx={{ mb: 2 }}
                        />
                    )}

                    <TextField
                        select
                        fullWidth
                        label="Status"
                        value={form.status}
                        onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                    >
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="draft">Draft</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd} disabled={saving} sx={{ borderRadius: 2, px: 3 }}>
                        {saving ? 'Adding...' : 'Add Banner'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BannerManagement;
