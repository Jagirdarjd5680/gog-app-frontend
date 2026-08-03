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
                    sx={{
                        textTransform: 'none',
                        fontSize: '12px',
                        fontWeight: 500,
                        fontFamily: 'inherit',
                        borderRadius: '6px',
                        color: 'var(--color-vc-ink)',
                        borderColor: 'var(--color-vc-hairline)',
                        bgcolor: 'var(--color-vc-canvas)',
                        '&:hover': {
                            bgcolor: 'var(--color-vc-canvas-soft)',
                            borderColor: 'var(--color-vc-hairline-strong)'
                        }
                    }}
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
                                borderRadius: '6px !important', 
                                overflow: 'hidden',
                                '&:before': { display: 'none' },
                                border: '1px solid',
                                borderColor: record.remainingAmount > 0 ? 'var(--color-vc-warning)' : 'var(--color-vc-hairline)',
                                bgcolor: 'var(--color-vc-canvas)',
                                boxShadow: 'none'
                            }}
                        >
                            <AccordionSummary 
                                expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: 'var(--color-vc-mute)' }} />}
                                sx={{ 
                                    bgcolor: 'var(--color-vc-canvas-soft)',
                                    borderBottom: '1px solid var(--color-vc-hairline)',
                                    px: 2.5
                                }}
                            >
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', mr: 2 }}>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                            {record.course?.title || 'Course Fee'}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)' }}>
                                            Batch: {record.batch?.name || 'Unassigned'}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                                            <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', display: 'block' }}>Remaining</Typography>
                                            <Typography sx={{ fontSize: '12px', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: record.remainingAmount > 0 ? 'var(--color-vc-error-deep)' : 'var(--color-vc-success-deep)' }}>
                                                ₹{record.remainingAmount?.toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={STATUS_CONFIG[record.status]?.label || record.status}
                                            size="small"
                                            sx={{ 
                                                fontWeight: 600, 
                                                fontSize: '10px',
                                                borderRadius: '4px',
                                                height: 20,
                                                bgcolor: record.status === 'paid' ? 'var(--color-vc-success-soft)' :
                                                         record.status === 'partial' ? 'var(--color-vc-warning-soft)' :
                                                         record.status === 'overdue' ? 'var(--color-vc-error-soft)' : 'var(--color-vc-canvas-soft)',
                                                color: record.status === 'paid' ? 'var(--color-vc-success-deep)' :
                                                       record.status === 'partial' ? 'var(--color-vc-warning-deep)' :
                                                       record.status === 'overdue' ? 'var(--color-vc-error-deep)' : 'var(--color-vc-mute)',
                                                border: '1px solid',
                                                borderColor: record.status === 'paid' ? 'var(--color-vc-success-soft)' :
                                                             record.status === 'partial' ? 'var(--color-vc-warning-soft)' :
                                                             record.status === 'overdue' ? 'var(--color-vc-error-soft)' : 'var(--color-vc-hairline)'
                                            }}
                                        />
                                    </Stack>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 2.5 }}>
                                <Stack direction="row" spacing={3} sx={{ mb: 3, p: 2, bgcolor: 'var(--color-vc-canvas-soft)', border: '1px solid var(--color-vc-hairline)', borderRadius: '6px' }}>
                                    <Box flex={1}>
                                        <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', mb: 0.5 }}>Total Fee</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-vc-ink)', fontFamily: '"JetBrains Mono", monospace' }}>₹{record.finalFee?.toLocaleString()}</Typography>
                                    </Box>
                                    <Box flex={1}>
                                        <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', mb: 0.5 }}>Discount</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-vc-ink)', fontFamily: '"JetBrains Mono", monospace' }}>₹{(record.discount || 0).toLocaleString()}</Typography>
                                    </Box>
                                    <Box flex={1}>
                                        <Typography sx={{ fontSize: '9px', fontWeight: 700, color: 'var(--color-vc-mute)', textTransform: 'uppercase', mb: 0.5 }}>Paid Amount</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-vc-success-deep)', fontFamily: '"JetBrains Mono", monospace' }}>₹{record.paidAmount?.toLocaleString()}</Typography>
                                    </Box>
                                </Stack>

                                <Box>
                                    <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-vc-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <PaymentIcon sx={{ fontSize: 16 }} />
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
                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '13px', fontFamily: 'inherit' }}>
                        No fee records found for this user.
                    </Typography>
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
