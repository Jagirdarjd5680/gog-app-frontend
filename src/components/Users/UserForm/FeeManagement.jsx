import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Grid, TextField, InputAdornment, Alert, IconButton, Button, FormControlLabel, Switch, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const FeeManagement = ({ courses, values, courseFees, setCourseFees }) => {
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

    return (
        <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', mb: 1.5 }}>
                Course Fee & Payments
            </Typography>
            {values.enrolledCourses.map(courseId => {
                const courseObj = courses.find(c => c._id === courseId);
                const feeState = courseFees[courseId];
                if (!courseObj || !feeState) return null;

                const currentPastTotal = (feeState.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                const currentNewTotal = (feeState.newPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                const totalEntered = currentPastTotal + currentNewTotal;
                const isOverpaid = totalEntered > (feeState.finalFee || 0);

                return (
                    <Accordion 
                        key={courseId} 
                        variant="outlined" 
                        sx={{ 
                            mb: 1.5, 
                            borderRadius: '6px !important', 
                            '&:before': { display: 'none' }, 
                            borderColor: isOverpaid ? 'var(--color-vc-error-soft)' : 'var(--color-vc-hairline)',
                            bgcolor: 'var(--color-vc-canvas)',
                            '&.Mui-expanded': {
                                margin: '0 0 12px 0'
                            }
                        }}
                    >
                        <AccordionSummary 
                            expandIcon={<ExpandMoreIcon sx={{ color: 'var(--color-vc-mute)' }} />}
                            sx={{
                                borderBottom: '1px solid transparent',
                                '&.Mui-expanded': {
                                    borderBottom: '1px solid var(--color-vc-hairline)'
                                }
                            }}
                        >
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>
                                {courseObj.title}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ py: 2.5 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth label="Total Fee" type="number" value={feeState.totalFee}
                                        onChange={(e) => {
                                            const t = Number(e.target.value);
                                            setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, totalFee: t, finalFee: t - (feeState.discount || 0) } }));
                                        }}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                        disabled={!!feeState.feeRecordId} size="small" sx={fieldStyles}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth label="Discount" type="number" value={feeState.discount}
                                        onChange={(e) => {
                                            const d = Number(e.target.value);
                                            setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, discount: d, finalFee: (feeState.totalFee || 0) - d } }));
                                        }}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} size="small" sx={fieldStyles}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth label="Final Fee" value={feeState.finalFee}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, readOnly: true }}
                                        size="small" variant="filled" sx={fieldStyles}
                                    />
                                </Grid>

                                {isOverpaid && (
                                    <Grid item xs={12}>
                                        <Alert 
                                            severity="error" 
                                            sx={{ 
                                                py: 0.5, 
                                                px: 2, 
                                                borderRadius: '6px',
                                                bgcolor: 'var(--color-vc-error-soft)',
                                                border: '1px solid var(--color-vc-error-soft)',
                                                color: 'var(--color-vc-error-deep)',
                                                fontSize: '12px',
                                                fontFamily: 'inherit',
                                                '& .MuiAlert-message': { fontFamily: 'inherit' }
                                            }}
                                        >
                                            Error: Total payments (₹{totalEntered}) exceed Final Fee (₹{feeState.finalFee})
                                        </Alert>
                                    </Grid>
                                )}

                                {feeState.feeRecordId && (
                                    <>
                                        <Grid item xs={6} sm={4}>
                                            <Typography sx={{ fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: 'var(--color-vc-mute)' }}>
                                                Already Paid: <b>₹{feeState.paidAmount}</b>
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={4}>
                                            <Typography sx={{ 
                                                fontSize: '11px', 
                                                fontFamily: '"JetBrains Mono", monospace', 
                                                color: feeState.remainingAmount > 0 ? 'var(--color-vc-error-deep)' : 'var(--color-vc-success-deep)' 
                                            }}>
                                                Remaining: <b>₹{feeState.remainingAmount}</b>
                                            </Typography>
                                        </Grid>
                                        {feeState.payments?.length > 0 && (
                                            <Grid item xs={12}>
                                                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-mute)', fontFamily: 'inherit', mb: 1, mt: 1 }}>
                                                    Past Payments (Editable):
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    {feeState.payments.map((p, idx) => (
                                                        <Box key={`past-${idx}`} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                            <TextField
                                                                fullWidth label="Amount" type="number" value={p.amount}
                                                                onChange={(e) => {
                                                                    const updated = [...feeState.payments]; updated[idx].amount = e.target.value;
                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                }}
                                                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} size="small" sx={fieldStyles}
                                                            />
                                                            <TextField
                                                                fullWidth select label="Method" value={p.method || 'cash'}
                                                                onChange={(e) => {
                                                                    const updated = [...feeState.payments]; updated[idx].method = e.target.value;
                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                }}
                                                                size="small" sx={fieldStyles}
                                                                SelectProps={{ MenuProps: menuStyles }}
                                                            >
                                                                <MenuItem value="cash">Cash</MenuItem>
                                                                <MenuItem value="upi">UPI</MenuItem>
                                                                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                                                            </TextField>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => {
                                                                    const updated = feeState.payments.filter((_, i) => i !== idx);
                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                }}
                                                                sx={{ color: 'var(--color-vc-error-deep)' }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Grid>
                                        )}
                                    </>
                                )}

                                <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-vc-link)', fontFamily: 'inherit' }}>
                                        {feeState.feeRecordId ? 'Add New Payment(s)' : 'Initial Payment(s)'}
                                    </Typography>
                                    <Button 
                                        size="small" 
                                        startIcon={<AddIcon />} 
                                        onClick={() => {
                                            setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: [...(feeState.newPayments || []), { id: Date.now(), amount: '', method: 'cash' }] } }));
                                        }}
                                        sx={{
                                            textTransform: 'none',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            fontFamily: 'inherit',
                                            color: 'var(--color-vc-link)',
                                            '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' }
                                        }}
                                    >
                                        Add Payment
                                    </Button>
                                </Grid>

                                {feeState.newPayments?.map((p, index) => (
                                    <Grid item xs={12} key={p.id || index}>
                                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                            <TextField
                                                fullWidth label="Amount" type="number" value={p.amount}
                                                onChange={(e) => {
                                                    const updated = [...feeState.newPayments]; updated[index].amount = e.target.value;
                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                }}
                                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} size="small" sx={fieldStyles}
                                            />
                                            <TextField
                                                fullWidth select label="Method" value={p.method}
                                                onChange={(e) => {
                                                    const updated = [...feeState.newPayments]; updated[index].method = e.target.value;
                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                }}
                                                size="small" sx={fieldStyles}
                                                SelectProps={{ MenuProps: menuStyles }}
                                            >
                                                <MenuItem value="cash">Cash</MenuItem>
                                                <MenuItem value="upi">UPI</MenuItem>
                                                <MenuItem value="bank_transfer">Bank</MenuItem>
                                            </TextField>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => {
                                                    const updated = feeState.newPayments.filter((_, i) => i !== index);
                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                }}
                                                sx={{ color: 'var(--color-vc-error-deep)' }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Grid>
                                ))}

                                <Grid item xs={12} sm={6} sx={{ mt: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch 
                                                size="small" 
                                                checked={feeState.emiEnabled} 
                                                onChange={(e) => setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, emiEnabled: e.target.checked } }))} 
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: 'var(--color-vc-primary)',
                                                        '& + .MuiSwitch-track': {
                                                            bgcolor: 'var(--color-vc-primary)'
                                                        }
                                                    }
                                                }}
                                            />
                                        }
                                        label={<Typography sx={{ fontSize: '13px', fontFamily: 'inherit', color: 'var(--color-vc-body)' }}>Enable EMI</Typography>}
                                    />
                                    {feeState.emiEnabled && (
                                        <TextField
                                            fullWidth label="EMI Count" type="number" size="small" value={feeState.emiCount}
                                            onChange={(e) => setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, emiCount: Number(e.target.value) } }))}
                                            sx={{ mt: 1.5, ...fieldStyles }}
                                        />
                                    )}
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};

export default FeeManagement;
