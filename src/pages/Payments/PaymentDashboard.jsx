import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Avatar,
    Stack,
    IconButton,
    TextField,
    InputAdornment
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import MetricsCard from '../../components/Dashboard/MetricsCard';
import PaymentDetailsModal from './PaymentDetailsModal';

// Helper to generate color from name
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
};

const PaymentDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalRefunds: 0, monthlyRevenue: 0 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentIdSearch, setPaymentIdSearch] = useState('');
    const [rollNumberSearch, setRollNumberSearch] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payments');
            if (response.data.success) {
                setPayments(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/payments/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setDetailsOpen(true);
    };

    const filteredPayments = payments.filter(payment => {
        const searchStr = searchTerm.toLowerCase();
        const paymentIdStr = paymentIdSearch.toLowerCase();
        const rollNumStr = rollNumberSearch.toLowerCase();
        
        // Check general search
        const matchesGeneral = !searchTerm || (
            payment.user?.name?.toLowerCase().includes(searchStr) ||
            payment.user?.email?.toLowerCase().includes(searchStr) ||
            payment.user?.rollNumber?.toLowerCase().includes(searchStr) ||
            payment.transactionId?.toLowerCase().includes(searchStr) ||
            payment.course?.title?.toLowerCase().includes(searchStr)
        );
        
        // Check payment ID search
        const matchesPaymentId = !paymentIdSearch || 
            payment.transactionId?.toLowerCase().includes(paymentIdStr);
        
        // Check roll number search
        const matchesRollNumber = !rollNumberSearch || 
            payment.user?.rollNumber?.toLowerCase().includes(rollNumStr);
        
        return matchesGeneral && matchesPaymentId && matchesRollNumber;
    });

    const columnDefs = [
        {
            headerName: 'USER',
            field: 'user.name',
            flex: 1.5,
            minWidth: 200,
            cellRenderer: (params) => {
                const name = params.data.user?.name || 'Unknown User';
                const avatar = params.data.user?.avatar;
                const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%', py: 1 }}>
                        <Avatar
                            src={avatar}
                            sx={{
                                width: 38,
                                height: 38,
                                bgcolor: stringToColor(name),
                                fontSize: '1rem',
                                fontWeight: 700,
                                border: '2px solid rgba(0,0,0,0.05)'
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary', mb: 0.2, lineHeight: 1.2 }}>
                                {name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
                                {params.data.user?.rollNumber || 'GUEST'}
                            </Typography>
                        </Box>
                    </Box>
                );
            }
        },
        {
            headerName: 'COURSE/TYPE',
            field: 'course.title',
            flex: 1.5,
            minWidth: 200,
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', py: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2, mb: 0.3 }}>
                        {params.data.course?.title || (params.data.paymentType === 'subscription' ? 'Plan Subscription' : 'N/A')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {params.data.paymentType || 'COURSE'}
                    </Typography>
                </Box>
            )
        },
        {
            field: 'amount',
            headerName: 'AMOUNT',
            width: 130,
            cellRenderer: (params) => (
                <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    ₹{params.value?.toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'paymentMethod',
            headerName: 'METHOD',
            width: 140,
            cellRenderer: (params) => {
                const method = params.value?.toLowerCase();
                const isAdmin = method?.includes('admin');
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Chip
                            icon={isAdmin ? <AdminPanelSettingsIcon sx={{ fontSize: '0.9rem !important' }} /> : <PaymentIcon sx={{ fontSize: '0.9rem !important' }} />}
                            label={params.value?.toUpperCase() || 'UNKNOWN'}
                            size="small"
                            variant="outlined"
                            sx={{
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                borderRadius: 1.5,
                                borderColor: isAdmin ? 'info.light' : 'divider',
                                color: isAdmin ? 'info.main' : 'text.secondary',
                                bgcolor: isAdmin ? 'rgba(2, 136, 209, 0.04)' : 'transparent',
                                height: 24
                            }}
                        />
                    </Box>
                );
            }
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            cellRenderer: (params) => {
                const status = params.value?.toLowerCase();
                const colorMap = {
                    completed: { bg: '#e8f5e9', text: '#2e7d32', label: 'SUCCESS' },
                    pending: { bg: '#fff3e0', text: '#ed6c02', label: 'PENDING' },
                    failed: { bg: '#ffebee', text: '#d32f2f', label: 'FAILED' },
                    refunded: { bg: '#f5f5f5', text: '#757575', label: 'REFUNDED' }
                };
                const style = colorMap[status] || colorMap.pending;

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <Chip
                            label={style.label}
                            size="small"
                            sx={{
                                bgcolor: style.bg,
                                color: style.text,
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                height: 24,
                                borderRadius: 1.5
                            }}
                        />
                    </Box>
                );
            },
        },
        {
            field: 'createdAt',
            headerName: 'DATE',
            width: 160,
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.1 }}>
                        {format(new Date(params.value), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="caption" fontWeight={500} color="text.secondary">
                        {format(new Date(params.value), 'hh:mm a')}
                    </Typography>
                </Box>
            ),
        },
        {
            headerName: 'ACTION',
            width: 80,
            cellRenderer: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <IconButton
                        size="small"
                        onClick={() => handleViewDetails(params.data)}
                        sx={{
                            bgcolor: 'rgba(0,0,0,0.03)',
                            '&:hover': { bgcolor: 'primary.main', color: 'white' },
                            width: 32,
                            height: 32
                        }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
            pinned: 'right'
        }
    ];

    return (
        <Box sx={{ pb: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                        Transactions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Monitor revenue, refunds, and student enrollments
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2} alignItems="flex-end">
                    <TextField
                        size="small"
                        placeholder="Search general..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 200, bgcolor: 'background.paper', borderRadius: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        size="small"
                        placeholder="Payment ID..."
                        value={paymentIdSearch}
                        onChange={(e) => setPaymentIdSearch(e.target.value)}
                        sx={{ width: 180, bgcolor: 'background.paper', borderRadius: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PaymentIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        size="small"
                        placeholder="Roll Number..."
                        value={rollNumberSearch}
                        onChange={(e) => setRollNumberSearch(e.target.value)}
                        sx={{ width: 180, bgcolor: 'background.paper', borderRadius: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AdminPanelSettingsIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </Box>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                    <MetricsCard
                        title="Total Revenue"
                        value={`₹${stats.totalRevenue?.toLocaleString()}`}
                        icon={<AccountBalanceWalletIcon />}
                        color="success"
                        subtitle="All-time earnings"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <MetricsCard
                        title="Monthly Revenue"
                        value={`₹${stats.monthlyRevenue?.toLocaleString()}`}
                        icon={<TrendingUpIcon />}
                        color="primary"
                        subtitle="Current month trajectory"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <MetricsCard
                        title="Total Refunds"
                        value={`₹${stats.totalRefunds?.toLocaleString()}`}
                        icon={<AttachMoneyIcon />}
                        color="error"
                        subtitle="Revenue reductions"
                    />
                </Grid>
            </Grid>

            <Box sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
                <DataTable
                    rowData={filteredPayments}
                    columnDefs={columnDefs}
                    loading={loading}
                    height={650}
                    rowHeight={70}
                    pagination={true}
                    paginationPageSize={10}
                />
            </Box>

            <PaymentDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                payment={selectedPayment}
            />
        </Box>
    );
};

export default PaymentDashboard;

