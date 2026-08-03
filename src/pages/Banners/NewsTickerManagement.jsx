import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Button, IconButton, Stack, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Switch
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import CampaignIcon from '@mui/icons-material/Campaign';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const NewsTickerManagement = () => {
    const [tickers, setTickers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [addOpen, setAddOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newText, setNewText] = useState('');
    const [newActive, setNewActive] = useState(true);

    const fetchTickers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/news-ticker');
            const data = response.data?.data || response.data || [];
            setTickers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load news tickers:', error);
            toast.error('Failed to load announcement tickers');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickers();
    }, [fetchTickers]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this ticker announcement?')) return;
        try {
            await api.delete(`/news-ticker/${id}`);
            toast.success('Ticker item deleted');
            fetchTickers();
        } catch (error) {
            toast.error('Failed to delete ticker');
        }
    };

    const handleAdd = async () => {
        if (!newText.trim()) {
            toast.error('Announcement text is required');
            return;
        }
        setSaving(true);
        try {
            await api.post('/news-ticker', { text: newText.trim(), isActive: newActive });
            toast.success('Ticker item added');
            setAddOpen(false);
            setNewText('');
            setNewActive(true);
            fetchTickers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add ticker');
        } finally {
            setSaving(false);
        }
    };

    const filteredTickers = useMemo(() => {
        return tickers.filter(t => {
            const text = (t.text || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();
            const matchesSearch = text.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (t.isActive !== false ? 'active' : 'disabled') !== statusFilter) return false;
            return true;
        });
    }, [tickers, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Announcements', value: tickers.length, icon: <CampaignIcon />, color: 'primary' },
        { title: 'Active Tickers', value: tickers.filter(t => t.isActive !== false).length, icon: <CheckCircleIcon />, color: 'success' }
    ], [tickers]);



    const columns = useMemo(() => [
        {
            field: 'text',
            headerName: 'ANNOUNCEMENT TEXT',
            flex: 2,
            minWidth: 280,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <CampaignIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                        {params.data.text || 'Announcement Ticker'}
                    </Typography>
                </Stack>
            )
        },
        {
            field: 'isActive',
            headerName: 'STATUS',
            width: 140,
            cellRenderer: (params) => {
                const active = params.data.isActive !== false;
                return (
                    <Chip
                        label={active ? 'ACTIVE' : 'DISABLED'}
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
                    News & Announcement Tickers
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Manage scrolling header announcements, alert banners, and notice links
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search announcement text..."
                filters={[
                    {
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { value: 'all', label: 'All Tickers' },
                            { value: 'active', label: 'Active' },
                            { value: 'disabled', label: 'Disabled' }
                        ]
                    }
                ]}
                actionButtonText="Add Ticker"
                actionButtonIcon={<AddIcon />}
                onActionClick={() => setAddOpen(true)}
            />

            <TableUI
                rowData={filteredTickers}
                columnDefs={columns}
                loading={loading}
            />

            <Dialog open={addOpen} onClose={() => !saving && setAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Add Announcement Ticker</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        fullWidth
                        multiline
                        rows={3}
                        label="Announcement Text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="e.g. Admissions open for the new batch — enroll now!"
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <FormControlLabel
                        control={<Switch checked={newActive} onChange={(e) => setNewActive(e.target.checked)} />}
                        label="Active"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd} disabled={saving} sx={{ borderRadius: 2, px: 3 }}>
                        {saving ? 'Adding...' : 'Add Ticker'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NewsTickerManagement;
