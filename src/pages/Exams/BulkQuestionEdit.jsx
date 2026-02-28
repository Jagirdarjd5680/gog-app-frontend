import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    IconButton,
    TextField,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    CircularProgress,
    Stack,
    AppBar,
    Toolbar
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';

const BulkQuestionEdit = () => {
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // If we passed selected IDs from the main page
                const selectedIds = location.state?.selectedIds || [];

                if (selectedIds.length > 0) {
                    const { data } = await api.get('/questions');
                    const filtered = data.filter(q => selectedIds.includes(q._id));
                    setQuestions(filtered);
                } else {
                    const { data } = await api.get('/questions');
                    setQuestions(data);
                }
            } catch (error) {
                toast.error('Failed to load questions');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [location.state]);

    const handleRowChange = (index, field, value) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const handleOptionChange = (qIndex, oIndex, field, value) => {
        const updated = [...questions];
        const updatedOptions = [...updated[qIndex].options];
        updatedOptions[oIndex] = { ...updatedOptions[oIndex], [field]: value };

        // If setting isCorrect to true, and it's single_choice/true_false, uncheck others
        if (field === 'isCorrect' && value === true && updated[qIndex].type !== 'multiple_choice') {
            updatedOptions.forEach((opt, idx) => {
                if (idx !== oIndex) opt.isCorrect = false;
            });
        }

        updated[qIndex].options = updatedOptions;
        setQuestions(updated);
    };

    const addOption = (qIndex) => {
        const updated = [...questions];
        updated[qIndex].options.push({ text: 'New Option', isCorrect: false });
        setQuestions(updated);
    };

    const removeOption = (qIndex, oIndex) => {
        const updated = [...questions];
        if (updated[qIndex].options.length > 1) {
            updated[qIndex].options.splice(oIndex, 1);
            setQuestions(updated);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/questions/bulk-update', questions);
            toast.success('All questions updated successfully');
            navigate('/question-bank');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: isDark ? '#121212' : '#f4f6f8' }}>
                <CircularProgress />
            </Box>
        );
    }

    const cellStyle = {
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        px: 1.5,
        py: 1,
        transition: 'background-color 0.2s',
        '&:hover': {
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
        }
    };

    const headerStyle = {
        bgcolor: isDark ? '#252525' : '#f8f9fa',
        fontWeight: 800,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'text.secondary',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
        borderBottom: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
        boxShadow: 'none !important'
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: isDark ? '#121212' : '#f4f6f8' }}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    bgcolor: isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={3} alignItems="center">
                        <IconButton onClick={() => navigate('/question-bank')} edge="start" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                            <CloseIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1 }}>Bulk Question Editor</Typography>
                            <Typography variant="caption" color="primary" fontWeight={700}>
                                {questions.length} Questions Loaded
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="text"
                            onClick={() => navigate('/question-bank')}
                            sx={{ color: 'text.secondary', fontWeight: 700 }}
                        >
                            Discard
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                            sx={{
                                borderRadius: 2,
                                px: 4,
                                boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                                fontWeight: 700
                            }}
                        >
                            {saving ? 'Saving...' : 'Publish Changes'}
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            <Toolbar /> {/* Spacer */}

            <TableContainer component={Paper} sx={{ flex: 1, borderRadius: 0, boxShadow: 'none', overflowX: 'auto', bgcolor: 'transparent' }}>
                <Table stickyHeader size="small" sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headerStyle, width: 50, textAlign: 'center' }}>#</TableCell>
                            <TableCell sx={{ ...headerStyle, minWidth: 350 }}>Question Content</TableCell>
                            <TableCell sx={{ ...headerStyle, minWidth: 160 }}>Type</TableCell>
                            <TableCell sx={{ ...headerStyle, minWidth: 400 }}>Options & Correct Answer</TableCell>
                            <TableCell sx={{ ...headerStyle, width: 80 }}>Marks</TableCell>
                            <TableCell sx={{ ...headerStyle, width: 140 }}>Difficulty</TableCell>
                            <TableCell sx={{ ...headerStyle, width: 160 }}>Category</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {questions.map((q, qIdx) => (
                            <TableRow key={q._id} sx={{ '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' } }}>
                                <TableCell sx={{ ...cellStyle, textAlign: 'center', color: 'text.secondary', fontWeight: 800 }}>
                                    {qIdx + 1}
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={2}
                                        value={q.content}
                                        onChange={(e) => handleRowChange(qIdx, 'content', e.target.value)}
                                        size="small"
                                        variant="standard"
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                fontFamily: 'inherit',
                                                lineHeight: 1.5
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Select
                                        fullWidth
                                        value={q.type}
                                        onChange={(e) => handleRowChange(qIdx, 'type', e.target.value)}
                                        size="small"
                                        variant="standard"
                                        disableUnderline
                                        sx={{
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                            borderRadius: 1.5,
                                            px: 1,
                                            height: 32
                                        }}
                                    >
                                        <MenuItem value="single_choice">Single Choice</MenuItem>
                                        <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                                        <MenuItem value="true_false">True / False</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
                                        {q.options.map((opt, oIdx) => (
                                            <Stack key={oIdx} direction="row" spacing={1.5} alignItems="center">
                                                <Tooltip title={opt.isCorrect ? "Correct answer" : "Mark as correct"}>
                                                    <Box
                                                        onClick={() => handleOptionChange(qIdx, oIdx, 'isCorrect', !opt.isCorrect)}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: q.type === 'multiple_choice' ? 0.5 : '50%',
                                                            border: '2px solid',
                                                            borderColor: opt.isCorrect ? 'primary.main' : 'divider',
                                                            bgcolor: opt.isCorrect ? 'primary.main' : 'transparent',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {opt.isCorrect && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />}
                                                    </Box>
                                                </Tooltip>
                                                <TextField
                                                    fullWidth
                                                    value={opt.text}
                                                    onChange={(e) => handleOptionChange(qIdx, oIdx, 'text', e.target.value)}
                                                    size="small"
                                                    variant="standard"
                                                    placeholder={`Option ${oIdx + 1}`}
                                                    InputProps={{
                                                        disableUnderline: true,
                                                        sx: {
                                                            fontSize: '0.85rem',
                                                            bgcolor: opt.isCorrect ? (isDark ? 'rgba(0,118,255,0.1)' : 'rgba(0,118,255,0.05)') : 'transparent',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            transition: 'all 0.2s',
                                                            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
                                                        }
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() => removeOption(qIdx, oIdx)}
                                                    color="error"
                                                    disabled={q.options.length <= 1}
                                                    sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                                                >
                                                    <CloseIcon fontSize="inherit" />
                                                </IconButton>
                                            </Stack>
                                        ))}
                                        {q.type !== 'true_false' && (
                                            <Button
                                                size="small"
                                                startIcon={<AddIcon />}
                                                onClick={() => addOption(qIdx)}
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    mt: 0.5,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                Add Option
                                            </Button>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        type="number"
                                        value={q.marks}
                                        onChange={(e) => handleRowChange(qIdx, 'marks', e.target.value)}
                                        size="small"
                                        variant="standard"
                                        inputProps={{ style: { textAlign: 'center', fontWeight: 800 } }}
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Select
                                            value={q.difficulty}
                                            onChange={(e) => handleRowChange(qIdx, 'difficulty', e.target.value)}
                                            size="small"
                                            variant="standard"
                                            disableUnderline
                                            sx={{
                                                fontSize: '0.7rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                bgcolor: q.difficulty === 'hard' ? 'error.main' : q.difficulty === 'medium' ? 'warning.main' : 'success.main',
                                                color: 'white',
                                                borderRadius: 10,
                                                px: 2,
                                                height: 22,
                                                minWidth: 80,
                                                '.MuiSelect-select': { py: 0, pr: '0 !important', textAlign: 'center' },
                                                '.MuiSvgIcon-root': { display: 'none' }
                                            }}
                                        >
                                            <MenuItem value="easy">Easy</MenuItem>
                                            <MenuItem value="medium">Medium</MenuItem>
                                            <MenuItem value="hard">Hard</MenuItem>
                                        </Select>
                                    </Box>
                                </TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        value={q.category}
                                        onChange={(e) => handleRowChange(qIdx, 'category', e.target.value)}
                                        size="small"
                                        variant="standard"
                                        placeholder="Category..."
                                        InputProps={{
                                            disableUnderline: true,
                                            sx: {
                                                fontSize: '0.85rem',
                                                fontStyle: 'italic',
                                                color: 'primary.main',
                                                fontWeight: 600
                                            }
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={7} sx={{ p: 2, textAlign: 'center', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => setQuestions([...questions, {
                                        content: '',
                                        type: 'single_choice',
                                        options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }],
                                        marks: 1,
                                        difficulty: 'easy',
                                        category: ''
                                    }])}
                                    sx={{ fontWeight: 800, textTransform: 'none' }}
                                >
                                    Add New Row
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BulkQuestionEdit;
