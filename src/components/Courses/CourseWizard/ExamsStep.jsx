import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Stack, Card, CardContent, 
    IconButton, Chip, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import api from '../../../utils/api';
import { toast } from 'react-toastify';
import ExamForm from '../../Exams/ExamForm';
import ExamPickerModal from '../../Exams/ExamPickerModal';

const ExamsStep = ({ values, setFieldValue, courseId }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    useEffect(() => {
        if (courseId) {
            fetchExams();
        }
    }, [courseId]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            // The backend already filters to this course server-side (`?course=`
            // -> Exam.courseId). A client-side re-filter used to run on top of that
            // checking Mongo-era `e.course`/`e.courses` fields that don't exist on the
            // real response, which zeroed out this list regardless of what was assigned.
            const { data } = await api.get(`/exams?course=${courseId}`);
            const list = data.data || data;
            setExams(Array.isArray(list) ? list : []);
        } catch (error) {
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedExam(null);
        setModalOpen(true);
    };

    const handleEdit = (exam) => {
        setSelectedExam(exam);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            try {
                await api.delete(`/exams/${id}`);
                toast.success('Exam deleted');
                fetchExams();
            } catch (error) {
                toast.error('Failed to delete exam');
            }
        }
    };

    return (
        <Box sx={{ p: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-vc-ink)', letterSpacing: '-0.02em', fontFamily: 'inherit' }}>Course Exams & Quizzes</Typography>
                    <Typography sx={{ fontSize: '13px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 }}>Create and manage assessments for this course.</Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined" 
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />} 
                        onClick={() => setPickerOpen(true)}
                        disabled={!courseId}
                        sx={{ 
                            borderRadius: '6px', 
                            px: 2.5, 
                            height: 36,
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            fontWeight: 500,
                            borderColor: 'var(--color-vc-hairline)',
                            color: 'var(--color-vc-ink)',
                            bgcolor: 'var(--color-vc-canvas)',
                            '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' },
                            '&:disabled': {
                                color: 'var(--color-vc-mute)',
                                border: '1px solid var(--color-vc-hairline)'
                            }
                        }}
                    >
                        Select Existing
                    </Button>
                    <Button
                        variant="contained" 
                        startIcon={<AddIcon sx={{ fontSize: 16 }} />} 
                        onClick={handleCreate}
                        disabled={!courseId}
                        sx={{ 
                            borderRadius: '6px', 
                            px: 3, 
                            height: 36,
                            boxShadow: 'none',
                            bgcolor: 'var(--color-vc-primary)',
                            color: 'var(--color-vc-on-primary)',
                            textTransform: 'none', 
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            fontWeight: 500,
                            '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' },
                            '&:disabled': {
                                bgcolor: 'var(--color-vc-canvas-soft-2)',
                                color: 'var(--color-vc-mute)',
                                border: '1px solid var(--color-vc-hairline)'
                            }
                        }}
                    >
                        Create Quiz
                    </Button>
                </Stack>
            </Box>

            {!courseId ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '6px', border: '1px dashed var(--color-vc-hairline)' }}>
                    <QuizIcon sx={{ fontSize: 40, color: 'var(--color-vc-mute)', mb: 1.5 }} />
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>Save Course First</Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.5 }}>Please save the course details before adding exams.</Typography>
                </Box>
            ) : loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress size={32} thickness={4} sx={{ color: 'var(--color-vc-ink)' }} />
                </Box>
            ) : exams.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'var(--color-vc-canvas-soft)', borderRadius: '6px', border: '1px dashed var(--color-vc-hairline)' }}>
                    <QuizIcon sx={{ fontSize: 40, color: 'var(--color-vc-mute)', mb: 1.5 }} />
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>No Quizzes Yet</Typography>
                    <Typography sx={{ fontSize: '12px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.5 }}>Add your first quiz to this course.</Typography>
                    <Button 
                        variant="text" 
                        sx={{ mt: 2, textTransform: 'none', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', color: 'var(--color-vc-link)', '&:hover': { color: 'var(--color-vc-link-deep)' } }} 
                        onClick={handleCreate}
                    >
                        + Add New Quiz
                    </Button>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {exams.map((exam) => (
                        <Card 
                            key={exam._id} 
                            variant="outlined"
                            sx={{ 
                                borderRadius: '6px', 
                                border: '1px solid var(--color-vc-hairline-strong, rgba(0, 0, 0, 0.12))', 
                                bgcolor: 'var(--color-vc-canvas)',
                                boxShadow: 'none',
                                '&:hover': { borderColor: 'var(--color-vc-hairline-strong, rgba(0, 0, 0, 0.18))', bgcolor: 'var(--color-vc-canvas-soft)' } 
                            }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 40, height: 40, borderRadius: '6px', border: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas-soft-2)', color: 'var(--color-vc-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <QuizIcon sx={{ fontSize: 18 }} />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit' }}>{exam.title}</Typography>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--color-vc-mute)' }}>
                                                <TimerOutlinedIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>{exam.duration} Mins</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'var(--color-vc-mute)' }}>
                                                <StarOutlineIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                                <Typography sx={{ fontSize: '11px', fontFamily: 'inherit' }}>{exam.passingMarks}/{exam.totalMarks} Marks</Typography>
                                            </Box>
                                            <Chip 
                                                label={exam.isActive ? 'Active' : 'Draft'} 
                                                size="small" 
                                                sx={{ 
                                                    height: 18, 
                                                    fontSize: '9px',
                                                    fontWeight: 600,
                                                    borderRadius: '4px',
                                                    bgcolor: exam.isActive ? 'rgba(41, 188, 155, 0.15)' : 'var(--color-vc-canvas-soft-2)',
                                                    color: exam.isActive ? 'var(--color-vc-cyan-deep)' : 'var(--color-vc-mute)',
                                                    border: '1px solid transparent'
                                                }}
                                            />
                                        </Stack>
                                    </Box>
                                    <Stack direction="row" spacing={0.5}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleEdit(exam)}
                                            sx={{ color: 'var(--color-vc-body)', '&:hover': { color: 'var(--color-vc-ink)' } }}
                                        >
                                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleDelete(exam._id)}
                                            sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-error-deep)' } }}
                                        >
                                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}

            {pickerOpen && (
                <ExamPickerModal
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    currentCourseId={courseId}
                    onSelect={fetchExams}
                />
            )}

            {modalOpen && (
                <ExamForm
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    initialData={selectedExam}
                    onSuccess={() => {
                        setModalOpen(false);
                        fetchExams();
                    }}
                />
            )}
        </Box>
    );
};

export default ExamsStep;
