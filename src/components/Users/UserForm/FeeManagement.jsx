import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Grid, TextField, InputAdornment, Alert, Divider, IconButton, Button, FormControlLabel, Switch, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const FeeManagement = ({ courses, values, courseFees, setCourseFees }) => {
    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Course Fee & Payments</Typography>
            {values.enrolledCourses.map(courseId => {
                const courseObj = courses.find(c => c._id === courseId);
                const feeState = courseFees[courseId];
                if (!courseObj || !feeState) return null;

                const currentPastTotal = (feeState.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                const currentNewTotal = (feeState.newPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
                const totalEntered = currentPastTotal + currentNewTotal;
                const isOverpaid = totalEntered > (feeState.finalFee || 0);

                return (
                    <Accordion key={courseId} variant="outlined" sx={{ mb: 1, borderRadius: 2, '&:before': { display: 'none' }, borderColor: isOverpaid ? 'error.main' : 'divider' }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>{courseObj.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth label="Total Fee" type="number" value={feeState.totalFee}
                                        onChange={(e) => {
                                            const t = Number(e.target.value);
                                            setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, totalFee: t, finalFee: t - (feeState.discount || 0) } }));
                                        }}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                                        disabled={!!feeState.feeRecordId} size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth label="Discount" type="number" value={feeState.discount}
                                        onChange={(e) => {
                                            const d = Number(e.target.value);
                                            setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, discount: d, finalFee: (feeState.totalFee || 0) - d } }));
                                        }}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        fullWidth label="Final Fee" value={feeState.finalFee}
                                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment>, readOnly: true }}
                                        size="small" variant="filled"
                                    />
                                </Grid>

                                {isOverpaid && (
                                    <Grid item xs={12}><Alert severity="error" sx={{ py: 0, px: 2 }}>Error: Total payments (₹{totalEntered}) exceed Final Fee (₹{feeState.finalFee})</Alert></Grid>
                                )}

                                {feeState.feeRecordId && (
                                    <>
                                        <Grid item xs={6} sm={4}><Typography variant="caption" color="text.secondary">Already Paid: ₹{feeState.paidAmount}</Typography></Grid>
                                        <Grid item xs={6} sm={4}><Typography variant="caption" color={feeState.remainingAmount > 0 ? 'error.main' : 'success.main'}>Remaining: ₹{feeState.remainingAmount}</Typography></Grid>
                                        {feeState.payments?.length > 0 && (
                                            <Grid item xs={12}>
                                                <Typography variant="caption" fontWeight={600} display="block" mb={1} color="text.secondary">Past Payments (Editable):</Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    {feeState.payments.map((p, idx) => (
                                                        <Box key={`past-${idx}`} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                                            <TextField
                                                                fullWidth label="Amount" type="number" value={p.amount}
                                                                onChange={(e) => {
                                                                    const updated = [...feeState.payments]; updated[idx].amount = e.target.value;
                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                }}
                                                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} size="small"
                                                            />
                                                            <TextField
                                                                fullWidth select label="Method" value={p.method || 'cash'}
                                                                onChange={(e) => {
                                                                    const updated = [...feeState.payments]; updated[idx].method = e.target.value;
                                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                                }}
                                                                size="small"
                                                            >
                                                                <MenuItem value="cash">Cash</MenuItem>
                                                                <MenuItem value="upi">UPI</MenuItem>
                                                                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                                                            </TextField>
                                                            <IconButton color="error" size="small" onClick={() => {
                                                                const updated = feeState.payments.filter((_, i) => i !== idx);
                                                                setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, payments: updated } }));
                                                            }}><DeleteIcon fontSize="small" /></IconButton>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Grid>
                                        )}
                                    </>
                                )}

                                <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" fontWeight={600} color="primary">{feeState.feeRecordId ? 'Add New Payment(s)' : 'Initial Payment(s)'}</Typography>
                                    <Button size="small" startIcon={<AddIcon />} onClick={() => {
                                        setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: [...(feeState.newPayments || []), { id: Date.now(), amount: '', method: 'cash' }] } }));
                                    }}>Payment</Button>
                                </Grid>

                                {feeState.newPayments?.map((p, index) => (
                                    <Grid item xs={12} key={p.id || index}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <TextField
                                                fullWidth label="Amount" type="number" value={p.amount}
                                                onChange={(e) => {
                                                    const updated = [...feeState.newPayments]; updated[index].amount = e.target.value;
                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                }}
                                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} size="small"
                                            />
                                            <TextField
                                                fullWidth select label="Method" value={p.method}
                                                onChange={(e) => {
                                                    const updated = [...feeState.newPayments]; updated[index].method = e.target.value;
                                                    setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                                }}
                                                size="small"
                                            >
                                                <MenuItem value="cash">Cash</MenuItem>
                                                <MenuItem value="upi">UPI</MenuItem>
                                                <MenuItem value="bank_transfer">Bank</MenuItem>
                                            </TextField>
                                            <IconButton color="error" size="small" onClick={() => {
                                                const updated = feeState.newPayments.filter((_, i) => i !== index);
                                                setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, newPayments: updated } }));
                                            }}><DeleteIcon fontSize="small" /></IconButton>
                                        </Box>
                                    </Grid>
                                ))}

                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={<Switch size="small" checked={feeState.emiEnabled} onChange={(e) => setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, emiEnabled: e.target.checked } }))} />}
                                        label={<Typography variant="body2">Enable EMI</Typography>}
                                    />
                                    {feeState.emiEnabled && (
                                        <TextField
                                            fullWidth label="EMI Count" type="number" size="small" value={feeState.emiCount}
                                            onChange={(e) => setCourseFees(prev => ({ ...prev, [courseId]: { ...feeState, emiCount: Number(e.target.value) } }))}
                                            sx={{ mt: 1 }}
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
