import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Stack, Chip, Avatar, Button } from '@mui/material';
import TableUI from '../../components/UI/Table/TableUI';
import GenericMetrics from '../../components/Common/GenericMetrics';
import GenericTableHeader from '../../components/Common/GenericTableHeader';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CategoryIcon from '@mui/icons-material/Category';
import StarsIcon from '@mui/icons-material/Stars';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import EditNoteIcon from '@mui/icons-material/EditNote';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import QuestionForm from '../../components/Exams/QuestionForm';
import ImportPreviewModal from '../../components/Exams/ImportPreviewModal';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import RecycleBin from '../../components/Common/RecycleBin';
import Papa from 'papaparse';
import { useAuth } from '../../context/AuthContext';
import { hasModulePermission } from '../../utils/permissions';

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
};

const QuestionBank = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const canAdd = hasModulePermission(user, 'exams', 'add');
    const canEdit = hasModulePermission(user, 'exams', 'edit');
    const canDelete = hasModulePermission(user, 'exams', 'delete');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [recycleBinOpen, setRecycleBinOpen] = useState(false);
    const [binCount, setBinCount] = useState(0);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [importing, setImporting] = useState(false);
    const csvInputRef = useRef(null);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/questions');
            const questionData = data?.data || data || [];
            setQuestions(Array.isArray(questionData) ? questionData : []);
            setSelectedQuestions([]);
        } catch (error) {
            console.error('Failed to load questions:', error);
            toast.error('Failed to load question bank');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBinCount = useCallback(async () => {
        try {
            const response = await api.get('/questions/bin/count');
            setBinCount(response.data?.count || 0);
        } catch (error) {
            // Silence bin count error if endpoint not implemented
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
        fetchBinCount();
    }, [fetchQuestions, fetchBinCount]);

    const handleCreate = () => {
        setSelectedQuestion(null);
        setFormOpen(true);
    };

    const handleEdit = useCallback((question) => {
        setSelectedQuestion(question);
        setFormOpen(true);
    }, []);

    const handleDelete = async () => {
        if (!questionToDelete) return;
        try {
            await api.delete(`/questions/${questionToDelete._id || questionToDelete.id}`);
            toast.success('Question deleted');
            fetchQuestions();
            fetchBinCount();
        } catch (error) {
            toast.error('Failed to delete question');
        }
        setQuestionToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleBulkDelete = async () => {
        if (!selectedQuestions.length) return;
        if (!window.confirm(`Delete ${selectedQuestions.length} selected questions?`)) return;
        try {
            await Promise.all(selectedQuestions.map(q => api.delete(`/questions/${q._id || q.id}`)));
            toast.success(`${selectedQuestions.length} questions deleted`);
            fetchQuestions();
            fetchBinCount();
            setSelectedQuestions([]);
        } catch (error) {
            toast.error('Failed to delete selected questions');
        }
    };

    const handleSelectionChanged = useCallback((event) => {
        setSelectedQuestions(event.api.getSelectedRows());
    }, []);

    const handleImportClick = () => csvInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data.map((raw) => {
                    const getField = (name) => {
                        const key = Object.keys(raw).find(k => k.trim().toLowerCase() === name);
                        return key ? String(raw[key] || '').trim() : '';
                    };
                    const text = getField('question');
                    const options = getField('options').split('|').map(o => o.trim()).filter(Boolean);
                    const correctOption = getField('correctoption') || getField('correct answer');
                    const marks = parseFloat(getField('marks')) || 1;
                    const category = getField('category');
                    const isValid = !!text && options.length >= 2 && options.includes(correctOption);
                    return { text, options, correctOption, marks, category, isValid };
                });
                setPreviewData(rows);
                setPreviewOpen(true);
            },
            error: () => toast.error('Failed to parse CSV file')
        });
        e.target.value = '';
    };

    const handleConfirmImport = async () => {
        const validRows = previewData.filter(row => row.isValid);
        if (!validRows.length) return;
        setImporting(true);
        try {
            await Promise.all(validRows.map(row => api.post('/questions', {
                text: row.text,
                options: JSON.stringify(row.options),
                correctOption: row.correctOption,
                marks: row.marks,
                category: row.category || null
            })));
            toast.success(`${validRows.length} questions imported`);
            setPreviewOpen(false);
            setPreviewData([]);
            fetchQuestions();
        } catch (error) {
            toast.error('Failed to import some questions');
        } finally {
            setImporting(false);
        }
    };

    const handleBulkEdit = () => {
        navigate('/question-bank/bulk-edit/select', { state: { selectedIds: selectedQuestions.map(q => q._id || q.id) } });
    };

    const handleExportCSV = () => {
        const csvData = questions.map(q => {
            let options = [];
            try {
                const parsed = JSON.parse(q.options);
                if (Array.isArray(parsed)) options = parsed;
            } catch {
                // ignore malformed rows
            }
            return {
                Question: q.text || q.question || '',
                Options: options.join('|'),
                CorrectOption: q.correctOption || '',
                Marks: q.marks || 1,
                Category: q.category || ''
            };
        });
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'question-bank.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredQuestions = useMemo(() => {
        if (!searchTerm.trim()) return questions;
        const term = searchTerm.toLowerCase();
        return questions.filter(q =>
            q.text?.toLowerCase().includes(term) ||
            q.question?.toLowerCase().includes(term) ||
            q.category?.toLowerCase().includes(term)
        );
    }, [questions, searchTerm]);

    const metricsItems = useMemo(() => {
        const categories = new Set(questions.map(q => q.category).filter(Boolean));
        const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
        return [
            { title: 'Total Questions', value: questions.length, icon: <QuestionAnswerIcon />, color: 'primary' },
            { title: 'Categories', value: categories.size, icon: <CategoryIcon />, color: 'info' },
            { title: 'Total Marks', value: totalMarks, icon: <StarsIcon />, color: 'success' },
            { title: 'In Recycle Bin', value: binCount, icon: <DeleteSweepIcon />, color: 'warning' }
        ];
    }, [questions, binCount]);

    const bulkActionButtons = useMemo(() => (
        selectedQuestions.length > 0 ? (
            <Stack direction="row" spacing={1}>
                {canEdit && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditNoteIcon fontSize="small" />}
                        onClick={handleBulkEdit}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px', borderRadius: '6px', height: 36 }}
                    >
                        Edit ({selectedQuestions.length})
                    </Button>
                )}
                {canDelete && (
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteSweepIcon fontSize="small" />}
                        onClick={handleBulkDelete}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px', borderRadius: '6px', height: 36 }}
                    >
                        Delete ({selectedQuestions.length})
                    </Button>
                )}
            </Stack>
        ) : null
    ), [selectedQuestions, canEdit, canDelete]);

    const headerActions = useMemo(() => (
        <Stack direction="row" spacing={1}>
            {canAdd && (
                <IconButton size="small" onClick={handleImportClick} sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', height: 36, width: 36, color: 'var(--color-vc-mute)' }} title="Import CSV">
                    <FileUploadIcon fontSize="small" />
                </IconButton>
            )}
            <IconButton size="small" onClick={handleExportCSV} sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', height: 36, width: 36, color: 'var(--color-vc-mute)' }} title="Export CSV">
                <FileDownloadIcon fontSize="small" />
            </IconButton>
            {binCount > 0 && (
                <IconButton size="small" onClick={() => setRecycleBinOpen(true)} sx={{ border: '1px solid var(--color-vc-hairline)', borderRadius: '6px', height: 36, width: 36, color: 'var(--color-vc-mute)' }} title="Recycle Bin">
                    <DeleteSweepIcon fontSize="small" />
                </IconButton>
            )}
            {bulkActionButtons}
        </Stack>
    ), [binCount, bulkActionButtons, canAdd]);

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
            field: 'text',
            headerName: 'QUESTION TEXT',
            flex: 2,
            minWidth: 280,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                        <QuestionAnswerIcon fontSize="small" />
                    </Avatar>
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-ink)' }}>
                            {stripHtml(params.data.text || params.data.question) || 'N/A'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-mute)' }}>
                            {params.data.category || 'Uncategorized'}
                        </Typography>
                    </Box>
                </Stack>
            )
        },
        {
            field: 'correctOption',
            headerName: 'CORRECT ANSWER',
            width: 170,
            cellRenderer: (params) => (
                <Chip
                    label={params.data.correctOption || 'Option A'}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.7rem', borderRadius: '6px' }}
                />
            )
        },
        {
            field: 'marks',
            headerName: 'MARKS',
            width: 110,
            valueFormatter: (params) => `${params.value || 1} Pt`
        },
        {
            field: 'actions',
            headerName: 'ACTIONS',
            width: 120,
            cellRenderer: (params) => (
                <Stack direction="row" spacing={1}>
                    {canEdit && (
                        <IconButton size="small" onClick={() => handleEdit(params.data)} sx={{ color: 'var(--color-vc-mute)' }} title="Edit">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                    {canDelete && (
                        <IconButton size="small" onClick={() => { setQuestionToDelete(params.data); setDeleteDialogOpen(true); }} sx={{ color: 'var(--color-vc-error)' }} title="Delete">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            )
        }
    ], [handleEdit, canEdit, canDelete]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                    Question Bank
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--color-vc-mute)' }}>
                    Central repository for managing exam questions, MCQ options, and answer keys
                </Typography>
            </Box>

            <GenericMetrics items={metricsItems} />

            <GenericTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                searchPlaceholder="Search question text or category..."
                actionButtonText={canAdd ? "Add Question" : undefined}
                actionButtonIcon={canAdd ? <AddIcon fontSize="small" /> : undefined}
                onActionClick={canAdd ? handleCreate : undefined}
                totalCount={filteredQuestions.length}
                extraElement={headerActions}
            />

            <input
                type="file"
                accept=".csv"
                ref={csvInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <TableUI
                rowData={filteredQuestions}
                columnDefs={columns}
                loading={loading}
                onSelectionChanged={handleSelectionChanged}
            />

            <ImportPreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                data={previewData}
                onConfirm={handleConfirmImport}
                loading={importing}
            />

            <QuestionForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSuccess={() => { setFormOpen(false); fetchQuestions(); }}
                initialData={selectedQuestion}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                title="Delete Question"
                message="Are you sure you want to delete this question?"
            />

            <RecycleBin
                open={recycleBinOpen}
                onClose={() => setRecycleBinOpen(false)}
                onRestore={() => { fetchQuestions(); fetchBinCount(); }}
            />
        </Box>
    );
};

export default QuestionBank;
