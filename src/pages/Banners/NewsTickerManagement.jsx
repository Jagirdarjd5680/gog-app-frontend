import { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton,
    Chip, Tooltip, InputBase, MenuItem, Select, FormControl,
    InputLabel, CircularProgress, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, Divider, Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CampaignIcon from '@mui/icons-material/Campaign';
import LinkIcon from '@mui/icons-material/Link';
import api from '../../utils/api';
import { toast } from 'react-toastify';

/* ─────────────────── helpers ──────────────────── */
const LINK_TYPES = [
    { value: 'none', label: '❌ No Link' },
    { value: 'course', label: '📚 Course' },
    { value: 'blog', label: '📝 Blog' },
    { value: 'external', label: '🌐 External URL' },
];

const linkLabel = (type) => LINK_TYPES.find(l => l.value === type)?.label || type;

/* ══════════════════════════════════════════════════
   NEWS TICKER FORM MODAL
══════════════════════════════════════════════════ */
const NewsTickerFormModal = ({ open, onClose, item, onSuccess }) => {
    const isEdit = !!item;

    const [text, setText] = useState('');
    const [linkType, setLinkType] = useState('none');
    const [link, setLink] = useState('');
    const [order, setOrder] = useState(0);
    const [isActive, setIsActive] = useState(true);

    const [saving, setSaving] = useState(false);
    const [courses, setCourses] = useState([]);
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        if (!open) return;
        if (isEdit) {
            setText(item.text || '');
            setLinkType(item.linkType || 'none');
            setLink(item.link || '');
            setOrder(item.order ?? 0);
            setIsActive(item.isActive ?? true);
        } else {
            setText(''); setLinkType('none'); setLink('');
            setOrder(0); setIsActive(true);
        }
        fetchOptions();
    }, [open, isEdit, item]);

    const fetchOptions = async () => {
        try {
            const [c, b] = await Promise.all([
                api.get('/courses/public'),
                api.get('/blogs/public'),
            ]);
            setCourses((c.data.data || []).map(x => ({ label: x.title, id: x._id })));
            setBlogs((b.data.data || []).map(x => ({ label: x.title, id: x._id })));
        } catch { /* silent */ }
    };

    const handleSave = async () => {
        if (!text.trim()) return toast.error('Text is required');

        setSaving(true);
        try {
            const payload = {
                text: text.trim(),
                linkType,
                link,
                order: Number(order),
                isActive
            };

            if (isEdit) {
                await api.put(`/news-ticker/${item._id}`, payload);
                toast.success('Ticker item updated!');
            } else {
                await api.post('/news-ticker', payload);
                toast.success('Ticker item created!');
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
                {isEdit ? '✏️ Edit News Ticker' : '📢 Add News Ticker'}
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ pt: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Ticker Text (Emojis allowed) *"
                            fullWidth
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g. 🚀 New Advanced Course Launched!"
                            variant="outlined"
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            <InputLabel>Link Type</InputLabel>
                            <Select
                                value={linkType}
                                label="Link Type"
                                onChange={(e) => {
                                    setLinkType(e.target.value);
                                    setLink('');
                                }}
                            >
                                {LINK_TYPES.map(l => (
                                    <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Display Order"
                            type="number"
                            fullWidth
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        {linkType === 'course' && (
                            <Autocomplete
                                options={courses}
                                value={courses.find(c => c.id === link) || null}
                                onChange={(_, val) => setLink(val?.id || '')}
                                renderInput={(params) => <TextField {...params} label="Select Course" />}
                            />
                        )}
                        {linkType === 'blog' && (
                            <Autocomplete
                                options={blogs}
                                value={blogs.find(b => b.id === link) || null}
                                onChange={(_, val) => setLink(val?.id || '')}
                                renderInput={(params) => <TextField {...params} label="Select Blog" />}
                            />
                        )}
                        {linkType === 'external' && (
                            <TextField
                                label="External URL"
                                fullWidth
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://youtube.com/..."
                            />
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={isActive}
                                label="Status"
                                onChange={(e) => setIsActive(e.target.value)}
                            >
                                <MenuItem value={true}>Active (Visible)</MenuItem>
                                <MenuItem value={false}>Inactive (Hidden)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>

            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={saving}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ borderRadius: 2, px: 3 }}
                    startIcon={saving && <CircularProgress size={16} color="inherit" />}
                >
                    {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const NewsTickerManagement = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/news-ticker/admin');
            setItems(data.data || []);
        } catch (error) {
            toast.error('Failed to load news ticker items');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news ticker item?')) return;
        try {
            await api.delete(`/news-ticker/${id}`);
            toast.success('Item deleted');
            fetchItems();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const filteredItems = items.filter(item =>
        item.text.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        📢 News Ticker
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage scrolling announcements for the mobile app
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setSelectedItem(null); setOpenForm(true); }}
                    sx={{ borderRadius: 2, px: 3, py: 1 }}
                >
                    Add News
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        width: 400,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2
                    }}
                >
                    <SearchIcon sx={{ p: 1, color: 'text.secondary' }} />
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search news..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Paper>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>News Text</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Link</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No news ticker items found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredItems.map((item) => (
                                <TableRow key={item._id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{item.text}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LinkIcon size="small" color="action" />
                                            <Typography variant="body2">{linkLabel(item.linkType)}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.order}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.isActive ? 'Active' : 'Inactive'}
                                            color={item.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit">
                                            <IconButton color="info" onClick={() => { setSelectedItem(item); setOpenForm(true); }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton color="error" onClick={() => handleDelete(item._id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <NewsTickerFormModal
                open={openForm}
                onClose={() => { setOpenForm(false); setSelectedItem(null); }}
                item={selectedItem}
                onSuccess={() => { setOpenForm(false); setSelectedItem(null); fetchItems(); }}
            />
        </Box>
    );
};

export default NewsTickerManagement;
