import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, IconButton, Stack, Chip, Avatar, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
    Paper, Table, TableHead, TableBody, TableRow, TableCell
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import axios from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Sits one step before the withdrawal-request table below: a completed tutor conversation
// debits the student's tokens immediately, but doesn't become part of the tutor's withdrawable
// earnings until an admin explicitly approves it here.
const PendingSessionEarnings = () => {
    const [pending, setPending] = useState([]);
    const [tokenValue, setTokenValue] = useState(10);
    const [loading, setLoading] = useState(false);
    const [approvingId, setApprovingId] = useState(null);

    const fetchPending = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/support-sessions/pending-earnings');
            setPending(Array.isArray(data.data) ? data.data : []);
            setTokenValue(data.tokenValueInRupees || 10);
        } catch (error) {
            toast.error('Failed to load pending session earnings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPending(); }, [fetchPending]);

    const handleApprove = async (sessionId) => {
        setApprovingId(sessionId);
        try {
            const { data } = await axios.post(`/support-sessions/${sessionId}/approve-earning`);
            toast.success(data.message || 'Approved');
            fetchPending();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        } finally {
            setApprovingId(null);
        }
    };

    if (!loading && pending.length === 0) return null;

    return (
        <Paper variant="outlined" sx={{ borderRadius: 2, mb: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight={700}>Pending Session Earnings</Typography>
                <Typography variant="caption" color="text.secondary">
                    Completed conversations awaiting approval before their tokens count toward the tutor's withdrawable balance (1 token = ₹{tokenValue}).
                </Typography>
            </Box>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Tutor</TableCell>
                        <TableCell>Completed On</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Tokens</TableCell>
                        <TableCell>Payout</TableCell>
                        <TableCell align="right">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pending.map((s) => (
                        <TableRow key={s._id}>
                            <TableCell>{s.tutorName || `Tutor #${s.tutorId}`}</TableCell>
                            <TableCell>{s.completedAt ? format(new Date(s.completedAt), 'MMM dd, yyyy') : '-'}</TableCell>
                            <TableCell>{s.durationMinutes ?? '-'} min</TableCell>
                            <TableCell>{s.tokensCost ?? 0}</TableCell>
                            <TableCell>₹{s.estimatedPayout ?? 0}</TableCell>
                            <TableCell align="right">
                                <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    disabled={approvingId === s.id}
                                    startIcon={approvingId === s.id ? <CircularProgress size={14} color="inherit" /> : <CheckIcon fontSize="small" />}
                                    onClick={() => handleApprove(s.id)}
                                >
                                    Approve
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

const AdminTutorWithdrawals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReq, setSelectedReq] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/withdrawals/admin/all');
            setRequests(Array.isArray(data.data) ? data.data : []);
        } catch (error) {
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (status) => {
        if (status === 'approved' && !transactionId) {
            return toast.error('Transaction ID is required for approval');
        }

        try {
            setProcessing(true);
            const { data } = await axios.patch(`/withdrawals/admin/${selectedReq._id}`, {
                status,
                transactionId,
                adminNote
            });
            if (data.success) {
                toast.success(`Request ${status} successfully`);
                setDialogOpen(false);
                fetchRequests();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessing(false);
        }
    };

    const openDialog = (req) => {
        setSelectedReq(req);
        setTransactionId(req.transactionId || '');
        setAdminNote(req.adminNote || '');
        setDialogOpen(true);
    };

    const filteredRequests = useMemo(() => {
        if (!searchTerm.trim()) return requests;
        const term = searchTerm.toLowerCase();
        return requests.filter(r =>
            (r.tutor?.name || '').toLowerCase().includes(term) ||
            (r.tutor?.email || '').toLowerCase().includes(term) ||
            (r.upiId || '').toLowerCase().includes(term)
        );
    }, [requests, searchTerm]);

    const metrics = useMemo(() => {
        const pending = requests.filter(r => r.status === 'pending').length;
        const approved = requests.filter(r => r.status === 'approved').length;
        const totalPaid = requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.amount || 0), 0);
        return [
            { title: 'Total Requests', value: requests.length, icon: <AccountBalanceWalletIcon />, color: 'primary' },
            { title: 'Pending', value: pending, icon: <HourglassTopIcon />, color: 'warning' },
            { title: 'Approved', value: approved, icon: <TaskAltIcon />, color: 'success' },
            { title: 'Total Paid Out', value: `${totalPaid} pts`, icon: <AccountBalanceWalletIcon />, color: 'info' }
        ];
    }, [requests]);

    const columns = useMemo(() => [
        {
            field: 'tutor',
            headerName: 'TUTOR',
            flex: 1.5,
            minWidth: 220,
            cellRenderer: (params) => {
                const name = params.data.tutor?.name || 'N/A';
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
                                {params.data.tutor?.email || 'N/A'}
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
                <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                    {params.data.amount} pts
                </Typography>
            )
        },
        {
            field: 'upiId',
            headerName: 'UPI ID',
            width: 180,
            valueGetter: (params) => params.data.upiId || 'N/A'
        },
        {
            field: 'createdAt',
            headerName: 'REQUESTED ON',
            width: 160,
            valueGetter: (params) => params.data.createdAt ? format(new Date(params.data.createdAt), 'MMM dd, yyyy') : 'N/A'
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 130,
            cellRenderer: (params) => {
                const status = params.data.status || 'pending';
                return (
                    <Chip
                        label={status.toUpperCase()}
                        color={status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'error'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 110,
            cellRenderer: (params) => (
                <IconButton
                    size="small"
                    onClick={() => openDialog(params.data)}
                    sx={{ color: 'var(--color-vc-mute)' }}
                    title={params.data.status === 'pending' ? 'Process Request' : 'View Details'}
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
                    Tutor Withdrawal Requests
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Review and process point-to-cash withdrawal requests from tutors
                </Typography>
            </Box>

            <PendingSessionEarnings />

            <GenericMetrics items={metrics} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search tutor name, email, or UPI ID..."
                totalCount={filteredRequests.length}
            />

            <TableUI
                rowData={filteredRequests}
                columnDefs={columns}
                loading={loading}
            />

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Withdrawal Request Details</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography color="text.secondary">Tutor Name:</Typography>
                            <Typography fontWeight={700}>{selectedReq?.tutor?.name}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography color="text.secondary">Requested Amount:</Typography>
                            <Typography fontWeight={700} color="primary">{selectedReq?.amount} Points</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography color="text.secondary">UPI ID:</Typography>
                            <Typography fontWeight={700}>{selectedReq?.upiId}</Typography>
                        </Box>

                        {selectedReq?.status === 'pending' ? (
                            <>
                                <TextField
                                    label="Transaction ID (UTR)"
                                    fullWidth
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter the payment reference number"
                                    required
                                />
                                <TextField
                                    label="Admin Note"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Optional note for the tutor"
                                />
                            </>
                        ) : (
                            <>
                                <Box>
                                    <Typography color="text.secondary" variant="caption">Transaction ID:</Typography>
                                    <Typography fontWeight={700}>{selectedReq?.transactionId || '-'}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" variant="caption">Admin Note:</Typography>
                                    <Typography>{selectedReq?.adminNote || '-'}</Typography>
                                </Box>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                    {selectedReq?.status === 'pending' && (
                        <>
                            <Button
                                color="error"
                                onClick={() => handleAction('rejected')}
                                disabled={processing}
                                startIcon={<CloseIcon />}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleAction('approved')}
                                disabled={processing}
                                startIcon={processing ? <CircularProgress size={20} /> : <CheckIcon />}
                            >
                                Approve & Mark Paid
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminTutorWithdrawals;
