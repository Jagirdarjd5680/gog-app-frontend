import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Checkbox, Paper, CircularProgress, Chip, Tabs, Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AssignExamModal = ({ open, onClose, examId, examTitle, courseId, courseTitle, onSuccess }) => {
    const [tabIdx, setTabIdx] = useState(0); // 0=Select existing exam, 1=Create new exam
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedExamIds, setSelectedExamIds] = useState([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    const [initialSelectedCourseIds, setInitialSelectedCourseIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [examData, setExamData] = useState({
        title: '', description: '', duration: 60,
        totalMarks: 100, passingMarks: 40, startDate: '', endDate: ''
    });

    const isExamMode = Boolean(examId); // If examId provided → assign courses TO the exam

    useEffect(() => {
        if (open) {
            if (isExamMode) {
                // Assign multiple courses to the given exam
                fetchCourses();
            } else {
                // Assign exams to the given course
                fetchExams();
            }
        }
    }, [open]);

    const fetchExams = async () => {
        setLoading(true);
        try {
            // Use large limit and timestamp to avoid stale cache or missing items
            const { data } = await api.get(`/exams?limit=1000&t=${Date.now()}`);
            const allExams = Array.isArray(data) ? data : data.data || [];
            setExams(allExams);
            // Pre-select exams that are already assigned to this course
            const assigned = allExams
                .filter(e => {
                    const eCoursesIds = (e.courses || []).map(c => typeof c === 'object' ? c._id : c);
                    const eSingleId = typeof e.course === 'object' ? e.course?._id : e.course;
                    return eCoursesIds.some(cid => cid?.toString() === courseId?.toString()) || eSingleId?.toString() === courseId?.toString();
                })
                .map(e => e._id);
            setSelectedExamIds(assigned);
        } catch {
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        setLoading(true);
        setLoading(true);
        try {
            const [coursesRes, examRes] = await Promise.all([
                api.get(`/courses?limit=1000&t=${Date.now()}`),
                api.get(`/exams/${examId}?t=${Date.now()}`)
            ]);
            const all = coursesRes.data?.data || [];
            const exam = Array.isArray(examRes.data) ? examRes.data[0] : examRes.data;
            const assignedIds = (exam?.courses || []).map(c => typeof c === 'object' ? c._id : c?.toString());
            setCourses(all);
            setSelectedCourseIds(assignedIds);
            setInitialSelectedCourseIds(assignedIds);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCourse = async (id) => {
        const isAdding = !selectedCourseIds.includes(id);
        const original = [...selectedCourseIds];
        
        // Update local UI immediately
        const nextIds = isAdding ? [...selectedCourseIds, id] : selectedCourseIds.filter(cid => cid !== id);
        setSelectedCourseIds(nextIds);

        try {
            // Update the Exam's courses list
            await api.put(`/exams/${examId}/assign-courses`, { courseIds: nextIds });
            toast.success('Updated');
            if (onSuccess) onSuccess(); // Refresh background
        } catch {
            setSelectedCourseIds(original);
            toast.error('Failed to update');
        }
    };

    const handleToggleExam = async (id) => {
        const isAdding = !selectedExamIds.includes(id);
        const original = [...selectedExamIds];
        
        // Update local UI immediately
        const nextIds = isAdding ? [...selectedExamIds, id] : selectedExamIds.filter(eid => eid !== id);
        setSelectedExamIds(nextIds);

        try {
            // We need to update this specific exam's courses array
            const exam = exams.find(e => e._id === id);
            const currentCourses = (exam?.courses || []).map(c => typeof c === 'object' ? c._id : c);
            const nextCourses = isAdding 
                ? Array.from(new Set([...currentCourses, courseId])) 
                : currentCourses.filter(cid => cid !== courseId);
            
            await api.put(`/exams/${id}/assign-courses`, { courseIds: nextCourses });
            
            // Update local exams list to keep "course count" chip accurate
            setExams(prev => prev.map(e => {
                if (e._id === id) {
                    return { ...e, courses: nextCourses };
                }
                return e;
            }));

            toast.success('Updated');
            if (onSuccess) onSuccess(); // Refresh background
        } catch {
            setSelectedExamIds(original);
            toast.error('Failed to update');
        }
    };

    const handleSubmit = async () => {
        if (tabIdx === 1) {
            // Only handle "Create New" case here
            try {
                if (!examData.title || !examData.startDate || !examData.endDate) {
                    return toast.warning('Please fill required fields');
                }
                await api.post('/exams', { ...examData, course: courseId, courses: [courseId] });
                toast.success('Exam created and assigned!');
                if (onSuccess) onSuccess();
                onClose();
            } catch (err) {
                toast.error('Failed to create exam');
            }
        } else {
            onClose(); // In other modes, it's already auto-saved
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {isExamMode
                    ? `Assign Courses to: ${examTitle}`
                    : `Assign Exam to: ${courseTitle}`}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {!isExamMode && (
                    <Tabs value={tabIdx} onChange={(_, v) => setTabIdx(v)} sx={{ mb: 2 }}>
                        <Tab label="Select Existing Exam" />
                        <Tab label="Create New Exam" />
                    </Tabs>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : isExamMode ? (
                    /* ── Mode A: Assign multiple COURSES to this exam ── */
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Select which courses this exam should be assigned to:
                        </Typography>
                        <Paper variant="outlined" sx={{ maxHeight: 320, overflow: 'auto' }}>
                            <List dense>
                                {courses.length === 0 ? (
                                    <ListItem><ListItemText primary="No courses found" /></ListItem>
                                ) : courses.map(c => (
                                    <ListItem key={c._id} disablePadding>
                                        <ListItemButton onClick={() => handleToggleCourse(c._id)} dense>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={selectedCourseIds.includes(c._id)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={c.title}
                                                secondary={c.isPublished ? 'Published' : 'Draft'}
                                            />
                                            <SchoolIcon fontSize="small" color="action" />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {selectedCourseIds.length} course(s) selected
                        </Typography>
                    </Box>
                ) : tabIdx === 0 ? (
                    /* ── Mode B: Assign existing EXAMS to a course ── */
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Select exams to assign to this course:
                        </Typography>
                        <Paper variant="outlined" sx={{ maxHeight: 320, overflow: 'auto' }}>
                            <List dense>
                                {exams.length === 0 ? (
                                    <ListItem><ListItemText primary="No exams available" /></ListItem>
                                ) : exams.map(exam => (
                                    <ListItem key={exam._id} disablePadding>
                                        <ListItemButton onClick={() => handleToggleExam(exam._id)} dense>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={selectedExamIds.includes(exam._id)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={exam.title}
                                                secondary={`Duration: ${exam.duration} min | Marks: ${exam.totalMarks}`}
                                            />
                                            {(exam.courses?.length > 0) && (
                                                <Chip label={`${exam.courses.length} course(s)`} size="small" />
                                            )}
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Box>
                ) : (
                    /* ── Mode C: Create new exam for this course ── */
                    <Box component="form" noValidate sx={{ mt: 1 }}>
                        {[
                            { name: 'title', label: 'Exam Title *', type: 'text' },
                            { name: 'description', label: 'Description', type: 'text', multiline: true, rows: 2 },
                        ].map(f => (
                            <TextField key={f.name} margin="normal" fullWidth {...f}
                                value={examData[f.name]}
                                onChange={(e) => setExamData({ ...examData, [f.name]: e.target.value })}
                            />
                        ))}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField margin="normal" fullWidth label="Start Date *" name="startDate" type="datetime-local"
                                value={examData.startDate} onChange={(e) => setExamData({ ...examData, startDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField margin="normal" fullWidth label="End Date *" name="endDate" type="datetime-local"
                                value={examData.endDate} onChange={(e) => setExamData({ ...examData, endDate: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            {['duration', 'totalMarks', 'passingMarks'].map(f => (
                                <TextField key={f} margin="normal" fullWidth
                                    label={f === 'duration' ? 'Duration (min)' : f === 'totalMarks' ? 'Total Marks' : 'Passing Marks'}
                                    name={f} type="number"
                                    value={examData[f]}
                                    onChange={(e) => setExamData({ ...examData, [f]: e.target.value })}
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                {(isExamMode || tabIdx === 0) && (
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto', ml: 2 }}>
                        Changes are saved automatically
                    </Typography>
                )}
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {(isExamMode || tabIdx === 0) ? 'Done' : 'Create & Assign'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignExamModal;
