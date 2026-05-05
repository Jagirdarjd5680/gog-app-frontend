import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, TextField, Button, Grid, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Chip, Dialog, DialogTitle, DialogContent, 
    DialogActions, Stack, CircularProgress, Alert
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';

const LeaveManagement = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });

    const isProfileComplete = user?.studentProfile?.isProfileComplete;

    useEffect(() => {
        if (isProfileComplete) {
            fetchLeaves();
        }
    }, [isProfileComplete]);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const response = await api.get('/leaves/my');
            if (response.data.success) {
                setLeaves(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load leave history');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!formData.startDate || !formData.endDate || !formData.reason) {
            return toast.warn('Please fill all fields');
        }
        setSubmitting(true);
        try {
            const response = await api.post('/leaves', formData);
            if (response.data.success) {
                toast.success('Leave application submitted');
                setOpenModal(false);
                fetchLeaves();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit leave');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    if (!isProfileComplete) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    Please complete your <strong>Personal Information</strong> section before you can apply for leave.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700}>My Leave Applications</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenModal(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Apply for Leave
                </Button>
            </Stack>

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell><b>Start Date</b></TableCell>
                            <TableCell><b>End Date</b></TableCell>
                            <TableCell><b>Reason</b></TableCell>
                            <TableCell><b>Status</b></TableCell>
                            <TableCell><b>Admin Note</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={30} /></TableCell></TableRow>
                        ) : leaves.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No leave applications found.</TableCell></TableRow>
                        ) : leaves.map((leave) => (
                            <TableRow key={leave._id}>
                                <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{leave.reason}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={leave.status.toUpperCase()} 
                                        color={getStatusColor(leave.status)} 
                                        size="small" 
                                        sx={{ fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell>{leave.adminMessage || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Application Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth 
                                label="Start Date" 
                                type="date" 
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth 
                                label="End Date" 
                                type="date" 
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth 
                                label="Reason" 
                                multiline 
                                rows={4} 
                                value={formData.reason}
                                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleApply}
                        disabled={submitting}
                        startIcon={submitting && <CircularProgress size={20} />}
                    >
                        Submit Application
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LeaveManagement;
