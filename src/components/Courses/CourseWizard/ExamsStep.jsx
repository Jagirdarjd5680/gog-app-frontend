import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Stack, Card, CardContent, 
    IconButton, Chip, CircularProgress, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { format } from 'date-fns';
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
            // Backend handles course filtering via query param
            const { data } = await api.get(`/exams?course=${courseId}`);
            // If backend doesn't filter, we filter here
            const list = data.data || data;
            const filtered = Array.isArray(list) ? list.filter(e => {
                const cid = e.course?._id || e.course;
                const cids = (e.courses || []).map(id => id._id || id);
                return cid === courseId || cids.includes(courseId);
            }) : [];
            
            setExams(filtered);
        } catch (error) {
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedExam(null); // No pre-filled data
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
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} sx={{ color: '#1e293b' }}>Course Exams & Quizzes</Typography>
                    <Typography variant="body2" color="text.secondary">Create and manage assessments for this course.</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined" startIcon={<AddIcon />} onClick={() => setPickerOpen(true)}
                        sx={{ borderRadius: '10px', px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}
                        disabled={!courseId}
                    >
                        Select Existing
                    </Button>
                    <Button
                        variant="contained" startIcon={<AddIcon />} onClick={handleCreate}
                        sx={{ borderRadius: '10px', px: 3, py: 1, bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' }, textTransform: 'none', fontWeight: 600 }}
                        disabled={!courseId}
                    >
                        Create Quiz
                    </Button>
                </Stack>
            </Box>

            {!courseId ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                    <QuizIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">Save Course First</Typography>
                    <Typography variant="body2" color="text.disabled">Please save the course details before adding exams.</Typography>
                </Box>
            ) : loading ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : exams.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                    <QuizIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No Quizzes Yet</Typography>
                    <Typography variant="body2" color="text.disabled">Add your first quiz to this course.</Typography>
                    <Button variant="text" sx={{ mt: 2 }} onClick={handleCreate}>+ Add New Quiz</Button>
                </Box>
            ) : (
                <Stack spacing={2}>
                    {exams.map((exam) => (
                        <Card key={exam._id} sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.08)', transition: 'all 0.3s ease', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' } }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <QuizIcon />
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={700}>{exam.title}</Typography>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                <TimerOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                <Typography variant="caption">{exam.duration} Mins</Typography>
                                            </Box>
                                            <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                <StarOutlineIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                <Typography variant="caption">{exam.passingMarks}/{exam.totalMarks} Marks</Typography>
                                            </Box>
                                            <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                                            <Chip 
                                                label={exam.isActive ? 'Active' : 'Draft'} 
                                                size="small" 
                                                color={exam.isActive ? 'success' : 'default'}
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                            />
                                        </Stack>
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton size="small" onClick={() => handleEdit(exam)}>
                                            <EditOutlinedIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(exam._id)}>
                                            <DeleteOutlineIcon fontSize="small" />
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
