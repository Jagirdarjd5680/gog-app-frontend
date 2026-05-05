import { useState, useEffect } from 'react';
import { Box, Typography, Button, Chip, IconButton, Tooltip } from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import AssignmentFormModal from '../../components/Assignments/AssignmentFormModal';
import QuestionSelector from '../../components/Exams/QuestionSelector';
import AssignmentSubmissionsModal from '../../components/Assignments/AssignmentSubmissionsModal';

const AssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [questionSelectorOpen, setQuestionSelectorOpen] = useState(false);
    const [currentAssignmentId, setCurrentAssignmentId] = useState(null);
    const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/assignments');
            if (response.data.success) {
                setAssignments(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (assignment) => {
        setSelectedAssignment(assignment);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedAssignment(null);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                await api.delete(`/assignments/${id}`);
                toast.success('Assignment deleted successfully');
                fetchAssignments();
            } catch (error) {
                toast.error('Failed to delete assignment');
            }
        }
    };

    const handleOpenQuestionSelector = (assignmentId) => {
        setCurrentAssignmentId(assignmentId);
        setQuestionSelectorOpen(true);
    };

    const handleViewSubmissions = (assignmentId) => {
        setCurrentAssignmentId(assignmentId);
        setSubmissionsModalOpen(true);
    };

    const handleAddQuestions = async (questionIds) => {
        try {
            await api.put(`/assignments/${currentAssignmentId}/questions`, { questionIds });
            toast.success(`${questionIds.length} questions updated`);
            
            // Fast state update
            setAssignments(prev => prev.map(a => 
                a._id === currentAssignmentId ? { ...a, questions: questionIds } : a
            ));
            
            // Then fetch for full data (including population if any)
            fetchAssignments();
        } catch (error) {
            console.error('Error adding questions:', error);
            toast.error('Failed to add questions');
        }
    };

    const columnDefs = [
        { field: 'title', headerName: 'Title', flex: 1 },
        {
            field: 'course',
            headerName: 'Course',
            valueGetter: (params) => params.data.course?.title || 'None',
            cellRenderer: (params) => (
                <Chip 
                    label={params.value} 
                    size="small" 
                    variant="outlined" 
                    sx={{ 
                        color: 'text.primary', 
                        fontWeight: 600,
                        borderColor: 'rgba(0,0,0,0.12)',
                        bgcolor: 'background.paper'
                    }} 
                />
            )
        },
        {
            field: 'deadline',
            headerName: 'Deadline',
            valueFormatter: (params) => format(new Date(params.value), 'PPp'),
        },
        { field: 'totalMarks', headerName: 'Marks' },
        {
            headerName: 'Questions',
            field: 'questions',
            width: 120,
            valueGetter: (params) => params.data.questions?.length || 0,
            cellRenderer: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value > 0 ? 'info' : 'default'}
                />
            )
        },
        {
            field: 'submissions',
            headerName: 'Submissions',
            valueGetter: (params) => params.data.submissions?.length || 0,
        },
        {
            field: 'isPublished',
            headerName: 'Status',
            cellRenderer: (params) => (
                <Chip label={params.value ? 'Published' : 'Draft'} color={params.value ? 'success' : 'default'} size="small" />
            ),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            filter: false,
            width: 220,
            cellRenderer: (params) => (
                <Box>
                    <Tooltip title="View Submissions">
                        <IconButton size="small" color="secondary" onClick={() => handleViewSubmissions(params.data._id)}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Manage Questions">
                        <IconButton size="small" color="info" onClick={() => handleOpenQuestionSelector(params.data._id)}>
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(params.data)}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(params.data._id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>
                    Assignments
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Create Assignment
                </Button>
            </Box>

            <DataTable
                rowData={assignments}
                columnDefs={columnDefs}
                loading={loading}
            />

            {modalOpen && (
                <AssignmentFormModal 
                    open={modalOpen} 
                    assignment={selectedAssignment}
                    onClose={() => setModalOpen(false)} 
                    onSuccess={fetchAssignments}
                />
            )}

            <QuestionSelector
                open={questionSelectorOpen}
                onClose={() => setQuestionSelectorOpen(false)}
                onSelect={handleAddQuestions}
                existingQuestionIds={assignments.find(a => a._id === currentAssignmentId)?.questions?.map(q => q._id || q) || []}
            />

            {submissionsModalOpen && (
                <AssignmentSubmissionsModal
                    open={submissionsModalOpen}
                    onClose={() => setSubmissionsModalOpen(false)}
                    assignmentId={currentAssignmentId}
                />
            )}
        </Box>
    );
};

export default AssignmentList;
