import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Typography, Box, 
    Chip, CircularProgress, IconButton, Tooltip, Stack 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/api';
import { format } from 'date-fns';
import SubmissionPreviewModal from './SubmissionPreviewModal';

const AssignmentSubmissionsModal = ({ open, onClose, assignmentId }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [previewSubmission, setPreviewSubmission] = useState(null);

    useEffect(() => {
        if (open && assignmentId) {
            fetchSubmissions();
        }
    }, [open, assignmentId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/assignments/${assignmentId}`);
            if (response.data.success) {
                const sorted = [...(response.data.data.submissions || [])].sort((a, b) =>
                    (a.student?.name || '').localeCompare(b.student?.name || '')
                );
                setSubmissions(sorted);
                setAssignmentTitle(response.data.data.title);
            }
        } catch (error) {
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                Submissions for: <b>{assignmentTitle}</b>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : submissions.length === 0 ? (
                    <Typography align="center" sx={{ py: 5, color: 'text.secondary' }}>
                        No submissions received yet.
                    </Typography>
                ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell><b>Student</b></TableCell>
                                    <TableCell><b>Submitted At</b></TableCell>
                                    <TableCell><b>Status</b></TableCell>
                                    <TableCell><b>Grade</b></TableCell>
                                    <TableCell align="right"><b>Actions</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {submissions.map((sub) => (
                                    <TableRow key={sub._id}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {sub.student?.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {sub.student?.rollNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {sub.submittedAt ? format(new Date(sub.submittedAt), 'PPp') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={sub.status.toUpperCase()} 
                                                size="small" 
                                                color={sub.status === 'graded' ? 'success' : 'warning'} 
                                            />
                                        </TableCell>
                                        <TableCell>{sub.grade !== undefined ? sub.grade : '-'}</TableCell>
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                <Tooltip title="View Submission">
                                                    <IconButton size="small" onClick={() => setPreviewSubmission(sub)}>
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
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

export default AssignmentSubmissionsModal;
