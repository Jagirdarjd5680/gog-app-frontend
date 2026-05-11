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
    IconButton,
    Tabs,
    Tab,
    Fade
} from '@mui/material';
import { 
    CalendarToday as CalendarIcon, 
    AccessTime as TimeIcon, 
    Person as TeacherIcon, 
    LocationOn as RoomIcon,
    MenuBook as SubjectIcon,
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon
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
        try {
            // Backend should handle filtering by user's batch in this route
            const res = await api.get('/timetables/my');
            setTimetable(res.data.data || []);
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const currentDaySlots = timetable.filter(slot => slot.day === DAYS[activeTab]);

    if (loading) return <Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Container maxWidth="md">
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={900} gutterBottom>My Daily Routine</Typography>
                    <Typography variant="body1" color="text.secondary">Stay organized with your batch schedule</Typography>
                </Box>

                <Paper elevation={0} sx={{ borderRadius: 6, mb: 4, bgcolor: 'white', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={(e, v) => setActiveTab(v)} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ 
                            px: 2,
                            '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0' },
                            '& .MuiTab-root': { fontWeight: 800, py: 3, fontSize: 13 }
                        }}
                    >
                        {DAYS.map((day, i) => (
                            <Tab key={day} label={day} />
                        ))}
                    </Tabs>
                </Paper>

                <Stack spacing={3}>
                    {currentDaySlots.length > 0 ? (
                        currentDaySlots.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((slot, i) => (
                            <Fade in key={i} timeout={300 + i * 100}>
                                <Card elevation={0} sx={{ 
                                    borderRadius: 5, 
                                    border: '1px solid', 
                                    borderColor: 'divider',
                                    transition: 'transform 0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={12} sm={3}>
                                                <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 4, textAlign: 'center' }}>
                                                    <TimeIcon sx={{ fontSize: 20, mb: 0.5 }} />
                                                    <Typography variant="h6" fontWeight={900} sx={{ fontSize: 16 }}>{slot.startTime}</Typography>
                                                    <Typography variant="caption" fontWeight={700}>{slot.endTime}</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={9}>
                                                <Stack spacing={1}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Typography variant="h5" fontWeight={900}>{slot.subject}</Typography>
                                                        <Chip label={slot.course?.title || 'General'} size="small" sx={{ fontWeight: 800, borderRadius: 1.5, bgcolor: '#f1f5f9' }} />
                                                    </Box>
                                                    
                                                    <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                                                    
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light', color: 'secondary.main' }}>
                                                                    <TeacherIcon sx={{ fontSize: 18 }} />
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="caption" color="text.disabled" fontWeight={800} sx={{ display: 'block' }}>INSTRUCTOR</Typography>
                                                                    <Typography variant="body2" fontWeight={700}>{slot.teacher?.name || 'TBA'}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.light', color: 'success.main' }}>
                                                                    <RoomIcon sx={{ fontSize: 18 }} />
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="caption" color="text.disabled" fontWeight={800} sx={{ display: 'block' }}>LOCATION</Typography>
                                                                    <Typography variant="body2" fontWeight={700}>{slot.room || 'Online'}</Typography>
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
                        <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                            <CalendarIcon sx={{ fontSize: 80, mb: 2 }} />
                            <Typography variant="h6" fontWeight={800}>No classes scheduled for {DAYS[activeTab]}</Typography>
                            <Typography variant="body2">Take this time to self-study or relax!</Typography>
                        </Box>
                    )}
                </Stack>
            </Container>
        </Box>
    );
};

export default TimetableStudent;
