import { useState, useEffect } from 'react';
import { 
    Box, Typography, Card, Avatar, Chip, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Tooltip, Button, Stack, CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import api, { fixUrl } from '../../utils/api';

const AllSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/assignments/all-submissions?limit=100');
            if (res.data.success) {
                setSubmissions(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNavigateToStudent = (studentId, batches) => {
        if (batches && batches.length > 0) {
            // batches may be ObjectIds or name strings — both work with the new backend
            const batchId = (batches[0]?._id || batches[0] || '').toString();
            if (!batchId) {
                alert('No batch found for this student');
                return;
            }
            navigate(`/assignments/submissions?batchId=${encodeURIComponent(batchId)}&studentId=${studentId}`);
        } else {
            alert('This student is not assigned to any batch. Please assign them to a batch first.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                        All Submissions
                    </Typography>
                    <Typography color="text.secondary">
                        Monitor recent assignment submissions across all batches
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    onClick={fetchSubmissions}
                    sx={{ borderRadius: 2 }}
                >
                    Refresh List
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Assignment</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {submissions.map((sub) => (
                            <TableRow key={sub._id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar 
                                            src={fixUrl(sub.studentImage)} 
                                            sx={{ width: 32, height: 32 }}
                                        />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{sub.studentName}</Typography>
                                            <Typography variant="caption" color="text.secondary">{sub.studentEmail}</Typography>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{sub.assignmentTitle}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">
                                        {format(new Date(sub.submittedAt), 'PPp')}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={sub.status.toUpperCase()} 
                                        size="small"
                                        color={sub.status === 'graded' ? 'success' : 'warning'}
                                        sx={{ fontWeight: 800, fontSize: 10, height: 20 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {sub.status === 'graded' ? (
                                        <Typography variant="subtitle2" fontWeight={800} color="success.main">
                                            {sub.grade} / 100
                                        </Typography>
                                    ) : '-'}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View Student Submissions">
                                        <IconButton 
                                            size="small" 
                                            color="primary"
                                            onClick={() => handleNavigateToStudent(sub.studentId, sub.studentBatches)}
                                        >
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Grade Now">
                                        <IconButton 
                                            size="small" 
                                            color="secondary"
                                            onClick={() => handleNavigateToStudent(sub.studentId, sub.studentBatches)}
                                        >
                                            <StarIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {submissions.length === 0 && (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <Typography color="text.secondary">No submissions found.</Typography>
                    </Box>
                )}
            </TableContainer>
        </Box>
    );
};

export default AllSubmissions;
