import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    Typography,
    Stack,
    IconButton,
    TextField,
    InputAdornment,
    Chip,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const SeatManagement = () => {
    const { isDark } = useTheme();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    
    // Assignment Dialog State
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [studentToAssign, setStudentToAssign] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingBookingId, setEditingBookingId] = useState(null);
    const [assignmentForm, setAssignmentForm] = useState({
        batchId: '',
        seatType: 'live',
        seatNumber: '',
        order: 1
    });

    useEffect(() => {
        fetchBatches();
        fetchStudents();
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

    const fetchStudents = async () => {
        try {
            const res = await api.get('/users?role=student');
            if (res.data.success) {
                setAllStudents(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchSeatStatus = async (batchId) => {
        setLoading(true);
        try {
            const res = await api.get(`/booking/batch/${batchId}/seats`);
            if (res.data.success) {
                setSeats(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load seat status');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAssign = (seatNum = '', type = 'live', booking = null) => {
        if (booking) {
            setIsEditing(true);
            setEditingBookingId(booking._id);
            setAssignmentForm({
                batchId: booking.batch?._id || selectedBatch?._id,
                seatType: booking.zone === 'Practice Zone' ? 'practice' : 'live',
                seatNumber: booking.seatNumber,
                order: booking.seatNumber
            });
            // Try to find the student object
            const student = allStudents.find(s => s.email === booking.user.email || s._id === booking.user.id);
            setStudentToAssign(student || { name: booking.user.name, email: booking.user.email, _id: booking.user.id });
        } else {
            setIsEditing(false);
            setEditingBookingId(null);
            setAssignmentForm({
                batchId: selectedBatch?._id || '',
                seatType: type,
                seatNumber: seatNum,
                order: seatNum || 1
            });
            setStudentToAssign(null);
        }
        setAssignDialogOpen(true);
    };

    const confirmAssignment = async () => {
        try {
            const num = Number(assignmentForm.seatNumber);
            if (!num) return toast.error('Please enter a valid seat number');

            // 1. Update the batch's total seats if needed
            const updatedTotalSeats = Math.max(selectedBatch.totalSeats, num);
            if (updatedTotalSeats > selectedBatch.totalSeats) {
                await api.put(`/booking/batches/${selectedBatch._id}`, {
                    ...selectedBatch,
                    totalSeats: updatedTotalSeats
                });
            }

            // 2. Handle Assignment
            if (studentToAssign) {
                const payload = {
                    user: {
                        name: studentToAssign.name,
                        email: studentToAssign.email,
                        phone: studentToAssign.phone || 'N/A',
                        id: studentToAssign._id
                    },
                    batchId: assignmentForm.batchId,
                    seatNumber: num,
                    zone: assignmentForm.seatType === 'live' ? 'Main Training Area' : 'Practice Zone'
                };

                if (isEditing && editingBookingId) {
                    // Update existing booking
                    await api.put(`/booking/${editingBookingId}/status`, { 
                        ...payload,
                        status: 'approved' 
                    });
                } else {
                    // Create new booking
                    const res = await api.post('/booking/request', { ...payload });
                    if (res.data.success) {
                        await api.put(`/booking/${res.data.data._id}/status`, { status: 'approved' });
                    }
                }
            }

            toast.success(`Seat #${num} updated successfully`);
            setAssignDialogOpen(false);
            fetchBatches(); 
            fetchSeatStatus(selectedBatch._id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Are you sure you want to remove this assignment?')) return;
        try {
            await api.delete(`/booking/${id}`);
            toast.success('Assignment removed');
            fetchSeatStatus(selectedBatch._id);
        } catch (error) {
            toast.error('Failed to remove assignment');
        }
    };

    const SeatCard = ({ number, type, booking }) => {
        const isOccupied = !!booking;
        const statusText = booking?.status === 'approved' ? 'BOOKED' : booking?.status === 'pending' ? 'PENDING' : 'READY';
        const studentName = booking?.user?.name || 'Empty';

        return (
            <Card 
                onClick={() => handleOpenAssign(number, type, booking)}
                sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    boxShadow: 'none', 
                    border: '1.5px solid', 
                    borderColor: isOccupied ? 'divider' : 'rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    bgcolor: isOccupied ? (booking.status === 'approved' ? 'black' : 'warning.light') : 'white',
                    color: isOccupied && booking.status === 'approved' ? 'white' : 'text.primary',
                    transition: '0.2s',
                    position: 'relative',
                    '&:hover': { 
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)'
                    }
                }}
            >
                <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6 }}>{selectedBatch?.name}</Typography>
                    <Chip label={type.toUpperCase()} size="small" sx={{ height: 16, fontSize: '0.5rem', fontWeight: 900 }} />
                </Stack>
                
                <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Typography variant="h4" fontWeight={900}>{number}</Typography>
                </Box>
                
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="caption" fontWeight={800}>{isOccupied ? studentName : statusText}</Typography>
                </Box>

                {isOccupied && (
                    <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteBooking(booking._id); }}
                        sx={{ position: 'absolute', bottom: 5, right: 5, color: booking.status === 'approved' ? 'rgba(255,255,255,0.5)' : 'error.main' }}
                    >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                )}
            </Card>
        );
    };

    return (
        <Box>
            {/* Header Tabs */}
            <Stack direction="row" spacing={1} mb={4} sx={{ overflowX: 'auto', pb: 1 }}>
                {batches.map((batch) => (
                    <Button 
                        key={batch._id}
                        onClick={() => setSelectedBatch(batch)}
                        variant={selectedBatch?._id === batch._id ? 'contained' : 'outlined'}
                        sx={{ 
                            borderRadius: 10, px: 3, py: 1, 
                            bgcolor: selectedBatch?._id === batch._id ? 'black' : 'transparent',
                            color: selectedBatch?._id === batch._id ? '#fbbf24' : 'text.secondary',
                            fontWeight: 800, textTransform: 'none',
                            borderColor: selectedBatch?._id === batch._id ? 'black' : '#eee',
                            flexShrink: 0
                        }}
                    >
                        {batch.name}
                    </Button>
                ))}
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h5" fontWeight={900}>Batch Seat Overview</Typography>
                    <Typography variant="caption" color="text.secondary">MANAGE LIVE AND PRACTICE SEATS</Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => handleOpenAssign()}
                    sx={{ bgcolor: 'black', borderRadius: 3, px: 4, py: 1, fontWeight: 900 }}
                >
                    ADD SEAT
                </Button>
            </Stack>

            {loading ? (
                <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress /></Box>
            ) : (
                <Stack spacing={6}>
                    {/* Live Seats Section */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={900} color="#94a3b8" mb={3} sx={{ letterSpacing: 1 }}>
                            LIVE AREA (READING SEATS)
                        </Typography>
                        <Grid container spacing={2}>
                            {Array.from({ length: 7 }, (_, i) => i + 1).map(num => (
                                <Grid item xs={6} sm={4} md={2.4} key={num}>
                                    <SeatCard 
                                        number={num} 
                                        type="live" 
                                        booking={seats.find(s => s.seatNumber === num)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Divider />

                    {/* Practice Seats Section */}
                    <Box>
                        <Typography variant="subtitle2" fontWeight={900} color="#94a3b8" mb={3} sx={{ letterSpacing: 1 }}>
                            PRACTICE AREA SEATS
                        </Typography>
                        <Grid container spacing={2}>
                            {Array.from({ length: Math.max(3, (selectedBatch?.totalSeats || 10) - 7) }, (_, i) => i + 8).map(num => (
                                <Grid item xs={6} sm={4} md={2.4} key={num}>
                                    <SeatCard 
                                        number={num} 
                                        type="practice" 
                                        booking={seats.find(s => s.seatNumber === num)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Stack>
            )}

            {/* Assignment Dialog */}
            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle fontWeight={900} sx={{ borderBottom: '1px solid #eee', mb: 2 }}>
                    {isEditing ? 'Edit Assignment' : 'Assign / Add Seat'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <Typography variant="caption" fontWeight={900} color="text.secondary">1. ASSIGN STUDENT (OPTIONAL)</Typography>
                            <Autocomplete
                                options={allStudents}
                                value={studentToAssign}
                                getOptionLabel={(option) => `${option.name} (${option.email})`}
                                renderInput={(params) => <TextField {...params} placeholder="Search student name..." fullWidth sx={{ mt: 1 }} />}
                                onChange={(e, v) => setStudentToAssign(v)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" fontWeight={900} color="text.secondary">2. SELECT BATCH</Typography>
                            <Select
                                fullWidth
                                value={assignmentForm.batchId}
                                onChange={(e) => setAssignmentForm({...assignmentForm, batchId: e.target.value})}
                                sx={{ mt: 1, borderRadius: 2 }}
                            >
                                {batches.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
                            </Select>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" fontWeight={900} color="text.secondary">3. SEAT TYPE</Typography>
                            <Select
                                fullWidth
                                value={assignmentForm.seatType}
                                onChange={(e) => setAssignmentForm({...assignmentForm, seatType: e.target.value})}
                                sx={{ mt: 1, borderRadius: 2 }}
                            >
                                <MenuItem value="live">LIVE / READING</MenuItem>
                                <MenuItem value="practice">PRACTICE AREA</MenuItem>
                            </Select>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" fontWeight={900} color="text.secondary">4. SEAT NUMBER</Typography>
                            <TextField
                                fullWidth
                                type="number"
                                value={assignmentForm.seatNumber}
                                onChange={(e) => setAssignmentForm({...assignmentForm, seatNumber: e.target.value})}
                                sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" fontWeight={900} color="text.secondary">5. ORDER NUMBER</Typography>
                            <TextField
                                fullWidth
                                type="number"
                                value={assignmentForm.order}
                                onChange={(e) => setAssignmentForm({...assignmentForm, order: e.target.value})}
                                sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setAssignDialogOpen(false)} sx={{ fontWeight: 800 }}>Cancel</Button>
                    <Button variant="contained" onClick={confirmAssignment} sx={{ bgcolor: 'black', borderRadius: 2, px: 5, py: 1.2, fontWeight: 900 }}>
                        {isEditing ? 'UPDATE ASSIGNMENT' : 'CONFIRM ASSIGNMENT'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SeatManagement;
