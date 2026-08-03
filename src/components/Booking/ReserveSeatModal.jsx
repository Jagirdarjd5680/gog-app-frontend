import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Autocomplete, CircularProgress, Typography, Box
} from '@mui/material';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ReserveSeatModal = ({ open, onClose, onSuccess }) => {
    const [batches, setBatches] = useState([]);
    const [students, setStudents] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [seatNumber, setSeatNumber] = useState('');

    useEffect(() => {
        if (!open) return;
        setSelectedBatch('');
        setSelectedStudent(null);
        setSeatNumber('');
        fetchOptions();
    }, [open]);

    const fetchOptions = async () => {
        setLoadingOptions(true);
        try {
            const [batchesRes, studentsRes] = await Promise.all([
                api.get('/seat-bookings/available-batches'),
                api.get('/users', { params: { role: 'student', limit: 500 } }),
            ]);
            setBatches(batchesRes.data?.data || []);
            setStudents(studentsRes.data?.data || []);
        } catch (error) {
            toast.error('Failed to load batches/students');
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedStudent) return toast.warning('Please select a student');
        if (!selectedBatch) return toast.warning('Please select a batch');

        setSaving(true);
        try {
            await api.post('/seat-bookings', {
                studentId: selectedStudent.id || selectedStudent._id,
                batchId: selectedBatch,
                seatNumber: seatNumber || undefined,
            });
            toast.success('Seat reserved successfully');
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reserve seat');
        } finally {
            setSaving(false);
        }
    };

    const selectedBatchData = batches.find((b) => String(b.id) === String(selectedBatch));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 800 }}>Reserve a Seat</DialogTitle>
            <DialogContent dividers>
                {loadingOptions ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <Autocomplete
                            options={students}
                            getOptionLabel={(s) => `${s.name} (${s.email})`}
                            value={selectedStudent}
                            onChange={(_, val) => setSelectedStudent(val)}
                            renderInput={(params) => <TextField {...params} label="Student *" size="small" />}
                        />

                        <TextField
                            select
                            fullWidth
                            size="small"
                            label="Batch *"
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                        >
                            {batches.length === 0 ? (
                                <MenuItem disabled value="">No active batches found</MenuItem>
                            ) : (
                                batches.map((b) => (
                                    <MenuItem key={b.id} value={b.id} disabled={b.availableSeats <= 0}>
                                        {b.name} — {b.course?.title || 'General'} ({b.availableSeats}/{b.maxStudents} seats free)
                                    </MenuItem>
                                ))
                            )}
                        </TextField>

                        {selectedBatchData && (
                            <Typography variant="caption" color="text.secondary">
                                {selectedBatchData.availableSeats} of {selectedBatchData.maxStudents} seats currently available in this batch.
                            </Typography>
                        )}

                        <TextField
                            fullWidth
                            size="small"
                            label="Seat Number (optional)"
                            value={seatNumber}
                            onChange={(e) => setSeatNumber(e.target.value)}
                            placeholder="e.g., A-12"
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} variant="text" color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={saving || loadingOptions}>
                    {saving ? <CircularProgress size={20} /> : 'Reserve Seat'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReserveSeatModal;
