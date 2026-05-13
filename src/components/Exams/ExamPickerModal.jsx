import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    InputAdornment,
    Box,
    Typography,
    Chip,
    IconButton,
    CircularProgress,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../Common/DataTable';
import api from '../../utils/api';

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
            
            // Filter out exams already linked to this course
            const filtered = Array.isArray(list) ? list.filter(e => {
                const cid = e.course?._id || e.course;
                const cids = (e.courses || []).map(id => id._id || id);
                return cid !== currentCourseId && !cids.includes(currentCourseId);
            }) : [];

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
            for (const exam of selectedRows) {
                const existingCids = (exam.courses || []).map(c => c._id || c);
                if (!existingCids.includes(currentCourseId)) {
                    await api.put(`/exams/${exam._id}/assign-courses`, {
                        courseIds: [...existingCids, currentCourseId]
                    });
                }
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
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>Select Existing Quizzes</Typography>
                    <Typography variant="caption" color="text.secondary">Link existing quizzes to this course</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ bgcolor: 'action.hover' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, height: '60vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search quizzes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: '10px' }
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
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '10px' }}>Cancel</Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    disabled={selectedRows.length === 0 || loading}
                    sx={{ borderRadius: '10px', px: 4 }}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : `Link Selected (${selectedRows.length})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExamPickerModal;
