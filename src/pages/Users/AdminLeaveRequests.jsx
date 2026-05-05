import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Button, 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Stack, CircularProgress 
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AdminLeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [adminMessage, setAdminMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const response = await api.get('/leaves');
            if (response.data.success) {
                setLeaves(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        setActionLoading(true);
        try {
            const response = await api.put(`/leaves/${selectedLeave._id}/status`, { 
                status, 
                adminMessage 
            });
            if (response.data.success) {
                toast.success(`Leave request ${status}`);
                setOpenModal(false);
                fetchLeaves();
            }
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>Leave Requests</Typography>
            
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.main' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white' }}><b>Student</b></TableCell>
                            <TableCell sx={{ color: 'white' }}><b>Start Date</b></TableCell>
                            <TableCell sx={{ color: 'white' }}><b>End Date</b></TableCell>
                            <TableCell sx={{ color: 'white' }}><b>Reason</b></TableCell>
                            <TableCell sx={{ color: 'white' }}><b>Status</b></TableCell>
                            <TableCell sx={{ color: 'white' }}><b>Actions</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center"><CircularProgress /></TableCell></TableRow>
                        ) : leaves.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No leave requests found.</TableCell></TableRow>
                        ) : leaves.map((leave) => (
                            <TableRow key={leave._id}>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{leave.student?.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{leave.student?.rollNumber}</Typography>
                                </TableCell>
                                <TableCell>{format(new Date(leave.startDate), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{format(new Date(leave.endDate), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{leave.reason}</TableCell>
                                <TableCell>
                                    <Chip label={leave.status.toUpperCase()} color={getStatusColor(leave.status)} size="small" />
                                </TableCell>
                                <TableCell>
                                    {leave.status === 'pending' && (
                                        <Button 
                                            variant="outlined" 
                                            size="small" 
                                            onClick={() => {
                                                setSelectedLeave(leave);
                                                setAdminMessage('');
                                                setOpenModal(true);
                                            }}
                                        >
                                            Process
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
                <DialogTitle>Process Leave Request</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" gutterBottom>
                        <b>Student:</b> {selectedLeave?.student?.name}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        <b>Duration:</b> {selectedLeave && `${format(new Date(selectedLeave.startDate), 'PP')} - ${format(new Date(selectedLeave.endDate), 'PP')}`}
                    </Typography>
                    <TextField 
                        fullWidth 
                        label="Admin Note (Optional)" 
                        multiline 
                        rows={3} 
                        value={adminMessage}
                        onChange={(e) => setAdminMessage(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        color="error" 
                        startIcon={<CancelIcon />} 
                        onClick={() => handleUpdateStatus('rejected')}
                        disabled={actionLoading}
                    >
                        Reject
                    </Button>
                    <Button 
                        color="success" 
                        variant="contained" 
                        startIcon={<CheckCircleIcon />} 
                        onClick={() => handleUpdateStatus('approved')}
                        disabled={actionLoading}
                    >
                        Approve
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminLeaveRequests;
