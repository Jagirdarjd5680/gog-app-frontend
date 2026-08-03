import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Button, 
    IconButton, 
    TextField, 
    CircularProgress,
    useTheme,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Skeleton
} from '@mui/material';
import { 
    Save as SaveIcon, 
    Add as PlusIcon, 
    Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_COLORS = {
    'Monday': '#ef4444',
    'Tuesday': '#3b82f6',
    'Wednesday': '#f59e0b',
    'Thursday': '#10b981',
    'Friday': '#64748b',
    'Saturday': '#ec4899',
    'Sunday': '#8b5cf6'
};

const TimetableAdmin = () => {
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(searchParams.get('batchId') || '');
    const [timetable, setTimetable] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timetableLoading, setTimetableLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchInitialData = async () => {
        try {
            const [batchRes, teacherRes, courseRes] = await Promise.all([
                api.get('/batches'),
                api.get('/users?role=teacher'),
                api.get('/courses')
            ]);
            const batchList = batchRes.data.data || [];
            setBatches(batchList);
            setTeachers(teacherRes.data.data || []);
            setCourses(courseRes.data.data || []);
            
            // If no batch selected from URL, pick the first one
            if (!selectedBatch && batchList.length > 0) {
                const firstBatchId = batchList[0].id || batchList[0]._id;
                setSelectedBatch(String(firstBatchId));
                setSearchParams({ batchId: String(firstBatchId) });
            }
        } catch (error) {
            toast.error('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    const fetchTimetable = useCallback(async (batchId) => {
        if (!batchId) return;
        setTimetableLoading(true);
        try {
            const res = await api.get(`/timetables?batch=${batchId}`);
            setTimetable(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load timetable');
        } finally {
            setTimetableLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedBatch) {
            fetchTimetable(selectedBatch);
        }
    }, [selectedBatch, fetchTimetable]);

    const handleBatchChange = (e) => {
        const batchId = e.target.value;
        setSelectedBatch(batchId);
        setSearchParams({ batchId });
    };

    const handleAddSlot = (day) => {
        const currentBatch = batches.find(b => String(b.id || b._id) === String(selectedBatch));
        const courseId = currentBatch?.course?.id || currentBatch?.course?._id || currentBatch?.course || (courses[0]?.id || courses[0]?._id || '');

        const newSlot = {
            day,
            startTime: '09:00',
            endTime: '10:00',
            subject: '',
            teacher: teachers[0]?.id || teachers[0]?._id || '',
            course: courseId,
            id: Math.random().toString(36).substr(2, 9)
        };
        setTimetable([...timetable, newSlot]);
    };

    const handleUpdateSlot = (id, field, value) => {
        setTimetable(timetable.map(slot => 
            (slot._id === id || slot.id === id) ? { ...slot, [field]: value } : slot
        ));
    };

    const handleDeleteSlot = (id) => {
        setTimetable(timetable.filter(slot => slot._id !== id && slot.id !== id));
    };

    const handleSave = async () => {
        if (!selectedBatch) return;
        setIsSaving(true);
        try {
            const currentBatch = batches.find(b => String(b.id || b._id) === String(selectedBatch));
            const batchCourseId = currentBatch?.course?.id || currentBatch?.course?._id || currentBatch?.course;

            const validTimetable = timetable
                .filter(slot => slot.day)
                .map(slot => ({
                    batch: selectedBatch,
                    day: slot.day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    subject: slot.subject || '',
                    teacher: slot.teacher ? (typeof slot.teacher === 'object' ? (slot.teacher.id || slot.teacher._id) : slot.teacher) : null,
                    course: batchCourseId || (slot.course ? (typeof slot.course === 'object' ? (slot.course.id || slot.course._id) : slot.course) : null)
                }));

            await api.post('/timetables/bulk', {
                batch: selectedBatch,
                timetable: validTimetable
            });
            
            toast.success('✨ Timetable saved successfully!');

            // Optional: Send notification
            try {
                await api.post('/notifications', {
                    title: '📅 Timetable Updated',
                    message: `Weekly schedule for ${currentBatch?.name} has been updated.`,
                    type: 'info',
                    recipientRole: 'specific',
                    batch: selectedBatch,
                    sendPush: true
                });
            } catch (notifErr) {}

            fetchTimetable(selectedBatch);
        } catch (error) {
            toast.error('❌ Failed to save. Check your inputs.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh', textAlign: 'center' }}>
            <CircularProgress sx={{ mt: 8 }} />
            <Typography sx={{ mt: 2, color: 'var(--color-vc-mute)' }}>Loading batches...</Typography>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            {/* Header Section */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                        Batch Timetable Management
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                        Configure weekly slots and assignments for specific batches
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel>Active Batch</InputLabel>
                        <Select
                            value={String(selectedBatch)}
                            onChange={handleBatchChange}
                            label="Active Batch"
                            sx={{
                                bgcolor: 'var(--color-vc-canvas)',
                                borderRadius: '6px',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline)' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' }
                            }}
                        >
                            {batches.map(b => {
                                const id = String(b.id || b._id);
                                return <MenuItem key={id} value={id}>{b.name}</MenuItem>;
                            })}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={isSaving || timetableLoading}
                        sx={{
                            borderRadius: '8px', px: 3, fontWeight: 700, textTransform: 'none', boxShadow: 'none',
                            bgcolor: 'var(--color-vc-primary)', color: 'var(--color-vc-on-primary)',
                            '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' }
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Sync Timetable'}
                    </Button>
                    <IconButton
                        onClick={() => fetchTimetable(selectedBatch)}
                        disabled={timetableLoading}
                        sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', color: 'var(--color-vc-mute)' }}
                    >
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            {/* Timetable Grid */}
            <Box sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 1200 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'var(--color-vc-canvas-soft)' }}>
                                {DAYS.map(day => (
                                    <TableCell key={day} align="center" sx={{ borderBottom: '1px solid var(--color-vc-hairline)', p: 1 }}>
                                        <Box sx={{
                                            bgcolor: DAY_COLORS[day],
                                            color: '#fff',
                                            py: 1,
                                            borderRadius: '6px',
                                            fontWeight: 800,
                                            fontSize: 11,
                                            letterSpacing: '0.06em',
                                            textTransform: 'uppercase'
                                        }}>
                                            {day}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow sx={{ verticalAlign: 'top' }}>
                                {DAYS.map(day => {
                                    const slots = timetable.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));

                                    return (
                                        <TableCell key={day} align="center" sx={{ borderRight: '1px solid var(--color-vc-hairline)', p: 1, minWidth: 160 }}>
                                            {timetableLoading ? (
                                                <Stack spacing={1}>
                                                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '8px' }} />
                                                    <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '8px' }} />
                                                </Stack>
                                            ) : (
                                                <>
                                                    {slots.map(slot => (
                                                        <Paper
                                                            key={slot._id || slot.id}
                                                            elevation={0}
                                                            sx={{
                                                                mb: 1.5,
                                                                p: 1.5,
                                                                position: 'relative',
                                                                bgcolor: 'var(--color-vc-canvas-soft)',
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--color-vc-hairline)',
                                                                transition: 'all 0.2s',
                                                                '&:hover': { borderColor: DAY_COLORS[day], bgcolor: 'var(--color-vc-canvas)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }
                                                            }}
                                                        >
                                                            {/* Timing Inputs */}
                                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                                                                <TextField 
                                                                    size="small" 
                                                                    variant="standard"
                                                                    value={slot.startTime}
                                                                    onChange={(e) => handleUpdateSlot(slot._id || slot.id, 'startTime', e.target.value)}
                                                                    sx={{ '& .MuiInputBase-input': { fontSize: 11, fontWeight: 700, textAlign: 'center', p: 0.5 } }}
                                                                />
                                                                <Typography variant="caption" color="text.disabled">to</Typography>
                                                                <TextField 
                                                                    size="small" 
                                                                    variant="standard"
                                                                    value={slot.endTime}
                                                                    onChange={(e) => handleUpdateSlot(slot._id || slot.id, 'endTime', e.target.value)}
                                                                    sx={{ '& .MuiInputBase-input': { fontSize: 11, fontWeight: 700, textAlign: 'center', p: 0.5 } }}
                                                                />
                                                            </Stack>

                                                            {/* Subject Input */}
                                                            <TextField 
                                                                fullWidth 
                                                                size="small" 
                                                                placeholder="Enter Topic..."
                                                                variant="standard"
                                                                value={slot.subject}
                                                                onChange={(e) => handleUpdateSlot(slot._id || slot.id, 'subject', e.target.value)}
                                                                sx={{
                                                                    mb: 1,
                                                                    '& .MuiInputBase-input': { fontSize: 13, fontWeight: 800, color: 'var(--color-vc-ink)', textAlign: 'center' },
                                                                    '&::after, &::before': { display: 'none' }
                                                                }}
                                                            />

                                                            {/* Teacher Select */}
                                                            <FormControl fullWidth size="small">
                                                                <Select
                                                                    value={slot.teacher ? (typeof slot.teacher === 'object' ? String(slot.teacher.id || slot.teacher._id) : String(slot.teacher)) : ''}
                                                                    onChange={(e) => handleUpdateSlot(slot._id || slot.id, 'teacher', e.target.value)}
                                                                    displayEmpty
                                                                    variant="standard"
                                                                    sx={{
                                                                        fontSize: 11, fontWeight: 600, color: 'var(--color-vc-mute)',
                                                                        '& .MuiSelect-select': { p: 0.5, textAlign: 'center' },
                                                                        '&::after, &::before': { display: 'none' }
                                                                    }}
                                                                >
                                                                    <MenuItem value="" sx={{ fontSize: 11 }}>No Teacher</MenuItem>
                                                                    {teachers.map(t => {
                                                                        const id = String(t.id || t._id);
                                                                        return <MenuItem key={id} value={id} sx={{ fontSize: 12 }}>{t.name}</MenuItem>;
                                                                    })}
                                                                </Select>
                                                            </FormControl>

                                                            {/* Delete Action */}
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => handleDeleteSlot(slot._id || slot.id)}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    right: -8,
                                                                    top: -8,
                                                                    bgcolor: 'var(--color-vc-canvas)',
                                                                    color: 'var(--color-vc-error, #ef4444)',
                                                                    border: '1px solid var(--color-vc-hairline)',
                                                                    p: 0.2,
                                                                    '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' }
                                                                }}
                                                            >
                                                                <DeleteIcon sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Paper>
                                                    ))}
                                                    <Button 
                                                        variant="text" 
                                                        fullWidth
                                                        startIcon={<PlusIcon />} 
                                                        onClick={() => handleAddSlot(day)}
                                                        sx={{
                                                            borderRadius: '6px',
                                                            mt: 1,
                                                            py: 1,
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: 'var(--color-vc-mute)',
                                                            border: '1px dashed var(--color-vc-hairline-strong)',
                                                            '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)', borderColor: DAY_COLORS[day] }
                                                        }}
                                                    >
                                                        Add Slot
                                                    </Button>
                                                </>
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
};

export default TimetableAdmin;
