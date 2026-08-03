import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Stack, Chip, Avatar, Button } from '@mui/material';
import GenericMetrics from '../../components/Common/GenericMetrics';
import { TableSkeleton } from '../../components/Common/SkeletonLoaders';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PercentIcon from '@mui/icons-material/Percent';
import QuizIcon from '@mui/icons-material/Quiz';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { downloadIconSummaryReport } from '../../utils/reportGenerator';

const IndividualResult = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/exam-results/details/${resultId}`);
                const data = response.data?.data || response.data || null;
                setResult(data);
            } catch (error) {
                console.error('Failed to load result details:', error);
                toast.error('Failed to load result details');
                navigate('/exam-results');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [resultId, navigate]);

    const handleDownloadSummary = async () => {
        setDownloading(true);
        try {
            await downloadIconSummaryReport(result);
            toast.success('Summary PDF downloaded');
        } catch (error) {
            toast.error('PDF Generation failed');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
                <TableSkeleton rows={6} columns={4} />
            </Box>
        );
    }

    if (!result) return null;

    const studentName = result.user?.name || result.student?.name || 'Student';
    const studentEmail = result.user?.email || result.student?.email || 'N/A';
    const examTitle = result.exam?.title || 'Exam Scorecard';
    const passed = result.passed || (result.score >= (result.exam?.passingMarks || 40));
    const percentage = result.maxScore ? Math.round((result.score / result.maxScore) * 100) : 0;
    const submittedOn = result.submitTime || result.createdAt;
    const answers = Array.isArray(result.answers) ? result.answers : [];
    const correctCount = answers.filter(a => a.isCorrect || a.score > 0).length;

    const metrics = [
        { title: 'Result', value: passed ? 'Passed' : 'Failed', icon: <TaskAltIcon />, color: passed ? 'success' : 'error' },
        { title: 'Total Score', value: `${result.score} / ${result.maxScore || 100}`, icon: <EmojiEventsIcon />, color: 'warning' },
        { title: 'Percentage', value: `${percentage}%`, icon: <PercentIcon />, color: 'primary' },
        { title: 'Correct Answers', value: `${correctCount} / ${answers.length}`, icon: <QuizIcon />, color: 'info' }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <IconButton onClick={() => navigate('/exam-results')} sx={{ color: 'var(--color-vc-mute)' }} title="Back to Results">
                        <ArrowBackIcon />
                    </IconButton>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', fontSize: 16, fontWeight: 700 }}>
                        {studentName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                            {examTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                            {studentName} &bull; {studentEmail}
                        </Typography>
                    </Box>
                </Stack>

                <Button
                    variant="outlined"
                    onClick={handleDownloadSummary}
                    disabled={downloading}
                    startIcon={<DownloadIcon fontSize="small" />}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', borderColor: 'var(--color-vc-hairline)', color: 'var(--color-vc-ink)' }}
                >
                    {downloading ? 'Downloading...' : 'Download PDF Scorecard'}
                </Button>
            </Box>

            <GenericMetrics items={metrics} />

            <Box
                sx={{
                    bgcolor: 'var(--color-vc-canvas)',
                    border: '1px solid var(--color-vc-hairline)',
                    borderRadius: '10px',
                    p: { xs: 2, md: 3 }
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                        Question-by-Question Breakdown
                    </Typography>
                    {submittedOn && (
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            Submitted: {format(new Date(submittedOn), 'MMM dd, yyyy - hh:mm a')}
                        </Typography>
                    )}
                </Stack>

                {answers.length === 0 ? (
                    <Typography sx={{ color: 'var(--color-vc-mute)', fontSize: '14px', textAlign: 'center', py: 6 }}>
                        No answer records available for this attempt.
                    </Typography>
                ) : (
                <Stack spacing={1.5}>
                    {answers.map((ans, idx) => {
                        const isCorrect = ans.isCorrect || ans.score > 0;
                        return (
                            <Box
                                key={idx}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: 2,
                                    p: 2,
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-vc-hairline)',
                                    bgcolor: 'var(--color-vc-canvas-soft)'
                                }}
                            >
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                                        Q{idx + 1}. {ans.questionText || `Question #${idx + 1}`}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                                        Selected: <Box component="span" sx={{ fontWeight: 600, color: 'var(--color-vc-ink)' }}>{ans.answer || ans.selectedAnswer || 'Not Answered'}</Box>
                                    </Typography>
                                </Box>

                                <Chip
                                    icon={isCorrect ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                                    label={isCorrect ? 'Correct' : 'Incorrect'}
                                    color={isCorrect ? 'success' : 'error'}
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '6px', flexShrink: 0 }}
                                />
                            </Box>
                        );
                    })}
                </Stack>
                )}
            </Box>
        </Box>
    );
};

export default IndividualResult;
