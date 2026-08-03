import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    InputAdornment,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../Common/DataTable';
import api from '../../utils/api';

const labelStyles = {
    fontFamily: 'inherit',
    fontSize: '13px',
    color: 'var(--color-vc-mute)',
    '&.Mui-focused': { color: 'var(--color-vc-ink)' }
};

const inputStyles = {
    borderRadius: '6px',
    fontFamily: 'inherit',
    fontSize: '13px',
    color: 'var(--color-vc-ink)',
    bgcolor: 'var(--color-vc-canvas)',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-vc-hairline)'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-vc-hairline-strong)'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--color-vc-ink)',
        borderWidth: '1px'
    }
};

const ExamPickerModal = ({ open, onClose, onSelect, currentCourseId }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        if (open) {
            fetchExams();
        }
    }, [open]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/exams');
            const list = data.data || data;

            // An exam belongs to at most one course (`Exam.courseId`, a bare nullable
            // int) — exclude ones already on this course; everything else (unassigned
            // or assigned elsewhere) is a valid pick, since selecting one below moves
            // it here.
            const filtered = Array.isArray(list)
                ? list.filter(e => e.courseId?.toString() !== currentCourseId?.toString())
                : [];

            setExams(filtered);
        } catch (error) {

        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChanged = useCallback((event) => {
        const selectedNodes = event.api.getSelectedNodes();
        setSelectedRows(selectedNodes.map(node => node.data));
    }, []);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            // Setting courseId directly — `/assign-courses` was never implemented on the
            // current (Prisma-backed) API, so this always 404'd and never actually linked
            // anything; an exam only ever has one course anyway (`Exam.courseId`).
            for (const exam of selectedRows) {
                await api.put(`/exams/${exam._id}`, { courseId: currentCourseId });
            }
            onSelect();
            onClose();
        } catch (error) {

        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 50,
            pinned: 'left'
        },
        { field: 'title', headerName: 'QUIZ TITLE', flex: 1.5, minWidth: 200 },
        { field: 'totalMarks', headerName: 'MARKS', width: 100 },
        { 
            headerName: 'QUESTIONS', 
            field: 'questions', 
            width: 120,
            valueGetter: (params) => params.data.questions?.length || 0
        },
    ];

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth 
            PaperProps={{
                sx: { 
                    bgcolor: 'var(--color-vc-canvas)', 
                    color: 'var(--color-vc-ink)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-vc-hairline)',
                    boxShadow: 'none',
                    backgroundImage: 'none'
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderBottom: '1px solid var(--color-vc-hairline)' }}>
                <Box>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-vc-ink)', fontFamily: 'inherit', letterSpacing: '-0.02em' }}>Select Existing Quizzes</Typography>
                    <Typography sx={{ fontSize: '11px', color: 'var(--color-vc-mute)', fontFamily: 'inherit', mt: 0.25 }}>Link existing quizzes to this course</Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'var(--color-vc-mute)', '&:hover': { color: 'var(--color-vc-ink)' } }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>
            
            <DialogContent sx={{ p: 0, height: '60vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid var(--color-vc-hairline)' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search quizzes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 16, color: 'var(--color-vc-mute)' }} />
                                </InputAdornment>
                            ),
                            sx: inputStyles
                        }}
                    />
                </Box>
                <Box sx={{ flexGrow: 1, p: 1 }}>
                    <DataTable
                        rowData={exams.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()))}
                        columnDefs={columns}
                        loading={loading}
                        onSelectionChanged={handleSelectionChanged}
                    />
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid var(--color-vc-hairline)' }}>
                <Button 
                    onClick={onClose} 
                    variant="outlined" 
                    sx={{ 
                        borderRadius: '6px', 
                        height: 36,
                        px: 2.5,
                        textTransform: 'none',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        fontWeight: 500,
                        borderColor: 'var(--color-vc-hairline)',
                        color: 'var(--color-vc-ink)',
                        bgcolor: 'var(--color-vc-canvas)',
                        '&:hover': { borderColor: 'var(--color-vc-hairline-strong)', bgcolor: 'var(--color-vc-canvas-soft)' }
                    }}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    disabled={selectedRows.length === 0 || loading}
                    sx={{ 
                        borderRadius: '6px', 
                        px: 4, 
                        height: 36,
                        textTransform: 'none',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        fontWeight: 500,
                        boxShadow: 'none',
                        bgcolor: 'var(--color-vc-primary)',
                        color: 'var(--color-vc-on-primary)',
                        '&:hover': { bgcolor: 'var(--color-vc-primary)', opacity: 0.9, boxShadow: 'none' }
                    }}
                >
                    {loading ? <CircularProgress size={16} color="inherit" /> : `Link Selected (${selectedRows.length})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExamPickerModal;
