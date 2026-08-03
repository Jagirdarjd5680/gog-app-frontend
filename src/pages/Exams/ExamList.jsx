import { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, IconButton, Stack, Chip, Avatar, CircularProgress, Button } from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SettingsIcon from '@mui/icons-material/Settings';
import api from '../../utils/api';
import { toast } from 'react-toastify';

import ExamForm from '../../components/Exams/ExamForm';
import QuestionSelector from '../../components/Exams/QuestionSelector';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { hasModulePermission } from '../../utils/permissions';

const ExamList = () => {
    const { user } = useAuth();
    const canAdd = hasModulePermission(user, 'exams', 'add');
    const canEdit = hasModulePermission(user, 'exams', 'edit');
    const canDelete = hasModulePermission(user, 'exams', 'delete');
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [examToDelete, setExamToDelete] = useState(null);
    const [questionSelectorOpen, setQuestionSelectorOpen] = useState(false);
    const [currentExamId, setCurrentExamId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchExams = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/exams');
            const examData = response.data?.data || response.data || [];
            setExams(Array.isArray(examData) ? examData : []);
        } catch (error) {
            console.error('Failed to fetch exams:', error);
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    const handleCreate = () => {
        setSelectedExam(null);
        setFormOpen(true);
    };

    const handleEdit = useCallback((exam) => {
        setSelectedExam(exam);
        setFormOpen(true);
    }, []);

    const handleFormSuccess = () => {
        setFormOpen(false);
        fetchExams();
    };

    const handleDelete = async () => {
        if (!examToDelete) return;
        try {
            await api.delete(`/exams/${examToDelete._id}`);
            toast.success('Exam deleted successfully');
            fetchExams();
        } catch (error) {
            toast.error('Failed to delete exam');
        }
        setExamToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleOpenQuestionSelector = useCallback((examId) => {
        setCurrentExamId(examId);
        setQuestionSelectorOpen(true);
    }, []);

    const handleAddQuestions = async (questionIds) => {
        try {
            await api.put(`/exams/${currentExamId}/questions`, { questionIds });
            toast.success(`${questionIds.length} questions added to exam`);
            fetchExams();
        } catch (error) {
            toast.error('Failed to add questions');
        }
    };

    const handleStatusToggle = useCallback(async (exam) => {
        setTogglingId(exam._id);
        try {
            await api.put(`/exams/${exam._id}`, { isPublished: !exam.isPublished, isActive: !exam.isActive });
            toast.success(`Exam ${!exam.isPublished ? 'published' : 'unpublished'}`);
            fetchExams();
        } catch (error) {
            toast.error('Failed to update exam status');
        } finally {
            setTogglingId(null);
        }
    }, [fetchExams]);

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} exams?`)) return;
        try {
            await Promise.all(selectedRows.map(e => api.delete(`/exams/${e._id}`)));
            toast.success('Selected exams deleted');
            fetchExams();
            setSelectedRows([]);
        } catch {
            toast.error('Failed to delete selected exams');
        }
    };

    const onSelectionChanged = useCallback((event) => {
        const selectedNodes = event.api.getSelectedNodes();
        setSelectedRows(selectedNodes.map(node => node.data));
    }, []);

    const filteredExams = useMemo(() => {
        return exams.filter(exam => {
            const title = (exam.title || '').toLowerCase();
            const term = searchTerm.toLowerCase().trim();
            if (term && !title.includes(term)) return false;

            const isPublished = exam.isPublished !== undefined ? exam.isPublished : exam.isActive;
            if (statusFilter !== 'all' && (statusFilter === 'published') !== !!isPublished) return false;
            return true;
        });
    }, [exams, searchTerm, statusFilter]);

    const metricsItems = useMemo(() => [
        { title: 'Total Exams', value: exams.length, icon: <QuizIcon />, color: 'primary' },
        { title: 'Published', value: exams.filter(e => (e.isPublished !== undefined ? e.isPublished : e.isActive)).length, icon: <CheckCircleIcon />, color: 'success' },
        { title: 'Drafts', value: exams.filter(e => !(e.isPublished !== undefined ? e.isPublished : e.isActive)).length, icon: <PendingActionsIcon />, color: 'warning' },
        { title: 'With Questions', value: exams.filter(e => (e.questions?.length || 0) > 0).length, icon: <HelpCenterIcon />, color: 'info' }
    ], [exams]);

    const filterConfigs = useMemo(() => [
        {
            value: statusFilter,
            onChange: setStatusFilter,
            minWidth: 160,
            options: [
                { value: 'all', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Drafts' }
            ]
        }
    ], [statusFilter]);

    const bulkDeleteButton = useMemo(() => (
        selectedRows.length > 0 && canDelete ? (
            <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteSweepIcon fontSize="small" />}
                onClick={handleBulkDelete}
                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px', borderRadius: '6px', height: 36 }}
            >
                Delete ({selectedRows.length})
            </Button>
        ) : null
    ), [selectedRows, canDelete]);

    const columns = useMemo(() => [
        {
            headerName: '',
            width: 50,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            sortable: false,
            filter: false,
            pinned: 'left'
        },
        {
            field: 'title',
            headerName: 'EXAM TITLE',
            flex: 1.5,
            minWidth: 240,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                        <QuizIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                        {params.data.title || 'Untitled Exam'}
                    </Typography>
                </Stack>
            )
        },
        {
            headerName: 'DURATION',
            field: 'duration',
            width: 130,
            valueFormatter: (params) => `${params.value || 60} mins`
        },
        {
            headerName: 'MARKS (PASS/TOTAL)',
            field: 'totalMarks',
            width: 170,
            valueGetter: (params) => `${params.data.passingMarks || 40} / ${params.data.totalMarks || 100}`
        },
        {
            headerName: 'QUESTIONS',
            field: 'questions',
            width: 140,
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
            headerName: 'STATUS',
            field: 'isPublished',
            width: 140,
            cellRenderer: (params) => {
                const isToggling = togglingId === params.data._id;
                const isPublished = params.data.isPublished !== undefined ? params.data.isPublished : params.data.isActive;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: isToggling ? 'default' : 'pointer' }} onClick={() => !isToggling && handleStatusToggle(params.data)}>
                        {isToggling ? (
                            <CircularProgress size={18} thickness={5} />
                        ) : (
                            <Chip
                                label={isPublished ? 'PUBLISHED' : 'DRAFT'}
                                color={isPublished ? 'success' : 'warning'}
                                size="small"
                                sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                            />
                        )}
                    </Box>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 140,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => handleOpenQuestionSelector(params.data._id)} sx={{ color: 'var(--color-vc-mute)' }} title="Manage Questions">
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                    {canEdit && (
                        <IconButton size="small" onClick={() => handleEdit(params.data)} sx={{ color: 'var(--color-vc-mute)' }} title="Edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {canDelete && (
                        <IconButton size="small" onClick={() => { setExamToDelete(params.data); setDeleteDialogOpen(true); }} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            )
        }
    ], [togglingId, handleStatusToggle, handleOpenQuestionSelector, handleEdit, canEdit, canDelete]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Exam Management
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Create, publish, and manage online exams and question papers
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search exam title..."
                filters={filterConfigs}
                actionButtonText={canAdd ? "Create Exam" : undefined}
                actionButtonIcon={canAdd ? <AddIcon fontSize="small" /> : undefined}
                onActionClick={canAdd ? handleCreate : undefined}
                totalCount={filteredExams.length}
                extraElement={bulkDeleteButton}
            />

            <TableUI
                rowData={filteredExams}
                columnDefs={columns}
                loading={loading}
                onSelectionChanged={onSelectionChanged}
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
                message="Are you sure you want to delete this exam? This action cannot be undone."
            />
        </Box>
    );
};

export default ExamList;
