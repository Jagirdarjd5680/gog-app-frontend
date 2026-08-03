import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, IconButton, Stack, Chip, Avatar } from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import PaymentDetailsModal from './PaymentDetailsModal';

const PaymentDashboard = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalRefunds: 0, monthlyRevenue: 0 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/payments');
            const data = response.data?.data || response.data || [];
            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await api.get('/payments/stats');
            if (response.data?.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            // Silence stats error if endpoint returns fallback
        }
    }, []);

    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, [fetchPayments, fetchStats]);

    const handleViewDetails = useCallback((payment) => {
        setSelectedPayment(payment);
        setDetailsOpen(true);
    }, []);

    const filteredPayments = useMemo(() => {
        if (!searchTerm.trim()) return payments;
        const searchStr = searchTerm.toLowerCase();
        return payments.filter(p =>
            p.user?.name?.toLowerCase().includes(searchStr) ||
            p.user?.email?.toLowerCase().includes(searchStr) ||
            p.transactionId?.toLowerCase().includes(searchStr) ||
            p.course?.title?.toLowerCase().includes(searchStr) ||
            p.razorpayPaymentId?.toLowerCase().includes(searchStr)
        );
    }, [payments, searchTerm]);

    const totalRevenueCalc = useMemo(() => {
        return payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    }, [payments]);

    const metrics = useMemo(() => [
        { title: 'Total Revenue', value: `₹${stats.totalRevenue || totalRevenueCalc}`, icon: <AttachMoneyIcon />, color: 'success' },
        { title: 'This Month', value: `₹${stats.monthlyRevenue || 0}`, icon: <CalendarMonthIcon />, color: 'primary' },
        { title: 'Total Refunds', value: `₹${stats.totalRefunds || 0}`, icon: <CurrencyExchangeIcon />, color: 'warning' },
        { title: 'Total Transactions', value: payments.length, icon: <ReceiptLongIcon />, color: 'info' }
    ], [stats, totalRevenueCalc, payments.length]);

    const columns = useMemo(() => [
        {
            field: 'user',
            headerName: 'STUDENT',
            flex: 1.5,
            minWidth: 220,
            cellRenderer: (params) => {
                const name = params.data.user?.name || 'N/A';
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
                                {params.data.user?.email || 'N/A'}
                            </Typography>
                        </Box>
                    </Stack>
                );
            }
        },
        {
            field: 'course',
            headerName: 'COURSE',
            flex: 1.2,
            minWidth: 180,
            valueGetter: (params) => params.data.course?.title || 'Course Enrollment'
        },
        {
            field: 'amount',
            headerName: 'AMOUNT',
            width: 130,
            cellRenderer: (params) => (
                <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-success, #16a34a)' }}>
                    ₹{params.data.amount || 0}
                </Typography>
            )
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 130,
            cellRenderer: (params) => {
                const status = params.data.status || 'completed';
                return (
                    <Chip
                        label={status.toUpperCase()}
                        color={status === 'completed' ? 'success' : status === 'refunded' ? 'warning' : 'error'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'paymentMethod',
            headerName: 'METHOD',
            width: 130,
            valueGetter: (params) => (params.data.paymentMethod || 'Razorpay').toUpperCase()
        },
        {
            field: 'createdAt',
            headerName: 'DATE',
            width: 170,
            valueGetter: (params) => {
                const d = params.data.createdAt || params.data.date;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 100,
            cellRenderer: (params) => (
                <IconButton
                    size="small"
                    onClick={() => handleViewDetails(params.data)}
                    sx={{ color: 'var(--color-vc-mute)' }}
                    title="View Receipt Details"
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )
        }
    ], [handleViewDetails]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Payments & Financial Overview
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Track online student transactions, Razorpay order IDs, and revenue stats
                </Typography>
            </Box>

            <GenericMetrics items={metrics} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search student, order ID, course..."
                totalCount={filteredPayments.length}
            />

            <TableUI
                rowData={filteredPayments}
                columnDefs={columns}
                loading={loading}
            />

            <PaymentDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                payment={selectedPayment}
            />
        </Box>
    );
};

export default PaymentDashboard;
