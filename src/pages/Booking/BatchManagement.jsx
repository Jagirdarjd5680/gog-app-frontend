import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    Typography,
    Button,
    Stack,
    IconButton,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const BatchManagement = () => {
    const { isDark } = useTheme();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        totalSeats: 10,
        zones: [
            { name: 'Main Training Area', seatCount: 7, seatType: 'READ' },
            { name: 'Practice Zone', seatCount: 3, seatType: 'PRAC' }
        ]
    });

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const res = await api.get('/booking/batches');
            if (res.data.success) {
                setBatches(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (batch = null) => {
        if (batch) {
            setSelectedBatch(batch);
            setFormData({
                name: batch.name,
                startTime: batch.startTime,
                endTime: batch.endTime,
                totalSeats: batch.totalSeats,
                zones: batch.zones || []
            });
        } else {
            setSelectedBatch(null);
            setFormData({
                name: '',
                startTime: '',
                endTime: '',
                totalSeats: 10,
                zones: [
                    { name: 'Main Training Area', seatCount: 7, seatType: 'READ' },
                    { name: 'Practice Zone', seatCount: 3, seatType: 'PRAC' }
                ]
            });
        }
        setOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const res = selectedBatch 
                ? await api.put(`/booking/batches/${selectedBatch._id}`, formData)
                : await api.post('/booking/batches', formData);
            
            if (res.data.success) {
                toast.success(`Batch ${selectedBatch ? 'updated' : 'created'} successfully`);
                setOpen(false);
                fetchBatches();
            }
        } catch (error) {
            toast.error('Operation failed');
        }
    };

    if (loading && batches.length === 0) {
        return <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h5" fontWeight={900}>Batches Management</Typography>
                    <Typography variant="caption" color="text.secondary">ADD, EDIT OR REMOVE BATCHES</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <IconButton onClick={fetchBatches} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'white', boxShadow: 1 }}>
                        <RefreshIcon />
                    </IconButton>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={() => handleOpen()}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 3, bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}
                    >
                        Create Batch
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                {batches.map((batch) => (
                    <Grid item xs={12} sm={6} md={4} key={batch._id}>
                        <Card sx={{ 
                            p: 3, 
                            borderRadius: 4, 
                            boxShadow: 'none', 
                            border: '1px solid', 
                            borderColor: 'divider',
                            position: 'relative',
                            '&:hover': { borderColor: 'primary.main', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }
                        }}>
                            <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                                <IconButton size="small" onClick={() => handleOpen(batch)}><EditIcon fontSize="small" /></IconButton>
                            </Box>
                            
                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.03)', color: 'text.primary', borderRadius: 2 }}>
                                    <CalendarTodayIcon fontSize="small" />
                                </Avatar>
                                <Typography variant="h6" fontWeight={800}>{batch.name}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary" mb={3}>
                                <AccessTimeIcon sx={{ fontSize: 16 }} />
                                <Typography variant="body2" fontWeight={600}>{batch.startTime} — {batch.endTime}</Typography>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        Enrollment
                                    </Typography>
                                </Box>
                                <Chip 
                                    label={`${batch.totalSeats} Seats`} 
                                    size="small" 
                                    sx={{ bgcolor: 'black', color: 'white', fontWeight: 800, borderRadius: 1.5 }}
                                />
                            </Stack>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Batch Form Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogTitle fontWeight={800}>{selectedBatch ? 'Edit Batch' : 'Create New Batch'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Batch Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Start Time"
                                placeholder="07:00 AM"
                                fullWidth
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            />
                            <TextField
                                label="End Time"
                                placeholder="09:00 AM"
                                fullWidth
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            />
                        </Stack>
                        <TextField
                            label="Total Seats"
                            type="number"
                            fullWidth
                            value={formData.totalSeats}
                            onChange={(e) => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={{ borderRadius: 2, textTransform: 'none', px: 4, bgcolor: 'black' }}>
                        Save Batch
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BatchManagement;
