import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Chip, CircularProgress } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { courseViewerService } from '../../../api/courseViewer/service';
import { toast } from 'react-toastify';

/**
 * Real data (via GET /assignments, filtered client-side to this course — there's no
 * ?courseId server-side filter yet), view-only for now. Actually submitting/completing an
 * assignment from the web course page is a separate follow-up — the native app already has
 * that flow (screens/assignmentDetail/Screen.tsx).
 */
export function AssignmentsTab({ courseId }) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        courseViewerService.getCourseAssignments(courseId)
            .catch(() => {
                toast.error('Failed to load assignments');
                return [];
            })
            .then(setAssignments)
            .finally(() => setLoading(false));
    }, [courseId]);

    if (loading) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (assignments.length === 0) {
        return <Typography variant="body2" color="text.secondary">No assignments for this course yet.</Typography>;
    }

    return (
        <Stack spacing={1.5}>
            {assignments.map((a) => (
                <Paper key={a.id} elevation={0} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AssignmentIcon color="action" />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={700}>{a.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Due {new Date(a.dueDate).toLocaleDateString()} · {a.totalMarks} marks
                        </Typography>
                    </Box>
                    <Chip label={a.isPublished ? 'Open' : 'Draft'} size="small" color={a.isPublished ? 'success' : 'default'} />
                </Paper>
            ))}
        </Stack>
    );
}
