import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Button, Chip, 
    CircularProgress, Dialog, DialogTitle, DialogContent, 
    DialogActions, TextField, MenuItem, Tabs, Tab
} from '@mui/material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const BookingAdmin = () => {
    const [bookings, setBookings] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);

    // Modal state
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [status, setStatus] = useState('pending');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bRes, batRes] = await Promise.all([
                api.get('/booking/all'),
                api.get('/booking/batches')
            ]);
            if (bRes.data.success) setBookings(bRes.data.data);
            if (batRes.data.success) setBatches(batRes.data.data);
        } catch (err) {
            toast.error('Failed to load bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (booking) => {
        setSelectedBooking(booking);
        setStatus(booking.status);
        setAdminNotes(booking.adminNotes || '');
        setOpenDialog(true);
    };

    const submitAction = async () => {
        try {
            const res = await api.put(`/booking/${selectedBooking._id}/status`, {
                status,
                adminNotes
            });
            if (res.data.success) {
                toast.success(`Booking ${status} successfully`);
                setOpenDialog(false);
                fetchData();
            }
        } catch (err) {
            toast.error('Failed to update booking');
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    const filteredBookings = tab === 0 
        ? bookings.filter(b => b.status === 'pending')
        : bookings.filter(b => b.status !== 'pending');

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Seat Booking Requests</Typography>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                    <Tab label="Pending Requests" />
                    <Tab label="Processed Requests" />
                </Tabs>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email / Phone</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Batch</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Zone / Seat</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    No requests found.
                                </TableCell>
                            </TableRow>
                        ) : filteredBookings.map((b) => (
                            <TableRow key={b._id}>
                                <TableCell>{b.user?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Typography variant="body2">{b.user?.email}</Typography>
                                    <Typography variant="caption" color="textSecondary">{b.user?.phone}</Typography>
                                </TableCell>
                                <TableCell>{b.batch?.name || 'Unknown Batch'}</TableCell>
                                <TableCell>{b.zone} - Seat {b.seatNumber}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={b.status.toUpperCase()} 
                                        color={b.status === 'approved' ? 'success' : b.status === 'rejected' ? 'error' : 'warning'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Button variant="contained" size="small" onClick={() => handleAction(b)}>
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Action Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Review Seat Request</DialogTitle>
                <DialogContent dividers>
                    {selectedBooking && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <Typography variant="subtitle2">Student: {selectedBooking.user?.name}</Typography>
                            <Typography variant="subtitle2">Batch: {selectedBooking.batch?.name}</Typography>
                            
                            <TextField
                                select
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                fullWidth
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </TextField>

                            <TextField
                                label="Admin Notes (Optional)"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
                                placeholder="E.g., Seat confirmed. Please complete payment."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={submitAction}>Save Changes</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookingAdmin;
