import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { 
    Box, 
    Typography, 
    Paper, 
    Grid, 
    Avatar, 
    Chip, 
    Divider, 
    Card, 
    CardContent,
    useTheme,
    Container,
    Stack,
    CircularProgress,
    Tabs,
    Tab,
    Fade,
    Skeleton
} from '@mui/material';
import { 
    CalendarToday as CalendarIcon, 
    AccessTime as TimeIcon, 
    Person as TeacherIcon, 
    LocationOn as RoomIcon,
} from '@mui/icons-material';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimetableStudent = () => {
    const theme = useTheme();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);

    useEffect(() => {
        fetchMyTimetable();
    }, []);

    const fetchMyTimetable = async () => {
        setLoading(true);
        try {
            const res = await api.get('/timetables/my');
            setTimetable(res.data.data || []);
        } catch (error) {
            console.error('Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    const currentDaySlots = timetable
        .filter(slot => slot.day === DAYS[activeTab])
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', letterSpacing: '-0.5px' }}>
                        My Weekly Routine
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Real-time schedule for your enrolled batches
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ borderRadius: 1, mb: 3, bgcolor: 'white', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, v) => setActiveTab(v)} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ 
                            px: 1,
                            '& .MuiTabs-indicator': { height: 3, bgcolor: 'primary.main' },
                            '& .MuiTab-root': { fontWeight: 700, py: 2, fontSize: 13, textTransform: 'none' }
                        }}
                    >
                        {DAYS.map((day) => (
                            <Tab key={day} label={day} />
                        ))}
                    </Tabs>
                </Paper>

                <Stack spacing={2}>
                    {loading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 1, mb: 2 }} />)
                    ) : currentDaySlots.length > 0 ? (
                        currentDaySlots.map((slot, i) => (
                            <Fade in key={slot._id || i} timeout={300 + i * 100}>
                                <Card elevation={0} sx={{ 
                                    borderRadius: 1, 
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: '#fcfdff' }
                                }}>
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={3}>
                                                <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 1, textAlign: 'center' }}>
                                                    <TimeIcon sx={{ fontSize: 18, mb: 0.5, color: 'primary.main' }} />
                                                    <Typography variant="h6" fontWeight={800} sx={{ fontSize: 16 }}>{slot.startTime}</Typography>
                                                    <Typography variant="caption" fontWeight={700} color="text.secondary">{slot.endTime}</Typography>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} sm={9}>
                                                <Stack spacing={1}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Typography variant="h6" fontWeight={800} sx={{ color: '#1e293b' }}>
                                                            {slot.subject}
                                                        </Typography>
                                                        <Chip 
                                                            label={slot.course?.title || 'Main Course'} 
                                                            size="small" 
                                                            sx={{ fontWeight: 700, borderRadius: 0.5, fontSize: 10, bgcolor: '#eff6ff', color: '#1d4ed8' }} 
                                                        />
                                                    </Box>
                                                    
                                                    <Divider sx={{ my: 0.5, borderStyle: 'dotted' }} />
                                                    
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'white', color: 'primary.main', border: '1px solid #e2e8f0' }}>
                                                                    <TeacherIcon sx={{ fontSize: 16 }} />
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ display: 'block', lineHeight: 1 }}>INSTRUCTOR</Typography>
                                                                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12 }}>{slot.teacher?.name || 'Assigned Instructor'}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'white', color: 'success.main', border: '1px solid #e2e8f0' }}>
                                                                    <RoomIcon sx={{ fontSize: 16 }} />
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ display: 'block', lineHeight: 1 }}>LOCATION</Typography>
                                                                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: 12 }}>{slot.room || 'Live Session'}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Fade>
                        ))
                    ) : (
                        <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'white', borderRadius: 1, border: '1px dashed #e2e8f0' }}>
                            <CalendarIcon sx={{ fontSize: 48, mb: 1.5, color: '#94a3b8' }} />
                            <Typography variant="h6" fontWeight={700} color="text.secondary">No sessions scheduled for {DAYS[activeTab]}</Typography>
                            <Typography variant="body2" color="text.disabled">Your schedule is clear today!</Typography>
                        </Box>
                    )}
                </Stack>
            </Container>
        </Box>
    );
};

export default TimetableStudent;
