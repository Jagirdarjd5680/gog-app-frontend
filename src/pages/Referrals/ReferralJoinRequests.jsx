import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Visibility as ViewIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const ReferralJoinRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [adminMessage, setAdminMessage] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('approve'); // 'approve' or 'reject'

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/referrals/admin/join-requests');
            setRequests(res.data.data);
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

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

    const getStatusChip = (status) => {
        switch (status) {
            case 'approved': return <Chip label="Approved" color="success" size="small" variant="outlined" />;
            case 'rejected': return <Chip label="Rejected" color="error" size="small" variant="outlined" />;
            default: return <Chip label="Pending" color="warning" size="small" variant="outlined" />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>Referral Joining Requests</Typography>
                    <Typography variant="body2" color="text.secondary">Review and manage student applications for the referral program.</Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Request Date</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Admin Note</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                    <Typography color="text.secondary">No join requests found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request) => (
                                <TableRow key={request._id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar src={request.user?.avatar}>{request.user?.name?.charAt(0)}</Avatar>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={800}>{request.user?.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{request.user?.email}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{format(new Date(request.createdAt), 'MMM dd, yyyy')}</Typography>
                                        <Typography variant="caption" color="text.secondary">{format(new Date(request.createdAt), 'hh:mm a')}</Typography>
                                    </TableCell>
                                    <TableCell>{getStatusChip(request.status)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                                            {request.adminMessage || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {request.status === 'pending' ? (
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<ApproveIcon />}
                                                    onClick={() => handleOpenDialog(request, 'approve')}
                                                    sx={{ borderRadius: 2, fontWeight: 800 }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<RejectIcon />}
                                                    onClick={() => handleOpenDialog(request, 'reject')}
                                                    sx={{ borderRadius: 2, fontWeight: 800 }}
                                                >
                                                    Reject
                                                </Button>
                                            </Stack>
                                        ) : (
                                            <Tooltip title={request.adminMessage || "No notes"}>
                                                <IconButton size="small">
                                                    <InfoIcon color="action" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Process Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle sx={{ fontWeight: 900 }}>
                    {dialogMode === 'approve' ? 'Approve Joining Request' : 'Reject Joining Request'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            {dialogMode === 'approve' 
                                ? `Are you sure you want to approve ${selectedRequest?.user?.name}'s request? They will receive their referral code immediately.`
                                : `Please provide a reason for rejecting ${selectedRequest?.user?.name}'s request.`
                            }
                        </Typography>
                        <TextField
                            label="Admin Message (Optional)"
                            multiline
                            rows={3}
                            fullWidth
                            placeholder="Type a message for the student..."
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit" sx={{ fontWeight: 800 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        color={dialogMode === 'approve' ? 'success' : 'error'}
                        onClick={handleProcess}
                        disabled={processing}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 900 }}
                    >
                        {processing ? 'Processing...' : dialogMode === 'approve' ? 'Approve Now' : 'Reject Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReferralJoinRequests;
