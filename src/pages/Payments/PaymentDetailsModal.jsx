import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, Typography, Chip, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const generateReceiptPDF = (payment) => {
    const printWindow = window.open('', '_blank');
    const courseName = payment?.course?.title || 'Course Purchase';

    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt - ${payment?.transactionId || 'N/A'}</title>
            <style>
                body { font-family: sans-serif; padding: 30px; background: #fff; color: #111; }
                .receipt { max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 24px; border-radius: 12px; }
                .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                .label { color: #6b7280; font-size: 13px; }
                .val { font-weight: 600; font-size: 13px; }
                .amount { font-size: 28px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>OFFICIAL PAYMENT RECEIPT</h2>
                </div>
                <div class="row"><span class="label">Student Name</span><span class="val">${payment?.user?.name || 'N/A'}</span></div>
                <div class="row"><span class="label">Email</span><span class="val">${payment?.user?.email || 'N/A'}</span></div>
                <div class="row"><span class="label">Course</span><span class="val">${courseName}</span></div>
                <div class="row"><span class="label">Transaction ID</span><span class="val">${payment?.transactionId || payment?.razorpayPaymentId || 'N/A'}</span></div>
                <div class="amount">₹${payment?.amount || 0}</div>
            </div>
            <script>window.print();</script>
        </body>
        </html>
    `;
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
};

const DetailRow = ({ label, children }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {label}
        </Typography>
        {children}
    </Box>
);

const PaymentDetailsModal = ({ open, onClose, payment }) => {
    if (!payment) return null;

    const courseName = payment.course?.title || 'Course Enrollment';
    const paymentStatus = payment.status || 'completed';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Transaction & Receipt Details
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box
                    sx={{
                        bgcolor: 'var(--color-vc-canvas-soft)',
                        border: '1px solid var(--color-vc-hairline)',
                        borderRadius: '8px',
                        px: 2,
                        mb: 2
                    }}
                >
                    <DetailRow label="Student">
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {payment.user?.name || 'N/A'}
                        </Typography>
                    </DetailRow>
                    <DetailRow label="Email">
                        <Typography variant="body2" sx={{ color: 'var(--color-vc-ink)' }}>
                            {payment.user?.email || 'N/A'}
                        </Typography>
                    </DetailRow>
                    <DetailRow label="Course">
                        <Typography variant="body2" fontWeight={700} color="primary">
                            {courseName}
                        </Typography>
                    </DetailRow>
                </Box>

                <Box
                    sx={{
                        border: '1px solid var(--color-vc-hairline)',
                        borderRadius: '8px',
                        px: 2
                    }}
                >
                    <DetailRow label="Amount Paid">
                        <Typography variant="h6" fontWeight={800} sx={{ color: 'var(--color-vc-success, #16a34a)' }}>
                            ₹{payment.amount || 0}
                        </Typography>
                    </DetailRow>
                    <DetailRow label="Status">
                        <Chip
                            label={paymentStatus.toUpperCase()}
                            color={paymentStatus === 'completed' ? 'success' : paymentStatus === 'refunded' ? 'warning' : 'error'}
                            size="small"
                            sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                        />
                    </DetailRow>
                    <DetailRow label="Order ID">
                        <Typography
                            variant="caption"
                            sx={{ bgcolor: 'var(--color-vc-canvas-soft)', px: 1, py: 0.5, borderRadius: '4px', fontFamily: '"JetBrains Mono", monospace', color: 'var(--color-vc-ink)' }}
                        >
                            {payment.razorpayOrderId || payment.orderId || 'N/A'}
                        </Typography>
                    </DetailRow>
                    <DetailRow label="Payment ID">
                        <Typography
                            variant="caption"
                            sx={{ bgcolor: 'var(--color-vc-canvas-soft)', px: 1, py: 0.5, borderRadius: '4px', fontFamily: '"JetBrains Mono", monospace', color: 'var(--color-vc-ink)' }}
                        >
                            {payment.razorpayPaymentId || payment.transactionId || 'N/A'}
                        </Typography>
                    </DetailRow>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button variant="contained" startIcon={<PictureAsPdfIcon fontSize="small" />} onClick={() => generateReceiptPDF(payment)}>
                    Download Receipt PDF
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentDetailsModal;
