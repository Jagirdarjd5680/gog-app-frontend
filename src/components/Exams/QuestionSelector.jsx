
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    InputAdornment,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Typography,
    Chip,
    CircularProgress,
    Divider,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../utils/api';

const QuestionSelector = ({ open, onClose, onSelect, existingQuestionIds = [] }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        if (open) {
            fetchQuestions();
            setSelectedIds([...existingQuestionIds]); // Initialize with existing IDs
        }
    }, [open, existingQuestionIds]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/questions');
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (id) => {
        const currentIndex = selectedIds.indexOf(id);
        const newChecked = [...selectedIds];

        if (currentIndex === -1) {
            newChecked.push(id);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedIds(newChecked);
    };

    const handleConfirm = () => {
        onSelect(selectedIds);
        onClose();
    };

    const filteredQuestions = questions.filter(q =>
        q.content.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Manage Exam Questions
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ height: 600, display: 'flex', flexDirection: 'column', p: 0 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search questions by content..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            sx: { bgcolor: 'white' }
                        }}
                    />
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {filteredQuestions.length === 0 ? (
                                <Box sx={{ p: 4, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        No questions found matching "{search}"
                                    </Typography>
                                </Box>
                            ) : (
                                filteredQuestions.map((question) => {
                                    const isSelected = selectedIds.indexOf(question._id) !== -1;
                                    return (
                                        <div key={question._id}>
                                            <ListItem
                                                button
                                                onClick={() => handleToggle(question._id)}
                                                sx={{
                                                    bgcolor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                                    '&:hover': { bgcolor: isSelected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)' }
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={isSelected}
                                                        tabIndex={-1}
                                                        disableRipple
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primaryTypographyProps={{ component: 'div' }}
                                                    secondaryTypographyProps={{ component: 'div' }}
                                                    primary={
                                                        <Typography variant="body1" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                                                            {question.content}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                                            <Chip
                                                                label={question.type.replace('_', ' ')}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.65rem', height: 20 }}
                                                            />
                                                            <Chip
                                                                label={`${question.marks} marks`}
                                                                size="small"
                                                                sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#e0e0e0' }}
                                                            />
                                                            <Chip
                                                                label={question.difficulty}
                                                                color={question.difficulty === 'hard' ? 'error' : question.difficulty === 'medium' ? 'warning' : 'success'}
                                                                size="small"
                                                                sx={{ fontSize: '0.65rem', height: 20, textTransform: 'capitalize' }}
                                                            />
                                                            <Chip
                                                                label={question.category}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.65rem', height: 20 }}
                                                            />
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider component="li" />
                                        </div>
                                    );
                                })
                            )}
                        </List>
                    )}
                </Box>
                <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {selectedIds.length} questions selected
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    color="primary"
                >
                    Save Changes ({selectedIds.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuestionSelector;
