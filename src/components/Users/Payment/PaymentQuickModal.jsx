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
    const [enrolledCourseIds, setEnrolledCourseIds] = useState(null); // null = not loaded yet

    const fieldStyles = {
        '& .MuiInputBase-root': {
            borderRadius: '6px',
            color: 'var(--color-vc-ink)',
            bgcolor: 'var(--color-vc-canvas)',
            fontSize: '13px',
            fontFamily: 'inherit',
        },
        '& .MuiInputLabel-root': {
            color: 'var(--color-vc-mute)',
            fontFamily: 'inherit',
            fontSize: '13px',
            '&.Mui-focused': {
                color: 'var(--color-vc-ink)'
            }
        },
        '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline)',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong)'
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-vc-hairline-strong)'
        },
        '& .MuiFormHelperText-root': {
            fontFamily: 'inherit',
            fontSize: '11px',
            color: 'var(--color-vc-mute)'
        }
    };

    const menuStyles = {
        PaperProps: {
            sx: {
                bgcolor: 'var(--color-vc-canvas)',
                color: 'var(--color-vc-ink)',
                border: '1px solid var(--color-vc-hairline)',
                borderRadius: '6px',
                boxShadow: '0px 8px 16px -4px rgba(0,0,0,0.08)',
                '& .MuiMenuItem-root': {
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    py: 1,
                    '&:hover': {
                        bgcolor: 'var(--color-vc-canvas-soft)'
                    }
                }
            }
        }
    };

    useEffect(() => {
        if (open && user?._id) {
            setEnrolledCourseIds(null);
            fetchCourses();
            fetchExistingFeeRecords();
            fetchSettings();
            fetchEnrolledCourseIds();
        }
    }, [open, user]);

    // The users list endpoint that feeds `selectedUser` (and therefore this modal's `user`
    // prop) never includes enrollments, so `user.enrolledCourses` is always undefined there —
    // this modal used to render completely blank (no course accordions, no "not enrolled"
    // warning either) for every student regardless of actual enrollment. Fetch the real
    // enrollment list straight from GET /users/:id, which does populate it.
    const fetchEnrolledCourseIds = async () => {
        try {
            const response = await api.get(`/users/${user._id}`);
            const details = response.data?.data || response.data;
            setEnrolledCourseIds(details?.enrolledCourses || []);
        } catch (error) {
            setEnrolledCourseIds(user?.enrolledCourses?.map(c => typeof c === 'object' ? c._id : c) || []);
        }
    };

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
        if (courses.length > 0 && enrolledCourseIds?.length > 0) {
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
    }, [courses, enrolledCourseIds]);

    const handleSave = async () => {
        setLoading(true);
        try {
            for (const courseId of enrolledCourseIds || []) {
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

                const normalizedNewPayments = (feeData.newPayments || [])
                    .filter(p => p.amount && Number(p.amount) > 0)
                    .map(p => ({
                        amount: Number(p.amount),
                        method: p.method || 'cash',
                        note: p.note || '',
                        paidAt: new Date()
                    }));

                if (feeData.feeRecordId) {
                    const combinedPayments = [...(feeData.payments || []), ...normalizedNewPayments];

                    await api.put(`/fee-records/${feeData.feeRecordId}`, {
                        discount: feeData.discount,
                        totalFee: feeData.totalFee,
                        finalFee: feeData.finalFee,
                        emiEnabled: feeData.emiEnabled,
                        emiCount: feeData.emiCount,
                        payments: combinedPayments,
                        // Only these actually trigger the invoice email + push notification —
                        // `payments` above is the full authoritative ledger (which can also
                        // shrink, e.g. via the per-payment "Delete Record" button), so the
                        // backend can't infer "what's new" just by diffing array lengths.
                        newPayments: normalizedNewPayments
                    });
                } else {
                    const initialPayments = normalizedNewPayments;

                    await api.post('/fee-records', {
                        user: user._id,
                        course: courseId,
                        totalFee: feeData.totalFee || 0,
                        discount: feeData.discount || 0,
                        finalFee: feeData.finalFee || 0,
                        emiEnabled: feeData.emiEnabled || false,
                        emiCount: feeData.emiCount || 1,
                        payments: initialPayments,
                        newPayments: initialPayments
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
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth 
            PaperProps={{ 
                sx: { 
                    borderRadius: '8px',
                    bgcolor: 'var(--color-vc-canvas)',
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: '0px 32px 64px -12px rgba(0,0,0,0.16)'
                } 
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                pb: 1.5, 
                borderBottom: '1px solid var(--color-vc-hairline)' 
            }}>
                <AccountBalanceWalletIcon sx={{ color: 'var(--color-vc-primary)' }} />
                <Box>
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                        Quick Payment
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                        Manage fees for {user?.name}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ bgcolor: 'var(--color-vc-canvas)', py: 3 }}>
                {enrolledCourseIds === null ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : enrolledCourseIds.length === 0 ? (
                    <Alert
                        severity="warning"
                        sx={{
                            borderRadius: '6px',
                            bgcolor: 'var(--color-vc-warning-soft)',
                            border: '1px solid var(--color-vc-warning-soft)',
                            color: 'var(--color-vc-warning-deep)',
                            fontFamily: 'inherit',
                            fontSize: '12px'
                        }}
                    >
                        This user is not enrolled in any courses.
                    </Alert>
                ) : (
                    <Box>
                        {enrolledCourseIds.map(courseId => {
                            const courseObj = courses.find(item => item._id === courseId);
                            const feeState = courseFees[courseId];
                            if (!courseObj || !feeState) return null;

                            const totalEntered = (feeState.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0) +
                                (feeState.newPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                            const isOverpaid = totalEntered > (feeState.finalFee || 0);

                            return (
                                <Accordion 
                                    key={courseId} 
                                    variant="outlined" 
                                    sx={{ 
                                        mb: 1.5, 
                                        borderRadius: '6px !important', 
                                        overflow: 'hidden', 
                                        borderColor: isOverpaid ? 'var(--color-vc-error-soft)' : 'var(--color-vc-hairline)',
                                        bgcolor: 'var(--color-vc-canvas)',
                                        '&.Mui-expanded': {
                                            margin: '0 0 12px 0'
                                        }
                                    }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-vc-mute)' }} />}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2, alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                                {courseObj.title}
                                            </Typography>
                                            <Typography sx={{ 
                                                fontSize: '11px', 
                                                fontFamily: '"JetBrains Mono", monospace',
                                                fontWeight: 700, 
                                                color: feeState.remainingAmount > 0 ? 'var(--color-vc-error-deep)' : 'var(--color-vc-success-deep)' 
                                            }}>
                                                {feeState.remainingAmount > 0 ? `₹${feeState.remainingAmount} Pending` : 'Fully Paid'}
                                            </Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ bgcolor: 'var(--color-vc-canvas-soft)', py: 2.5 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth label="Final Fee" size="small" variant="filled"
                                                    value={feeState.finalFee || 0} sx={fieldStyles}
                                                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, readOnly: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    fullWidth label="Total Paid" size="small" variant="filled"
                                                    value={feeState.paidAmount || 0} sx={fieldStyles}
                                                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, readOnly: true }}
                                                />
                                            </Grid>

                                            {feeState.payments?.length > 0 && (
                                                <Grid item xs={12}>
                                                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', fontFamily: 'inherit', mb: 1 }}>
                                                        Past Payments:
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
                                                        {feeState.payments.map((p, idx) => (
                                                            <Box 
                                                                key={idx} 
                                                                sx={{ 
                                                                    display: 'flex', 
                                                                    gap: 1.5, 
                                                                    p: 1.25, 
                                                                    bgcolor: 'var(--color-vc-canvas)', 
                                                                    borderRadius: '6px', 
                                                                    border: '1px solid var(--color-vc-hairline)', 
                                                                    alignItems: 'center' 
                                                                }}
                                                            >
                                                                <Typography sx={{ flex: 1, fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: 'var(--color-vc-body)' }}>
                                                                    ₹{p.amount} ({p.method}) - {new Date(p.paidAt).toLocaleDateString()}
                                                                </Typography>
                                                                <Stack direction="row" spacing={0.5}>
                                                                    <Tooltip title="Download Receipt">
                                                                        <IconButton size="small" sx={{ color: 'var(--color-vc-link)' }} onClick={() => handleDownloadPDF(courseId, idx)} disabled={!!actionLoading}>
                                                                            {actionLoading === `download-${courseId}-${idx}` ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon fontSize="inherit" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Send Email Receipt">
                                                                        <IconButton size="small" sx={{ color: 'var(--color-vc-primary)' }} onClick={() => handleSendEmail(courseId, idx)} disabled={!!actionLoading}>
                                                                            {actionLoading === `email-${courseId}-${idx}` ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="inherit" />}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Delete Record">
                                                                        <IconButton size="small" sx={{ color: 'var(--color-vc-error-deep)' }} onClick={() => {
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
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: 1 }}>
                                                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-link)', fontFamily: 'inherit' }}>
                                                        Add Payment
                                                    </Typography>
                                                    <Button 
                                                        size="small" 
                                                        startIcon={<AddIcon />} 
                                                        onClick={() => {
                                                            setCourseFees(prev => ({
                                                                ...prev,
                                                                [courseId]: { ...feeState, newPayments: [...(feeState.newPayments || []), { amount: '', method: 'cash' }] }
                                                            }));
                                                        }}
                                                        sx={{
                                                            textTransform: 'none',
                                                            fontSize: '12px',
                                                            fontWeight: 500,
                                                            fontFamily: 'inherit',
                                                            color: 'var(--color-vc-link)',
                                                            '&:hover': { bgcolor: 'var(--color-vc-canvas)' }
                                                        }}
                                                    >
                                                        Add
                                                    </Button>
                                                </Box>
                                                {feeState.newPayments?.map((p, idx) => (
                                                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1.5, p: 1.25, bgcolor: 'var(--color-vc-canvas)', borderRadius: '6px', border: '1px solid var(--color-vc-hairline)' }}>
                                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                        <TextField
                                                            fullWidth label="Amount" size="small" type="number" value={p.amount || ''}
                                                            onChange={(e) => {
                                                                const updated = [...feeState.newPayments]; updated[idx].amount = e.target.value;
                                                                setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                            }}
                                                            sx={fieldStyles}
                                                        />
                                                        <TextField
                                                            select fullWidth label="Method" size="small" value={p.method || 'cash'}
                                                            onChange={(e) => {
                                                                const updated = [...feeState.newPayments]; updated[idx].method = e.target.value;
                                                                setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                            }}
                                                            sx={fieldStyles}
                                                            SelectProps={{ MenuProps: menuStyles }}
                                                        >
                                                            <MenuItem value="cash">Cash</MenuItem>
                                                            <MenuItem value="upi">UPI</MenuItem>
                                                            <MenuItem value="bank_transfer">Bank</MenuItem>
                                                            <MenuItem value="online">Online</MenuItem>
                                                        </TextField>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                const updated = feeState.newPayments.filter((_, i) => i !== idx);
                                                                setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                            }}
                                                            sx={{ color: 'var(--color-vc-error-deep)' }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                    <TextField
                                                        fullWidth label="Note (optional)" size="small" value={p.note || ''}
                                                        onChange={(e) => {
                                                            const updated = [...feeState.newPayments]; updated[idx].note = e.target.value;
                                                            setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                        }}
                                                        sx={fieldStyles}
                                                    />
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
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', gap: 1 }}>
                <Button 
                    onClick={onClose} 
                    disabled={loading}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        color: 'var(--color-vc-mute)',
                        '&:hover': {
                            color: 'var(--color-vc-ink)',
                            bgcolor: 'var(--color-vc-canvas-soft)'
                        }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    disabled={loading} 
                    startIcon={<AccountBalanceWalletIcon />}
                    sx={{
                        px: 3,
                        borderRadius: '6px',
                        height: 36,
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxShadow: 'none',
                        bgcolor: 'var(--color-vc-primary)',
                        color: 'var(--color-vc-on-primary)',
                        '&:hover': {
                            bgcolor: 'var(--color-vc-primary)',
                            opacity: 0.9,
                            boxShadow: 'none'
                        }
                    }}
                >
                    {loading ? 'Saving...' : 'Save Payments'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentQuickModal;
