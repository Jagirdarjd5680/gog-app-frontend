import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const STATUS_COLOR = { success: 'success', completed: 'success', pending: 'warning', failed: 'error', refunded: 'default' };

/** Student's own purchase history — GET /payments/my-payments, mirrors ReferralDashboard.jsx's page shape. */
const MyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/payments/my-payments')
            .then((res) => setPayments(res.data.data || []))
            .catch(() => toast.error('Failed to load payment history'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 6, textAlign: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900}>My Payments</Typography>
                <Typography variant="body2" color="text.secondary">Your course purchase history</Typography>
            </Box>

            {payments.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center' }}>
                    <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                    <Typography variant="body2" color="text.secondary">No payments yet.</Typography>
                </Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((p) => (
                                <TableRow key={p.id} hover>
                                    <TableCell>{p.course?.title || '—'}</TableCell>
                                    <TableCell>₹{p.amount?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip label={p.status} size="small" color={STATUS_COLOR[p.status] || 'default'} sx={{ textTransform: 'capitalize', fontWeight: 700 }} />
                                    </TableCell>
                                    <TableCell>{p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy') : '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default MyPayments;
