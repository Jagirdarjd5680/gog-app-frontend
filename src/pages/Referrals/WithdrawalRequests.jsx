import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Typography, Stack, Avatar, Chip, IconButton
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const WithdrawalRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Modal states
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotUrl, setScreenshotUrl] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/referrals/admin/withdrawals');
            const data = res.data?.data || res.data || [];
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load withdrawal requests:', error);
            toast.error('Failed to load withdrawal requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (status) => {
        if (status === 'approved' && !transactionId) {
            return toast.error('Please enter Transaction ID');
        }

        setProcessing(true);
        const formData = new FormData();
        formData.append('status', status);
        formData.append('transactionId', transactionId);
        if (screenshot) formData.append('screenshot', screenshot);
        if (screenshotUrl) formData.append('screenshotUrl', screenshotUrl);

        try {
            await api.put(`/referrals/admin/withdrawals/${selectedRequest._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(`Request ${status} successfully`);
            setShowModal(false);
            fetchRequests();
            setTransactionId('');
            setScreenshot(null);
            setScreenshotUrl('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessing(false);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const userName = (req.user?.name || req.userName || '').toLowerCase();
            const email = (req.user?.email || req.email || '').toLowerCase();
            const upi = (req.upiId || req.accountNumber || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = userName.includes(term) || email.includes(term) || upi.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (req.status || 'pending') !== statusFilter) return false;
            return true;
        });
    }, [requests, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Requests', value: requests.length, icon: <AccountBalanceWalletIcon />, color: 'primary' },
        { title: 'Pending Payouts', value: requests.filter(r => r.status === 'pending').length, icon: <PendingActionsIcon />, color: 'warning' },
        { title: 'Approved', value: requests.filter(r => r.status === 'approved' || r.status === 'completed').length, icon: <CheckCircleIcon />, color: 'success' },
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
            field: 'amount',
            headerName: 'AMOUNT',
            width: 130,
            cellRenderer: (params) => (
                <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--color-vc-success)' }}>
                    ₹{params.data.amount || 0}
                </Typography>
            )
        },
        {
            field: 'upiId',
            headerName: 'UPI / BANK ACCOUNT',
            flex: 1.5,
            minWidth: 200,
            valueGetter: (params) => params.data.upiId || params.data.accountNumber || 'N/A'
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            cellRenderer: (params) => {
                const status = params.data.status || 'pending';
                const color = status === 'approved' || status === 'completed' ? 'success' : status === 'rejected' ? 'error' : 'warning';
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
            headerName: 'DATE',
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
            cellRenderer: (params) => (
                <IconButton
                    size="small"
                    onClick={() => {
                        setSelectedRequest(params.data);
                        setTransactionId(params.data.transactionId || '');
                        setShowModal(true);
                    }}
                    sx={{ color: 'var(--color-vc-link)' }}
                    title="Review Payout"
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Student Payout & Withdrawal Requests
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Review, process, and approve student referral reward payout requests
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                searchPlaceholder="Search student name, email, or UPI..."
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
            <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Review Payout Request</DialogTitle>
                <DialogContent dividers sx={{ spaceY: 2 }}>
                    {selectedRequest && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
                            <Box sx={{ p: 2, bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '12px', border: '1px solid var(--color-vc-hairline)' }}>
                                <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)', textTransform: 'uppercase', fontWeight: 700 }}>Student Details</Typography>
                                <Typography variant="subtitle1" fontWeight={800}>{selectedRequest.user?.name || selectedRequest.userName}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedRequest.user?.email || selectedRequest.email}</Typography>
                                <Typography variant="h6" fontWeight={900} sx={{ color: 'var(--color-vc-success)', mt: 1 }}>Amount: ₹{selectedRequest.amount}</Typography>
                                <Typography variant="body2" fontWeight={700}>UPI/Account: {selectedRequest.upiId || selectedRequest.accountNumber}</Typography>
                            </Box>

                            {selectedRequest.status === 'pending' && (
                                <>
                                    <TextField
                                        label="Transaction ID / UTR"
                                        fullWidth
                                        size="small"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="e.g. 329182019283"
                                    />

                                    <Box>
                                        <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>Upload Receipt / Screenshot (Optional)</Typography>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            startIcon={<CloudUploadIcon />}
                                            size="small"
                                        >
                                            Upload Screenshot
                                            <input type="file" hidden accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} />
                                        </Button>
                                        {screenshot && <Typography variant="caption" sx={{ ml: 1, color: 'var(--color-vc-success)' }}>{screenshot.name}</Typography>}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setShowModal(false)} variant="outlined" color="inherit">Close</Button>
                    {selectedRequest?.status === 'pending' && (
                        <>
                            <Button onClick={() => handleAction('rejected')} variant="contained" color="error" disabled={processing}>Reject Payout</Button>
                            <Button onClick={() => handleAction('approved')} variant="contained" color="success" disabled={processing}>Approve & Complete</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WithdrawalRequests;
