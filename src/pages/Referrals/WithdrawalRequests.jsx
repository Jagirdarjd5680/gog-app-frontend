import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Button, 
    Avatar, 
    Chip, 
    IconButton, 
    TextField, 
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    CircularProgress,
    Fade,
    useTheme,
    alpha,
    Grid
} from '@mui/material';
import { 
    Wallet, 
    Search, 
    Eye, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Upload, 
    ArrowUpRight,
    Calendar,
    ChevronRight,
    User,
    ExternalLink
} from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const WithdrawalRequests = () => {
    const theme = useTheme();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    const [screenshotUrl, setScreenshotUrl] = useState('');
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/referrals/admin/withdrawals');
            setRequests(res.data.data);
        } catch (error) {
            toast.error('Failed to load withdrawal requests');
        } finally {
            setLoading(false);
        }
    };

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

    const filteredRequests = requests.filter(req => 
        req.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.upiId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f8fafc' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc', color: '#1e293b' }}>
            <Fade in={true} timeout={800}>
                <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                    {/* Header */}
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3} sx={{ mb: 6 }}>
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3 }}>
                                    <Wallet size={28} style={{ color: theme.palette.primary.main }} />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#0f172a' }}>Withdrawals</Typography>
                            </Stack>
                            <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                                Manage student reward redemptions and bank transfers
                            </Typography>
                        </Box>

                        <TextField
                            placeholder="Search by name or UPI..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} color="#94a3b8" />
                                    </InputAdornment>
                                ),
                                sx: {
                                    bgcolor: 'white',
                                    borderRadius: 3,
                                    width: { xs: '100%', md: 320 },
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                    '& fieldset': { border: '1px solid #e2e8f0' },
                                    '&:hover fieldset': { borderColor: theme.palette.primary.main }
                                }
                            }}
                        />
                    </Stack>

                    {/* Stats Grid */}
                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {[
                            { label: 'Pending Requests', value: requests.filter(r => r.status === 'pending').length, color: theme.palette.warning.main, bg: '#fffbeb' },
                            { label: 'Processed Today', value: requests.filter(r => r.status === 'approved').length, color: theme.palette.success.main, bg: '#f0fdf4' },
                            { label: 'Total Payouts', value: `₹${requests.reduce((acc, curr) => acc + (curr.status === 'approved' ? curr.amount : 0), 0)}`, color: theme.palette.primary.main, bg: '#eff6ff' }
                        ].map((stat, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Paper elevation={0} sx={{ p: 3, bgcolor: 'white', borderRadius: 5, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: stat.color }}>{stat.value}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Table */}
                    <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'white', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', py: 3, px: 4 }}>Student Detail</TableCell>
                                    <TableCell sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', py: 3, px: 4 }}>Redemption</TableCell>
                                    <TableCell sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', py: 3, px: 4 }}>Payment Channel</TableCell>
                                    <TableCell align="center" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', py: 3, px: 4 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.1em', py: 3, px: 4 }}>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRequests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                            <Typography variant="body1" sx={{ color: '#94a3b8', fontWeight: 500 }}>No requests found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRequests.map((req) => (
                                        <TableRow key={req._id} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: '0.3s' }}>
                                            <TableCell sx={{ py: 3, px: 4, borderBottom: '1px solid #f1f5f9' }}>
                                                <Stack direction="row" alignItems="center" spacing={2}>
                                                    <Avatar sx={{ bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', width: 48, height: 48, borderRadius: 3 }}>
                                                        <User size={20} color="#64748b" />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a' }}>{req.user.name}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#64748b' }}>{req.user.email}</Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ py: 3, px: 4, borderBottom: '1px solid #f1f5f9' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 900, color: theme.palette.success.main }}>₹{req.amount}</Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700 }}>{req.points} PTS</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 3, px: 4, borderBottom: '1px solid #f1f5f9' }}>
                                                <Stack spacing={0.5}>
                                                    <Box sx={{ bgcolor: '#f8fafc', px: 1.5, py: 0.5, borderRadius: 2, display: 'inline-block', border: '1px solid #e2e8f0' }}>
                                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>{req.upiId}</Typography>
                                                    </Box>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <Calendar size={10} color="#94a3b8" />
                                                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>{new Date(req.createdAt).toLocaleDateString()}</Typography>
                                                    </Stack>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 3, px: 4, borderBottom: '1px solid #f1f5f9' }}>
                                                <Chip 
                                                    label={req.status}
                                                    size="small"
                                                    sx={{ 
                                                        fontWeight: 900, 
                                                        textTransform: 'uppercase', 
                                                        letterSpacing: '0.1em',
                                                        fontSize: 10,
                                                        bgcolor: alpha(req.status === 'pending' ? theme.palette.warning.main : req.status === 'approved' ? theme.palette.success.main : theme.palette.error.main, 0.1),
                                                        color: req.status === 'pending' ? theme.palette.warning.main : req.status === 'approved' ? theme.palette.success.main : theme.palette.error.main,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ py: 3, px: 4, borderBottom: '1px solid #f1f5f9' }}>
                                                {req.status === 'pending' ? (
                                                    <Button 
                                                        variant="contained" 
                                                        size="small"
                                                        onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                                                        sx={{ borderRadius: 3, fontWeight: 900, textTransform: 'uppercase', fontSize: 11, px: 3, bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark }, boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}
                                                        endIcon={<ChevronRight size={14} />}
                                                    >
                                                        Process
                                                    </Button>
                                                ) : (
                                                    <IconButton onClick={() => { setSelectedRequest(req); setShowModal(true); }} sx={{ color: '#94a3b8', '&:hover': { color: theme.palette.primary.main, bgcolor: '#f1f5f9' } }}>
                                                        <Eye size={20} />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Fade>

            {/* Modal */}
            <Dialog 
                open={showModal} 
                onClose={() => setShowModal(false)}
                PaperProps={{
                    sx: { bgcolor: 'white', borderRadius: 8, maxWidth: 500, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
                }}
            >
                <DialogTitle sx={{ p: 4, pb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                            <ArrowUpRight size={24} color={theme.palette.primary.main} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a' }}>Review Payout</Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Request ID: #{selectedRequest?._id.slice(-6)}</Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                
                <DialogContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Amount</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.success.main }}>₹{selectedRequest?.amount}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, p: 2, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>UPI ID</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedRequest?.upiId}</Typography>
                        </Box>
                    </Box>

                    {selectedRequest?.status === 'pending' ? (
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>Transaction ID</Typography>
                                <TextField 
                                    fullWidth
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Enter UTR / Trans ID..."
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f8fafc' } }}
                                />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>Payment Proof (Upload or URL)</Typography>
                                <Stack spacing={2}>
                                    <Box 
                                        component="label"
                                        sx={{ 
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3,
                                            bgcolor: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: 5,
                                            cursor: 'pointer', transition: '0.3s', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: theme.palette.primary.main }
                                        }}
                                    >
                                        <Upload size={24} color="#94a3b8" />
                                        <Typography variant="caption" sx={{ mt: 1, color: '#64748b', fontWeight: 700 }}>{screenshot ? screenshot.name : 'Click to Upload'}</Typography>
                                        <input type="file" hidden onChange={(e) => setScreenshot(e.target.files[0])} />
                                    </Box>
                                    
                                    <Typography variant="caption" align="center" sx={{ color: '#94a3b8', fontWeight: 700 }}>— OR —</Typography>

                                    <TextField 
                                        fullWidth
                                        value={screenshotUrl}
                                        onChange={(e) => setScreenshotUrl(e.target.value)}
                                        placeholder="Paste Screenshot URL here..."
                                        variant="outlined"
                                        size="small"
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: '#f8fafc' } }}
                                    />
                                </Stack>
                            </Box>
                        </Stack>
                    ) : (
                        <Stack spacing={2}>
                            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>Transaction Details</Typography>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0f172a' }}>{selectedRequest?.transactionId || 'N/A'}</Typography>
                            </Box>
                            {selectedRequest?.screenshot && (
                                <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>Payment Proof</Typography>
                                    <img 
                                        src={selectedRequest.screenshot.startsWith('http') ? selectedRequest.screenshot : `http://localhost:5000${selectedRequest.screenshot}`} 
                                        alt="Proof" 
                                        style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <Button 
                                        size="small" 
                                        startIcon={<ExternalLink size={14} />}
                                        href={selectedRequest.screenshot.startsWith('http') ? selectedRequest.screenshot : `http://localhost:5000${selectedRequest.screenshot}`}
                                        target="_blank"
                                        sx={{ mt: 1, textTransform: 'none' }}
                                    >
                                        View Full Size
                                    </Button>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 4, pt: 0 }}>
                    {selectedRequest?.status === 'pending' ? (
                        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                            <Button 
                                fullWidth 
                                variant="outlined"
                                color="error"
                                onClick={() => handleAction('rejected')} 
                                disabled={processing}
                                sx={{ borderRadius: 4, p: 1.5, fontWeight: 900 }}
                            >
                                Reject
                            </Button>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="success"
                                onClick={() => handleAction('approved')}
                                disabled={processing}
                                sx={{ borderRadius: 4, p: 1.5, fontWeight: 900, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                            >
                                {processing ? <CircularProgress size={20} color="inherit" /> : 'Mark as Paid'}
                            </Button>
                        </Stack>
                    ) : (
                        <Button fullWidth onClick={() => setShowModal(false)} sx={{ color: '#64748b', fontWeight: 900 }}>Close</Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WithdrawalRequests;
