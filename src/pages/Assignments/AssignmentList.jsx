import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, IconButton, Stack, Chip, Avatar
} from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import AssignmentFormModal from '../../components/Assignments/AssignmentFormModal';
import QuestionSelector from '../../components/Exams/QuestionSelector';
import AssignmentSubmissionsModal from '../../components/Assignments/AssignmentSubmissionsModal';
import { format } from 'date-fns';

const AssignmentList = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [questionSelectorOpen, setQuestionSelectorOpen] = useState(false);
    const [currentAssignmentId, setCurrentAssignmentId] = useState(null);
    const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchAssignments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/assignments');
            const data = response.data?.data || response.data || [];
            setAssignments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load assignments:', error);
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const handleCreate = () => {
        setSelectedAssignment(null);
        setModalOpen(true);
    };

    const handleEdit = useCallback((assignment) => {
        setSelectedAssignment(assignment);
        setModalOpen(true);
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this assignment?')) return;
        try {
            await api.delete(`/assignments/${id}`);
            toast.success('Assignment deleted successfully');
            fetchAssignments();
        } catch (error) {
            toast.error('Failed to delete assignment');
        }
    };

    const handleOpenQuestionSelector = useCallback((assignmentId) => {
        setCurrentAssignmentId(assignmentId);
        setQuestionSelectorOpen(true);
    }, []);

    const handleViewSubmissions = useCallback((assignmentId) => {
        setCurrentAssignmentId(assignmentId);
        setSubmissionsModalOpen(true);
    }, []);

    const handleAddQuestions = async (questionIds) => {
        try {
            await api.put(`/assignments/${currentAssignmentId}/questions`, { questionIds });
            toast.success(`${questionIds.length} questions updated`);
            fetchAssignments();
        } catch (error) {
            toast.error('Failed to add questions');
        }
    };

    const filteredAssignments = useMemo(() => {
        return assignments.filter(a => {
            const title = (a.title || '').toLowerCase();
            const course = (a.course?.title || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();

            const matchesSearch = title.includes(term) || course.includes(term);
            if (!matchesSearch) return false;

            if (statusFilter !== 'all' && (a.status || 'published') !== statusFilter) return false;
            return true;
        });
    }, [assignments, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Assignments', value: assignments.length, icon: <AssignmentIcon />, color: 'primary' },
        { title: 'With Questions', value: assignments.filter(a => (a.questions?.length || 0) > 0).length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Pending Tasks', value: assignments.filter(a => (a.questions?.length || 0) === 0).length, icon: <PendingActionsIcon />, color: 'warning' }
    ], [assignments]);

    const filterConfigs = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            minWidth: 160,
            options: [
                { value: 'all', label: 'All Assignments' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Drafts' }
            ]
        }
    ], [statusFilter]);

    const columns = useMemo(() => [
        {
            field: 'title',
            headerName: 'ASSIGNMENT TITLE',
            flex: 2,
            minWidth: 240,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                        <AssignmentIcon fontSize="small" />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {params.data.title || 'Course Homework'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            {params.data.course?.title || 'General Course'}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'batch',
            headerName: 'TARGET BATCH',
            width: 160,
            valueGetter: (params) => params.data.batch?.name || 'All Batches'
        },
        {
            field: 'dueDate',
            headerName: 'DUE DATE',
            width: 160,
            valueGetter: (params) => {
                const d = params.data.dueDate;
                return d ? format(new Date(d), 'MMM dd, yyyy') : 'No Due Date';
            }
        },
        {
            field: 'questions',
            headerName: 'QUESTIONS',
            width: 130,
            cellRenderer: (params) => {
                const count = params.data.questions?.length || 0;
                return (
                    <Chip
                        label={`${count} Qs`}
                        color={count > 0 ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 180,
            cellRenderer: (params) => {
                const id = params.data._id || params.data.id;
                return (
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={() => handleViewSubmissions(id)} sx={{ color: 'var(--color-vc-link)' }} title="View Submissions">
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpenQuestionSelector(id)} sx={{ color: 'var(--color-vc-mute)' }} title="Manage Questions">
                            <SettingsIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEdit(params.data)} sx={{ color: 'var(--color-vc-mute)' }} title="Edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(id)} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                );
            }
        }
    ], [handleEdit, handleOpenQuestionSelector, handleViewSubmissions]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Assignments & Homework Tasks
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Create homework assignments, set submission due dates, and grade student answers
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search assignment title or course..."
                filters={filterConfigs}
                actionButtonText="Create Assignment"
                actionButtonIcon={<AddIcon />}
                onActionClick={handleCreate}
            />

            <TableUI
                rowData={filteredAssignments}
                columnDefs={columns}
                loading={loading}
            />

            <AssignmentFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => { setModalOpen(false); fetchAssignments(); }}
                initialData={selectedAssignment}
            />

            <QuestionSelector
                open={questionSelectorOpen}
                onClose={() => setQuestionSelectorOpen(false)}
                onSelect={handleAddQuestions}
                existingQuestionIds={assignments.find(a => (a._id || a.id) === currentAssignmentId)?.questions || []}
            />

            <AssignmentSubmissionsModal
                open={submissionsModalOpen}
                onClose={() => setSubmissionsModalOpen(false)}
                assignmentId={currentAssignmentId}
            />
        </Box>
    );
};

export default AssignmentList;
