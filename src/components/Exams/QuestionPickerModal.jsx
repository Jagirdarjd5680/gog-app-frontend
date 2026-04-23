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
    Stack,
    Checkbox
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../Common/DataTable';
import api from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

const QuestionPickerModal = ({ open, onClose, onSelect, selectedIds = [] }) => {
    const { isDark } = useTheme();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelected, setTempSelected] = useState([]);

    useEffect(() => {
        if (open) {
            console.log('🔍 QuestionPickerModal Opened', { selectedIds });
            fetchQuestions();
            setTempSelected(selectedIds);
        }
    }, [open]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/questions');
            if (response.data.success) {
                setQuestions(response.data.data || []);
            } else {
                setQuestions(response.data || []); // Fallback for legacy
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectionChanged = useCallback((event) => {
        console.log('🎯 handleSelectionChanged triggered', event);
        if (event?.api?.getSelectedRows) {
            const selectedRows = event.api.getSelectedRows();
            console.log('✅ Selected Rows found:', selectedRows);
            const selectedIds = selectedRows.map(r => r._id);
            
            // Only update if IDs actually changed to prevent loops
            setTempSelected(prev => {
                const isSame = prev.length === selectedIds.length && 
                             prev.every(id => selectedIds.includes(id));
                return isSame ? prev : selectedIds;
            });
        } else {
            console.warn('⚠️ event.api.getSelectedRows is missing!');
        }
    }, []);

    const handleConfirm = () => {
        console.log('🚀 Confirming Selection:', tempSelected);
        onSelect(tempSelected);
        onClose();
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
                <div 
                    style={{ whiteSpace: 'normal', lineHeight: '1.5em', padding: '8px 0' }}
                    dangerouslySetInnerHTML={{ __html: params.value }}
                />
            )
        },
        {
            headerName: 'TYPE',
            field: 'type',
            width: 130,
            cellRenderer: (params) => {
                const labels = {
                    multiple_choice: 'MCQ',
                    single_choice: 'SCQ',
                    true_false: 'T/F'
                };
                return <Chip label={labels[params.value] || params.value} size="small" variant="outlined" />;
            }
        },
        {
            headerName: 'MARKS',
            field: 'marks',
            width: 80
        }
    ];

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ sx: { borderRadius: '20px', height: '80vh' } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>Select Questions</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {tempSelected.length} questions selected
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ bgcolor: 'action.hover' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search questions..."
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
                        rowData={questions.filter(q => q.content.toLowerCase().includes(searchTerm.toLowerCase()))}
                        columnDefs={columns}
                        loading={loading}
                        rowHeight={60}
                        onSelectionChanged={handleSelectionChanged}
                        rowSelection="multiple"
                        getRowId={(row) => row._id}
                        selectedIds={tempSelected}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '10px' }}>Cancel</Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    sx={{ borderRadius: '10px', px: 4 }}
                >
                    Add Selected ({tempSelected.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuestionPickerModal;
