import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, IconButton, Stack, Chip, Avatar, Button, Grid } from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import PercentIcon from '@mui/icons-material/Percent';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ExamResults = () => {
    const navigate = useNavigate();
    const { examId } = useParams();

    const [summary, setSummary] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchResults = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`/exam-results/exam/${id}`);
            const resData = response.data?.data || response.data || [];
            setResults(Array.isArray(resData) ? resData : []);
        } catch (error) {
            console.error('Failed to load exam results:', error);
            toast.error('Failed to load detailed exam results');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSummary = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/exam-results/summary');
            const data = response.data?.data || response.data || [];
            setSummary(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load summary:', error);
            toast.error('Failed to load exam results summary');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        if (!examId) {
            setSelectedExam(null);
            setResults([]);
            setSearchTerm('');
        } else if (summary.length > 0) {
            const found = summary.find(e => (e._id || e.id) === examId);
            if (found) {
                setSelectedExam(found);
                fetchResults(examId);
            }
        }
    }, [examId, summary, fetchResults]);

    const handleSelectExam = (exam) => {
        const id = exam._id || exam.id;
        navigate(`/exam-results/${id}`);
    };

    const handleBack = () => {
        navigate('/exam-results');
    };

    const filteredResults = useMemo(() => {
        if (!searchTerm.trim()) return results;
        const term = searchTerm.toLowerCase();
        return results.filter(r => {
            const name = (r.user?.name || r.student?.name || '').toLowerCase();
            const email = (r.user?.email || r.student?.email || '').toLowerCase();
            return name.includes(term) || email.includes(term);
        });
    }, [results, searchTerm]);

    const summaryMetrics = useMemo(() => {
        const totalSubmissions = summary.reduce((sum, e) => sum + (e.totalSubmissions || e.submissionsCount || 0), 0);
        const avgScore = summary.length
            ? Math.round(summary.reduce((sum, e) => sum + (e.avgScore || 0), 0) / summary.length)
            : 0;
        return [
            { title: 'Total Exams', value: summary.length, icon: <QuizIcon />, color: 'primary' },
            { title: 'Total Submissions', value: totalSubmissions, icon: <GroupsIcon />, color: 'info' },
            { title: 'Avg Score', value: `${avgScore}%`, icon: <PercentIcon />, color: 'success' }
        ];
    }, [summary]);

    const resultMetrics = useMemo(() => {
        const passed = results.filter(r => r.passed || (r.score >= (r.passingMarks || 40))).length;
        const avgScore = results.length
            ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length)
            : 0;
        return [
            { title: 'Total Submissions', value: results.length, icon: <GroupsIcon />, color: 'primary' },
            { title: 'Passed', value: passed, icon: <TaskAltIcon />, color: 'success' },
            { title: 'Failed', value: results.length - passed, icon: <QuizIcon />, color: 'error' },
            { title: 'Avg Score', value: avgScore, icon: <EmojiEventsIcon />, color: 'warning' }
        ];
    }, [results]);

    const resultColumns = useMemo(() => [
        {
            field: 'student',
            headerName: 'STUDENT NAME',
            flex: 1.5,
            minWidth: 220,
            cellRenderer: (params) => {
                const name = params.data.user?.name || params.data.student?.name || 'N/A';
                return (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                            {name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                {name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                {params.data.user?.email || params.data.student?.email || 'N/A'}
                            </Typography>
                        </Box>
                    </Stack>
                );
            }
        },
        {
            field: 'score',
            headerName: 'SCORE',
            width: 140,
            cellRenderer: (params) => (
                <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                    {params.data.score || 0} / {params.data.maxScore || 100}
                </Typography>
            )
        },
        {
            field: 'passed',
            headerName: 'RESULT',
            width: 130,
            cellRenderer: (params) => {
                const passed = params.data.passed || (params.data.score >= (params.data.passingMarks || 40));
                return (
                    <Chip
                        label={passed ? 'PASSED' : 'FAILED'}
                        color={passed ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'submitTime',
            headerName: 'SUBMITTED ON',
            width: 190,
            valueGetter: (params) => {
                const date = params.data.submitTime || params.data.createdAt;
                return date ? format(new Date(date), 'MMM dd, yyyy - hh:mm a') : 'N/A';
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 120,
            cellRenderer: (params) => (
                <IconButton
                    size="small"
                    onClick={() => navigate(`/exam-results/details/${params.data._id || params.data.id}`)}
                    sx={{ color: 'var(--color-vc-mute)' }}
                    title="View Answer Sheet"
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )
        }
    ], [navigate]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {selectedExam && (
                    <IconButton onClick={handleBack} sx={{ color: 'var(--color-vc-mute)' }} title="Back to Summary">
                        <ArrowBackIcon />
                    </IconButton>
                )}
                <Box>
                    <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                        {selectedExam ? selectedExam.title : 'Exam Performance & Analytics'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                        {selectedExam
                            ? 'Detailed student scores, evaluation records, and answer sheets'
                            : 'Overview of student submissions across all published exams'}
                    </Typography>
                </Box>
            </Box>

            <GenericMetrics items={selectedExam ? resultMetrics : summaryMetrics} />

            {!selectedExam ? (
                <Grid container spacing={2}>
                    {summary.map((exam) => {
                        const totalSubmissions = exam.totalSubmissions || exam.submissionsCount || 0;
                        const avgScore = exam.avgScore ? Math.round(exam.avgScore) : 0;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={exam._id || exam.id}>
                                <Card
                                    onClick={() => handleSelectExam(exam)}
                                    sx={{
                                        cursor: 'pointer',
                                        borderRadius: '10px',
                                        border: '1px solid var(--color-vc-hairline)',
                                        bgcolor: 'var(--color-vc-canvas)',
                                        boxShadow: 'none',
                                        transition: 'box-shadow 0.2s, border-color 0.2s',
                                        '&:hover': {
                                            boxShadow: '0px 4px 16px rgba(0,0,0,0.06)',
                                            borderColor: 'var(--color-vc-hairline-strong)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                                    <QuizIcon fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                                        {exam.title}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                                        Duration: {exam.duration || 60} mins
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Stack>

                                        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                                            <Chip
                                                icon={<GroupsIcon sx={{ fontSize: '15px !important' }} />}
                                                label={`${totalSubmissions} Submissions`}
                                                size="small"
                                                color="primary"
                                                sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '6px' }}
                                            />
                                        </Stack>

                                        <Stack direction="row" spacing={1.5} sx={{ pt: 1.5, borderTop: '1px solid var(--color-vc-hairline)' }}>
                                            <Box sx={{ flex: 1, bgcolor: 'var(--color-vc-canvas-soft)', p: 1.25, borderRadius: '8px' }}>
                                                <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>Average Score</Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <EmojiEventsIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                                    <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--color-vc-ink)' }}>{avgScore}%</Typography>
                                                </Stack>
                                            </Box>
                                            <Box sx={{ flex: 1, bgcolor: 'var(--color-vc-canvas-soft)', p: 1.25, borderRadius: '8px' }}>
                                                <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>Total Marks</Typography>
                                                <Typography variant="body2" fontWeight={800} sx={{ color: 'var(--color-vc-ink)' }}>{exam.totalMarks || 100} Pts</Typography>
                                            </Box>
                                        </Stack>

                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            sx={{ mt: 2, textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                                        >
                                            View Full Report
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            ) : (
                <>
                    <GenericTableHeader
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        searchPlaceholder="Search student name or email..."
                        totalCount={filteredResults.length}
                    />
                    <TableUI
                        rowData={filteredResults}
                        columnDefs={resultColumns}
                        loading={loading}
                    />
                </>
            )}
        </Box>
    );
};

export default ExamResults;
