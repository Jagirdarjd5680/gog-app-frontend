import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Button, IconButton, Stack, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ReserveSeatModal from '../../components/Booking/ReserveSeatModal';

const BookingManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [reserveModalOpen, setReserveModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/seat-bookings');
            const data = res.data?.data || res.data || [];
            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load bookings:', error);
            toast.error('Failed to load seat bookings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`/seat-bookings/${id}`, { status });
            toast.success(`Booking ${status} successfully`);
            fetchBookings();
            setViewDialogOpen(false);
        } catch (error) {
            toast.error('Failed to update booking status');
        }
    };

    const handleDeleteBooking = async (id) => {
        if (!window.confirm('Delete this seat booking?')) return;
        try {
            await api.delete(`/seat-bookings/${id}`);
            toast.success('Booking deleted');
            fetchBookings();
        } catch (error) {
            toast.error('Failed to delete booking');
        }
    };

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const name = (b.user?.name || '').toLowerCase();
            const email = (b.user?.email || '').toLowerCase();
            const seat = (b.seatNumber || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = name.includes(term) || email.includes(term) || seat.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (b.status || 'pending') !== statusFilter) return false;
            return true;
        });
    }, [bookings, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Bookings', value: bookings.length, icon: <EventSeatIcon />, color: 'primary' },
        { title: 'Pending Approval', value: bookings.filter(b => b.status === 'pending').length, icon: <PendingActionsIcon />, color: 'warning' },
        { title: 'Confirmed Seats', value: bookings.filter(b => b.status === 'approved' || b.status === 'confirmed').length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Cancelled', value: bookings.filter(b => b.status === 'rejected' || b.status === 'cancelled').length, icon: <CancelIcon />, color: 'error' }
    ], [bookings]);

    const filters = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            minWidth: 170,
            options: [
                { value: 'all', label: 'All Bookings' },
                { value: 'pending', label: 'Pending Approval' },
                { value: 'approved', label: 'Confirmed' },
                { value: 'rejected', label: 'Cancelled' }
            ]
        }
    ], [statusFilter]);

    const columns = useMemo(() => [
        {
            field: 'name',
            headerName: 'STUDENT NAME',
            flex: 2,
            minWidth: 240,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                        {(params.data.user?.name || 'S').charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {params.data.user?.name || 'Student'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            {params.data.user?.email || 'N/A'}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'seatNumber',
            headerName: 'SEAT / BATCH',
            width: 180,
            valueGetter: (params) => params.data.seatNumber
                ? `Seat: ${params.data.seatNumber}`
                : (params.data.batch?.name || 'Unassigned')
        },
        {
            field: 'status',
            headerName: 'STATUS',
            width: 140,
            cellRenderer: (params) => {
                const status = params.data.status || 'pending';
                const color = status === 'approved' || status === 'confirmed' ? 'success' : status === 'rejected' ? 'error' : 'warning';
                return (
                    <Chip
                        label={status.toUpperCase()}
                        color={color}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'createdAt',
            headerName: 'BOOKING DATE',
            width: 160,
            valueGetter: (params) => {
                const d = params.data.createdAt;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'N/A';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 140,
            cellRenderer: (params) => {
                const id = params.data._id || params.data.id;
                return (
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => { setSelectedBooking(params.data); setViewDialogOpen(true); }} sx={{ color: 'var(--color-vc-link)' }} title="View Details">
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteBooking(id)} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                );
            }
        }
    ], []);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Seat Booking & Reservations
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Review, approve, and manage classroom seat reservations and student batch allocations
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search student name, email, or seat..."
                filters={filters}
                totalCount={filteredBookings.length}
                actionButtonText="Reserve Seat"
                actionButtonIcon={<AddIcon fontSize="small" />}
                onActionClick={() => setReserveModalOpen(true)}
            />

            <ReserveSeatModal
                open={reserveModalOpen}
                onClose={() => setReserveModalOpen(false)}
                onSuccess={fetchBookings}
            />

            <TableUI
                rowData={filteredBookings}
                columnDefs={columns}
                loading={loading}
            />

            {/* Booking Details Modal */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Seat Reservation Details</DialogTitle>
                <DialogContent dividers>
                    {selectedBooking && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
                            <Typography variant="subtitle1" fontWeight={800}>{selectedBooking.user?.name || 'Student'}</Typography>
                            <Typography variant="body2" color="text.secondary">Email: {selectedBooking.user?.email || 'N/A'}</Typography>
                            <Typography variant="body2" fontWeight={700}>Seat Number: {selectedBooking.seatNumber || selectedBooking.batch?.name || 'Unassigned'}</Typography>
                            <Typography variant="body2">Status: <strong>{(selectedBooking.status || 'pending').toUpperCase()}</strong></Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={() => setViewDialogOpen(false)} variant="outlined" color="inherit">Close</Button>
                    {selectedBooking?.status === 'pending' && (
                        <>
                            <Button onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'rejected')} variant="contained" color="error">Reject</Button>
                            <Button onClick={() => handleUpdateStatus(selectedBooking._id || selectedBooking.id, 'approved')} variant="contained" color="success">Approve Seat</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookingManagement;
