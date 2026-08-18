import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Box,
    Chip, IconButton, Tooltip, Stack, TextField
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import SubmissionPreviewModal from './SubmissionPreviewModal';

const StudentSubmissionsModal = ({ open, onClose, student, onGraded }) => {
    const [editingId, setEditingId] = useState(null);
    const [gradeInput, setGradeInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [previewSubmission, setPreviewSubmission] = useState(null);

    const submissions = student?.submissions || [];

    const startEdit = (sub) => {
        setEditingId(sub.id);
        setGradeInput(sub.grade ?? '');
        setFeedbackInput(sub.feedback || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setGradeInput('');
        setFeedbackInput('');
    };

    const saveGrade = async (submissionId) => {
        if (gradeInput === '' || Number.isNaN(Number(gradeInput))) {
            toast.warning('Please enter a valid grade');
            return;
        }
        setSaving(true);
        try {
            await api.put(`/assignments/submissions/${submissionId}/grade`, {
                grade: Number(gradeInput),
                feedback: feedbackInput,
                status: 'graded',
            });
            toast.success('Grade saved');
            cancelEdit();
            onGraded?.();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save grade');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                Submissions: <b>{student?.name}</b>
                <Typography variant="caption" display="block" color="text.secondary">
                    {student?.email}
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                {submissions.length === 0 ? (
                    <Typography align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        This student hasn't submitted any assignments yet.
                    </Typography>
                ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell><b>Assignment</b></TableCell>
                                    <TableCell><b>Submitted At</b></TableCell>
                                    <TableCell><b>Status</b></TableCell>
                                    <TableCell><b>Grade</b></TableCell>
                                    <TableCell align="right"><b>Actions</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {submissions.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell>{sub.assignmentTitle}</TableCell>
                                        <TableCell>
                                            {sub.submittedAt ? format(new Date(sub.submittedAt), 'PPp') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={(sub.status || 'submitted').toUpperCase()}
                                                size="small"
                                                color={sub.status === 'graded' ? 'success' : 'warning'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {editingId === sub.id ? (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={gradeInput}
                                                    onChange={(e) => setGradeInput(e.target.value)}
                                                    inputProps={{ min: 0, max: 100, style: { width: 60 } }}
                                                />
                                            ) : (
                                                sub.grade !== null && sub.grade !== undefined ? `${sub.grade} Pts` : '-'
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Submission">
                                                    <IconButton size="small" onClick={() => setPreviewSubmission({ ...sub, student })}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                {editingId === sub.id ? (
                                                    <>
                                                        <Tooltip title="Save">
                                                            <IconButton size="small" color="success" disabled={saving} onClick={() => saveGrade(sub.id)}>
                                                                <CheckIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Cancel">
                                                            <IconButton size="small" onClick={cancelEdit}>
                                                                <CloseIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                ) : (
                                                    <Tooltip title="Grade">
                                                        <IconButton size="small" onClick={() => startEdit(sub)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                            {editingId === sub.id && (
                                                <Box sx={{ mt: 1 }}>
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        placeholder="Feedback (optional)"
                                                        value={feedbackInput}
                                                        onChange={(e) => setFeedbackInput(e.target.value)}
                                                    />
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">Close</Button>
            </DialogActions>

            <SubmissionPreviewModal
                open={Boolean(previewSubmission)}
                onClose={() => setPreviewSubmission(null)}
                submission={previewSubmission}
            />
        </Dialog>
    );
};

export default StudentSubmissionsModal;
