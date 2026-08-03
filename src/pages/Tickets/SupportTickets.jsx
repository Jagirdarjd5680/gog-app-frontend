import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Button, IconButton, Stack, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SendIcon from '@mui/icons-material/Send';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const SupportTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [newTicket, setNewTicket] = useState({ subject: '', description: '', priority: 'medium' });

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/tickets');
            const data = res.data?.data || res.data || [];
            setTickets(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load support tickets:', error);
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleCreateTicket = async () => {
        if (!newTicket.subject.trim() || !newTicket.description.trim()) {
            return toast.error('Subject and description are required');
        }
        try {
            await api.post('/tickets', newTicket);
            toast.success('Support ticket created');
            setCreateDialogOpen(false);
            setNewTicket({ subject: '', description: '', priority: 'medium' });
            fetchTickets();
        } catch (error) {
            toast.error('Failed to create ticket');
        }
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) return;
        try {
            await api.post(`/tickets/${selectedTicket._id || selectedTicket.id}/reply`, { text: replyMessage });
            toast.success('Reply sent');
            setReplyMessage('');
            setViewDialogOpen(false);
            fetchTickets();
        } catch (error) {
            toast.error('Failed to send reply');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this support ticket?')) return;
        try {
            await api.delete(`/tickets/${id}`);
            toast.success('Ticket deleted');
            fetchTickets();
        } catch (error) {
            toast.error('Failed to delete ticket');
        }
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const subject = (t.subject || '').toLowerCase();
            const user = (t.user?.name || t.userName || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = subject.includes(term) || user.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (t.status || 'open') !== statusFilter) return false;
            return true;
        });
    }, [tickets, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Tickets', value: tickets.length, icon: <SupportAgentIcon />, color: 'primary' },
        { title: 'Open Tickets', value: tickets.filter(t => t.status === 'open' || t.status === 'pending').length, icon: <PendingActionsIcon />, color: 'warning' },
        { title: 'Resolved', value: tickets.filter(t => t.status === 'closed' || t.status === 'resolved').length, icon: <CheckCircleIcon />, color: 'success' }
    ], [tickets]);

    const filters = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            minWidth: 160,
            options: [
                { value: 'all', label: 'All Tickets' },
                { value: 'open', label: 'Open' },
                { value: 'closed', label: 'Resolved' }
            ]
        }
    ], [statusFilter]);

    const columns = useMemo(() => [
        {
            field: 'subject',
            headerName: 'TICKET SUBJECT',
            flex: 2,
            minWidth: 260,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13 }}>
                        <SupportAgentIcon fontSize="small" />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {params.data.subject || 'Support Inquiry'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            From: {params.data.user?.name || params.data.userName || 'Student'}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'priority',
            headerName: 'PRIORITY',
            width: 130,
            cellRenderer: (params) => {
                const prio = params.data.priority || 'medium';
                const color = prio === 'high' ? 'error' : prio === 'medium' ? 'warning' : 'info';
                return (
                    <Chip
                        label={prio.toUpperCase()}
                        color={color}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 130,
            cellRenderer: (params) => {
                const status = params.data.status || 'open';
                const color = status === 'closed' || status === 'resolved' ? 'success' : 'warning';
                return (
                    <Chip
                        label={status.toUpperCase()}
                        color={color}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'createdAt',
            headerName: 'DATE CREATED',
            width: 160,
            valueGetter: (params) => {
                const d = params.data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 140,
            cellRenderer: (params) => {
                const id = params.data._id || params.data.id;
                return (
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => { setSelectedTicket(params.data); setViewDialogOpen(true); }} sx={{ color: 'var(--color-vc-link)' }} title="View & Reply">
                            <VisibilityIcon fontSize="small" />
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
                    Support Tickets & Helpdesk
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Track, resolve, and manage student technical support inquiries and ticket threads
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search support ticket subject or student..."
                filters={filters}
                totalCount={filteredTickets.length}
                actionButtonText="Create Ticket"
                actionButtonIcon={<AddIcon fontSize="small" />}
                onActionClick={() => setCreateDialogOpen(true)}
            />

            <TableUI
                rowData={filteredTickets}
                columnDefs={columns}
                loading={loading}
            />

            {/* Create Ticket Modal */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Create Support Ticket</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                        <TextField
                            label="Ticket Subject"
                            fullWidth
                            size="small"
                            value={newTicket.subject}
                            onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            value={newTicket.description}
                            onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setCreateDialogOpen(false)} variant="outlined" color="inherit">Cancel</Button>
                    <Button onClick={handleCreateTicket} variant="contained" color="primary">Submit Ticket</Button>
                </DialogActions>
            </Dialog>

            {/* View & Reply Ticket Modal */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Ticket Details & Reply</DialogTitle>
                <DialogContent dividers>
                    {selectedTicket && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                            <Box sx={{ p: 2, bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '12px', border: '1px solid var(--color-vc-hairline)' }}>
                                <Typography variant="subtitle1" fontWeight={800}>{selectedTicket.subject}</Typography>
                                <Typography variant="caption" color="text.secondary">From: {selectedTicket.user?.name || selectedTicket.userName}</Typography>
                                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{selectedTicket.description}</Typography>
                            </Box>

                            <TextField
                                label="Send Response Message"
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                placeholder="Type response to student..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setViewDialogOpen(false)} variant="outlined" color="inherit">Close</Button>
                    <Button onClick={handleReply} variant="contained" color="primary" startIcon={<SendIcon />}>Send Reply</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupportTickets;
