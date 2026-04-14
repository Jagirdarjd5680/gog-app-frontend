import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton,
    List, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Checkbox, Paper, CircularProgress, Chip, Tabs, Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AssignAssignmentModal = ({ open, onClose, courseId, courseTitle, onSuccess }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setAssignments([]); // Clear or show loading
            setSelectedIds([]);
            fetchAssignments();
        }
    }, [open]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            // Use large limit and timestamp to avoid stale cache or missing items
            const { data } = await api.get(`/assignments?limit=1000&t=${Date.now()}`);
            const allAssignments = data.data || [];
            
            // Pre-select assignments already belonging to this course
            const assigned = allAssignments
                .filter(a => {
                    const cid = typeof a.course === 'object' ? a.course?._id : a.course;
                    return cid?.toString() === courseId?.toString();
                })
                .map(a => a._id);
            
            setAssignments(allAssignments);
            setSelectedIds(assigned);
        } catch (error) {
            toast.error('Failed to load assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        const isAdding = !selectedIds.includes(id);
        const originalSelected = [...selectedIds];
        const originalAssignments = [...assignments];
        
        // Optimistic UI update for Checkbox
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );

        // Update local assignments text for "Current Course"
        setAssignments(prev => prev.map(a => {
            if (a._id === id) {
                return { ...a, course: isAdding ? { _id: courseId, title: courseTitle } : null };
            }
            return a;
        }));

        try {
            await api.put(`/assignments/${id}`, { course: isAdding ? courseId : null });
            toast.success(isAdding ? 'Linked successfully' : 'Unlinked successfully');
            if (onSuccess) onSuccess(); // Refresh background table
        } catch (error) {
            // Rollback on failure
            setSelectedIds(originalSelected);
            setAssignments(originalAssignments);
            toast.error('Failed to update assignment');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ fontWeight: 700 }}>
                Manage Assignments for: {courseTitle}
                <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Select assignments to link to this course:
                        </Typography>
                        <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto', mt: 1 }}>
                            <List dense>
                                {assignments.length === 0 ? (
                                    <ListItem><ListItemText primary="No assignments found" /></ListItem>
                                ) : assignments.map(a => (
                                    <ListItem key={a._id} disablePadding>
                                        <ListItemButton onClick={() => handleToggle(a._id)} dense>
                                            <ListItemIcon>
                                                <Checkbox
                                                    edge="start"
                                                    checked={selectedIds.includes(a._id)}
                                                    tabIndex={-1}
                                                    disableRipple
                                                />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={a.title} 
                                                secondary={`Current Course: ${a.course?.title || 'None'} | Marks: ${a.totalMarks}`}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto', ml: 2 }}>
                    Changes are saved automatically
                </Typography>
                <Button onClick={onClose} variant="contained">Done</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignAssignmentModal;
