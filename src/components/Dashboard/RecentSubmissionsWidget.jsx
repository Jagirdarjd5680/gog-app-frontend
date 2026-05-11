import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, List, ListItem, ListItemAvatar, 
    Avatar, ListItemText, Chip, Button, Divider, CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api, { fixUrl } from '../../utils/api';
import { formatDistanceToNow } from 'date-fns';

const RecentSubmissionsWidget = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/assignments/all-submissions?limit=10');
            if (res.data.success) {
                setSubmissions(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch recent submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSubmission = (sub) => {
        const batchId = sub.studentBatches?.[0]?._id || sub.studentBatches?.[0];
        if (batchId) {
            navigate(`/assignments/submissions?batchId=${batchId}&studentId=${sub.studentId}`);
        }
    };

    if (loading) {
        return (
            <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={24} />
            </Paper>
        );
    }

    return (
        <Paper sx={{ borderRadius: 4, height: '100%', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8f9fa' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AssignmentTurnedInIcon color="primary" />
                    <Typography variant="h6" fontWeight={800}>Recent Submissions</Typography>
                </Box>
                <Button 
                    size="small" 
                    variant="text" 
                    onClick={() => navigate('/assignments/all')}
                    sx={{ fontWeight: 700 }}
                >
                    View All
                </Button>
            </Box>
            <Divider />
            <List sx={{ py: 0 }}>
                {submissions.map((sub, index) => (
                    <Box key={sub._id}>
                        <ListItem 
                            sx={{ 
                                py: 2, 
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                                cursor: 'pointer'
                            }}
                            onClick={() => handleViewSubmission(sub)}
                        >
                            <ListItemAvatar>
                                <Avatar 
                                    src={fixUrl(sub.studentImage)} 
                                    sx={{ width: 44, height: 44, border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
                                />
                            </ListItemAvatar>
                            <ListItemText 
                                disableTypography
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle2" fontWeight={700} component="span">{sub.studentName}</Typography>
                                        <Chip 
                                            label={sub.status.toUpperCase()} 
                                            size="small" 
                                            color={sub.status === 'graded' ? 'success' : 'warning'}
                                            sx={{ fontSize: 9, height: 18, fontWeight: 900 }}
                                        />
                                    </Box>
                                }
                                secondary={
                                    <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                                            {sub.assignmentTitle}
                                        </Typography>
                                        <Typography variant="caption" component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
                                            {formatDistanceToNow(new Date(sub.submittedAt))} ago
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                        {index < submissions.length - 1 && <Divider sx={{ mx: 2 }} />}
                    </Box>
                ))}
                {submissions.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No submissions yet.</Typography>
                    </Box>
                )}
            </List>
        </Paper>
    );
};

export default RecentSubmissionsWidget;
