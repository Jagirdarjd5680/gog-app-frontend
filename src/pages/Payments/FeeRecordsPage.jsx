import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Button, IconButton, Chip, Avatar, Stack,
    TextField, MenuItem, Dialog, DialogTitle, DialogContent,
    DialogActions, Grid, Divider, LinearProgress, Tooltip,
    FormControl, InputLabel, Select, Alert, Paper, Tab, Tabs,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import PaymentsIcon from '@mui/icons-material/Payments';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PendingIcon from '@mui/icons-material/Pending';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

const STATUS_CONFIG = {
    paid: { color: 'success', label: 'Paid', icon: CheckCircleIcon },
    partial: { color: 'warning', label: 'Partial', icon: WarningIcon },
    pending: { color: 'default', label: 'Pending', icon: PendingIcon },
    overdue: { color: 'error', label: 'Overdue', icon: WarningIcon },
};

const PAYMENT_METHODS = ['cash', 'upi', 'bank_transfer', 'online', 'cheque', 'other'];

const FeeRecordsPage = () => {
    const { isDark } = useTheme();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [batches, setBatches] = useState([]);
    const [batchFilter, setBatchFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [totals, setTotals] = useState({});

    // Add payment dialog
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentNote, setPaymentNote] = useState('');
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    // History dialog
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyRecord, setHistoryRecord] = useState(null);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (batchFilter) params.append('batchId', batchFilter);
            if (statusFilter) params.append('status', statusFilter);
            params.append('limit', '500');
            const res = await api.get(`/fee-records?${params}`);
            if (res.data.success) {
                setRecords(res.data.data);
                setTotals(res.data.totals || {});
            }
        } catch (error) {
            toast.error('Failed to load fee records');
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches');
            if (res.data.success) setBatches(res.data.data);
        } catch {}
    };

    useEffect(() => {
        fetchRecords();
        fetchBatches();
    }, [batchFilter, statusFilter]);

    const handleAddPayment = async () => {
        if (!paymentAmount || Number(paymentAmount) <= 0) {
            toast.error('Enter a valid payment amount');
            return;
        }
        setPaymentLoading(true);
        try {
            await api.post(`/fee-records/${selectedRecord._id}/payment`, {
                amount: Number(paymentAmount),
                method: paymentMethod,
                note: paymentNote,
                transactionRef: paymentRef,
            });
            toast.success('Payment recorded successfully ✅');
            setPaymentDialogOpen(false);
            setPaymentAmount('');
            setPaymentNote('');
            setPaymentRef('');
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to record payment');
        } finally {
            setPaymentLoading(false);
        }
    };

    const openHistory = (record) => {
        setHistoryRecord(record);
        setHistoryDialogOpen(true);
    };

    const openPayment = (record) => {
        setSelectedRecord(record);
        setPaymentAmount(String(record.remainingAmount || ''));
        setPaymentMethod('cash');
        setPaymentNote('');
        setPaymentRef('');
        setPaymentDialogOpen(true);
    };

    const columnDefs = useMemo(() => [
        {
            headerName: 'Student',
            flex: 1.5,
            minWidth: 200,
            cellRenderer: (params) => {
                const u = params.data.user;
                return (
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%' }}>
                        <Avatar src={u?.avatar} sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                            {u?.name?.[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{u?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">#{u?.rollNumber || '---'}</Typography>
                        </Box>
                    </Stack>
                );
            }
        },
        {
            headerName: 'Course',
            field: 'course',
            flex: 1.2,
            minWidth: 150,
            valueGetter: (p) => p.data.course?.title || 'N/A',
            cellRenderer: (p) => (
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.82rem' }}>{p.value}</Typography>
            )
        },
        {
            headerName: 'Batch',
            field: 'batch',
            width: 130,
            valueGetter: (p) => p.data.batch?.name || '—',
        },
        {
            headerName: 'Total Fee',
            field: 'finalFee',
            width: 120,
            cellRenderer: (p) => (
                <Typography variant="body2" fontWeight={700} color="text.primary">₹{p.value?.toLocaleString()}</Typography>
            )
        },
        {
            headerName: 'Paid',
            field: 'paidAmount',
            width: 110,
            cellRenderer: (p) => (
                <Typography variant="body2" fontWeight={700} color="success.main">₹{p.value?.toLocaleString()}</Typography>
            )
        },
        {
            headerName: 'Remaining',
            field: 'remainingAmount',
            width: 120,
            cellRenderer: (p) => (
                <Typography variant="body2" fontWeight={700} color={p.value > 0 ? 'error.main' : 'success.main'}>
                    ₹{p.value?.toLocaleString()}
                </Typography>
            )
        },
        {
            headerName: 'Progress',
            width: 150,
            cellRenderer: (p) => {
                const pct = p.data.finalFee > 0 ? Math.min(100, (p.data.paidAmount / p.data.finalFee) * 100) : 0;
                return (
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.08)',
                                '& .MuiLinearProgress-bar': { bgcolor: pct >= 100 ? '#4CAF50' : pct > 50 ? '#FF9800' : '#f44336', borderRadius: 3 }
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">{pct.toFixed(0)}%</Typography>
                    </Box>
                );
            }
        },
        {
            headerName: 'Status',
            field: 'status',
            width: 110,
            cellRenderer: (p) => {
                const cfg = STATUS_CONFIG[p.value] || STATUS_CONFIG.pending;
                return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />;
            }
        },
        {
            headerName: 'EMI',
            field: 'emiEnabled',
            width: 100,
            cellRenderer: (p) => p.value ? (
                <Chip label={`${p.data.emiCount} EMI`} size="small" color="info" variant="outlined" sx={{ fontSize: '0.7rem' }} />
            ) : <Typography variant="caption" color="text.disabled">One-time</Typography>
        },
        {
            headerName: 'Actions',
            width: 130,
            pinned: 'right',
            cellRenderer: (p) => (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ height: '100%' }}>
                    <Tooltip title="Add Payment">
                        <span>
                            <IconButton
                                size="small"
                                onClick={() => openPayment(p.data)}
                                disabled={p.data.status === 'paid'}
                                sx={{ color: '#4CAF50', bgcolor: 'rgba(76,175,80,0.1)', borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(76,175,80,0.2)' } }}
                            >
                                <CurrencyRupeeIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Payment History">
                        <IconButton
                            size="small"
                            onClick={() => openHistory(p.data)}
                            sx={{ color: '#9C27B0', bgcolor: 'rgba(156,39,176,0.1)', borderRadius: 1.5, '&:hover': { bgcolor: 'rgba(156,39,176,0.2)' } }}
                        >
                            <HistoryIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )
        }
    ], []);

    return (
        <Box sx={{ p: 2 }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Fee & Payment Records</Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage course fees, partial payments and EMI tracking
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} mb={3}>
                {[
                    { label: 'Total Fees', value: totals.totalFeeSum, color: '#667eea', icon: '💰' },
                    { label: 'Collected', value: totals.totalPaidSum, color: '#4CAF50', icon: '✅' },
                    { label: 'Pending', value: totals.totalRemainingSum, color: '#F44336', icon: '⏳' },
                ].map((card) => (
                    <Grid item xs={12} sm={4} key={card.label}>
                        <Paper sx={{
                            p: 2.5, borderRadius: 3, border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'white'
                        }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>{card.label}</Typography>
                                    <Typography variant="h5" fontWeight={800} sx={{ color: card.color }}>
                                        ₹{(card.value || 0).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: 32 }}>{card.icon}</Typography>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Filters */}
            <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Filter by Batch</InputLabel>
                    <Select value={batchFilter} label="Filter by Batch" onChange={(e) => setBatchFilter(e.target.value)}>
                        <MenuItem value="">All Batches</MenuItem>
                        {batches.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="partial">Partial</MenuItem>
                        <MenuItem value="paid">Paid</MenuItem>
                        <MenuItem value="overdue">Overdue</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <DataTable
                rowData={records}
                columnDefs={columnDefs}
                loading={loading}
                enableGlobalSearch
                searchPlaceholder="Search by student name or course..."
                rowHeight={60}
            />

            {/* Add Payment Dialog */}
            <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <CurrencyRupeeIcon color="success" />
                        Add Payment
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedRecord && (
                        <>
                            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                                <Typography variant="body2">
                                    <strong>{selectedRecord.user?.name}</strong> — {selectedRecord.course?.title}<br />
                                    Total: ₹{selectedRecord.finalFee?.toLocaleString()} |
                                    Paid: ₹{selectedRecord.paidAmount?.toLocaleString()} |
                                    <strong> Remaining: ₹{selectedRecord.remainingAmount?.toLocaleString()}</strong>
                                </Typography>
                            </Alert>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth label="Payment Amount (₹)" type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        inputProps={{ min: 1, max: selectedRecord.remainingAmount }}
                                        helperText={`Max: ₹${selectedRecord.remainingAmount?.toLocaleString()}`}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select fullWidth label="Payment Method"
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        {PAYMENT_METHODS.map(m => (
                                            <MenuItem key={m} value={m}>{m.replace('_', ' ').toUpperCase()}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth label="Transaction Reference (Optional)"
                                        value={paymentRef}
                                        onChange={(e) => setPaymentRef(e.target.value)}
                                        placeholder="UPI ref / cheque no..."
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth label="Note (Optional)"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        placeholder="e.g. 1st installment"
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained" color="success"
                        onClick={handleAddPayment} disabled={paymentLoading}
                        startIcon={<PaymentsIcon />}
                    >
                        {paymentLoading ? 'Recording...' : 'Record Payment'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment History Dialog */}
            <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <HistoryIcon color="secondary" />
                        Payment History — {historyRecord?.user?.name}
                    </Stack>
                </DialogTitle>
                <DialogContent dividers>
                    {historyRecord && (
                        <>
                            {/* Summary bar */}
                            <Grid container spacing={2} mb={2}>
                                {[
                                    { label: 'Total Fee', value: historyRecord.finalFee, color: 'text.primary' },
                                    { label: 'Paid', value: historyRecord.paidAmount, color: 'success.main' },
                                    { label: 'Remaining', value: historyRecord.remainingAmount, color: 'error.main' },
                                ].map(item => (
                                    <Grid item xs={4} key={item.label}>
                                        <Paper sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                                            <Typography variant="h6" fontWeight={700} color={item.color}>
                                                ₹{item.value?.toLocaleString()}
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <LinearProgress
                                variant="determinate"
                                value={historyRecord.finalFee > 0 ? Math.min(100, (historyRecord.paidAmount / historyRecord.finalFee) * 100) : 0}
                                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                            />

                            {/* Payment history table */}
                            {historyRecord.payments?.length === 0 ? (
                                <Alert severity="info">No payments recorded yet.</Alert>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell>Reference</TableCell>
                                            <TableCell>Note</TableCell>
                                            <TableCell>Recorded By</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {historyRecord.payments?.map((p, idx) => (
                                            <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}>
                                                <TableCell>{idx + 1}</TableCell>
                                                <TableCell>{p.paidAt ? format(new Date(p.paidAt), 'dd MMM yyyy, hh:mm a') : '—'}</TableCell>
                                                <TableCell>
                                                    <Typography fontWeight={700} color="success.main">₹{p.amount?.toLocaleString()}</Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip label={p.method?.replace('_', ' ').toUpperCase()} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                                                </TableCell>
                                                <TableCell>{p.transactionRef || '—'}</TableCell>
                                                <TableCell>{p.note || '—'}</TableCell>
                                                <TableCell>{p.recordedBy?.name || 'Admin'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeeRecordsPage;
