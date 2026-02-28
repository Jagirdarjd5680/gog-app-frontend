import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    CircularProgress,
    Tabs,
    Tab,
    Paper,
    useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LiveClassCard from '../../components/LiveClasses/LiveClassCard';
import LiveClassModal from '../../components/LiveClasses/LiveClassModal';

const LiveClassList = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const isAdmin = user?.role === 'admin' || user?.role === 'teacher';

    useEffect(() => {
        // Check if returning from Google Auth
        const urlParams = new URLSearchParams(window.location.search);
        const tokens = urlParams.get('tokens');
        if (tokens) {
            localStorage.setItem('googleMeetTokens', tokens);
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            toast.success('Google Meet connected successfully!');
            setModalOpen(true); // Re-open the modal so user can continue
        }
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/live-classes');
            if (response.data.success) {
                setClasses(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load live classes');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (liveClass) => {
        setEditingClass(liveClass);
        setModalOpen(true);
    };

    const handleAdd = () => {
        setEditingClass(null);
        setModalOpen(true);
    };

    const filteredClasses = classes.filter(c => {
        if (activeTab === 0) return true; // All
        if (activeTab === 1) return c.status === 'ongoing';
        if (activeTab === 2) return c.status === 'scheduled';
        if (activeTab === 3) return c.status === 'completed';
        return true;
    });

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header Section */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 4
            }}>
                <Box>
                    <Typography variant="h4" fontWeight={900} color="primary.main" gutterBottom>
                        Live Classes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Engage with your students in real-time sessions
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchClasses}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Refresh
                    </Button>
                    {isAdmin && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAdd}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                fontWeight: 700,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                            }}
                        >
                            Schedule Class
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Filter Tabs */}
            <Paper elevation={0} sx={{ borderRadius: 3, mb: 4, p: 0.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{
                        '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                        '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minWidth: 100 }
                    }}
                >
                    <Tab label="All Sessions" />
                    <Tab label="Ongoing" icon={<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', mr: 1 }} />} iconPosition="start" />
                    <Tab label="Upcoming" />
                    <Tab label="Past" />
                </Tabs>
            </Paper>

            {/* Content Section */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : filteredClasses.length === 0 ? (
                <Box sx={{
                    textAlign: 'center',
                    py: 12,
                    px: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
                    borderRadius: 6,
                    border: '2px dashed',
                    borderColor: 'divider'
                }}>
                    <VideoCallIcon sx={{ fontSize: 60, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" fontWeight={700} color="text.secondary">
                        No live classes found
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                        {activeTab === 0 ? "You haven't scheduled any sessions yet." : "No sessions match this filter."}
                    </Typography>
                    {isAdmin && activeTab === 0 && (
                        <Button variant="contained" onClick={handleAdd} sx={{ borderRadius: 2 }}>
                            Schedule First Class
                        </Button>
                    )}
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {filteredClasses.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                            <LiveClassCard
                                liveClass={item}
                                onEdit={handleEdit}
                                isAdmin={isAdmin}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}



            <LiveClassModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchClasses}
                initialData={editingClass}
            />
        </Box>
    );
};

export default LiveClassList;

