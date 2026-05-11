import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Typography,
    Box,
    Grid,
    Alert,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
    IconButton,
    Switch,
    FormControlLabel,
    Stack,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';

const PaymentQuickModal = ({ open, onClose, user, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
    const [courseFees, setCourseFees] = useState({});
    const [settings, setSettings] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // 'email-id-idx' or 'download-id-idx'

    useEffect(() => {
        if (open && user?._id) {
            fetchCourses();
            fetchExistingFeeRecords();
            fetchSettings();
        }
    }, [open, user]);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            if (response.data.success) setSettings(response.data.data);
        } catch (error) { }
    };

    const handleSendEmail = async (courseId, paymentIndex) => {
        const actionKey = `email-${courseId}-${paymentIndex}`;
        setActionLoading(actionKey);
        try {
            toast.info('Sending receipt email...');
            await api.post('/fee-records/send-receipt', {
                userId: user._id,
                courseId,
                paymentIndex
            });
            toast.success('Receipt sent successfully');
        } catch (error) {
            toast.error('Failed to send receipt email');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownloadPDF = async (courseId, paymentIndex) => {
        const actionKey = `download-${courseId}-${paymentIndex}`;
        setActionLoading(actionKey);
        try {
            const response = await api.post('/fee-records/download-receipt',
                { userId: user._id, courseId, paymentIndex },
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt_${user.rollNumber || 'PAY'}_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download PDF');
        } finally {
            setActionLoading(null);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await api.get('/courses');
            setCourses(response.data.data);
        } catch (error) { }
    };

    const fetchExistingFeeRecords = async () => {
        try {
            const response = await api.get(`/fee-records/user/${user._id}`);
            if (response.data.success) {
                const feesMap = {};
                (response.data.data || []).forEach(record => {
                    if (record?.course?._id) {
                        feesMap[record.course._id] = {
                            feeRecordId: record._id,
                            totalFee: record.totalFee,
                            discount: record.discount,
                            finalFee: record.finalFee,
                            emiEnabled: record.emiEnabled,
                            emiCount: record.emiCount,
                            paidAmount: record.paidAmount,
                            remainingAmount: record.remainingAmount,
                            payments: record.payments || [],
                            newPayments: []
                        };
                    }
                });
                setCourseFees(feesMap);
            }
        } catch (error) { }
    };

    // Ensure enrolled courses have fee state
    useEffect(() => {
        const enrolledCourseIds = user?.enrolledCourses?.map(c => typeof c === 'object' ? c._id : c) || [];
        if (courses.length > 0 && enrolledCourseIds.length > 0) {
            setCourseFees(prev => {
                const newFeeState = { ...prev };
                let updated = false;
                enrolledCourseIds.forEach(courseId => {
                    if (!newFeeState[courseId]) {
                        const courseObj = courses.find(c => c._id === courseId);
                        if (courseObj) {
                            const finalPrice = courseObj.price || 0;
                            newFeeState[courseId] = {
                                totalFee: finalPrice,
                                discount: 0,
                                finalFee: finalPrice,
                                emiEnabled: false,
                                emiCount: 1,
                                newPayments: []
                            };
                            updated = true;
                        }
                    }
                });
                return updated ? newFeeState : prev;
            });
        }
    }, [courses, user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const enrolledCourseIds = user?.enrolledCourses?.map(c => typeof c === 'object' ? c._id : c) || [];

            for (const courseId of enrolledCourseIds) {
                const feeData = courseFees[courseId];
                if (!feeData) continue;

                // Validation
                const pastTotal = (feeData.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                const newTotal = (feeData.newPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                if (pastTotal + newTotal > (feeData.finalFee || 0)) {
                    toast.error(`Payments exceed final fee for ${courses.find(c => c._id === courseId)?.title}`);
                    setLoading(false);
                    return;
                }

                if (feeData.feeRecordId) {
                    const combinedPayments = [...(feeData.payments || []), ...(feeData.newPayments || [])]
                        .filter(p => p.amount && Number(p.amount) > 0)
                        .map(p => ({
                            amount: Number(p.amount),
                            method: p.method || 'cash',
                            note: p.note || '',
                            paidAt: p.paidAt || new Date()
                        }));

                    await api.put(`/fee-records/${feeData.feeRecordId}`, {
                        discount: feeData.discount,
                        emiEnabled: feeData.emiEnabled,
                        emiCount: feeData.emiCount,
                        payments: combinedPayments
                    });
                } else {
                    const initialPayments = (feeData.newPayments || [])
                        .filter(p => p.amount && Number(p.amount) > 0)
                        .map(p => ({
                            amount: Number(p.amount),
                            method: p.method || 'cash',
                            note: p.note || '',
                            paidAt: new Date()
                        }));

                    await api.post('/fee-records', {
                        user: user._id,
                        course: courseId,
                        totalFee: feeData.totalFee || 0,
                        discount: feeData.discount || 0,
                        finalFee: feeData.finalFee || 0,
                        emiEnabled: feeData.emiEnabled || false,
                        emiCount: feeData.emiCount || 1,
                        payments: initialPayments
                    });
                }
            }

            toast.success('Payments updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Failed to update payments');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <AccountBalanceWalletIcon color="primary" />
                <Box>
                    <Typography variant="h6" fontWeight={700}>Quick Payment</Typography>
                    <Typography variant="caption" color="text.secondary">Manage fees for {user?.name}</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {user?.enrolledCourses?.length === 0 ? (
                    <Alert severity="warning">This user is not enrolled in any courses.</Alert>
                ) : (
                    <Box sx={{ mt: 1 }}>
                        {user?.enrolledCourses?.map(c => {
                            const courseId = typeof c === 'object' ? c._id : c;
                            const courseObj = courses.find(item => item._id === courseId);
                            const feeState = courseFees[courseId];
                            if (!courseObj || !feeState) return null;

                            const totalEntered = (feeState.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0) +
                                (feeState.newPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                            const isOverpaid = totalEntered > (feeState.finalFee || 0);

                            return (
                                <Accordion key={courseId} variant="outlined" sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden', borderColor: isOverpaid ? 'error.main' : 'divider' }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2, alignItems: 'center' }}>
                                            <Typography fontWeight={700} variant="body2">{courseObj.title}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: feeState.remainingAmount > 0 ? 'error.main' : 'success.main' }}>
                                                {feeState.remainingAmount > 0 ? `₹${feeState.remainingAmount} Pending` : 'Fully Paid'}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth label="Final Fee" size="small" variant="filled"
                                                    value={feeState.finalFee || 0} InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment>, readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth label="Total Paid" size="small" variant="filled"
                                                    value={feeState.paidAmount || 0} InputProps={{ startAdornment: <InputAdornment position="start">Rs.</InputAdornment>, readOnly: true }}
                                                />
                                            </Grid>

                                            {feeState.payments?.length > 0 && (
                                                <Grid item xs={12}>
                                                    <Typography variant="caption" fontWeight={700} color="text.secondary">Past Payments:</Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                                                        {feeState.payments.map((p, idx) => (
                                                            <Box key={idx} sx={{ display: 'flex', gap: 1, p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid #eee', alignItems: 'center' }}>
                                                                <Typography variant="caption" sx={{ flex: 1, fontWeight: 600 }}>
                                                                    ₹{p.amount} ({p.method}) - {new Date(p.paidAt).toLocaleDateString()}
                                                                </Typography>
                                                                <Stack direction="row" spacing={0.5}>
                                                                    <Tooltip title="Download Receipt">
                                                                        <IconButton size="small" color="primary" onClick={() => handleDownloadPDF(courseId, idx)} disabled={!!actionLoading}>
                                                                            {actionLoading === `download-${courseId}-${idx}` ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="inherit" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Send Email Receipt">
                                                                        <IconButton size="small" color="info" onClick={() => handleSendEmail(courseId, idx)} disabled={!!actionLoading}>
                                                                            {actionLoading === `email-${courseId}-${idx}` ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="inherit" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete Record">
                                                                        <IconButton size="small" color="error" onClick={() => {
                                                                            const updated = feeState.payments.filter((_, i) => i !== idx);
                                                                            setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                        }}><DeleteIcon fontSize="inherit" /></IconButton>
                                                                    </Tooltip>
                                                                </Stack>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Grid>
                                            )}

                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="caption" fontWeight={800} color="primary">Add Payment</Typography>
                                                    <Button size="small" startIcon={<AddIcon />} onClick={() => {
                                                        setCourseFees(prev => ({
                                                            ...prev,
                                                            [courseId]: { ...feeState, newPayments: [...(feeState.newPayments || []), { amount: '', method: 'cash' }] }
                                                        }));
                                                    }}>Add</Button>
                                                </Box>
                                                {feeState.newPayments?.map((p, idx) => (
                                                    <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                        <TextField
                                                            fullWidth label="Amount" size="small" type="number" value={p.amount || ''}
                                                            onChange={(e) => {
                                                                const updated = [...feeState.newPayments]; updated[idx].amount = e.target.value;
                                                                setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                            }}
                                                        />
                                                        <TextField
                                                            select fullWidth label="Method" size="small" value={p.method || 'cash'}
                                                            onChange={(e) => {
                                                                const updated = [...feeState.newPayments]; updated[idx].method = e.target.value;
                                                                setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                            }}
                                                        >
                                                            <MenuItem value="cash">Cash</MenuItem>
                                                            <MenuItem value="upi">UPI</MenuItem>
                                                            <MenuItem value="bank_transfer">Bank</MenuItem>
                                                            <MenuItem value="online">Online</MenuItem>
                                                        </TextField>
                                                        <IconButton color="error" onClick={() => {
                                                            const updated = feeState.newPayments.filter((_, i) => i !== idx);
                                                            setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                        }}><DeleteIcon /></IconButton>
                                                    </Box>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={loading} startIcon={<AccountBalanceWalletIcon />}>
                    {loading ? 'Saving...' : 'Save Payments'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentQuickModal;
