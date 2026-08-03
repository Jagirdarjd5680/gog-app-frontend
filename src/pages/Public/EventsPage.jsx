import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, CardMedia, 
    TextField, InputAdornment, Chip, Container, Stack,
    Skeleton, Button, IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress
} from '@mui/material';
import { 
    Search as SearchIcon, 
    CalendarToday as CalendarIcon, 
    LocationOn as LocationIcon,
    FilterList as FilterIcon,
    Group as GroupIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import api, { fixUrl } from '../../utils/api';
import { format } from 'date-fns';

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Enrolled Modal States
    const [enrolledModalOpen, setEnrolledModalOpen] = useState(false);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [enrolledLoading, setEnrolledLoading] = useState(false);
    const [selectedEventTitle, setSelectedEventTitle] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const eventsRes = await api.get('/events'); 
            if (eventsRes.data.success) {
                setEvents(eventsRes.data.data);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    const handleViewEnrolled = async (event) => {
        setSelectedEventTitle(event.title);
        setEnrolledModalOpen(true);
        setEnrolledLoading(true);
        setEnrolledStudents([]);
        try {
            const res = await api.get(`/events/${event._id}/enrolled`);
            if (res.data.success) {
                setEnrolledStudents(res.data.data.map(b => b.student).filter(Boolean));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setEnrolledLoading(false);
        }
    };

    const getStatus = (start, end) => {
        const now = new Date();
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (now >= startDate && now <= endDate) return { label: 'LIVE', color: 'error' };
        if (now < startDate) return { label: 'Upcoming', color: 'primary' };
        return { label: 'Completed', color: 'success' };
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterStatus === 'All') return matchesSearch;
        const status = getStatus(event.startDate, event.endDate).label;
        return matchesSearch && status === filterStatus;
    }).sort((a, b) => {
        // Sort: Live first, then Upcoming, then Completed
        const order = { 'LIVE': 0, 'Upcoming': 1, 'Completed': 2 };
        const statusA = getStatus(a.startDate, a.endDate).label;
        const statusB = getStatus(b.startDate, b.endDate).label;
        return order[statusA] - order[statusB];
    });

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Our Events
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Join our masterclasses, workshops, and community meetups
                </Typography>
            </Box>

            <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="Search events..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ flexGrow: 1, minWidth: '300px' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 3, bgcolor: 'white' }
                    }}
                />
                <Stack direction="row" spacing={1}>
                    {['All', 'LIVE', 'Upcoming', 'Completed'].map((status) => (
                        <Chip
                            key={status}
                            label={status}
                            onClick={() => setFilterStatus(status)}
                            color={filterStatus === status ? 'primary' : 'default'}
                            variant={filterStatus === status ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 600 }}
                        />
                    ))}
                </Stack>
            </Box>

            <Grid container spacing={4}>
                {loading ? (
                    [1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
                            <Skeleton variant="text" sx={{ mt: 1 }} />
                            <Skeleton variant="text" width="60%" />
                        </Grid>
                    ))
                ) : filteredEvents.length === 0 ? (
                    <Box sx={{ width: '100%', py: 10, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">No events found matching your criteria.</Typography>
                    </Box>
                ) : (
                    filteredEvents.map((event) => {
                        const status = getStatus(event.startDate, event.endDate);
                        const imageUrl = event.images?.[0] || 'https://via.placeholder.com/400x200?text=No+Image';
                        
                        return (
                            <Grid item xs={12} sm={6} md={4} key={event._id}>
                                <Card sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    borderRadius: 4,
                                    transition: 'transform 0.3s ease',
                                    '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 }
                                }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={fixUrl(imageUrl)}
                                            alt={event.title}
                                        />
                                        <Chip
                                            label={status.label}
                                            color={status.color}
                                            size="small"
                                            sx={{ 
                                                position: 'absolute', 
                                                top: 16, 
                                                right: 16, 
                                                fontWeight: 800,
                                                boxShadow: 2
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                                            {event.title}
                                        </Typography>
                                        <Stack spacing={1} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {format(new Date(event.startDate), 'dd MMM yyyy')}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationIcon sx={{ fontSize: 18, color: 'error.main' }} />
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {event.location || 'Online'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        
                                        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                                            <Button 
                                                variant="outlined" 
                                                fullWidth 
                                                sx={{ borderRadius: 2, fontWeight: 700 }}
                                                onClick={() => window.location.href = `/events/${event._id}`}
                                            >
                                                View Details
                                            </Button>
                                            <Tooltip title="View Enrolled Students">
                                                <IconButton 
                                                    color="primary" 
                                                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                                                    onClick={() => handleViewEnrolled(event)}
                                                >
                                                    <GroupIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>

            {/* Enrolled Students Modal */}
            <Dialog 
                open={enrolledModalOpen} 
                onClose={() => setEnrolledModalOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                        Enrolled Students
                    </Typography>
                    <IconButton onClick={() => setEnrolledModalOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {selectedEventTitle}
                    </Typography>
                    
                    {enrolledLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : enrolledStudents.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography color="text.secondary">No students enrolled yet.</Typography>
                        </Box>
                    ) : (
                        <List>
                            {enrolledStudents.map((student, idx) => (
                                <ListItem key={idx} divider={idx < enrolledStudents.length - 1}>
                                    <ListItemAvatar>
                                        <Avatar src={fixUrl(student.profileImage)}>
                                            {student.name?.charAt(0) || 'U'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                        primary={student.name || 'Unknown User'} 
                                        secondary={student.email}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default EventsPage;

