import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Avatar, 
    Button, 
    IconButton, 
    TextField, 
    Chip, 
    Divider, 
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
    Tooltip,
    Fade,
    Stack
} from '@mui/material';
import { 
    Save as SaveIcon, 
    Add as PlusIcon, 
    Delete as DeleteIcon, 
    AccessTime as TimeIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_COLORS = {
    'Monday': '#e57373',
    'Tuesday': '#64b5f6',
    'Wednesday': '#ffb74d',
    'Thursday': '#4db6ac',
    'Friday': '#90a4ae',
    'Saturday': '#f06292',
    'Sunday': '#9575cd'
};

const TimetableAdmin = () => {
    const theme = useTheme();
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [timetable, setTimetable] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedBatch) fetchTimetable();
    }, [selectedBatch]);

    const fetchInitialData = async () => {
        try {
            const [batchRes, teacherRes, courseRes] = await Promise.all([
                api.get('/batches'),
                api.get('/users?role=teacher'),
                api.get('/courses')
            ]);
            setBatches(batchRes.data.data || []);
            setTeachers(teacherRes.data.data || []);
            setCourses(courseRes.data.data || []);
            
            if (batchRes.data.data?.length > 0) {
                setSelectedBatch(batchRes.data.data[0]._id);
            }
        } catch (error) {
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const fetchTimetable = async () => {
        try {
            const res = await api.get(`/timetables?batch=${selectedBatch}`);
            setTimetable(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load timetable');
        }
    };

    const handleAddSlot = (day) => {
        const currentBatch = batches.find(b => b._id === selectedBatch);
        const courseId = currentBatch?.course?._id || currentBatch?.course || (courses[0]?._id || '');

        const newSlot = {
            day,
            startTime: '09:00',
            endTime: '10:00',
            subject: '',
            teacher: teachers[0]?._id || '',
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
        setIsSaving(true);
        try {
            const currentBatch = batches.find(b => b._id === selectedBatch);
            const batchCourseId = currentBatch?.course?._id || currentBatch?.course;

            const validTimetable = timetable
                .filter(slot => slot.subject && slot.day)
                .map(slot => ({
                    batch: selectedBatch,
                    day: slot.day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    subject: slot.subject,
                    teacher: slot.teacher ? (typeof slot.teacher === 'object' ? slot.teacher._id : slot.teacher) : null,
                    course: batchCourseId || (slot.course ? (typeof slot.course === 'object' ? slot.course._id : slot.course) : null)
                }));

            
            await api.post('/timetables/bulk', {
                batch: selectedBatch,
                timetable: validTimetable
            });
            
            toast.success('✨ Timetable synchronized successfully!', {
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });

            // Send notification about the update
            try {
                await api.post('/notifications', {
                    title: '📅 Timetable Updated',
                    message: `The weekly schedule for your batch has been updated. Please check "My Routine" for details.`,
                    type: 'info',
                    recipientRole: 'specific',
                    batch: selectedBatch,
                    sendPush: true
                });
                
            } catch (notifErr) {
                
            }

            fetchTimetable();
        } catch (error) {
            
            toast.error('❌ Failed to update timetable. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, bgcolor: '#f1f5f9', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#1e293b' }}>School Time Table</Typography>
                    <Typography variant="body2" color="text.secondary">Manage and organize weekly schedules with a grid view</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel>Select Batch</InputLabel>
                        <Select 
                            value={selectedBatch} 
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            label="Select Batch"
                            sx={{ bgcolor: 'white', borderRadius: 2 }}
                        >
                            {batches.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <Button 
                        variant="contained" 
                        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{ borderRadius: 2, px: 4, fontWeight: 800 }}
                    >
                        Save Changes
                    </Button>
                </Stack>
            </Box>

            {/* Grid View Container */}
            <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 1000, borderCollapse: 'separate' }}>
                        <TableHead>
                            <TableRow>
                                {DAYS.slice(0, 6).map(day => (
                                    <TableCell key={day} align="center" sx={{ p: 0, borderBottom: 'none' }}>
                                        <Box sx={{ 
                                            bgcolor: DAY_COLORS[day], 
                                            color: 'white', 
                                            py: 1.5, 
                                            mx: 0.5,
                                            mt: 1,
                                            clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)',
                                            fontWeight: 900,
                                            fontSize: 14,
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}>
                                            {day.toUpperCase().substring(0, 3)}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow sx={{ bgcolor: '#f8fafc', position: 'relative' }}>
                                {DAYS.slice(0, 6).map(day => {
                                    const slots = timetable.filter(s => s.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
                                    return (
                                        <TableCell key={day} align="center" sx={{ borderRight: '1px solid #f1f5f9', verticalAlign: 'top', minHeight: 400, p: 1.5 }}>
                                            {slots.map(slot => (
                                                <Paper key={slot._id || slot.id} elevation={0} sx={{ mb: 2, p: 1.5, position: 'relative', bgcolor: 'white', borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                        <TextField 
                                                            size="small" 
                                                            variant="outlined"
                                                            value={slot.startTime}
                                                            onChange={(e) => handleUpdateSlot(slot._id || slot.id, 'startTime', e.target.value)}
                                                            placeholder="09:00"
                                                            sx={{ 
                                                                flex: 1,
                                                                '& .MuiInputBase-input': { fontSize: 12, fontWeight: 800, color: '#000', p: 0.5, textAlign: 'center' }
                                                            }}
                                                        />
                                                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>-</Typography>
                                                        <TextField 
                                                            size="small" 
                                                            variant="outlined"
                                                            value={slot.endTime}
                                                            onChange={(e) => handleUpdateSlot(slot._id || slot.id, 'endTime', e.target.value)}
                                                            placeholder="10:00"
                                                            sx={{ 
                                                                flex: 1,
                                                                '& .MuiInputBase-input': { fontSize: 12, fontWeight: 800, color: '#000', p: 0.5, textAlign: 'center' }
                                                            }}
                                                        />
                                                    </Box>
                                                    <TextField 
                                                        fullWidth 
                                                        size="small" 
                                                        placeholder="Subject..."
                                                        value={slot.subject}
                                                        onChange={(e) => handleUpdateSlot(slot._id || slot.id, 'subject', e.target.value)}
                                                        sx={{ 
                                                            mb: 1,
                                                            '& .MuiInputBase-input': { fontSize: 13, fontWeight: 800, color: '#000', textAlign: 'center', '&::placeholder': { opacity: 0.6, color: '#000' } },
                                                            '& fieldset': { border: 'none' }
                                                        }}
                                                    />
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleDeleteSlot(slot._id || slot.id)}
                                                        sx={{ position: 'absolute', right: -6, top: -6, bgcolor: 'white', color: 'error.light', p: 0.2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                    <FormControl fullWidth size="small">
                                                        <Select
                                                            value={slot.teacher ? (typeof slot.teacher === 'object' ? slot.teacher._id : slot.teacher) : ''}
                                                            onChange={(e) => handleUpdateSlot(slot._id || slot.id, 'teacher', e.target.value)}
                                                            displayEmpty
                                                            sx={{ 
                                                                fontSize: 12, fontWeight: 700, color: '#000',
                                                                height: 32, borderRadius: 2, bgcolor: '#f8fafc',
                                                                '& fieldset': { border: 'none' }
                                                            }}
                                                        >
                                                            <MenuItem value="" sx={{ color: 'text.secondary' }}>Select Teacher</MenuItem>
                                                            {teachers.map(t => <MenuItem key={t._id} value={t._id} sx={{ fontSize: 12, color: '#000' }}>{t.name}</MenuItem>)}
                                                        </Select>
                                                    </FormControl>
                                                </Paper>
                                            ))}
                                            <Button 
                                                variant="outlined" 
                                                fullWidth
                                                startIcon={<PlusIcon />} 
                                                onClick={() => handleAddSlot(day)}
                                                sx={{ borderRadius: 2, mt: 1, py: 1, borderStyle: 'dashed', color: 'text.secondary', borderColor: 'divider' }}
                                            >
                                                Add Slot
                                            </Button>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default TimetableAdmin;
