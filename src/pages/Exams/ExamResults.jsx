import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Grid,
    Card,
    CardContent,
    Button,
    CardActionArea,
    Breadcrumbs,
    Link,
    Paper,
    Divider,
    Avatar
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

const ExamResults = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const { examId } = useParams();
    
    const [summary, setSummary] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const response = await api.get('/exam-results/summary');
            const data = response.data || [];
            setSummary(data);
            
            // If examId is in URL, set the selected exam from summary
            if (examId) {
                const found = data.find(e => e._id === examId);
                if (found) {
                    setSelectedExam(found);
                    fetchResults(examId);
                }
            }
        } catch (error) {
            toast.error('Failed to load summary');
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`/exam-results/exam/${id}`);
            setResults(response.data || []);
        } catch (error) {
            toast.error('Failed to load exam results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    // Watch for URL changes (back button support)
    useEffect(() => {
        if (!examId) {
            setSelectedExam(null);
            setResults([]);
        } else if (summary.length > 0) {
            const found = summary.find(e => e._id === examId);
            if (found) {
                setSelectedExam(found);
                fetchResults(examId);
            }
        }
    }, [examId, summary]);

    const handleSelectExam = (exam) => {
        navigate(`/exam-results/${exam._id}`);
    };

    const handleBack = () => {
        navigate('/exam-results');
    };

    const handleViewResult = (resultId) => {
        navigate(`/exam-results/details/${resultId}`);
    };

    const StatusRenderer = (params) => {
        const passed = params.data.passed;
        return (
            <Chip
                label={passed ? 'PASSED' : 'FAILED'}
                size="small"
                color={passed ? 'success' : 'error'}
                sx={{ fontWeight: 'bold', fontSize: '0.7rem', borderRadius: 0 }}
            />
        );
    };

    const ActionsRenderer = (params) => (
        <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
                <IconButton 
                    size="small" 
                    sx={{ bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 0 }}
                    onClick={() => handleViewResult(params.data._id)}
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Stack>
    );

    const columnDefs = [
        {
            headerName: 'STUDENT',
            field: 'user',
            flex: 1.2,
            minWidth: 150,
            valueGetter: (params) => params.data.user?.name || 'Unknown'
        },
        {
            headerName: 'ROLL NO',
            field: 'user.rollNumber',
            flex: 1,
            minWidth: 120,
            valueGetter: (params) => params.data.user?.rollNumber || 'N/A'
        },
        {
            headerName: 'SCORE',
            field: 'score',
            width: 120,
            valueGetter: (params) => `${params.data.score}/${params.data.maxScore}`
        },
        {
            headerName: 'PERCENTAGE',
            field: 'percentage',
            width: 120,
            valueGetter: (params) => `${params.data.percentage?.toFixed(1)}%`
        },
        {
            headerName: 'ATTEMPT',
            field: 'attemptNumber',
            width: 100,
        },
        {
            headerName: 'STATUS',
            cellRenderer: StatusRenderer,
            width: 120
        },
        {
            headerName: 'DATE',
            field: 'submitTime',
            width: 160,
            valueGetter: (params) => params.data.submitTime ? format(new Date(params.data.submitTime), 'MMM dd, yyyy HH:mm') : 'N/A'
        },
        {
            headerName: 'ACTION',
            cellRenderer: ActionsRenderer,
            width: 100,
            pinned: 'right'
        },
    ];

    if (!selectedExam) {
        return (
            <Box sx={{ p: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={900} sx={{
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                    }}>
                        Exam Results
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Select an exam to view detailed student outcomes and performance metrics.
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {summary.length > 0 ? summary.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                            <Card sx={{
                                borderRadius: 0,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(33, 150, 243, 0.1)',
                                    borderColor: 'primary.light'
                                }
                            }}>
                                <CardActionArea onClick={() => handleSelectExam(item)}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                            <Avatar sx={{ 
                                                bgcolor: 'rgba(33, 150, 243, 0.1)', 
                                                color: 'primary.main',
                                                width: 50,
                                                height: 50,
                                                borderRadius: 0
                                            }}>
                                                <AssignmentIcon />
                                            </Avatar>
                                            <Chip 
                                                label={`${item.count} Attempts`} 
                                                size="small" 
                                                sx={{ 
                                                    fontWeight: 800, 
                                                    fontSize: '0.7rem', 
                                                    bgcolor: 'primary.main', 
                                                    color: 'white',
                                                    borderRadius: 0
                                                }} 
                                            />
                                        </Stack>

                                        <Typography variant="h6" fontWeight={800} gutterBottom sx={{ 
                                            lineHeight: 1.2,
                                            height: '2.4em',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                            {item.name}
                                        </Typography>

                                        <Divider sx={{ my: 1.5, opacity: 0.5 }} />

                                        <Stack direction="row" spacing={2} justifyContent="space-between">
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Success Rate</Typography>
                                                <Typography variant="subtitle2" fontWeight={800}>
                                                    {((item.passCount / item.count) * 100).toFixed(1)}%
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="caption" color="text.secondary" display="block">Avg Score</Typography>
                                                <Typography variant="subtitle2" fontWeight={800}>
                                                    {item.avgPercentage.toFixed(1)}%
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </CardActionArea>
                                <Box sx={{ p: 2, pt: 0 }}>
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        color="primary"
                                        endIcon={<VisibilityIcon />}
                                        onClick={() => handleSelectExam(item)}
                                        sx={{ borderRadius: 0, fontWeight: 700, textTransform: 'none' }}
                                    >
                                        See Results
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    )) : !loading && (
                        <Grid item xs={12}>
                            <Box sx={{ py: 10, textAlign: 'center' }}>
                                <GroupsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="h5" color="text.secondary">No exam results found yet.</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Box>
        );
    }

    // Results View
    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Breadcrumbs sx={{ mb: 1.5 }}>
                    <Link underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleBack}>
                        <ArrowBackIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        All Exams
                    </Link>
                    <Typography color="text.primary">{selectedExam.name}</Typography>
                </Breadcrumbs>

                <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                    <Box>
                        <Typography variant="h4" fontWeight={900}>{selectedExam.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Detailed score reports for and student performance metrics
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Paper variant="outlined" sx={{ px: 2, py: 1, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupsIcon color="primary" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Total Students</Typography>
                                <Typography variant="subtitle2" fontWeight={800}>{selectedExam.count}</Typography>
                            </Box>
                        </Paper>
                        <Paper variant="outlined" sx={{ px: 2, py: 1, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmojiEventsIcon color="success" />
                            <Box>
                                <Typography variant="caption" color="text.secondary" display="block">Pass Rate</Typography>
                                <Typography variant="subtitle2" fontWeight={800}>{((selectedExam.passCount / selectedExam.count) * 100).toFixed(1)}%</Typography>
                            </Box>
                        </Paper>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ bgcolor: 'background.paper', borderRadius: 0, border: '1px solid', borderColor: 'divider' }}>
                <DataTable
                    rowData={results}
                    columnDefs={columnDefs}
                    loading={loading}
                    pagination={true}
                    paginationPageSize={10}
                    borderRadius={0}
                    height="auto"
                />
            </Box>
        </Box>
    );
};

export default ExamResults;
