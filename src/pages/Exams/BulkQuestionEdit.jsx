import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, IconButton, Stack, TextField, Button, CircularProgress,
    Select, MenuItem, Radio, Checkbox, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { parseQuestionForEditing, serializeQuestionForSaving } from '../../components/Exams/QuestionForm';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const TYPE_LABELS = {
    single_choice: 'Single Choice',
    multiple_choice: 'Multiple Choice',
    true_false: 'True / False'
};

const DIFFICULTY_STYLES = {
    easy: { bg: 'var(--color-vc-success-soft, #dcfce7)', color: 'var(--color-vc-success-deep, #15803d)' },
    medium: { bg: 'var(--color-vc-warning-soft, #fef3c7)', color: 'var(--color-vc-warning-deep, #b45309)' },
    hard: { bg: 'var(--color-vc-error-soft, #fee2e2)', color: 'var(--color-vc-error-deep, #b91c1c)' }
};

const blankRow = () => ({
    _rowKey: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    id: null,
    content: '',
    type: 'single_choice',
    marks: 1,
    category: '',
    difficulty: 'medium',
    options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ],
    explanation: ''
});

const fieldSx = {
    '& .MuiInputBase-root': {
        fontSize: '13px',
        fontFamily: 'inherit',
        borderRadius: '6px',
        color: 'var(--color-vc-ink)',
        bgcolor: 'var(--color-vc-canvas)'
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--color-vc-hairline-strong)' }
};

const BulkQuestionEdit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const selectedIds = location.state?.selectedIds || [];
                const { data } = await api.get('/questions');
                const listData = data?.data || data || [];
                const filtered = selectedIds.length > 0
                    ? listData.filter(q => selectedIds.includes(q._id || q.id))
                    : listData;

                setRows(filtered.map(q => ({
                    _rowKey: `existing-${q._id || q.id}`,
                    id: q._id || q.id,
                    ...parseQuestionForEditing(q)
                })));
            } catch (error) {
                console.error('Failed to load questions:', error);
                toast.error('Failed to load questions for editing');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [location.state]);

    const updateRow = (rowIdx, patch) => {
        setRows(prev => prev.map((r, i) => (i === rowIdx ? { ...r, ...patch } : r)));
    };

    const handleTypeChange = (rowIdx, type) => {
        setRows(prev => prev.map((r, i) => {
            if (i !== rowIdx) return r;
            let options = r.options;
            if (type === 'true_false') {
                options = [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }];
            } else if (r.type === 'true_false' && type !== 'true_false') {
                options = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
            }
            return { ...r, type, options };
        }));
    };

    const handleOptionTextChange = (rowIdx, optIdx, text) => {
        setRows(prev => prev.map((r, i) => {
            if (i !== rowIdx) return r;
            const options = r.options.map((o, oi) => (oi === optIdx ? { ...o, text } : o));
            return { ...r, options };
        }));
    };

    const handleCorrectToggle = (rowIdx, optIdx) => {
        setRows(prev => prev.map((r, i) => {
            if (i !== rowIdx) return r;
            const options = r.type === 'multiple_choice'
                ? r.options.map((o, oi) => (oi === optIdx ? { ...o, isCorrect: !o.isCorrect } : o))
                : r.options.map((o, oi) => ({ ...o, isCorrect: oi === optIdx }));
            return { ...r, options };
        }));
    };

    const handleAddOption = (rowIdx) => {
        setRows(prev => prev.map((r, i) => (i === rowIdx ? { ...r, options: [...r.options, { text: '', isCorrect: false }] } : r)));
    };

    const handleRemoveOption = (rowIdx, optIdx) => {
        setRows(prev => prev.map((r, i) => (i === rowIdx ? { ...r, options: r.options.filter((_, oi) => oi !== optIdx) } : r)));
    };

    const handleAddRow = () => setRows(prev => [...prev, blankRow()]);

    const handleDeleteRow = async (rowIdx) => {
        const row = rows[rowIdx];
        if (row.id) {
            if (!window.confirm('Delete this question?')) return;
            try {
                await api.delete(`/questions/${row.id}`);
                toast.success('Question deleted');
            } catch {
                toast.error('Failed to delete question');
                return;
            }
        }
        setRows(prev => prev.filter((_, i) => i !== rowIdx));
    };

    const handlePublish = async () => {
        setSaving(true);
        try {
            await Promise.all(rows.map(row => {
                const payload = serializeQuestionForSaving(row);
                return row.id ? api.put(`/questions/${row.id}`, payload) : api.post('/questions', payload);
            }));
            toast.success('All changes published successfully');
            navigate('/question-bank');
        } catch (error) {
            toast.error('Failed to publish some changes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ bgcolor: 'var(--color-vc-canvas)', minHeight: '100vh' }}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ p: 2, borderBottom: '1px solid var(--color-vc-hairline)', bgcolor: 'var(--color-vc-canvas)', position: 'sticky', top: 0, zIndex: 5 }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={() => navigate('/question-bank')} sx={{ bgcolor: 'var(--color-vc-canvas-soft)', color: 'var(--color-vc-mute)' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    <Box>
                        <Typography variant="h6" fontWeight={900} sx={{ color: 'var(--color-vc-ink)', letterSpacing: -0.5 }}>
                            Bulk Question Editor
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--color-vc-error)', fontWeight: 700 }}>
                            {rows.length} Questions Loaded
                        </Typography>
                    </Box>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Button onClick={() => navigate('/question-bank')} sx={{ textTransform: 'none', fontWeight: 700, color: 'var(--color-vc-mute)' }}>
                        Discard
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<SaveIcon fontSize="small" />}
                        onClick={handlePublish}
                        disabled={saving || loading || rows.length === 0}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '24px', px: 3 }}
                    >
                        {saving ? 'Publishing...' : 'Publish Changes'}
                    </Button>
                </Stack>
            </Stack>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={28} />
                </Box>
            ) : (
                <>
                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, bgcolor: 'var(--color-vc-canvas)' }}>
                        <Table sx={{ tableLayout: 'fixed' }}>
                            <TableHead>
                                <TableRow>
                                    {['#', 'QUESTION CONTENT', 'TYPE', 'OPTIONS & CORRECT ANSWER', 'MARKS', 'DIFFICULTY', 'CATEGORY'].map((h, i) => (
                                        <TableCell
                                            key={h}
                                            sx={{
                                                bgcolor: 'var(--color-vc-canvas-soft)',
                                                color: 'var(--color-vc-mute)',
                                                fontWeight: 700,
                                                fontSize: '11px',
                                                letterSpacing: '0.06em',
                                                borderBottom: '1px solid var(--color-vc-hairline)',
                                                width: [50, 220, 150, 320, 80, 130, 140][i]
                                            }}
                                        >
                                            {h}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row, rowIdx) => (
                                    <TableRow key={row._rowKey} sx={{ verticalAlign: 'top' }}>
                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <Stack alignItems="center" spacing={1}>
                                                <Typography variant="body2" fontWeight={700} sx={{ color: 'var(--color-vc-mute)' }}>
                                                    {rowIdx + 1}
                                                </Typography>
                                                <IconButton size="small" onClick={() => handleDeleteRow(rowIdx)} sx={{ color: 'var(--color-vc-error)' }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <Box
                                                sx={{
                                                    '.ql-toolbar': { borderRadius: '6px 6px 0 0', borderColor: 'var(--color-vc-hairline)' },
                                                    '.ql-container': { borderRadius: '0 0 6px 6px', borderColor: 'var(--color-vc-hairline)', fontSize: '13px', bgcolor: 'var(--color-vc-canvas)' },
                                                    '.ql-editor': { minHeight: '90px', color: 'var(--color-vc-ink)' }
                                                }}
                                            >
                                                <ReactQuill
                                                    theme="snow"
                                                    value={row.content}
                                                    onChange={(content) => updateRow(rowIdx, { content })}
                                                    placeholder="Enter question text..."
                                                />
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <Select
                                                fullWidth
                                                size="small"
                                                value={row.type}
                                                onChange={(e) => handleTypeChange(rowIdx, e.target.value)}
                                                sx={{ ...fieldSx, fontSize: '13px' }}
                                            >
                                                {Object.entries(TYPE_LABELS).map(([val, label]) => (
                                                    <MenuItem key={val} value={val} sx={{ fontSize: '13px' }}>{label}</MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <Stack spacing={0.75}>
                                                {row.options.map((opt, optIdx) => (
                                                    <Stack key={optIdx} direction="row" alignItems="center" spacing={0.5}>
                                                        {row.type === 'multiple_choice' ? (
                                                            <Checkbox size="small" checked={opt.isCorrect} onChange={() => handleCorrectToggle(rowIdx, optIdx)} />
                                                        ) : (
                                                            <Radio size="small" checked={opt.isCorrect} onChange={() => handleCorrectToggle(rowIdx, optIdx)} />
                                                        )}
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={opt.text}
                                                            disabled={row.type === 'true_false'}
                                                            placeholder={`Option ${optIdx + 1}`}
                                                            onChange={(e) => handleOptionTextChange(rowIdx, optIdx, e.target.value)}
                                                            sx={{
                                                                ...fieldSx,
                                                                ...(opt.isCorrect ? { '& .MuiInputBase-root': { ...fieldSx['& .MuiInputBase-root'], bgcolor: 'var(--color-vc-primary-soft, #dbeafe)' } } : {})
                                                            }}
                                                        />
                                                        {row.type !== 'true_false' && (
                                                            <IconButton size="small" onClick={() => handleRemoveOption(rowIdx, optIdx)} sx={{ color: 'var(--color-vc-error)' }}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                ))}
                                                {row.type !== 'true_false' && (
                                                    <Button
                                                        size="small"
                                                        startIcon={<AddIcon fontSize="small" />}
                                                        onClick={() => handleAddOption(rowIdx)}
                                                        sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600, color: 'var(--color-vc-mute)' }}
                                                    >
                                                        Add Option
                                                    </Button>
                                                )}
                                            </Stack>
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={row.marks}
                                                onChange={(e) => updateRow(rowIdx, { marks: e.target.value })}
                                                sx={fieldSx}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <Select
                                                fullWidth
                                                size="small"
                                                value={row.difficulty}
                                                onChange={(e) => updateRow(rowIdx, { difficulty: e.target.value })}
                                                sx={{
                                                    ...fieldSx,
                                                    fontSize: '12px',
                                                    fontWeight: 800,
                                                    '& .MuiSelect-select': {
                                                        bgcolor: DIFFICULTY_STYLES[row.difficulty]?.bg,
                                                        color: DIFFICULTY_STYLES[row.difficulty]?.color,
                                                        borderRadius: '20px',
                                                        textAlign: 'center',
                                                        textTransform: 'uppercase'
                                                    }
                                                }}
                                            >
                                                <MenuItem value="easy" sx={{ fontSize: '12px', fontWeight: 700 }}>Easy</MenuItem>
                                                <MenuItem value="medium" sx={{ fontSize: '12px', fontWeight: 700 }}>Medium</MenuItem>
                                                <MenuItem value="hard" sx={{ fontSize: '12px', fontWeight: 700 }}>Hard</MenuItem>
                                            </Select>
                                        </TableCell>

                                        <TableCell sx={{ borderBottom: '1px solid var(--color-vc-hairline)' }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={row.category}
                                                placeholder="Category"
                                                onChange={(e) => updateRow(rowIdx, { category: e.target.value })}
                                                sx={fieldSx}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddRow}
                            sx={{ textTransform: 'none', fontWeight: 700, color: 'var(--color-vc-error)' }}
                        >
                            Add New Row
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default BulkQuestionEdit;
