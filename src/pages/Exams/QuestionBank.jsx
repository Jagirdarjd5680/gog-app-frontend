import { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    TextField,
    Badge,
    MenuItem,
    Stack,
    Menu,
    Typography,
    Tooltip
} from '@mui/material';
import DataTable from '../../components/Common/DataTable';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import QuestionForm from '../../components/Exams/QuestionForm';
import ImportPreviewModal from '../../components/Exams/ImportPreviewModal';
import DeleteConfirmDialog from '../../components/Common/DeleteConfirmDialog';
import RecycleBin from '../../components/Common/RecycleBin';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import Papa from 'papaparse';
import { useTheme } from '../../context/ThemeContext';

const QuestionBank = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [diffFilter, setDiffFilter] = useState('all');
    const [formOpen, setFormOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [recycleBinOpen, setRecycleBinOpen] = useState(false);
    const [binCount, setBinCount] = useState(0);
    const [importAnchor, setImportAnchor] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState([]);
    const [importLoading, setImportLoading] = useState(false);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const CSVInputRef = useRef(null);
    const JSONInputRef = useRef(null);

    useEffect(() => {
        fetchQuestions();
        fetchBinCount();
    }, [search, typeFilter, diffFilter]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const params = { search };
            if (typeFilter !== 'all') params.type = typeFilter;
            if (diffFilter !== 'all') params.difficulty = diffFilter;

            const { data } = await api.get('/questions', { params });
            setQuestions(data);
            setSelectedQuestions([]); // Clear selection on fetch
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChanged = (event) => {
        setSelectedQuestions(event.api.getSelectedRows());
    };

    const handleBulkDelete = async () => {
        if (!selectedQuestions.length) return;

        setBulkActionLoading(true);
        try {
            // Sequential deletion as existing backend might not have bulk delete
            // Better to add a bulk delete endpoint, but for now:
            await Promise.all(
                selectedQuestions.map(q => api.delete(`/questions/${q._id}`))
            );

            toast.success(`${selectedQuestions.length} questions moved to recycle bin`);
            fetchQuestions();
            fetchBinCount();
        } catch (error) {
            toast.error('Failed to delete some questions');
        } finally {
            setBulkActionLoading(false);
        }
    };

    const handleBulkExport = (format) => {
        if (!selectedQuestions.length) return;

        const exportData = selectedQuestions.map(q => ({
            content: q.content,
            type: q.type,
            options: q.options.map(o => o.text).join(','),
            correctAnswer: q.options.find(o => o.isCorrect)?.text || '',
            marks: q.marks,
            difficulty: q.difficulty,
            category: q.category
        }));

        if (format === 'json') {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute("href", dataStr);
            dl.setAttribute("download", `exported_questions_${Date.now()}.json`);
            dl.click();
        } else {
            const csv = Papa.unparse(exportData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `exported_questions_${Date.now()}.csv`);
            link.click();
        }
    };

    const handleConfirmImport = async () => {
        setImportLoading(true);
        try {
            await api.post('/questions/bulk', previewData);
            toast.success(`Successfully imported ${previewData.length} questions`);
            setPreviewOpen(false);
            fetchQuestions();
        } catch (err) {
            toast.error("Import failed: " + (err.response?.data?.message || err.message));
        } finally {
            setImportLoading(false);
        }
    };

    const transformOptions = (row) => {
        let opts = [];
        const type = row.type || 'multiple_choice';

        if (type === 'true_false') {
            opts = [
                { text: 'True', isCorrect: row.correctAnswer?.toLowerCase() === 'true' },
                { text: 'False', isCorrect: row.correctAnswer?.toLowerCase() === 'false' }
            ];
        } else {
            const rawOptions = Array.isArray(row.options)
                ? row.options
                : (typeof row.options === 'string' ? row.options.split(',') : []);

            opts = rawOptions.map(opt => ({
                text: opt.trim(),
                isCorrect: opt.trim() === (row.correctAnswer || '').trim()
            }));

            // Fallback: If no correct answer matched, mark the first one as correct if present
            if (opts.length > 0 && !opts.some(o => o.isCorrect)) {
                opts[0].isCorrect = true;
            }
        }
        return opts;
    };

    const handleImport = (e, format) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                let rawData = [];
                if (format === 'json') {
                    rawData = JSON.parse(event.target.result);
                } else {
                    const results = Papa.parse(event.target.result, { header: true, skipEmptyLines: true });
                    rawData = results.data;
                }

                if (!Array.isArray(rawData)) throw new Error("File must contain an array of questions");

                // Validate and Transform
                const transformed = rawData.map(q => {
                    if (!q.content || !q.type) {
                        throw new Error(`Invalid data: Content and Type are required for all questions.`);
                    }
                    return {
                        ...q,
                        marks: Number(q.marks) || 1,
                        options: transformOptions(q)
                    };
                });

                setPreviewData(transformed);
                setPreviewOpen(true);
            } catch (err) {
                toast.error("Validation failed: " + err.message);
            } finally {
                e.target.value = null; // Reset input
            }
        };
        reader.readAsText(file);
    };

    const handleExportDemo = (format) => {
        const demoData = [
            {
                content: 'What is the capital of France?',
                type: 'single_choice',
                options: 'Paris,London,Berlin,Madrid',
                correctAnswer: 'Paris',
                marks: 1,
                difficulty: 'easy',
                category: 'General Knowledge'
            },
            {
                content: 'React is a library, not a framework.',
                type: 'true_false',
                options: 'True,False',
                correctAnswer: 'True',
                marks: 2,
                difficulty: 'medium',
                category: 'Tech'
            }
        ];

        if (format === 'json') {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(demoData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "questions_demo.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        } else {
            const csv = Papa.unparse(demoData);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "questions_demo.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const fetchBinCount = async () => {
        try {
            const { data } = await api.get('/questions/bin/count');
            setBinCount(data.count);
        } catch (error) {
            console.error('Bin count error:', error);
        }
    };

    const handleCreate = () => {
        setSelectedQuestion(null);
        setFormOpen(true);
    };

    const handleEdit = (question) => {
        setSelectedQuestion(question);
        setFormOpen(true);
    };

    const handleFormSuccess = () => {
        setFormOpen(false);
        fetchQuestions();
    };

    const handleDelete = async () => {
        if (!questionToDelete) return;
        try {
            await api.delete(`/questions/${questionToDelete._id}`);
            toast.success('Question moved to recycle bin');
            fetchQuestions();
            fetchBinCount();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete');
        }
        setQuestionToDelete(null);
        setDeleteDialogOpen(false);
    };

    const columns = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 50,
            pinned: 'left'
        },
        {
            headerName: 'QUESTION',
            field: 'content',
            flex: 2,
            minWidth: 300,
            cellRenderer: (params) => (
                <div style={{ whiteSpace: 'normal', lineHeight: '1.5em', padding: '8px 0' }}>
                    {params.value.length > 100 ? params.value.substring(0, 100) + '...' : params.value}
                </div>
            )
        },
        {
            headerName: 'TYPE',
            field: 'type',
            width: 150,
            cellRenderer: (params) => {
                const colors = {
                    multiple_choice: 'primary',
                    single_choice: 'info',
                    true_false: 'secondary'
                };
                const labels = {
                    multiple_choice: 'Multiple Choice',
                    single_choice: 'Single Choice',
                    true_false: 'True / False'
                };
                return <Chip label={labels[params.value]} color={colors[params.value]} size="small" variant="outlined" />;
            }
        },
        { headerName: 'MARKS', field: 'marks', width: 100 },
        {
            headerName: 'DIFFICULTY',
            field: 'difficulty',
            width: 120,
            cellRenderer: (params) => (
                <Chip
                    label={params.value}
                    size="small"
                    color={params.value === 'hard' ? 'error' : params.value === 'medium' ? 'warning' : 'success'}
                    sx={{ textTransform: 'capitalize' }}
                />
            )
        },
        { headerName: 'CATEGORY', field: 'category', width: 150 },
        {
            headerName: 'ACTIONS',
            field: 'actions',
            width: 120,
            cellRenderer: (params) => (
                <Box>
                    <IconButton size="small" onClick={() => handleEdit(params.data)} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => { setQuestionToDelete(params.data); setDeleteDialogOpen(true); }} color="error">
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    const menuStyles = {
        PaperProps: {
            sx: {
                bgcolor: isDark ? '#1e1e1e' : '#fff',
                color: isDark ? '#fff' : 'inherit',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : 'none',
                minWidth: 180
            }
        }
    };

    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            {/* Header / Actions Row */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search questions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: 2, bgcolor: isDark ? 'action.hover' : '#f8f9fa' }
                    }}
                    sx={{ width: 350 }}
                />

                <Stack direction="row" spacing={2} alignItems="center">
                    {/* Hidden Inputs */}
                    <input type="file" hidden ref={CSVInputRef} accept=".csv" onChange={(e) => handleImport(e, 'csv')} />
                    <input type="file" hidden ref={JSONInputRef} accept=".json" onChange={(e) => handleImport(e, 'json')} />

                    {/* Import Menu */}
                    <Button
                        variant="outlined"
                        startIcon={<FileUploadIcon />}
                        onClick={(e) => setImportAnchor(e.currentTarget)}
                        sx={{ borderRadius: 1.5, borderColor: 'divider', color: 'text.primary' }}
                    >
                        Import
                    </Button>
                    <Menu
                        anchorEl={importAnchor}
                        open={Boolean(importAnchor)}
                        onClose={() => setImportAnchor(null)}
                        {...menuStyles}
                    >
                        <MenuItem onClick={() => { CSVInputRef.current.click(); setImportAnchor(null); }}>Import CSV</MenuItem>
                        <MenuItem onClick={() => { JSONInputRef.current.click(); setImportAnchor(null); }}>Import JSON</MenuItem>
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1, pt: 1, px: 2 }}>
                            <Typography variant="caption" color="text.secondary">Download Demo</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 0.5, mb: 1 }}>
                                <Button size="small" onClick={() => handleExportDemo('csv')}>CSV</Button>
                                <Button size="small" onClick={() => handleExportDemo('json')}>JSON</Button>
                            </Stack>
                        </Box>
                    </Menu>

                    <Badge badgeContent={binCount} color="error" overlap="rectangular">
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteSweepIcon />}
                            onClick={() => setRecycleBinOpen(true)}
                            sx={{ borderRadius: 1.5, fontWeight: 600 }}
                        >
                            Recycle Bin
                        </Button>
                    </Badge>

                    <Button
                        variant="outlined"
                        startIcon={<EditNoteIcon />}
                        onClick={() => navigate(`/question-bank/bulk-edit/${Math.random().toString(36).substring(7)}`)}
                        sx={{ borderRadius: 1.5, mr: 1 }}
                    >
                        Bulk Edit All
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                        sx={{ borderRadius: 1.5, boxShadow: 'none' }}
                    >
                        Add Question
                    </Button>
                </Stack>
            </Box>

            {/* Filters Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>FILTERS:</Typography>

                <TextField
                    select
                    size="small"
                    label="Question Type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    sx={{ minWidth: 180 }}
                    SelectProps={{
                        sx: { borderRadius: 2, bgcolor: isDark ? 'action.hover' : '#f8f9fa' }
                    }}
                >
                    <MenuItem value="all">Every Type</MenuItem>
                    <MenuItem value="single_choice">Single Choice</MenuItem>
                    <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                    <MenuItem value="true_false">True / False</MenuItem>
                </TextField>

                <TextField
                    select
                    size="small"
                    label="Difficulty"
                    value={diffFilter}
                    onChange={(e) => setDiffFilter(e.target.value)}
                    sx={{ minWidth: 150 }}
                    SelectProps={{
                        sx: { borderRadius: 2, bgcolor: isDark ? 'action.hover' : '#f8f9fa' }
                    }}
                >
                    <MenuItem value="all">Every Difficulty</MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                </TextField>

                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                    Found: <b>{questions.length}</b> questions
                </Typography>
            </Box>

            {/* Bulk Actions Floating Bar */}
            {selectedQuestions.length > 0 && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 40,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: isDark ? '#2c2c2c' : '#fff',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'divider',
                        borderRadius: 4,
                        px: 4,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        zIndex: 1000,
                        animation: 'slideUp 0.3s ease-out',
                        '@keyframes slideUp': {
                            from: { bottom: -100, opacity: 0 },
                            to: { bottom: 40, opacity: 1 }
                        }
                    }}
                >
                    <Typography variant="body1" fontWeight={700} color="primary">
                        {selectedQuestions.length} Selected
                    </Typography>

                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            size="small"
                            onClick={() => handleBulkExport('csv')}
                            sx={{ borderRadius: 2 }}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadIcon />}
                            size="small"
                            onClick={() => handleBulkExport('json')}
                            sx={{ borderRadius: 2 }}
                        >
                            Export JSON
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EditNoteIcon />}
                            size="small"
                            onClick={() => navigate(`/question-bank/bulk-edit/${Math.random().toString(36).substring(7)}`, { state: { selectedIds: selectedQuestions.map(q => q._id) } })}
                            sx={{ borderRadius: 2 }}
                        >
                            Bulk Edit
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            size="small"
                            disabled={bulkActionLoading}
                            onClick={handleBulkDelete}
                            sx={{ borderRadius: 2, bgcolor: '#ff1744', '&:hover': { bgcolor: '#d50000' } }}
                        >
                            {bulkActionLoading ? 'Deleting...' : 'Delete All'}
                        </Button>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setSelectedQuestions([])} // This needs a grid ref to clear properly, but for now UI only
                            color="inherit"
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Box>
            )}

            <DataTable
                rowData={questions}
                columnDefs={columns}
                loading={loading}
                rowHeight={60}
                pagination={true}
                paginationPageSize={10}
                onSelectionChanged={handleSelectionChanged}
            />

            <QuestionForm
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSuccess={handleFormSuccess}
                initialData={selectedQuestion}
            />

            <ImportPreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                data={previewData}
                onConfirm={handleConfirmImport}
                loading={importLoading}
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
                type="question"
                onRestore={() => {
                    fetchQuestions();
                    fetchBinCount();
                }}
            />
        </Box>
    );
};

export default QuestionBank;
