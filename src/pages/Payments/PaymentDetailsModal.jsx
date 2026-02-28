import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Divider,
    Chip,
    Stack,
    IconButton
} from '@mui/material';
import { format } from 'date-fns';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import HistoryIcon from '@mui/icons-material/History';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';

// PDF Generation Component - Separate logic
const generateReceiptPDF = (payment) => {
    const printWindow = window.open('', '_blank');
    
    const courseName = payment.course?.title || 
        (payment.paymentType === 'subscription' && payment.subscriptionPlan ? `Subscription (${payment.subscriptionPlan})` : 
        payment.paymentType === 'subscription' ? 'Subscription' : 'Course Purchase');
    
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt - ${payment.transactionId || 'N/A'}</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
                .receipt-container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; border-bottom: 2px solid #c40c0c; padding-bottom: 20px; margin-bottom: 20px; }
                .logo { font-size: 24px; font-weight: bold; color: #c40c0c; margin-bottom: 5px; }
                .receipt-title { font-size: 18px; color: #333; margin-top: 10px; }
                .section { margin: 15px 0; }
                .section-title { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 600; }
                .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ddd; }
                .info-label { color: #666; font-size: 13px; }
                .info-value { font-weight: 600; color: #333; font-size: 13px; }
                .amount-section { background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
                .amount-value { font-size: 28px; font-weight: bold; color: #2e7d32; margin-top: 5px; }
                .status-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
                .transaction-id { font-family: 'Courier New', monospace; font-size: 11px; background: #f0f0f0; padding: 4px 8px; border-radius: 4px; word-break: break-all; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
                @media print { body { background: white; } .receipt-container { box-shadow: none; } .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                <div class="header">
                    <img src="/assets/logo-no-bg.webp" alt="God of Graphics" style="max-width: 100px; height: auto; margin-bottom: 10px;" />
                    <div style="font-size: 12px; color: #666;">Learning Management System</div>
                    <div class="receipt-title">Payment Receipt</div>
                </div>

                <div class="section">
                    <div class="section-title">Student Information</div>
                    <div class="info-row">
                        <span class="info-label">Name</span>
                        <span class="info-value">${payment.user?.name || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Roll Number</span>
                        <span class="info-value">${payment.user?.rollNumber || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email</span>
                        <span class="info-value">${payment.user?.email || 'N/A'}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Course Details</div>
                    <div class="info-row">
                        <span class="info-label">Course Name</span>
                        <span class="info-value">${courseName}</span>
                    </div>
                </div>

                <div class="amount-section">
                    <div style="font-size: 12px; color: #666;">Amount Paid</div>
                    <div class="amount-value">₹${payment.amount?.toLocaleString() || '0'}</div>
                    <div style="margin-top: 10px;">
                        <span class="status-badge" style="background: ${payment.status === 'completed' ? '#e8f5e9' : '#fff3e0'}; color: ${payment.status === 'completed' ? '#2e7d32' : '#ed6c02'};">
                            ${(payment.status || 'pending').toUpperCase()}
                        </span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Transaction Details</div>
                    <div class="info-row">
                        <span class="info-label">Payment Date</span>
                        <span class="info-value">${payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Payment Method</span>
                        <span class="info-value" style="text-transform: capitalize;">${payment.paymentMethod || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Transaction ID</span>
                        <span class="info-value transaction-id">${payment.transactionId || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Order ID</span>
                        <span class="info-value transaction-id">${payment.orderId || 'N/A'}</span>
                    </div>
                </div>

                <div class="footer">
                    <p>This is a computer generated receipt and does not require signature.</p>
                    <p style="font-size: 10px; margin-top: 10px;">For any queries, contact support@godofgraphics.com</p>
                </div>

                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #c40c0c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                        Print / Save as PDF
                    </button>
                </div>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
};

const PaymentDetailsModal = ({ open, onClose, payment }) => {
    if (!payment) return null;

    // Debug log to check actual data
    console.log('Payment data received:', {
        orderId: payment.orderId,
        transactionId: payment.transactionId,
        rollNumber: payment.user?.rollNumber,
        userId: payment.user?._id
    });

    const getStatusChip = (status) => {
        const colors = {
            completed: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
            pending: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
            failed: { color: 'error', icon: <ErrorIcon fontSize="small" /> },
            refunded: { color: 'default', icon: <HistoryIcon fontSize="small" /> }
        };
        const config = colors[status] || { color: 'default', icon: null };
        return (
            <Chip
                label={status?.toUpperCase() || 'UNKNOWN'}
                color={config.color}
                icon={config.icon}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
        );
    };

    const handleDownloadPDF = () => {
        generateReceiptPDF(payment);
    };

    // Fix: Avoid showing "Subscription (null)"
    const getCourseName = () => {
        if (payment.course?.title) return payment.course.title;
        if (payment.paymentType === 'subscription' && payment.subscriptionPlan) {
            return `Subscription (${payment.subscriptionPlan})`;
        }
        if (payment.paymentType === 'subscription') return 'Subscription';
        return 'Course Purchase';
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="xs" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: 'primary.main', 
                color: 'white',
                py: 1.5,
                px: 2
            }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <ReceiptLongIcon fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={700}>Receipt</Typography>
                </Stack>
                <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2 }}>
                {/* Compact User Info */}
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <PersonIcon color="primary" fontSize="small" />
                        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Student
                        </Typography>
                    </Stack>
                    <Box sx={{ pl: 3 }}>
                        <Typography variant="body2" fontWeight={600}>{payment.user?.name || 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {payment.user?.rollNumber || 'N/A'} • {payment.user?.email || 'N/A'}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Compact Course & Amount */}
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <PaymentIcon color="primary" fontSize="small" />
                        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Course Details
                        </Typography>
                    </Stack>
                    <Box sx={{ pl: 3 }}>
                        <Typography variant="body2" fontWeight={600}>{getCourseName()}</Typography>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                            <Typography variant="h6" color="success.main" fontWeight={800} sx={{ lineHeight: 1 }}>
                                ₹{payment.amount?.toLocaleString()}
                            </Typography>
                            {getStatusChip(payment.status)}
                        </Stack>
                    </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Compact Transaction Info */}
                <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.65rem' }}>
                        Transaction Info
                    </Typography>
                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>Date</Typography>
                            <Typography variant="caption" fontWeight={600} display="block">
                                {payment.createdAt ? format(new Date(payment.createdAt), 'dd MMM yyyy') : 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>Method</Typography>
                            <Typography variant="caption" fontWeight={600} display="block" sx={{ textTransform: 'capitalize' }}>
                                {payment.paymentMethod || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>Transaction ID</Typography>
                            <Typography variant="caption" fontWeight={600} display="block" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {payment.transactionId || 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem' }}>Order ID</Typography>
                            <Typography variant="caption" fontWeight={600} display="block" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                {payment.orderId || 'N/A'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Refund Info if applicable */}
                {payment.status === 'refunded' && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'error.lighter', borderRadius: 1.5, border: '1px solid', borderColor: 'error.main' }}>
                        <Typography variant="caption" fontWeight={700} color="error.main" sx={{ textTransform: 'uppercase' }}>
                            Refunded
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color="error.main">
                            ₹{payment.refundAmount?.toLocaleString() || payment.amount?.toLocaleString()}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
                <Button onClick={onClose} variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                    Close
                </Button>
                <Button
                    onClick={handleDownloadPDF}
                    variant="contained"
                    size="small"
                    startIcon={<PictureAsPdfIcon />}
                    sx={{ textTransform: 'none', bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                >
                    Download PDF
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentDetailsModal;
