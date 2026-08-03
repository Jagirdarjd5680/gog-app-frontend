import { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, List, ListItem, ListItemAvatar, 
    Avatar, ListItemText, Chip, Button, Divider, CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
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
            <Paper sx={{ 
                p: 3, 
                borderRadius: '8px', 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                bgcolor: 'var(--color-vc-canvas)',
                border: '1px solid var(--color-vc-hairline)',
                boxShadow: 'none'
            }}>
                <CircularProgress size={20} sx={{ color: 'var(--color-vc-primary)' }} />
            </Paper>
        );
    }

    return (
        <Paper sx={{ 
            borderRadius: '8px', 
            height: '100%', 
            overflow: 'hidden', 
            bgcolor: 'var(--color-vc-canvas)',
            border: '1px solid var(--color-vc-hairline)',
            boxShadow: '0px 1px 1px rgba(0,0,0,0.02)',
        }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'var(--color-vc-canvas)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentTurnedInIcon sx={{ color: 'var(--color-vc-mute)', fontSize: 18 }} />
                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Recent Submissions</Typography>
                </Box>
                <Button 
                    size="small" 
                    variant="text" 
                    onClick={() => navigate('/assignments/all')}
                    sx={{ 
                        fontWeight: 500, 
                        color: 'var(--color-vc-link)', 
                        fontSize: '13px', 
                        fontFamily: 'inherit',
                        textTransform: 'none',
                        '&:hover': { color: 'var(--color-vc-link-deep)', bgcolor: 'var(--color-vc-canvas-soft)' }
                    }}
                >
                    View All
                </Button>
            </Box>
            <Divider sx={{ borderColor: 'var(--color-vc-hairline)' }} />
            <List sx={{ py: 0 }}>
                {submissions.map((sub, index) => {
                    const isGraded = sub.status === 'graded';
                    const chipColor = isGraded ? 'var(--color-vc-success)' : 'var(--color-vc-warning)';
                    return (
                        <Box key={sub._id}>
                            <ListItem 
                                sx={{ 
                                    py: 1.5, 
                                    px: 2.5,
                                    '&:hover': { bgcolor: 'var(--color-vc-canvas-soft)' },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleViewSubmission(sub)}
                            >
                                <ListItemAvatar>
                                    <Avatar 
                                        src={fixUrl(sub.studentImage)} 
                                        sx={{ width: 32, height: 32, border: '1px solid var(--color-vc-hairline)' }} 
                                    />
                                </ListItemAvatar>
                                <ListItemText 
                                    disableTypography
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography sx={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{sub.studentName}</Typography>
                                            <Chip 
                                                label={sub.status.toUpperCase()} 
                                                size="small" 
                                                sx={{ 
                                                    fontSize: 9, 
                                                    height: 18, 
                                                    fontWeight: 600,
                                                    bgcolor: `${chipColor}15`,
                                                    color: chipColor,
                                                    borderRadius: '4px',
                                                    border: `1px solid ${chipColor}20`,
                                                }}
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                                            <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-body)', fontFamily: 'inherit' }}>
                                                {sub.assignmentTitle}
                                            </Typography>
                                            <Typography sx={{ fontSize: '10px', color: 'var(--color-vc-mute)', fontFamily: 'inherit' }}>
                                                {formatDistanceToNow(new Date(sub.submittedAt))} ago
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < submissions.length - 1 && <Divider sx={{ mx: 2.5, borderColor: 'var(--color-vc-hairline)' }} />}
                        </Box>
                    );
                })}
                {submissions.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '14px', fontFamily: 'inherit' }}>No submissions yet.</Typography>
                    </Box>
                )}
            </List>
        </Paper>
    );
};

export default RecentSubmissionsWidget;
