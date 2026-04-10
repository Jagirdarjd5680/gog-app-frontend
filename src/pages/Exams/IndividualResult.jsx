import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Avatar,
    Stack,
    Divider,
    IconButton,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    FormControlLabel,
    Radio,
    RadioGroup,
    Checkbox,
    FormGroup,
    CircularProgress,
    Backdrop
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';
import { downloadIconSummaryReport, downloadDetailedReport } from '../../utils/reportGenerator';

const IndividualResult = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await api.get(`/exam-results/details/${resultId}`);
                setResult(response.data);
            } catch (error) {
                toast.error('Failed to load result details');
                navigate('/exam-results');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [resultId, navigate]);

    const handleQuestionClick = (answerIndex) => {
        const answer = result.answers[answerIndex];
        setSelectedQuestion({
            ...answer,
            qIndex: answerIndex + 1
        });
        setOpenModal(true);
    };

    const handleNext = () => {
        if (!selectedQuestion) return;
        const nextIdx = selectedQuestion.qIndex; // qIndex is 1-based, so next index is the same
        if (nextIdx < result.answers.length) {
            handleQuestionClick(nextIdx);
        }
    };

    const handlePrev = () => {
        if (!selectedQuestion) return;
        const prevIdx = selectedQuestion.qIndex - 2; // qIndex is 1-based, so prev index is qIndex - 2
        if (prevIdx >= 0) {
            handleQuestionClick(prevIdx);
        }
    };

    const handleDownloadSummary = async () => {
        setDownloading(true);
        try {
            await downloadIconSummaryReport(result);
        } catch (error) {
            toast.error('PDF Generation failed');
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadDetailed = async () => {
        setDownloading(true);
        try {
            await downloadDetailedReport(result);
        } catch (error) {
            toast.error('PDF Generation failed');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <Box sx={{ p: 4 }}><Typography>Loading...</Typography></Box>;
    if (!result) return null;

    const { user, exam, answers } = result;

    return (
        <Box sx={{ p: 4 }}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2000 }}
                open={downloading}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress color="inherit" />
                    <Typography variant="h6" fontWeight={700}>Generating Your PDF Report...</Typography>
                </Stack>
            </Backdrop>

            <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 3, borderRadius: 1 }}
            >
                Back to Results
            </Button>

            <Grid container spacing={4}>
                {/* ── Sidebar (User Stats) ────────────────────────────────────── */}
                <Grid item xs={12} md={3.5}>
                    <Card sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Avatar
                                    src={user.avatar}
                                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2, borderRadius: 1, border: '4px solid', borderColor: 'primary.main' }}
                                >
                                    {user.name.charAt(0)}
                                </Avatar>
                                <Typography variant="h5" fontWeight={900}>{user.name}</Typography>
                                <Typography color="text.secondary" gutterBottom>{user.email}</Typography>
                                <Chip label={`Roll No: ${user.rollNumber || 'N/A'}`} size="small" sx={{ borderRadius: 1, mt: 1 }} />
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Exam</Typography>
                                    <Typography variant="body1" fontWeight={800}>{exam.title}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Score Dashboard</Typography>
                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                                        <Typography variant="h3" color="primary" fontWeight={900}>{result.score}</Typography>
                                        <Typography variant="h6" color="text.secondary" sx={{ opacity: 0.6 }}>/ {result.maxScore}</Typography>
                                    </Stack>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Percentage</Typography>
                                    <Typography variant="h6" fontWeight={800}>{result.percentage.toFixed(2)}%</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Result Status</Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            label={result.passed ? 'PASSED' : 'FAILED'}
                                            color={result.passed ? 'success' : 'error'}
                                            sx={{ borderRadius: 1, fontWeight: 900, px: 2 }}
                                        />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>Submitted At</Typography>
                                    <Typography variant="body2">{format(new Date(result.submitTime), 'PPP p')}</Typography>
                                </Box>
                            </Stack>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', mb: 2, display: 'block' }}>Export Reports</Typography>
                            <Stack spacing={1.5}>
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    color="info" 
                                    onClick={handleDownloadSummary}
                                    startIcon={<DownloadIcon />}
                                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 800, justifyContent: 'flex-start' }}
                                >
                                    Download Icon Summary
                                </Button>
                                <Button 
                                    fullWidth 
                                    variant="outlined" 
                                    color="primary" 
                                    onClick={handleDownloadDetailed}
                                    startIcon={<DownloadIcon />}
                                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 800, justifyContent: 'flex-start' }}
                                >
                                    Download Detailed Report
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── Main Content (Question Grid) ─────────────────────────────── */}
                <Grid item xs={12} md={8.5}>
                    <Card sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <AssignmentIcon color="primary" />
                                <Typography variant="h6" fontWeight={900}>Question Summary</Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                                Click on any question number to view detailed feedback for that attempt.
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {answers.map((ans, idx) => (
                                    <Box
                                        key={idx}
                                        onClick={() => handleQuestionClick(idx)}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            bgcolor: ans.isCorrect ? 'success.main' : 'error.main',
                                            color: '#fff',
                                            fontWeight: 900,
                                            fontSize: '1.2rem',
                                            borderRadius: 1,
                                            border: '2px solid transparent',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                transform: 'scale(1.1)',
                                                boxShadow: isDark ? '0 0 15px rgba(255,255,255,0.2)' : '0 4px 12px rgba(0,0,0,0.2)',
                                                borderColor: isDark ? '#fff' : '#000'
                                            }
                                        }}
                                    >
                                        {idx + 1}
                                    </Box>
                                ))}
                            </Box>

                            <Stack direction="row" spacing={3} sx={{ mt: 6 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 0.5 }} />
                                    <Typography variant="caption" fontWeight={700}>Correct</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: 0.5 }} />
                                    <Typography variant="caption" fontWeight={700}>Incorrect / Partially Correct</Typography>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Question Detail Modal ────────────────────────────────────── */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 1 } }}
            >
                {selectedQuestion && (
                    <>
                        <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" fontWeight={900}>
                                    Question {selectedQuestion.qIndex}
                                </Typography>
                                <Chip
                                    label={`${selectedQuestion.marksObtained || 0} / ${selectedQuestion.question?.marks || 0} Marks`}
                                    color={selectedQuestion.isCorrect ? 'success' : 'error'}
                                    variant="outlined"
                                    sx={{ borderRadius: 1, fontWeight: 800 }}
                                />
                            </Stack>
                        </DialogTitle>
                        <DialogContent sx={{ p: 4 }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                                    {selectedQuestion.question?.content || selectedQuestion.question?.text || 'Question has been deleted.'}
                                </Typography>
                            </Box>

                            <Typography variant="caption" color="text.secondary" fontWeight={900} sx={{ textTransform: 'uppercase', mb: 2, display: 'block' }}>
                                Options & Analysis:
                            </Typography>

                            <Stack spacing={1.5}>
                                {selectedQuestion.question?.options?.map((opt) => {
                                    const isSelected = selectedQuestion.selectedOptionId === opt._id || 
                                                     selectedQuestion.selectedOptionIds?.includes(opt._id);
                                    
                                    const textMatch = selectedQuestion.selectedText === opt.text;
                                    const effectivelySelected = isSelected || (selectedQuestion.question?.type === 'true_false' && textMatch);
                                    const isCorrect = opt.isCorrect;

                                    // Determine the status/color
                                    let borderColor = 'divider';
                                    let bgcolor = 'transparent';
                                    let statusIcon = null;
                                    let statusLabel = null;

                                    if (isCorrect && effectivelySelected) {
                                        borderColor = '#4caf50';
                                        bgcolor = 'rgba(76, 175, 80, 0.08)';
                                        statusIcon = <CheckCircleIcon sx={{ color: '#4caf50' }} />;
                                        statusLabel = "Correct Response";
                                    } else if (effectivelySelected) {
                                        borderColor = '#f44336';
                                        bgcolor = 'rgba(244, 67, 54, 0.08)';
                                        statusIcon = <CancelIcon sx={{ color: '#f44336' }} />;
                                        statusLabel = "Student's Wrong Choice";
                                    } else if (isCorrect) {
                                        borderColor = '#ff9800';
                                        bgcolor = 'rgba(255, 152, 0, 0.08)';
                                        statusIcon = <CheckCircleIcon sx={{ color: '#ff9800' }} />;
                                        statusLabel = "Missing Correct Answer";
                                    }

                                    return (
                                        <Box
                                            key={opt._id}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 1,
                                                border: '1px solid',
                                                borderColor: borderColor,
                                                borderLeft: `6px solid ${borderColor === 'divider' ? 'transparent' : borderColor}`,
                                                bgcolor: bgcolor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                transition: 'all 0.2s',
                                                position: 'relative'
                                            }}
                                        >
                                            <Stack spacing={0.5}>
                                                {statusLabel && (
                                                    <Typography variant="caption" fontWeight={900} sx={{ 
                                                        color: borderColor, 
                                                        textTransform: 'uppercase', 
                                                        letterSpacing: '0.05em',
                                                        fontSize: '0.65rem'
                                                    }}>
                                                        {statusLabel}
                                                    </Typography>
                                                )}
                                                <Typography variant="body1" fontWeight={effectivelySelected || isCorrect ? 700 : 400}>
                                                    {opt.text}
                                                </Typography>
                                            </Stack>
                                            
                                            <Box sx={{ ml: 2 }}>
                                                {statusIcon}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>

                            {selectedQuestion.question?.explanation && (
                                <Box sx={{ mt: 4, p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderLeft: '4px solid', borderColor: 'primary.main', borderRadius: 1 }}>
                                    <Typography variant="caption" fontWeight={900} color="primary">EXPLANATION:</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>{selectedQuestion.question.explanation}</Typography>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', justifyContent: 'space-between' }}>
                            <Box>
                                <Button 
                                    disabled={selectedQuestion.qIndex === 1}
                                    onClick={handlePrev}
                                    variant="outlined"
                                    sx={{ borderRadius: 1, mr: 1 }}
                                >
                                    Previous
                                </Button>
                                <Button 
                                    disabled={selectedQuestion.qIndex === result.answers.length}
                                    onClick={handleNext}
                                    variant="outlined"
                                    sx={{ borderRadius: 1 }}
                                >
                                    Next
                                </Button>
                            </Box>
                            <Button onClick={() => setOpenModal(false)} variant="contained" sx={{ borderRadius: 1, px: 4 }}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default IndividualResult;
