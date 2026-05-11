import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Stack,
    Divider,
    Paper,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import api from '../../utils/api';
import MetricsCard from './MetricsCard';
import SchoolIcon from '@mui/icons-material/School';
import StarsIcon from '@mui/icons-material/Stars';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const StudentDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/reports/student-dashboard');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async (courseId, paymentIndex) => {
        try {
            const response = await api.post('/fee-records/download-receipt', {
                userId: data.userId, // This should be handled by backend if not provided
                courseId,
                paymentIndex
            }, { responseType: 'blob' });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt_${courseId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download receipt');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const { feeRecords, payments, enrolledCoursesCount, totalPoints, registrationStatus } = data;

    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                    Welcome Back!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Track your learning progress and fee status here.
                </Typography>
            </Box>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                        title="Enrolled Courses"
                        value={enrolledCoursesCount}
                        icon={<SchoolIcon sx={{ fontSize: 32 }} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                        title="GOG Points"
                        value={totalPoints}
                        icon={<StarsIcon sx={{ fontSize: 32 }} />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                        title="Registration"
                        value={registrationStatus?.toUpperCase() || 'NONE'}
                        icon={<InfoIcon sx={{ fontSize: 32 }} />}
                        color={registrationStatus === 'approved' ? 'success' : 'info'}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricsCard
                        title="Pending Payments"
                        value={feeRecords.filter(r => r.status !== 'paid').length}
                        icon={<AccountBalanceWalletIcon sx={{ fontSize: 32 }} />}
                        color="error"
                    />
                </Grid>
            </Grid>

            {/* Fee Section */}
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon color="primary" /> My Fee & Installments
            </Typography>

            <Grid container spacing={3}>
                {feeRecords.map((record) => (
                    <Grid item xs={12} key={record._id}>
                        <Card sx={{ 
                            borderRadius: 3, 
                            border: '1px solid', 
                            borderColor: 'divider',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        component="img"
                                        src={record.course?.thumbnail || '/placeholder.png'}
                                        sx={{ width: 60, height: 40, borderRadius: 1, objectFit: 'cover' }}
                                    />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {record.course?.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Roll No: {record.registrationNumber || 'Pending'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                    <Chip 
                                        label={record.status.toUpperCase()} 
                                        color={record.status === 'paid' ? 'success' : record.status === 'partial' ? 'warning' : 'error'}
                                        size="small"
                                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                    />
                                    <Chip 
                                        label={record.payments?.some(p => p.method === 'online' || p.method === 'razorpay') ? 'STUDENT PURCHASED' : 'OFFLINE/MANUAL'} 
                                        variant="outlined"
                                        size="small"
                                        sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                                    />
                                </Stack>
                            </Box>

                            <CardContent>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={4}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                                            Payment Summary
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2">Final Fee:</Typography>
                                                <Typography variant="body2" fontWeight={700}>₹{record.finalFee?.toLocaleString()}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2">Paid Amount:</Typography>
                                                <Typography variant="body2" fontWeight={700} color="success.main">₹{record.paidAmount?.toLocaleString()}</Typography>
                                            </Box>
                                            <Divider sx={{ my: 1 }} />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" fontWeight={700}>Remaining:</Typography>
                                                <Typography variant="body2" fontWeight={800} color="error.main">₹{record.remainingAmount?.toLocaleString()}</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                                            EMI Details
                                        </Typography>
                                        {record.emiEnabled ? (
                                            <Box sx={{ mt: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2">EMI Amount:</Typography>
                                                    <Typography variant="body2" fontWeight={700}>₹{record.emiAmount?.toLocaleString()}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2">Total Installments:</Typography>
                                                    <Typography variant="body2" fontWeight={700}>{record.emiCount}</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2">Paid Installments:</Typography>
                                                    <Typography variant="body2" fontWeight={700}>{record.payments?.length || 0}</Typography>
                                                </Box>
                                                {record.remainingAmount > 0 && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, p: 1, bgcolor: 'error.lighter', borderRadius: 1 }}>
                                                        <Typography variant="caption" fontWeight={700} color="error.dark">Next Due:</Typography>
                                                        <Typography variant="caption" fontWeight={700} color="error.dark">
                                                            {record.emiStartDate ? format(new Date(record.emiStartDate), 'MMM dd, yyyy') : 'N/A'}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Single payment plan selected.
                                            </Typography>
                                        )}
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                                            Recent History
                                        </Typography>
                                        <Box sx={{ mt: 1 }}>
                                            {record.payments?.slice(-2).reverse().map((payment, idx) => (
                                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, p: 1, bgcolor: 'rgba(0,0,0,0.01)', borderRadius: 1 }}>
                                                    <Box>
                                                        <Typography variant="caption" display="block" fontWeight={700}>
                                                            ₹{payment.amount?.toLocaleString()} ({payment.method})
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {format(new Date(payment.paidAt), 'dd MMM yyyy')}
                                                        </Typography>
                                                    </Box>
                                                    <IconButton size="small" color="primary" onClick={() => handleDownloadReceipt(record.course?._id || record.course, record.payments.length - 1 - idx)}>
                                                        <DownloadIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                            {record.payments?.length === 0 && (
                                                <Typography variant="caption" color="text.secondary">No payments recorded yet.</Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                
                {feeRecords.length === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                            <HistoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No fee records found</Typography>
                            <Typography variant="body2" color="text.secondary">Your payment information will appear here once you enroll in a course.</Typography>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default StudentDashboard;
