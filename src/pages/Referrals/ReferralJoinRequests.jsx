import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Stack, Avatar, Chip, IconButton
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ReferralJoinRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog states
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('approve');
    const [adminMessage, setAdminMessage] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/referrals/admin/join-requests');
            const data = res.data?.data || res.data || [];
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load join requests:', error);
            toast.error('Failed to load referral join requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleOpenDialog = (request, mode) => {
        setSelectedRequest(request);
        setDialogMode(mode);
        setAdminMessage('');
        setOpenDialog(true);
    };

    const handleProcess = async () => {
        setProcessing(true);
        try {
            const status = dialogMode === 'approve' ? 'approved' : 'rejected';
            await api.put(`/referrals/admin/join-requests/${selectedRequest._id}/process`, {
                status,
                adminMessage
            });
            toast.success(`Request ${status} successfully`);
            setOpenDialog(false);
            fetchRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process request');
        } finally {
            setProcessing(false);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const userName = (req.user?.name || req.userName || '').toLowerCase();
            const email = (req.user?.email || req.email || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = userName.includes(term) || email.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (req.status || 'pending') !== statusFilter) return false;
            return true;
        });
    }, [requests, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Applications', value: requests.length, icon: <HowToRegIcon />, color: 'primary' },
        { title: 'Pending Review', value: requests.filter(r => r.status === 'pending').length, icon: <PendingActionsIcon />, color: 'warning' },
        { title: 'Approved Partners', value: requests.filter(r => r.status === 'approved').length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, icon: <CancelIcon />, color: 'error' }
    ], [requests]);

    const filterConfigs = useMemo(() => [
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' }
            ]
        }
    ], []);

    const filterValues = useMemo(() => ({ status: statusFilter }), [statusFilter]);
    const filterSetters = useMemo(() => ({ status: setStatusFilter }), []);

    const columns = useMemo(() => [
        {
            field: 'user',
            headerName: 'STUDENT NAME',
            flex: 1.5,
            minWidth: 220,
            cellRenderer: (params) => {
                const user = params.data.user || {};
                const name = user.name || params.data.userName || 'Student';
                const email = user.email || params.data.email || 'N/A';
                return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                            {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                {name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                {email}
                            </Typography>
                        </Box>
                    </Stack>
                );
            }
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            cellRenderer: (params) => {
                const status = params.data.status || 'pending';
                const color = status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning';
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
            headerName: 'SUBMITTED DATE',
            width: 160,
            valueGetter: (params) => {
                const d = params.data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 160,
            cellRenderer: (params) => {
                const status = params.data.status || 'pending';
                if (status !== 'pending') {
                    return <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>Processed</Typography>;
                }
                return (
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(params.data, 'approve')}
                            sx={{ color: 'var(--color-vc-success)' }}
                            title="Approve Application"
                        >
                            <CheckCircleIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(params.data, 'reject')}
                            sx={{ color: 'var(--color-vc-error)' }}
                            title="Reject Application"
                        >
                            <CancelIcon fontSize="small" />
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
                    Referral Joining Requests
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Review and manage student applications for the referral partner program
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                searchPlaceholder="Search applicant name or email..."
                filterConfigs={filterConfigs}
                filterValues={filterValues}
                filterSetters={filterSetters}
            />

            <TableUI
                rowData={filteredRequests}
                columnDefs={columns}
                loading={loading}
            />

            {/* Action Review Dialog Modal */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {dialogMode === 'approve' ? 'Approve Joining Request' : 'Reject Joining Request'}
                </DialogTitle>
                <DialogContent dividers>
                    {selectedRequest && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                            <Typography variant="body2">
                                Applicant: <strong>{selectedRequest.user?.name || selectedRequest.userName}</strong>
                            </Typography>
                            <TextField
                                label="Admin Note / Message"
                                fullWidth
                                multiline
                                rows={3}
                                size="small"
                                value={adminMessage}
                                onChange={(e) => setAdminMessage(e.target.value)}
                                placeholder="Enter reason or note for student..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setOpenDialog(false)} variant="outlined" color="inherit">Cancel</Button>
                    <Button
                        onClick={handleProcess}
                        variant="contained"
                        color={dialogMode === 'approve' ? 'success' : 'error'}
                        disabled={processing}
                    >
                        Confirm {dialogMode === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReferralJoinRequests;
