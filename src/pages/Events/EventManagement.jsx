import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Button, IconButton, Stack, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog states
    const [enrolledModalOpen, setEnrolledModalOpen] = useState(false);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [enrolledLoading, setEnrolledLoading] = useState(false);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');

    const [addOpen, setAddOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const emptyForm = { title: '', description: '', date: '', price: '' };
    const [form, setForm] = useState(emptyForm);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/events/admin');
            const data = res.data?.data || res.data || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast.error('Failed to load events and webinars');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleViewEnrolled = async (event) => {
        setSelectedEventTitle(event.title);
        setEnrolledModalOpen(true);
        setEnrolledLoading(true);
        try {
            const res = await api.get(`/events/${event._id || event.id}/enrolled`);
            const data = res.data?.data || [];
            setEnrolledStudents(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Failed to fetch enrolled participants');
        } finally {
            setEnrolledLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        try {
            await api.delete(`/events/${id}`);
            toast.success('Event deleted successfully');
            fetchEvents();
        } catch (error) {
            toast.error('Failed to delete event');
        }
    };

    const handleAdd = async () => {
        if (!form.title.trim() || !form.description.trim() || !form.date) {
            toast.error('Title, description and date are required');
            return;
        }
        setSaving(true);
        try {
            await api.post('/events', {
                title: form.title.trim(),
                description: form.description.trim(),
                date: new Date(form.date).toISOString(),
                price: Number(form.price) || 0,
            });
            toast.success('Event created successfully');
            setAddOpen(false);
            setForm(emptyForm);
            fetchEvents();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create event');
        } finally {
            setSaving(false);
        }
    };

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const title = (e.title || '').toLowerCase();
            const location = (e.location || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = title.includes(term) || location.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (e.isPublished !== false ? 'published' : 'draft') !== statusFilter) return false;
            return true;
        });
    }, [events, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Webinars', value: events.length, icon: <EventIcon />, color: 'primary' },
        { title: 'Published Events', value: events.filter(e => e.isPublished !== false).length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Total Registrations', value: events.reduce((sum, e) => sum + (e.enrolledCount || 0), 0), icon: <GroupIcon />, color: 'info' }
    ], [events]);



    const columns = useMemo(() => [
        {
            field: 'title',
            headerName: 'EVENT TITLE & LOCATION',
            flex: 2,
            minWidth: 260,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                        <EventIcon fontSize="small" />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {params.data.title || 'Workshops & Webinar'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            📍 {params.data.location || 'Online Session'}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'startDate',
            headerName: 'EVENT DATE',
            width: 170,
            valueGetter: (params) => {
                const d = params.data.startDate || params.data.date;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'TBA';
            }
        },
        {
            field: 'isPublished',
            headerName: 'STATUS',
            width: 130,
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
            width: 160,
            cellRenderer: (params) => {
                const id = params.data._id || params.data.id;
                return (
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => handleViewEnrolled(params.data)} sx={{ color: 'var(--color-vc-link)' }} title="View Registrations">
                            <GroupIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(id)} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                );
            }
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Events, Workshops & Webinars
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Schedule interactive webinars, workshops, offline bootcamps, and manage student RSVPs
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search event title or location..."
                filters={[
                    {
                        value: statusFilter,
                        onChange: setStatusFilter,
                        options: [
                            { value: 'all', label: 'All Events' },
                            { value: 'published', label: 'Published' },
                            { value: 'draft', label: 'Drafts' }
                        ]
                    }
                ]}
                actionButtonText="Create Event"
                actionButtonIcon={<AddIcon />}
                onActionClick={() => setAddOpen(true)}
            />

            <TableUI
                rowData={filteredEvents}
                columnDefs={columns}
                loading={loading}
            />

            {/* Enrolled Students Modal */}
            <Dialog open={enrolledModalOpen} onClose={() => setEnrolledModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Enrolled Participants - {selectedEventTitle}</DialogTitle>
                <DialogContent dividers>
                    {enrolledLoading ? (
                        <Typography variant="body2" color="text.secondary">Loading registrations...</Typography>
                    ) : enrolledStudents.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No students registered yet.</Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {enrolledStudents.map((st, idx) => (
                                <Stack key={idx} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1, borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                    <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{(st.student?.name || 'S').charAt(0)}</Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={700}>{st.student?.name || 'Student'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{st.student?.email || 'N/A'}</Typography>
                                    </Box>
                                </Stack>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEnrolledModalOpen(false)} variant="outlined" color="inherit">Close</Button>
                </DialogActions>
            </Dialog>

            {/* Create Event Modal */}
            <Dialog open={addOpen} onClose={() => !saving && setAddOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Create Event / Webinar</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Event Title"
                        value={form.title}
                        onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Full Stack Career Bootcamp"
                        sx={{ mt: 1, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="What is this event about?"
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        type="datetime-local"
                        label="Event Date & Time"
                        value={form.date}
                        onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        type="number"
                        label="Ticket Price (₹)"
                        value={form.price}
                        onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                        placeholder="Leave empty or 0 for a free event"
                        InputProps={{ inputProps: { min: 0, step: '0.01' } }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setAddOpen(false)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd} disabled={saving} sx={{ borderRadius: 2, px: 3 }}>
                        {saving ? 'Creating...' : 'Create Event'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EventManagement;
