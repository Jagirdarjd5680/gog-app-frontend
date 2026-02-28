
import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Chip,
    IconButton,
    Typography,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    CircularProgress
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import ExamForm from '../../components/Exams/ExamForm';
import QuestionSelector from '../../components/Exams/QuestionSelector';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';

const ExamList = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);
    const [questionSelectorOpen, setQuestionSelectorOpen] = useState(false);
    const [currentExamId, setCurrentExamId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/exams');
            setExams(data);
        } catch (error) {
            console.error('Error fetching exams:', error);
            // toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedExam(null);
        setFormOpen(true);
    };

    const handleEdit = (exam) => {
        setSelectedExam(exam);
        setFormOpen(true);
    };

    const handleFormSuccess = () => {
        setFormOpen(false);
        fetchExams();
    };

    const handleDelete = async () => {
        if (!examToDelete) return;
        try {
            await api.delete(`/exams/${examToDelete._id}`);
            toast.success('Exam deleted');
            fetchExams();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete');
        }
        setExamToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleOpenQuestionSelector = (examId) => {
        setCurrentExamId(examId);
        setQuestionSelectorOpen(true);
    };

    const handleAddQuestions = async (questionIds) => {
        try {
            await api.put(`/exams/${currentExamId}/questions`, { questionIds });
            toast.success(`${questionIds.length} questions added to exam`);
            fetchExams();
        } catch (error) {
            console.error('Error adding questions:', error);
            toast.error('Failed to add questions');
        }
    };

    const handleStatusToggle = async (exam) => {
        setTogglingId(exam._id);
        try {
            await api.put(`/exams/${exam._id}`, { isActive: !exam.isActive });
            toast.success(`Exam ${!exam.isActive ? 'activated' : 'deactivated'}`);
            fetchExams();
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('Failed to update status');
        } finally {
            setTogglingId(null);
        }
    };

    const columns = [
        { field: 'title', headerName: 'EXAM TITLE', flex: 1.5, minWidth: 200 },
        {
            headerName: 'DURATION',
            field: 'duration',
            width: 120,
            valueFormatter: (params) => `${params.value} mins`
        },
        {
            headerName: 'MARKS',
            field: 'totalMarks',
            width: 100,
            valueGetter: (params) => `${params.data.passingMarks}/${params.data.totalMarks}`
        },
        {
            headerName: 'QUESTIONS',
            field: 'questions',
            width: 120,
            valueGetter: (params) => params.data.questions?.length || 0,
            cellRenderer: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value > 0 ? 'success' : 'default'}
                    variant="outlined"
                />
            )
        },
        {
            headerName: 'STATUS',
            field: 'isActive',
            width: 120,
            cellRenderer: (params) => {
                const isToggling = togglingId === params.data._id;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: isToggling ? 'default' : 'pointer' }} onClick={() => !isToggling && handleStatusToggle(params.data)}>
                        {isToggling ? (
                            <CircularProgress size={20} thickness={5} />
                        ) : (
                            <Chip
                                label={params.value ? 'Active' : 'Draft'}
                                color={params.value ? 'success' : 'default'}
                                size="small"
                                sx={{ cursor: 'pointer' }}
                            />
                        )}
                    </Box>
                );
            }
        },
        {
            headerName: 'ACTIONS',
            field: 'actions',
            width: 200,
            cellRenderer: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleOpenQuestionSelector(params.data._id)} color="info" title="Manage Questions">
                        <SettingsIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(params.data)} color="primary" title="Edit Details">
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setExamToDelete(params.data); setDeleteDialogOpen(true); }} color="error" title="Delete">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={600}>Exam Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Create Exam
                </Button>
            </Box>

            <DataTable
                rowData={exams}
                columnDefs={columns}
                loading={loading}
            />

            <ExamForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSuccess={handleFormSuccess}
                initialData={selectedExam}
            />

            <QuestionSelector
                open={questionSelectorOpen}
                onClose={() => setQuestionSelectorOpen(false)}
                onSelect={handleAddQuestions}
                existingQuestionIds={exams.find(e => e._id === currentExamId)?.questions?.map(q => q._id || q) || []}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Exam"
                message="Are you sure you want to delete this exam?"
            />
        </Box>
    );
};

export default ExamList;
