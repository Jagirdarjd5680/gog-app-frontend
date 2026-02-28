
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Typography,
    Checkbox,
    FormControlLabel,
    Radio,
    RadioGroup
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const QuestionForm = ({ open, onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState({
        content: '',
        type: 'multiple_choice',
        marks: 1,
        category: '',
        difficulty: 'medium',
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ],
        explanation: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            // Reset form if no initial data
            setFormData({
                content: '',
                type: 'multiple_choice',
                marks: 1,
                category: '',
                difficulty: 'medium',
                options: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ],
                explanation: ''
            });
        }
    }, [initialData, open]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index][field] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const handleCorrectOptionChange = (index) => {
        const newOptions = [...formData.options];
        if (formData.type === 'single_choice' || formData.type === 'true_false') {
            // Reset others for single choice
            newOptions.forEach((opt, i) => opt.isCorrect = i === index);
        } else {
            // Toggle for multiple choice
            newOptions[index].isCorrect = !newOptions[index].isCorrect;
        }
        setFormData({ ...formData, options: newOptions });
    };

    // For single choice using Radio buttons
    const handleRadioChange = (e) => {
        const selectedIndex = parseInt(e.target.value);
        const newOptions = [...formData.options];
        newOptions.forEach((opt, i) => opt.isCorrect = i === selectedIndex);
        setFormData({ ...formData, options: newOptions });
    }

    const addOption = () => {
        setFormData({
            ...formData,
            options: [...formData.options, { text: '', isCorrect: false }]
        });
    };

    const removeOption = (index) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    const handleTypeChange = (e) => {
        const type = e.target.value;
        let options = [...formData.options];

        if (type === 'true_false') {
            options = [
                { text: 'True', isCorrect: true },
                { text: 'False', isCorrect: false }
            ];
        } else if (formData.type === 'true_false' && type !== 'true_false') {
            // Reset to 4 empty options if switching away from T/F
            options = [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ];
        }

        setFormData({ ...formData, type, options });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.content.trim()) return toast.warning('Question content is required');

        // Ensure at least one correct answer
        if (!formData.options.some(opt => opt.isCorrect)) {
            return toast.warning('Please select at least one correct option');
        }

        try {
            if (initialData?._id) {
                await api.put(`/questions/${initialData._id}`, formData);
                toast.success('Question updated successfully');
            } else {
                await api.post('/questions', formData);
                toast.success('Question created successfully');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving question:', error);
            toast.error('Failed to save question');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {initialData ? 'Edit Question' : 'Create New Question'}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Question Content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        required
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={formData.type}
                                label="Type"
                                onChange={handleTypeChange}
                                name="type"
                            >
                                <MenuItem value="multiple_choice">Multiple Choice (Multiple Answers)</MenuItem>
                                <MenuItem value="single_choice">Single Choice (One Answer)</MenuItem>
                                <MenuItem value="true_false">True / False</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Marks"
                            name="marks"
                            type="number"
                            value={formData.marks}
                            onChange={handleChange}
                            sx={{ width: 150 }}
                        />
                        <TextField
                            label="Difficulty"
                            name="difficulty"
                            select
                            SelectProps={{ native: true }}
                            value={formData.difficulty}
                            onChange={handleChange}
                            sx={{ width: 150 }}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </TextField>
                    </Box>

                    <TextField
                        label="Category / Subject"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        fullWidth
                        size="small"
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Options</Typography>

                    {formData.type === 'single_choice' || formData.type === 'true_false' ? (
                        <RadioGroup
                            value={formData.options.findIndex(opt => opt.isCorrect)}
                            onChange={handleRadioChange}
                        >
                            {formData.options.map((option, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <FormControlLabel
                                        value={index}
                                        control={<Radio />}
                                        label=""
                                        sx={{ mr: 0 }}
                                    />
                                    <TextField
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        fullWidth
                                        size="small"
                                        disabled={formData.type === 'true_false'} // Disable text edit for T/F
                                    />
                                    {formData.type !== 'true_false' && (
                                        <IconButton color="error" onClick={() => removeOption(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}
                        </RadioGroup>
                    ) : (
                        // Multiple Choice (Checkbox)
                        formData.options.map((option, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Checkbox
                                    checked={option.isCorrect}
                                    onChange={() => handleCorrectOptionChange(index)}
                                />
                                <TextField
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    fullWidth
                                    size="small"
                                />
                                <IconButton color="error" onClick={() => removeOption(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))
                    )}

                    {formData.type !== 'true_false' && (
                        <Button startIcon={<AddIcon />} onClick={addOption} sx={{ width: 'fit-content' }}>
                            Add Option
                        </Button>
                    )}

                    <TextField
                        label="Explanation (Optional)"
                        name="explanation"
                        value={formData.explanation}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Explain why the correct answer is correct..."
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Save Question</Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuestionForm;
