import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Paper,
    Grid,
    Card,
    Stack,
    IconButton,
    Button,
    Chip,
    Avatar,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

// Import sub-components
import BatchManagement from './BatchManagement';
import SeatManagement from './SeatManagement';

const BookingManagement = () => {
    const { isDark } = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/booking/all');
            if (res.data.success) {
                setBookings(res.data.data);
                calculateStats(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const s = {
            total: data.length,
            pending: data.filter(b => b.status === 'pending').length,
            approved: data.filter(b => b.status === 'approved').length,
            rejected: data.filter(b => b.status === 'rejected').length
        };
        setStats(s);
    };

    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setViewDialogOpen(true);
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking? This will allow the student to request again.')) return;
        try {
            const res = await api.delete(`/booking/${id}`);
            if (res.data.success) {
                toast.success('Booking deleted successfully');
                if (viewDialogOpen) setViewDialogOpen(false);
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to delete booking');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await api.put(`/booking/${id}/status`, { status });
            if (res.data.success) {
                toast.success(`Booking ${status} successfully`);
                if (viewDialogOpen) setViewDialogOpen(false);
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const StatCard = ({ title, value, color, icon, subtitle }) => (
        <Card sx={{ 
            p: 2.5, 
            borderRadius: 4, 
            boxShadow: 'none', 
            border: '1px solid', 
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: color }}>
                            {value}
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${color}15`, color: color, borderRadius: 2 }}>
                        {icon}
                    </Avatar>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {subtitle}
                </Typography>
            </Box>
            <Box sx={{ 
                position: 'absolute', 
                right: -20, 
                bottom: -20, 
                opacity: 0.05, 
                transform: 'rotate(-15deg)',
                color: color 
            }}>
                {React.cloneElement(icon, { sx: { fontSize: 100 } })}
            </Box>
        </Card>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.5px' }}>
                        All Batches Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        SYSTEM-WIDE BOOKING OVERVIEW
                    </Typography>
                </Box>
                <IconButton onClick={fetchData} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'white', boxShadow: 1 }}>
                    <RefreshIcon />
                </IconButton>
            </Stack>

            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Total" value={stats.total} color="#6366f1" icon={<TrendingUpIcon />} subtitle="Total seat requests" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Pending" value={stats.pending} color="#f59e0b" icon={<AccessTimeIcon />} subtitle="Awaiting review" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Approved" value={stats.approved} color="#10b981" icon={<CheckCircleIcon />} subtitle="Seats confirmed" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Rejected" value={stats.rejected} color="#ef4444" icon={<CancelIcon />} subtitle="Requests denied" />
                </Grid>
            </Grid>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={(e, v) => setTabValue(v)}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 700,
                                minHeight: 64,
                                fontSize: '0.95rem'
                            }
                        }}
                    >
                        <Tab icon={<DashboardIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Dashboard" />
                        <Tab icon={<GroupsIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Manage Batches" />
                        <Tab icon={<EventSeatIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Manage Seats" />
                    </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                    {tabValue === 0 && (
                        <Box>
                            <Stack direction="row" spacing={2} mb={3} alignItems="center">
                                <TextField
                                    placeholder="Quick search..."
                                    size="small"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.50' }
                                    }}
                                />
                                <Select
                                    value="all"
                                    size="small"
                                    sx={{ minWidth: 150, borderRadius: 3, fontWeight: 700 }}
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="approved">Approved</MenuItem>
                                    <MenuItem value="rejected">Rejected</MenuItem>
                                </Select>
                            </Stack>

                            {loading ? (
                                <Box sx={{ py: 10, textAlign: 'center' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Box sx={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                                <th style={{ textAlign: 'left', padding: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Student Details</th>
                                                <th style={{ textAlign: 'left', padding: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Batch & Seat</th>
                                                <th style={{ textAlign: 'left', padding: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                                                <th style={{ textAlign: 'right', padding: '16px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((booking) => (
                                                <tr key={booking._id} style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{booking.user.name[0]}</Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={800}>{booking.user.name}</Typography>
                                                                <Typography variant="caption" color="text.secondary">{booking.user.phone} • {booking.user.email}</Typography>
                                                            </Box>
                                                        </Stack>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <Typography variant="body2" fontWeight={700}>{booking.batch?.name || 'Batch'}</Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                                            SEAT #{booking.seatNumber} ({booking.zone})
                                                        </Typography>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>
                                                        <Chip 
                                                            label={booking.status.toUpperCase()} 
                                                            size="small"
                                                            color={booking.status === 'approved' ? 'success' : booking.status === 'rejected' ? 'error' : 'warning'}
                                                            sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: 1.5 }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleDeleteBooking(booking._id)}
                                                                sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleViewDetails(booking)}
                                                                sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.100' }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                            {booking.status === 'pending' ? (
                                                                <>
                                                                    <IconButton 
                                                                        size="small" 
                                                                        onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                                                        sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}
                                                                    >
                                                                        <CheckCircleIcon fontSize="small" />
                                                                    </IconButton>
                                                                    <IconButton 
                                                                        size="small"
                                                                        onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                                        sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}
                                                                    >
                                                                        <CancelIcon fontSize="small" />
                                                                    </IconButton>
                                                                </>
                                                            ) : (
                                                                booking.status === 'approved' && (
                                                                    <IconButton 
                                                                        size="small"
                                                                        onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                                        sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}
                                                                        title="Reject Approved Booking"
                                                                    >
                                                                        <CancelIcon fontSize="small" />
                                                                    </IconButton>
                                                                )
                                                            )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </Box>
                            )}
                        </Box>
                    )}
                    
                    {tabValue === 1 && (
                        <BatchManagement />
                    )}

                    {tabValue === 2 && (
                        <SeatManagement />
                    )}
                </Box>
            </Paper>

            {/* View Details Dialog */}
            <Dialog 
                open={viewDialogOpen} 
                onClose={() => setViewDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: 900 }}>Booking Details</DialogTitle>
                <DialogContent>
                    {selectedBooking && (
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>STUDENT</Typography>
                                <Typography variant="body1" fontWeight={800}>{selectedBooking.user.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedBooking.user.email}</Typography>
                                <Typography variant="body2" color="text.secondary">{selectedBooking.user.phone}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>BATCH & SEAT</Typography>
                                <Typography variant="body1" fontWeight={800}>{selectedBooking.batch?.name || 'Batch'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Seat #{selectedBooking.seatNumber} ({selectedBooking.zone})
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>STATUS</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip 
                                        label={selectedBooking.status.toUpperCase()} 
                                        color={selectedBooking.status === 'approved' ? 'success' : selectedBooking.status === 'rejected' ? 'error' : 'warning'}
                                        size="small"
                                        sx={{ fontWeight: 800, borderRadius: 1.5 }}
                                    />
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                    <Box>
                        <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => handleDeleteBooking(selectedBooking._id)}
                            startIcon={<DeleteIcon />}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            Delete
                        </Button>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button onClick={() => setViewDialogOpen(false)} sx={{ fontWeight: 700 }}>Close</Button>
                        {selectedBooking?.status === 'pending' && (
                            <Button 
                                variant="contained" 
                                color="success"
                                onClick={() => handleStatusUpdate(selectedBooking._id, 'approved')}
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                                Approve
                            </Button>
                        )}
                        {selectedBooking?.status !== 'rejected' && (
                            <Button 
                                variant="contained" 
                                color="error"
                                onClick={() => handleStatusUpdate(selectedBooking._id, 'rejected')}
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                                Reject
                            </Button>
                        )}
                    </Stack>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookingManagement;
