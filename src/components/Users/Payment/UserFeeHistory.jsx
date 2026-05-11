import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    LinearProgress,
    Button,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../../utils/api';
import SyncIcon from '@mui/icons-material/Sync';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentHistoryTable from './PaymentHistoryTable';
import { useTheme } from '../../../context/ThemeContext';
import PaymentDetailsModal from '../../../pages/Payments/PaymentDetailsModal';

const STATUS_CONFIG = {
    paid: { color: 'success', label: 'Paid' },
    partial: { color: 'warning', label: 'Partial' },
    pending: { color: 'default', label: 'Pending' },
    overdue: { color: 'error', label: 'Overdue' },
};

const UserFeeHistory = ({ userId, user: userData }) => {
    const { isDark } = useTheme();
    const [feeRecords, setFeeRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchFeeRecords();
        }
    }, [userId]);

    const fetchFeeRecords = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/fee-records/user/${userId}`);
            if (response.data.success) {
                setFeeRecords(response.data.data);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const handleViewReceipt = (record, payment, index) => {
        // Map individual payment to the structure expected by PaymentDetailsModal
        const mappedPayment = {
            ...payment,
            user: userData, // Use the user object passed from parent
            course: record.course,
            status: 'completed', // These are confirmed payments
            createdAt: payment.paidAt,
            paymentMethod: payment.method === 'admin' ? 'offline' : payment.method,
            transactionId: payment.transactionRef || 'N/A',
            orderId: payment.orderId || 'N/A',
            paymentIndex: index,
            courseId: record.course?._id
        };
        setSelectedPayment(mappedPayment);
        setIsReceiptOpen(true);
    };

    if (loading && feeRecords.length === 0) {
        return <LinearProgress />;
    }

    return (
        <Box>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    startIcon={<SyncIcon />}
                    variant="outlined"
                    size="small"
                    onClick={fetchFeeRecords}
                    disabled={loading}
                >
                    Refresh Records
                </Button>
            </Box>

            {feeRecords.length > 0 ? (
                <Box>
                    {feeRecords.map((record) => (
                        <Accordion 
                            key={record._id} 
                            variant="outlined" 
                            sx={{ 
                                mb: 1.5, 
                                borderRadius: '12px !important', 
                                overflow: 'hidden',
                                '&:before': { display: 'none' },
                                border: '1px solid',
                                borderColor: record.remainingAmount > 0 ? 'warning.light' : 'divider',
                                '&.Mui-expanded': {
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                                }
                            }}
                        >
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon />}
                                sx={{ 
                                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                                    px: 2
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', mr: 2 }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {record.course?.title || 'Course Fee'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Batch: {record.batch?.name || 'Unassigned'}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Remaining</Typography>
                                            <Typography variant="body2" fontWeight={700} color={record.remainingAmount > 0 ? 'error.main' : 'success.main'}>
                                                ₹{record.remainingAmount?.toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={STATUS_CONFIG[record.status]?.label || record.status}
                                            color={STATUS_CONFIG[record.status]?.color || 'default'}
                                            size="small"
                                            sx={{ fontWeight: 700, height: 24 }}
                                        />
                                    </Stack>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 2 }}>
                                <Stack direction="row" spacing={3} sx={{ mb: 2, p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                                    <Box flex={1}>
                                        <Typography variant="caption" color="text.secondary" display="block">Total Fee</Typography>
                                        <Typography variant="subtitle2" fontWeight={700}>₹{record.finalFee?.toLocaleString()}</Typography>
                                    </Box>
                                    <Box flex={1}>
                                        <Typography variant="caption" color="text.secondary" display="block">Discount</Typography>
                                        <Typography variant="subtitle2" fontWeight={700}>₹{(record.discount || 0).toLocaleString()}</Typography>
                                    </Box>
                                    <Box flex={1}>
                                        <Typography variant="caption" color="text.secondary" display="block">Paid Amount</Typography>
                                        <Typography variant="subtitle2" fontWeight={700} color="success.main">₹{record.paidAmount?.toLocaleString()}</Typography>
                                    </Box>
                                </Stack>

                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} color="primary" mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PaymentIcon sx={{ fontSize: 18 }} />
                                        Payment History
                                    </Typography>
                                    <PaymentHistoryTable 
                                        payments={record.payments} 
                                        isDark={isDark} 
                                        handleViewReceipt={handleViewReceipt} 
                                        record={record} 
                                    />
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            ) : (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">No fee records found for this user.</Typography>
                </Box>
            )}

            <PaymentDetailsModal
                open={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                payment={selectedPayment}
            />
        </Box>
    );
};

export default UserFeeHistory;
