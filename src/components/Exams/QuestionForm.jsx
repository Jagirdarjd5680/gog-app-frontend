
import { useState } from 'react';
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
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Converts a stored Question record (Prisma shape: text/options-as-JSON-string/correctOption)
// into the rich editing shape this form works with (content/type/options-with-isCorrect).
export const parseQuestionForEditing = (question) => {
    // Already in editing shape (e.g. re-opening the form without a round-trip to the server)
    if (Array.isArray(question.options)) {
        return {
            content: question.content || question.text || '',
            type: question.type || 'multiple_choice',
            marks: question.marks ?? 1,
            category: question.category || '',
            difficulty: question.difficulty || 'medium',
            options: question.options,
            explanation: question.explanation || ''
        };
    }

    let optionTexts = [];
    if (typeof question.options === 'string') {
        try {
            const parsed = JSON.parse(question.options);
            if (Array.isArray(parsed)) {
                optionTexts = parsed.map(o => (typeof o === 'string' ? o : (o.text || '')));
            }
        } catch {
            optionTexts = question.options.split('|').map(s => s.trim()).filter(Boolean);
        }
    }

    const correctTexts = new Set(
        (question.correctOption || '').split(',').map(s => s.trim()).filter(Boolean)
    );

    let type = 'single_choice';
    if (optionTexts.length === 2 && optionTexts.every(t => ['true', 'false'].includes(t.toLowerCase()))) {
        type = 'true_false';
    } else if (correctTexts.size > 1) {
        type = 'multiple_choice';
    }

    return {
        content: question.text || question.content || '',
        type,
        marks: question.marks ?? 1,
        category: question.category || '',
        difficulty: question.difficulty || 'medium',
        options: optionTexts.length
            ? optionTexts.map(text => ({ text, isCorrect: correctTexts.has(text) }))
            : [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
            ],
        explanation: question.explanation || ''
    };
};

// Converts this form's editing shape back into the shape the backend/database expects.
export const serializeQuestionForSaving = (formData) => ({
    text: formData.content,
    options: JSON.stringify(formData.options.map(o => o.text)),
    correctOption: formData.options.filter(o => o.isCorrect).map(o => o.text).join(', '),
    marks: Number(formData.marks) || 1,
    category: formData.category || null,
    explanation: formData.explanation || null
});

const emptyFormData = () => ({
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

const QuestionForm = ({ open, onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState(emptyFormData);
    // Tracks whether formData already reflects the dialog's current open state, so we can
    // resync synchronously during render (React's "adjusting state during render" pattern).
    // Doing this via useEffect instead would commit ReactQuill's initial (stale/empty) value
    // first, and ReactQuill ignores subsequent `value` prop updates after that first mount.
    const [wasOpen, setWasOpen] = useState(false);

    if (open && !wasOpen) {
        setWasOpen(true);
        setFormData(initialData ? parseQuestionForEditing(initialData) : emptyFormData());
    } else if (!open && wasOpen) {
        setWasOpen(false);
    }

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
            const payload = serializeQuestionForSaving(formData);
            const id = initialData?._id || initialData?.id;
            if (id) {
                await api.put(`/questions/${id}`, payload);
                toast.success('Question updated successfully');
            } else {
                await api.post('/questions', payload);
                toast.success('Question created successfully');
            }
            onSuccess();
        } catch (error) {
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
                    <Box>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Question Content
                        </Typography>
                        <Box sx={{ 
                            '.ql-editor': { minHeight: '100px' },
                            '.ql-toolbar': { borderRadius: '8px 8px 0 0' },
                            '.ql-container': { borderRadius: '0 0 8px 8px', bgcolor: 'white' }
                        }}>
                            <ReactQuill
                                key={open ? (initialData?._id || initialData?.id || 'new') : 'closed'}
                                theme="snow"
                                value={formData.content}
                                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                                placeholder="Type your question here..."
                            />
                        </Box>
                    </Box>

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
