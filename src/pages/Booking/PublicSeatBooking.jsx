import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    Stack,
    Button,
    Grid,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const PublicSeatBooking = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', phone: '' });
    const [hasMyBooking, setHasMyBooking] = useState(false);

    useEffect(() => {
        fetchBatches();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            fetchSeatStatus(selectedBatch._id);
        }
    }, [selectedBatch]);

    const fetchBatches = async () => {
        try {
            const res = await api.get('/booking/batches');
            if (res.data.success && res.data.data.length > 0) {
                setBatches(res.data.data);
                setSelectedBatch(res.data.data[0]);
            }
        } catch (error) {
            toast.error('Failed to load batches');
        }
    };

    const fetchSeatStatus = async (batchId) => {
        setLoading(true);
        try {
            const res = await api.get(`/booking/batch/${batchId}/seats`);
            if (res.data.success) {
                setSeats(res.data.data);
                // Check if any seat in the response is marked as "isMine"
                const myBooking = res.data.data.find(s => s.isMine);
                setHasMyBooking(!!myBooking);
            }
        } catch (error) {
            toast.error('Failed to load seats');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatClick = (num) => {
        if (hasMyBooking) {
            return toast.warning('You already have an active booking or request.');
        }
        
        // Find if seat is already booked (approved)
        const isBooked = seats.some(s => s.seatNumber === num && s.status === 'approved');
        if (isBooked) {
            return toast.error('This seat is already confirmed by another student.');
        }

        setSelectedSeat(num);
        setBookingDialogOpen(true);
    };

    const handleBooking = async () => {
        if (!userForm.name || !userForm.email || !userForm.phone) {
            return toast.error('Please fill all details');
        }
        try {
            const res = await api.post('/booking/request', {
                user: userForm,
                batchId: selectedBatch._id,
                seatNumber: selectedSeat,
                zone: selectedSeat <= 7 ? 'Main Training Area' : 'Practice Zone'
            });
            if (res.data.success) {
                toast.success('Booking request sent successfully!');
                setBookingDialogOpen(false);
                fetchSeatStatus(selectedBatch._id);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        }
    };

    const Seat = ({ number }) => {
        // Filter all bookings for this seat number
        const seatBookings = seats.filter(s => s.seatNumber === number);
        const isMine = seatBookings.some(s => s.isMine);
        const isBooked = seatBookings.some(s => s.status === 'approved');
        const isPending = seatBookings.some(s => s.status === 'pending');
        const count = seatBookings.filter(s => s.status === 'pending').length;

        let color = '#22c55e'; // Green (Available)
        if (isMine) {
            color = '#3b82f6'; // Blue (YOURS)
        } else if (isBooked) {
            color = '#ef4444'; // Red (BOOKED)
        } else if (isPending) {
            color = '#fbbf24'; // Yellow (REQUEST)
        }

        return (
            <Box 
                onClick={() => handleSeatClick(number)}
                sx={{ 
                    width: 42, 
                    height: 42, 
                    bgcolor: color, 
                    borderRadius: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 900,
                    cursor: (isBooked && !isMine) ? 'default' : 'pointer',
                    position: 'relative',
                    transition: '0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    '&:active': { transform: 'scale(0.95)' }
                }}
            >
                {number}
                {/* Request Count Badge (The "Point") */}
                {count > 0 && (
                    <Box sx={{ 
                        position: 'absolute', top: -6, right: -6, 
                        width: 16, height: 16, bgcolor: 'black', 
                        borderRadius: '50%', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', 
                        border: '1px solid white', zIndex: 2 
                    }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 900, color: 'white' }}>{count}</Typography>
                    </Box>
                )}
                {/* Yellow dot for visual flair */}
                {number >= 8 && (
                    <Box sx={{ 
                        position: 'absolute', top: -2, right: -2, 
                        width: 8, height: 8, bgcolor: isMine ? 'white' : '#fbbf24', 
                        borderRadius: '50%', border: '1px solid white' 
                    }} />
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ bgcolor: '#f4f4f4', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
                width: { xs: '100%', sm: 420 }, 
                bgcolor: 'white', 
                minHeight: '100vh', 
                position: 'relative',
                boxShadow: '0 0 40px rgba(0,0,0,0.05)'
            }}>
                {/* Black Header Area */}
                <Box sx={{ 
                    bgcolor: 'black', 
                    pt: 4, pb: 6, 
                    textAlign: 'center', 
                    borderBottomLeftRadius: 40, 
                    borderBottomRightRadius: 40,
                    position: 'relative',
                    mb: 3
                }}>
                    <Box sx={{ 
                        width: 80, height: 80, 
                        bgcolor: '#111', borderRadius: 4, 
                        display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', mx: 'auto', mb: 3,
                        border: '1px solid #333'
                    }}>
                        <img src="/assets/logo-no-bg.webp" alt="Logo" style={{ height: 45 }} />
                    </Box>
                    
                    <Button sx={{ 
                        borderRadius: 10, 
                        border: '1px solid #444', 
                        px: 3, py: 0.8,
                        color: '#fbbf24',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        pointerEvents: 'none'
                    }}>
                        BOOK YOUR SEAT TODAY
                    </Button>
                </Box>

                <Container sx={{ px: 3, pb: 10 }}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 2, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        SELECT BATCH
                    </Typography>

                    <Grid container spacing={1.5} mb={4}>
                        {batches.map((batch) => (
                            <Grid item xs={4} key={batch._id}>
                                <Paper 
                                    onClick={() => setSelectedBatch(batch)}
                                    sx={{ 
                                        p: 1.5, 
                                        textAlign: 'center', 
                                        borderRadius: 2, 
                                        cursor: 'pointer',
                                        bgcolor: selectedBatch?._id === batch._id ? 'black' : 'white',
                                        color: selectedBatch?._id === batch._id ? '#fbbf24' : 'text.primary',
                                        border: '1.5px solid',
                                        borderColor: selectedBatch?._id === batch._id ? '#fbbf24' : '#eee',
                                        transition: '0.3s',
                                        boxShadow: selectedBatch?._id === batch._id ? '0 0 15px rgba(251, 191, 36, 0.2)' : 'none'
                                    }}
                                >
                                    <Typography variant="caption" fontWeight={900} display="block" sx={{ fontSize: '0.65rem' }}>{batch.name}</Typography>
                                    <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 600, opacity: 0.7 }}>{batch.startTime}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Paper sx={{ p: 3, borderRadius: 5, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1.5px solid #f5f5f5' }}>
                        {hasMyBooking && (
                            <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', p: 1.5, borderRadius: 2, mb: 2, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <Typography variant="caption" fontWeight={800} color="#1d4ed8" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon sx={{ fontSize: 14 }} /> YOU ALREADY HAVE A SEAT IN THIS BATCH
                                </Typography>
                            </Box>
                        )}

                        <Stack direction="row" justifyContent="center" spacing={2} mb={4}>
                            {[
                                { label: 'Available', color: '#22c55e' },
                                { label: 'Booked', color: '#ef4444' },
                                { label: 'Request', color: '#fbbf24' },
                                { label: 'Yours', color: '#3b82f6' }
                            ].map((item) => (
                                <Stack direction="row" spacing={0.5} alignItems="center" key={item.label}>
                                    <Box sx={{ width: 8, height: 8, bgcolor: item.color, borderRadius: '50%' }} />
                                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: '0.6rem' }}>{item.label}</Typography>
                                </Stack>
                            ))}
                        </Stack>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" fontWeight={900} color="#cbd5e1" display="block" mb={3} sx={{ letterSpacing: 1 }}>
                                MAIN TRAINING AREA (7 SEATS)
                            </Typography>
                            
                            <Stack spacing={3} alignItems="center" mb={6}>
                                <Stack direction="row" spacing={2.5}>
                                    {[1, 2, 3, 4].map(num => <Seat key={num} number={num} />)}
                                </Stack>
                                <Stack direction="row" spacing={2.5}>
                                    {[5, 6, 7].map(num => <Seat key={num} number={num} />)}
                                </Stack>
                            </Stack>

                            <Typography variant="caption" fontWeight={900} color="#cbd5e1" display="block" mb={3} sx={{ letterSpacing: 1 }}>
                                PRACTICE ZONE (4 SEATS)
                            </Typography>
                            <Stack direction="row" spacing={2.5} justifyContent="center">
                                {[8, 9, 10].map(num => <Seat key={num} number={num} />)}
                            </Stack>
                        </Box>
                    </Paper>
                </Container>
            </Box>

            <Dialog open={bookingDialogOpen} onClose={() => setBookingDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle fontWeight={900}>Book Seat #{selectedSeat}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Name" fullWidth value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                        <TextField label="Email" fullWidth value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                        <TextField label="Phone" fullWidth value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setBookingDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleBooking} sx={{ bgcolor: 'black', borderRadius: 2 }}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PublicSeatBooking;
